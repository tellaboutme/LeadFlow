from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_ok() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["app_name"]
    assert response.headers["X-Request-ID"]


def test_meta_config_ok() -> None:
    response = client.get("/api/v1/meta/config")
    assert response.status_code == 200
    body = response.json()
    assert body["ai_provider"] == "mock"
    assert body["telegram_provider"] == "mock"
