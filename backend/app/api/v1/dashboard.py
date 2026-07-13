from fastapi import APIRouter

from app.api.deps import DbDep
from app.schemas.dashboard import DashboardStats
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: DbDep) -> DashboardStats:
    return dashboard_service.get_stats(db)
