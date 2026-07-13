import httpx
import pytest

from app.models.enums import LeadPriority
from app.models.lead import Lead
from app.services.notifications.base import NotificationError
from app.services.notifications.message import build_lead_message
from app.services.notifications.telegram_provider import TelegramProvider


def _lead(**kw: object) -> Lead:
    base: dict[str, object] = {
        "name": "Alice",
        "email": "a@example.com",
        "description": "A description that is long enough for a lead record.",
        "priority": LeadPriority.HIGH,
        "category": "E-commerce",
    }
    base.update(kw)
    return Lead(**base)


def test_message_escapes_user_values() -> None:
    lead = _lead(name="<script>alert(1)</script>", company="A & B <b>", ai_summary="x <i>y</i> & z")
    message = build_lead_message(lead)
    assert "<script>" not in message
    assert "&lt;script&gt;" in message
    assert "&amp;" in message
    # The message's own bold labels remain real markup.
    assert "<b>Client:</b>" in message


def test_message_budget_range_and_single() -> None:
    single = build_lead_message(_lead(budget_min=1000, budget_max=1000, currency="USD"))
    assert "1000 USD" in single
    ranged = build_lead_message(_lead(budget_min=1000, budget_max=2000, currency="EUR"))
    assert "1000-2000 EUR" in ranged


class _FakeResponse:
    def __init__(self, status_code: int) -> None:
        self.status_code = status_code


def test_telegram_provider_success(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}

    def fake_post(url: str, **kwargs: object) -> _FakeResponse:
        captured["url"] = url
        captured["json"] = kwargs.get("json")
        return _FakeResponse(200)

    monkeypatch.setattr(httpx, "post", fake_post)
    TelegramProvider("secret-token", 10).send("123", "<b>hi</b>")
    payload = captured["json"]
    assert isinstance(payload, dict)
    assert payload["chat_id"] == "123"
    assert payload["parse_mode"] == "HTML"


def test_telegram_provider_api_error(monkeypatch: pytest.MonkeyPatch) -> None:
    def fake_post(*_a: object, **_kw: object) -> _FakeResponse:
        return _FakeResponse(400)

    monkeypatch.setattr(httpx, "post", fake_post)
    with pytest.raises(NotificationError):
        TelegramProvider("secret-token", 10).send("123", "<b>hi</b>")


def test_telegram_provider_timeout(monkeypatch: pytest.MonkeyPatch) -> None:
    def fake_post(*_a: object, **_kw: object) -> None:
        raise httpx.TimeoutException("timed out")

    monkeypatch.setattr(httpx, "post", fake_post)
    with pytest.raises(NotificationError) as excinfo:
        TelegramProvider("secret-token", 10).send("123", "<b>hi</b>")
    # The token is never leaked in the error message.
    assert "secret-token" not in str(excinfo.value)
