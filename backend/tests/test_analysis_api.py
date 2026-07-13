from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.services.ai.base import AIProviderError

LEAD = {
    "name": "Alice Anderson",
    "email": "alice@example.com",
    "description": "We want to build an online store with cart and payments.",
    "budget_text": "$20,000",
}


def test_create_with_analyze_persists_result(client: TestClient) -> None:
    response = client.post("/api/v1/leads", params={"analyze": "true"}, json=LEAD)
    assert response.status_code == 201
    body = response.json()
    assert body["analysis_status"] == "completed"
    assert body["category"] == "E-commerce"
    assert body["priority"] == "high"
    assert body["ai_model"] == "mock"
    assert body["prompt_version"] == "lead-analysis-v1"

    # Persisted: a fresh GET returns the analysis fields.
    fetched = client.get(f"/api/v1/leads/{body['id']}").json()
    assert fetched["analysis_status"] == "completed"
    assert fetched["budget_min"] == 20000


def test_create_without_analyze_is_not_requested(client: TestClient) -> None:
    body = client.post("/api/v1/leads", json=LEAD).json()
    assert body["analysis_status"] == "not_requested"
    assert body["priority"] is None


def test_analyze_endpoint(client: TestClient) -> None:
    lead_id = client.post("/api/v1/leads", json=LEAD).json()["id"]
    response = client.post(f"/api/v1/leads/{lead_id}/analyze")
    assert response.status_code == 200
    assert response.json()["analysis_status"] == "completed"


def test_analyze_endpoint_missing_404(client: TestClient) -> None:
    assert client.post("/api/v1/leads/nope/analyze").status_code == 404


def test_ai_failure_still_returns_201_failed(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def boom(_settings: Any) -> Any:
        raise AIProviderError("provider unavailable")

    # Patch where analyze_lead looks up the factory.
    monkeypatch.setattr("app.services.analysis_service.get_ai_provider", boom)

    response = client.post("/api/v1/leads", params={"analyze": "true"}, json=LEAD)
    assert response.status_code == 201
    body = response.json()
    assert body["analysis_status"] == "failed"
    assert body["analysis_error"] == "provider unavailable"
