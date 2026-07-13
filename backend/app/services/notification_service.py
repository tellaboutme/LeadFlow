from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.base import utcnow
from app.models.enums import AnalysisStatus, NotificationStatus
from app.models.lead import Lead
from app.models.settings import AppSettings
from app.repositories.settings_repository import get_or_create_settings
from app.services.notifications.base import PRIORITY_RANK, NotificationError
from app.services.notifications.factory import get_notification_provider
from app.services.notifications.message import build_lead_message


def _meets_threshold(lead: Lead, app_settings: AppSettings) -> bool:
    if lead.priority is None:
        return False
    return PRIORITY_RANK[lead.priority] >= PRIORITY_RANK[app_settings.notify_min_priority]


def notify_lead(db: Session, settings: Settings, lead: Lead, *, manual: bool = False) -> Lead:
    """Send a Telegram alert for a lead if eligible, and persist the outcome.

    Eligibility: completed analysis, a chat id, priority at/above the configured
    threshold, and (for automatic sends) the enabled flag. Ineligible -> not_required.
    A delivery error -> failed with a safe message; the lead is never rolled back.

    Automatic sends (manual=False, e.g. after create/re-analyze) never resend
    once a lead has already been notified successfully — otherwise every
    re-analysis of an already-notified lead would fire a duplicate Telegram
    message. The lead is returned unchanged in that case (its "sent" status
    and timestamp stay accurate). A manual send (the explicit "Notify"
    action) always resends.
    """
    if not manual and lead.notification_status == NotificationStatus.SENT:
        return lead

    app_settings = get_or_create_settings(db)

    eligible = (
        lead.analysis_status == AnalysisStatus.COMPLETED
        and bool(app_settings.telegram_chat_id)
        and _meets_threshold(lead, app_settings)
        and (app_settings.telegram_enabled or manual)
    )
    if not eligible:
        return _set_status(db, lead, NotificationStatus.NOT_REQUIRED, error=None)

    try:
        provider = get_notification_provider(settings)
        assert app_settings.telegram_chat_id is not None
        provider.send(app_settings.telegram_chat_id, build_lead_message(lead))
    except NotificationError as exc:
        return _set_status(db, lead, NotificationStatus.FAILED, error=str(exc))
    except Exception:
        return _set_status(db, lead, NotificationStatus.FAILED, error="Notification failed.")

    lead.last_notified_at = utcnow()
    return _set_status(db, lead, NotificationStatus.SENT, error=None)


def _set_status(db: Session, lead: Lead, status: NotificationStatus, *, error: str | None) -> Lead:
    lead.notification_status = status
    lead.notification_error = error[:500] if error else None
    db.commit()
    db.refresh(lead)
    return lead


def send_test_message(db: Session, settings: Settings, chat_id: str | None) -> None:
    """Send a fixed test message. Raises NotificationError on failure (never leaks
    the token). Uses the given chat id or the configured singleton's."""
    app_settings = get_or_create_settings(db)
    target = chat_id or app_settings.telegram_chat_id
    if not target:
        raise NotificationError("No Telegram chat id configured.")
    provider = get_notification_provider(settings)
    provider.send(target, "<b>LeadFlow test message</b>\nYour Telegram integration works.")
