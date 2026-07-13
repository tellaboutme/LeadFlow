"""Deterministic DB reset for E2E tests. A no-op (404) outside test mode."""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbDep, SettingsDep
from app.db.seed import run_seed
from app.models.lead import Lead
from app.models.settings import AppSettings

router = APIRouter(prefix="/testing", tags=["testing"])


@router.post("/reset", status_code=status.HTTP_204_NO_CONTENT)
def reset_database(db: DbDep, settings: SettingsDep) -> None:
    """Wipe all leads and settings, then reseed deterministic demo data.

    Only available when ENVIRONMENT=test (set by the Playwright webServer),
    so this can never be reached against a real deployment.
    """
    if settings.environment != "test":
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    db.query(Lead).delete()
    db.query(AppSettings).delete()
    db.commit()
    run_seed(db)
