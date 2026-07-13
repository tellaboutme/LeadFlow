from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Query, Response, status

from app.api.deps import DbDep, SettingsDep
from app.schemas.lead import LeadCreate, LeadListResponse, LeadRead, LeadUpdate
from app.schemas.lead_query import LeadExportParams, LeadListParams
from app.services.analysis_service import analyze_lead
from app.services.csv_export import build_leads_csv
from app.services.lead_service import LeadService
from app.services.notification_service import notify_lead

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("", response_model=LeadRead, status_code=status.HTTP_201_CREATED)
def create_lead(
    payload: LeadCreate,
    db: DbDep,
    settings: SettingsDep,
    analyze: Annotated[
        bool,
        Query(description="Run AI analysis after saving. AI failure still returns 201."),
    ] = False,
) -> LeadRead:
    lead = LeadService(db).create(payload)
    if analyze:
        lead = analyze_lead(db, settings, lead)
        lead = notify_lead(db, settings, lead)  # auto-send; failure never blocks 201
    return LeadRead.model_validate(lead)


@router.post("/{lead_id}/analyze", response_model=LeadRead)
def analyze_existing_lead(lead_id: str, db: DbDep, settings: SettingsDep) -> LeadRead:
    lead = LeadService(db).get(lead_id)
    lead = analyze_lead(db, settings, lead)
    lead = notify_lead(db, settings, lead)  # auto-send after analysis
    return LeadRead.model_validate(lead)


@router.post("/{lead_id}/notify", response_model=LeadRead)
def notify_existing_lead(lead_id: str, db: DbDep, settings: SettingsDep) -> LeadRead:
    lead = LeadService(db).get(lead_id)
    lead = notify_lead(db, settings, lead, manual=True)
    return LeadRead.model_validate(lead)


@router.get("", response_model=LeadListResponse)
def list_leads(params: Annotated[LeadListParams, Query()], db: DbDep) -> LeadListResponse:
    items, total = LeadService(db).list(params)
    return LeadListResponse(
        items=[LeadRead.model_validate(item) for item in items],
        total=total,
        limit=params.limit,
        offset=params.offset,
    )


@router.get("/export")
def export_leads_csv(params: Annotated[LeadExportParams, Query()], db: DbDep) -> Response:
    leads = LeadService(db).list_for_export(params)
    content = build_leads_csv(leads, bom=params.bom)
    filename = f"leads-export-{datetime.now(UTC):%Y%m%d-%H%M%S}.csv"
    return Response(
        content=content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{lead_id}", response_model=LeadRead)
def get_lead(lead_id: str, db: DbDep) -> LeadRead:
    return LeadRead.model_validate(LeadService(db).get(lead_id))


@router.patch("/{lead_id}", response_model=LeadRead)
def update_lead(lead_id: str, payload: LeadUpdate, db: DbDep) -> LeadRead:
    return LeadRead.model_validate(LeadService(db).update(lead_id, payload))


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(lead_id: str, db: DbDep) -> None:
    LeadService(db).delete(lead_id)
