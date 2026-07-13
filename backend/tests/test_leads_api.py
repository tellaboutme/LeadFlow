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


def test_create_returns_defaults(client: TestClient) -> None:
    body = _create(client)
    assert body["id"]
    assert body["status"] == "new"
    assert body["analysis_status"] == "not_requested"
    assert body["tags"] == []


def test_create_invalid_email_422(client: TestClient) -> None:
    response = client.post("/api/v1/leads", json={**VALID_LEAD, "email": "not-an-email"})
    assert response.status_code == 422


def test_create_short_name_and_description_422(client: TestClient) -> None:
    assert client.post("/api/v1/leads", json={**VALID_LEAD, "name": "A"}).status_code == 422
    assert (
        client.post("/api/v1/leads", json={**VALID_LEAD, "description": "too short"}).status_code
        == 422
    )


def test_get_one_and_404(client: TestClient) -> None:
    lead_id = _create(client)["id"]
    assert client.get(f"/api/v1/leads/{lead_id}").status_code == 200
    missing = client.get("/api/v1/leads/does-not-exist")
    assert missing.status_code == 404
    assert missing.json()["detail"] == "Lead not found"


def test_patch_updates_status(client: TestClient) -> None:
    lead_id = _create(client)["id"]
    response = client.patch(
        f"/api/v1/leads/{lead_id}", json={"status": "contacted", "priority": "high"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "contacted"
    assert response.json()["priority"] == "high"


def test_patch_missing_404(client: TestClient) -> None:
    assert client.patch("/api/v1/leads/nope", json={"status": "won"}).status_code == 404


def test_delete_and_missing(client: TestClient) -> None:
    lead_id = _create(client)["id"]
    assert client.delete(f"/api/v1/leads/{lead_id}").status_code == 204
    assert client.get(f"/api/v1/leads/{lead_id}").status_code == 404
    assert client.delete(f"/api/v1/leads/{lead_id}").status_code == 404


def test_list_pagination(client: TestClient) -> None:
    for i in range(5):
        _create(client, email=f"user{i}@example.com")
    body = client.get("/api/v1/leads", params={"limit": 2, "offset": 0}).json()
    assert body["total"] == 5
    assert body["limit"] == 2
    assert len(body["items"]) == 2


def test_list_bad_limit_422(client: TestClient) -> None:
    assert client.get("/api/v1/leads", params={"limit": 0}).status_code == 422
    assert client.get("/api/v1/leads", params={"limit": 101}).status_code == 422
    assert client.get("/api/v1/leads", params={"offset": -1}).status_code == 422


def test_list_filter_status(client: TestClient) -> None:
    a = _create(client, email="a@example.com")["id"]
    _create(client, email="b@example.com")
    client.patch(f"/api/v1/leads/{a}", json={"status": "won"})

    body = client.get("/api/v1/leads", params={"status": "won"}).json()
    assert body["total"] == 1
    assert body["items"][0]["id"] == a


def test_list_filter_priority_none_isolates_unclassified(client: TestClient) -> None:
    unclassified = _create(client, email="unclassified@example.com")["id"]
    classified = _create(client, email="classified@example.com")["id"]
    client.patch(f"/api/v1/leads/{classified}", json={"priority": "high"})

    body = client.get("/api/v1/leads", params={"priority": "none"}).json()
    assert body["total"] == 1
    assert body["items"][0]["id"] == unclassified


def test_list_search_matches_name_email_company(client: TestClient) -> None:
    _create(client, name="Zephyr Zhang", email="zephyr@example.com", company="Zenith")
    _create(client, name="Bob Brown", email="bob@example.com", company="Bright")

    assert client.get("/api/v1/leads", params={"search": "zephyr"}).json()["total"] == 1
    assert client.get("/api/v1/leads", params={"search": "bright"}).json()["total"] == 1
    assert client.get("/api/v1/leads", params={"search": "@example.com"}).json()["total"] == 2


def test_list_sort_by_name(client: TestClient) -> None:
    _create(client, name="Carol Clark", email="c@example.com")
    _create(client, name="Anna Adams", email="a@example.com")
    _create(client, name="Bella Boyd", email="b@example.com")

    asc = client.get("/api/v1/leads", params={"sort_by": "name", "sort_order": "asc"}).json()
    names = [item["name"] for item in asc["items"]]
    assert names == sorted(names)


def test_list_sort_by_priority_uses_severity_not_alphabetical(client: TestClient) -> None:
    # Alphabetically: high < low < medium < urgent. Sorting must instead
    # follow declared severity order (low < medium < high < urgent).
    low = _create(client, email="low@example.com")["id"]
    urgent = _create(client, email="urgent@example.com")["id"]
    high = _create(client, email="high@example.com")["id"]
    medium = _create(client, email="medium@example.com")["id"]
    for lead_id, priority in [(low, "low"), (medium, "medium"), (high, "high"), (urgent, "urgent")]:
        client.patch(f"/api/v1/leads/{lead_id}", json={"priority": priority})

    asc = client.get("/api/v1/leads", params={"sort_by": "priority", "sort_order": "asc"}).json()
    assert [item["id"] for item in asc["items"]] == [low, medium, high, urgent]

    desc = client.get("/api/v1/leads", params={"sort_by": "priority", "sort_order": "desc"}).json()
    assert [item["id"] for item in desc["items"]] == [urgent, high, medium, low]


def test_list_sort_by_status_uses_pipeline_order_not_alphabetical(client: TestClient) -> None:
    # Alphabetically: contacted < lost < new < qualified < won. Sorting must
    # instead follow declared pipeline order (new < contacted < qualified <
    # won < lost).
    new = _create(client, email="new@example.com")["id"]
    lost = _create(client, email="lost@example.com")["id"]
    contacted = _create(client, email="contacted@example.com")["id"]
    won = _create(client, email="won@example.com")["id"]
    qualified = _create(client, email="qualified@example.com")["id"]
    for lead_id, status in [
        (contacted, "contacted"),
        (won, "won"),
        (qualified, "qualified"),
        (lost, "lost"),
    ]:
        client.patch(f"/api/v1/leads/{lead_id}", json={"status": status})

    asc = client.get("/api/v1/leads", params={"sort_by": "status", "sort_order": "asc"}).json()
    assert [item["id"] for item in asc["items"]] == [new, contacted, qualified, won, lost]


def test_analyze_flag_controls_analysis(client: TestClient) -> None:
    # analyze=false leaves the lead un-analyzed; analyze=true runs the (mock) analysis.
    # Full analysis behavior is covered in test_analysis_api.py.
    off = client.post("/api/v1/leads", json=VALID_LEAD, params={"analyze": "false"})
    assert off.status_code == 201
    assert off.json()["analysis_status"] == "not_requested"
    on = client.post(
        "/api/v1/leads",
        json={**VALID_LEAD, "email": "second@example.com"},
        params={"analyze": "true"},
    )
    assert on.status_code == 201
    assert on.json()["analysis_status"] == "completed"
