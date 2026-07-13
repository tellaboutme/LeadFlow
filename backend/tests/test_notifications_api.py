from fastapi.testclient import TestClient

HIGH_LEAD = {
    "name": "Alice Anderson",
    "email": "alice@example.com",
    "description": "We want to build an online store with cart and payments.",
    "budget_text": "$20,000",
}
LOW_LEAD = {
    "name": "Bob Brown",
    "email": "bob@example.com",
    "description": "hi can you help me with something small",
}


def _enable_telegram(client: TestClient, threshold: str = "high") -> None:
    resp = client.patch(
        "/api/v1/settings",
        json={
            "telegram_enabled": True,
            "telegram_chat_id": "12345",
            "notify_min_priority": threshold,
        },
    )
    assert resp.status_code == 200


def test_settings_never_exposes_token(client: TestClient) -> None:
    body = client.get("/api/v1/settings").json()
    assert not any("token" in key for key in body)
    patched = client.patch("/api/v1/settings", json={"company_name": "Acme"}).json()
    assert patched["company_name"] == "Acme"
    assert not any("token" in key for key in patched)


def test_high_lead_auto_sends_low_not_required(client: TestClient) -> None:
    _enable_telegram(client)
    high = client.post("/api/v1/leads", params={"analyze": "true"}, json=HIGH_LEAD).json()
    assert high["priority"] == "high"
    assert high["notification_status"] == "sent"
    assert high["last_notified_at"] is not None

    low = client.post("/api/v1/leads", params={"analyze": "true"}, json=LOW_LEAD).json()
    assert low["priority"] == "low"
    assert low["notification_status"] == "not_required"


def test_manual_notify_endpoint(client: TestClient) -> None:
    _enable_telegram(client)
    lead_id = client.post("/api/v1/leads", params={"analyze": "true"}, json=HIGH_LEAD).json()["id"]
    resp = client.post(f"/api/v1/leads/{lead_id}/notify")
    assert resp.status_code == 200
    assert resp.json()["notification_status"] == "sent"


def test_notify_missing_lead_404(client: TestClient) -> None:
    assert client.post("/api/v1/leads/nope/notify").status_code == 404


def test_test_telegram_mock_reports_provider(client: TestClient) -> None:
    resp = client.post("/api/v1/settings/test-telegram", json={"chat_id": "999"})
    assert resp.status_code == 200
    # provider="mock" tells the caller no real message was sent.
    assert resp.json() == {"ok": True, "provider": "mock", "error": None}


def test_test_telegram_missing_chat_id(client: TestClient) -> None:
    body = client.post("/api/v1/settings/test-telegram", json={}).json()
    assert body["ok"] is False
    assert body["error"]
