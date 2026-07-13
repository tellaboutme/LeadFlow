import builtins

from sqlalchemy.orm import Session

from app.core.exceptions import LeadNotFoundError
from app.models.lead import Lead
from app.repositories.lead_repository import LeadRepository
from app.schemas.lead import LeadCreate, LeadUpdate
from app.schemas.lead_query import LeadFilterParams, LeadListParams


class LeadService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = LeadRepository(db)

    def create(self, data: LeadCreate) -> Lead:
        lead = Lead(**data.model_dump())
        self.repo.add(lead)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get(self, lead_id: str) -> Lead:
        lead = self.repo.get(lead_id)
        if lead is None:
            raise LeadNotFoundError(lead_id)
        return lead

    def list(self, params: LeadListParams) -> tuple[list[Lead], int]:
        return self.repo.list(params)

    def list_for_export(self, params: LeadFilterParams) -> builtins.list[Lead]:
        return self.repo.list_for_export(params)

    def update(self, lead_id: str, data: LeadUpdate) -> Lead:
        lead = self.get(lead_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(lead, field, value)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def delete(self, lead_id: str) -> None:
        lead = self.get(lead_id)
        self.repo.delete(lead)
        self.db.commit()
