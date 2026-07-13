from typing import Any

import pytest
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.enums import AnalysisStatus, LeadPriority, NotificationStatus
from app.models.lead import Lead
from app.repositories.settings_repository import get_or_create_settings
from app.services.notification_service import notify_lead


def _completed_lead(db: Session, priority: LeadPriority = LeadPriority.HIGH) -> Lead:
    lead = Lead(
        name="Alice",
        email="a@example.com",
        description="A description long enough for a valid lead record here.",
        analysis_status=AnalysisStatus.COMPLETED,
        priority=priority,
        category="E-commerce",
        ai_summary="Summary of the request.",
        recommended_action="Reply soon.",
    )
    db.add(lead)
    db.commit()
    return lead


def _configure(db: Session, *, enabled: bool, chat_id: str | None, threshold: LeadPriority) -> None:
    row = get_or_create_settings(db)
    row.telegram_enabled = enabled
    row.telegram_chat_id = chat_id
    row.notify_min_priority = threshold
    db.commit()


def test_high_lead_sends(db_session: Session) -> None:
    _configure(db_session, enabled=True, chat_id="123", threshold=LeadPriority.HIGH)
    lead = _completed_lead(db_session, LeadPriority.HIGH)
    notify_lead(db_session, get_settings(), lead)
    assert lead.notification_status == NotificationStatus.SENT
    assert lead.last_notified_at is not None


def test_low_lead_below_threshold_not_required(db_session: Session) -> None:
    _configure(db_session, enabled=True, chat_id="123", threshold=LeadPriority.HIGH)
    lead = _completed_lead(db_session, LeadPriority.LOW)
    notify_lead(db_session, get_settings(), lead)
    assert lead.notification_status == NotificationStatus.NOT_REQUIRED


def test_disabled_not_required(db_session: Session) -> None:
    _configure(db_session, enabled=False, chat_id="123", threshold=LeadPriority.HIGH)
    lead = _completed_lead(db_session)
    notify_lead(db_session, get_settings(), lead)
    assert lead.notification_status == NotificationStatus.NOT_REQUIRED


def test_missing_chat_id_not_required(db_session: Session) -> None:
    _configure(db_session, enabled=True, chat_id=None, threshold=LeadPriority.HIGH)
    lead = _completed_lead(db_session)
    notify_lead(db_session, get_settings(), lead)
    assert lead.notification_status == NotificationStatus.NOT_REQUIRED


def test_not_analyzed_not_required(db_session: Session) -> None:
    _configure(db_session, enabled=True, chat_id="123", threshold=LeadPriority.LOW)
    lead = Lead(
        name="Bob", email="b@example.com", description="Not analyzed lead description here."
    )
    db_session.add(lead)
    db_session.commit()
    notify_lead(db_session, get_settings(), lead)
    assert lead.notification_status == NotificationStatus.NOT_REQUIRED


def test_manual_bypasses_disabled(db_session: Session) -> None:
    _configure(db_session, enabled=False, chat_id="123", threshold=LeadPriority.HIGH)
    lead = _completed_lead(db_session)
    notify_lead(db_session, get_settings(), lead, manual=True)
    assert lead.notification_status == NotificationStatus.SENT


def test_automatic_resend_after_already_sent_is_skipped(
    db_session: Session, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Regression: re-analyzing an already-notified lead must not send twice."""
    calls: list[str] = []

    class _Recording:
        name = "recording"

        def send(self, chat_id: str, html_message: str) -> None:
            calls.append(chat_id)

    monkeypatch.setattr(
        "app.services.notification_service.get_notification_provider",
        lambda _settings: _Recording(),
    )
    _configure(db_session, enabled=True, chat_id="123", threshold=LeadPriority.HIGH)
    lead = _completed_lead(db_session)

    notify_lead(db_session, get_settings(), lead)  # first automatic send
    assert lead.notification_status == NotificationStatus.SENT
    first_notified_at = lead.last_notified_at

    notify_lead(db_session, get_settings(), lead)  # simulates a re-analyze

    assert calls == ["123"]  # provider called exactly once
    assert lead.notification_status == NotificationStatus.SENT
    assert lead.last_notified_at == first_notified_at

    notify_lead(db_session, get_settings(), lead, manual=True)  # explicit resend still works
    assert calls == ["123", "123"]


def test_unclassified_priority_not_required(db_session: Session) -> None:
    _configure(db_session, enabled=True, chat_id="123", threshold=LeadPriority.LOW)
    lead = _completed_lead(db_session, LeadPriority.LOW)
    lead.priority = None
    db_session.commit()
    notify_lead(db_session, get_settings(), lead)
    assert lead.notification_status == NotificationStatus.NOT_REQUIRED


def test_unexpected_provider_error_marks_failed_with_safe_message(
    db_session: Session, monkeypatch: pytest.MonkeyPatch
) -> None:
    class _Broken:
        name = "broken"

        def send(self, chat_id: str, html_message: str) -> None:
            raise RuntimeError("boom, unexpected internal detail")

    monkeypatch.setattr(
        "app.services.notification_service.get_notification_provider",
        lambda _settings: _Broken(),
    )
    _configure(db_session, enabled=True, chat_id="123", threshold=LeadPriority.HIGH)
    lead = _completed_lead(db_session)

    notify_lead(db_session, get_settings(), lead)

    assert lead.notification_status == NotificationStatus.FAILED
    assert lead.notification_error == "Notification failed."  # no internal detail leaked


def test_delivery_failure_marks_failed_and_keeps_lead(
    db_session: Session, monkeypatch: pytest.MonkeyPatch
) -> None:
    from app.services.notifications.base import NotificationError

    class _Failing:
        name = "failing"

        def send(self, chat_id: str, html_message: str) -> None:
            raise NotificationError("send failed")

    def fake_provider(_settings: Any) -> Any:
        return _Failing()

    monkeypatch.setattr(
        "app.services.notification_service.get_notification_provider", fake_provider
    )
    _configure(db_session, enabled=True, chat_id="123", threshold=LeadPriority.HIGH)
    lead = _completed_lead(db_session)

    notify_lead(db_session, get_settings(), lead)

    stored = db_session.get(Lead, lead.id)
    assert stored is not None  # never rolled back
    assert stored.notification_status == NotificationStatus.FAILED
    assert stored.notification_error == "send failed"
