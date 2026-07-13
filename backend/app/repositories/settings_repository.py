from sqlalchemy.orm import Session

from app.models.settings import SETTINGS_SINGLETON_ID, AppSettings


def get_or_create_settings(db: Session) -> AppSettings:
    """Return the singleton settings row, creating it (id=1) if absent."""
    settings = db.get(AppSettings, SETTINGS_SINGLETON_ID)
    if settings is None:
        settings = AppSettings(id=SETTINGS_SINGLETON_ID)
        db.add(settings)
        db.flush()
    return settings
