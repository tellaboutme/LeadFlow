import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.db.seed import SEED_LEADS

VALID_LEAD = {
    "name": "Extra Person",
    "email": "extra@example.com",
    "description": "An extra lead created during a test, not part of the seed set.",
}


def test_reset_returns_404_outside_test_mode(client: TestClient) -> None:
    assert get_settings().environment != "test"
    assert client.post("/api/v1/testing/reset").status_code == 404


def test_reset_wipes_and_reseeds_in_test_mode(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(get_settings(), "environment", "test")

    client.post("/api/v1/leads", json=VALID_LEAD)
    assert client.get("/api/v1/leads", params={"limit": 100}).json()["total"] == 1

    resp = client.post("/api/v1/testing/reset")
    assert resp.status_code == 204

    body = client.get("/api/v1/leads", params={"limit": 100}).json()
    assert body["total"] == len(SEED_LEADS)
    assert not any(item["email"] == VALID_LEAD["email"] for item in body["items"])

    settings_body = client.get("/api/v1/settings").json()
    assert settings_body["company_name"] is None  # settings singleton reset to defaults
