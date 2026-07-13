from typing import Protocol

from app.models.enums import LeadPriority

PRIORITY_RANK: dict[LeadPriority, int] = {
    LeadPriority.LOW: 1,
    LeadPriority.MEDIUM: 2,
    LeadPriority.HIGH: 3,
    LeadPriority.URGENT: 4,
}


class NotificationError(Exception):
    """Raised when a notification cannot be delivered. Carries a safe message
    with no secrets (never includes the bot token)."""


class NotificationProvider(Protocol):
    name: str

    def send(self, chat_id: str, html_message: str) -> None: ...
