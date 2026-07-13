from typing import Any

from fastapi.testclient import TestClient

VALID_LEAD: dict[str, Any] = {
    "name": "Alice Anderson",
    "email": "alice@example.com",
    "company": "Acme Web Co",
    "source": "website",
    "description": "We need a marketing website redesign with a CMS and blog.",
}


def _create(client: TestClient, **overrides: Any) -> dict[str, Any]:
    payload = {**VALID_LEAD, **overrides}
    response = client.post("/api/v1/leads", json=payload)
    assert response.status_code == 201, response.text
    body: dict[str, Any] = response.json()
    return body


def test_stats_empty_db(client: TestClient) -> None:
    body = client.get("/api/v1/dashboard/stats").json()
    assert body["total"] == 0
    assert body["new"] == 0
    assert body["high_priority"] == 0
    assert body["urgent"] == 0
    assert body["won"] == 0
    assert body["conversion_rate"] == 0.0
    assert body["recent_leads"] == []
    assert all(bucket["count"] == 0 for bucket in body["by_priority"])


def test_stats_counts_and_conversion_rate(client: TestClient) -> None:
    a = _create(client, email="a@example.com")["id"]
    b = _create(client, email="b@example.com")["id"]
    _create(client, email="c@example.com")
    _create(client, email="d@example.com")

    client.patch(f"/api/v1/leads/{a}", json={"priority": "high"})
    client.patch(f"/api/v1/leads/{b}", json={"priority": "urgent", "status": "won"})

    body = client.get("/api/v1/dashboard/stats").json()
    assert body["total"] == 4
    assert body["new"] == 3
    assert body["high_priority"] == 1
    assert body["urgent"] == 1
    assert body["won"] == 1
    assert body["conversion_rate"] == 0.25


def test_stats_recent_leads_ordered_and_limited(client: TestClient) -> None:
    ids = [_create(client, email=f"user{i}@example.com")["id"] for i in range(7)]

    body = client.get("/api/v1/dashboard/stats").json()
    assert len(body["recent_leads"]) == 5
    # Most recently created leads first.
    assert [item["id"] for item in body["recent_leads"]] == list(reversed(ids))[:5]
