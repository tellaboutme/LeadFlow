from app.core.config import Settings
from app.services.notifications.base import NotificationError, NotificationProvider
from app.services.notifications.mock_provider import MockNotificationProvider
from app.services.notifications.telegram_provider import TelegramProvider


def get_notification_provider(settings: Settings) -> NotificationProvider:
    provider = settings.telegram_provider.strip().lower()
    if provider == "mock":
        return MockNotificationProvider()
    if provider == "telegram":
        if not settings.telegram_bot_token:
            raise NotificationError("Telegram bot token is not configured.")
        return TelegramProvider(settings.telegram_bot_token, settings.telegram_timeout_seconds)
    raise NotificationError(f"Unknown Telegram provider: {settings.telegram_provider!r}")
