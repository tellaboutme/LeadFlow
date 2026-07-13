from fastapi.testclient import TestClient


def test_get_settings_returns_defaults(client: TestClient) -> None:
    body = client.get("/api/v1/settings").json()
    assert body["id"] == 1
    assert body["company_name"] is None
    assert body["telegram_enabled"] is False
    assert body["notify_min_priority"] == "high"


def test_patch_updates_only_provided_fields(client: TestClient) -> None:
    client.patch("/api/v1/settings", json={"company_name": "Acme"})

    patched = client.patch("/api/v1/settings", json={"telegram_enabled": True}).json()
    assert patched["telegram_enabled"] is True
    assert patched["company_name"] == "Acme"  # untouched by the second PATCH


def test_patch_invalid_priority_422(client: TestClient) -> None:
    resp = client.patch("/api/v1/settings", json={"notify_min_priority": "not-a-priority"})
    assert resp.status_code == 422
