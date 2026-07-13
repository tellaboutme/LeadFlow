from app.core.config import Settings
from app.schemas.meta import MetaConfigResponse


def get_meta_config(settings: Settings) -> MetaConfigResponse:
    return MetaConfigResponse(
        app_name=settings.app_name,
        app_version=settings.app_version,
        environment=settings.environment,
        ai_provider=settings.ai_provider,
        telegram_provider=settings.telegram_provider,
    )
