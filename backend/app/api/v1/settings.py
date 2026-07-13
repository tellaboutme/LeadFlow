from fastapi import APIRouter

from app.api.deps import DbDep, SettingsDep
from app.repositories.settings_repository import get_or_create_settings
from app.schemas.settings import (
    SettingsRead,
    SettingsUpdate,
    TestTelegramRequest,
    TestTelegramResponse,
)
from app.services.notification_service import send_test_message
from app.services.notifications.base import NotificationError

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsRead)
def read_settings(db: DbDep) -> SettingsRead:
    settings_row = get_or_create_settings(db)
    db.commit()
    return SettingsRead.model_validate(settings_row)


@router.patch("", response_model=SettingsRead)
def update_settings(payload: SettingsUpdate, db: DbDep) -> SettingsRead:
    settings_row = get_or_create_settings(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings_row, field, value)
    db.commit()
    db.refresh(settings_row)
    return SettingsRead.model_validate(settings_row)


@router.post("/test-telegram", response_model=TestTelegramResponse)
def test_telegram(
    payload: TestTelegramRequest, db: DbDep, settings: SettingsDep
) -> TestTelegramResponse:
    # Surface which provider ran: "mock" records the message without contacting
    # Telegram, so a green result there means no real message was sent.
    provider = settings.telegram_provider.strip().lower()
    try:
        send_test_message(db, settings, payload.chat_id)
    except NotificationError as exc:
        return TestTelegramResponse(ok=False, provider=provider, error=str(exc))
    return TestTelegramResponse(ok=True, provider=provider)
