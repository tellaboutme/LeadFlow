from app.core.config import Settings
from app.schemas.health import HealthResponse


def get_health(settings: Settings) -> HealthResponse:
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        app_version=settings.app_version,
    )
