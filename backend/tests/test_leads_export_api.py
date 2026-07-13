import csv
import io
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


def _rows(response_content: bytes) -> list[list[str]]:
    text = response_content.decode("utf-8")
    return list(csv.reader(io.StringIO(text)))


def test_export_empty_db_returns_header_only(client: TestClient) -> None:
    resp = client.get("/api/v1/leads/export")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")
    assert "attachment; filename=" in resp.headers["content-disposition"]
    rows = _rows(resp.content)
    assert len(rows) == 1
    assert rows[0][:2] == ["ID", "Name"]


def test_export_content_and_order(client: TestClient) -> None:
    _create(client, email="a@example.com", name="Alice A")
    _create(client, email="b@example.com", name="Bob B")

    resp = client.get("/api/v1/leads/export")
    rows = _rows(resp.content)
    header, *data = rows
    assert len(data) == 2
    # Default sort matches the list endpoint: created_at desc.
    assert [row[header.index("Name")] for row in data] == ["Bob B", "Alice A"]


def test_export_respects_filters(client: TestClient) -> None:
    won = _create(client, email="won@example.com", name="Won Co")
    _create(client, email="lost@example.com", name="Lost Co")
    client.patch(f"/api/v1/leads/{won['id']}", json={"status": "won"})

    resp = client.get("/api/v1/leads/export", params={"status": "won"})
    rows = _rows(resp.content)
    header, *data = rows
    assert len(data) == 1
    assert data[0][header.index("Name")] == "Won Co"


def test_export_unicode_round_trips(client: TestClient) -> None:
    _create(client, email="polish@example.com", name="Zażółć gęślą jaźń", company="Łódź Sp. z o.o.")

    resp = client.get("/api/v1/leads/export")
    rows = _rows(resp.content)
    header, *data = rows
    assert data[0][header.index("Name")] == "Zażółć gęślą jaźń"
    assert data[0][header.index("Company")] == "Łódź Sp. z o.o."


def test_export_bom_prefixes_utf8(client: TestClient) -> None:
    resp = client.get("/api/v1/leads/export", params={"bom": "true"})
    assert resp.content.startswith(b"\xef\xbb\xbf")

    resp_no_bom = client.get("/api/v1/leads/export")
    assert not resp_no_bom.content.startswith(b"\xef\xbb\xbf")


def test_export_guards_formula_injection(client: TestClient) -> None:
    _create(client, name="=SUM(A1:A9)", company="+1;DROP TABLE leads")

    resp = client.get("/api/v1/leads/export")
    rows = _rows(resp.content)
    header, *data = rows
    assert data[0][header.index("Name")] == "'=SUM(A1:A9)"
    assert data[0][header.index("Company")] == "'+1;DROP TABLE leads"
