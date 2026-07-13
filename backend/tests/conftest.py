from collections.abc import Generator
from pathlib import Path

import pytest
from _pytest.monkeypatch import MonkeyPatch
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

BACKEND_DIR = Path(__file__).resolve().parents[1]


def _alembic_config() -> Config:
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    return cfg


@pytest.fixture
def db_url(tmp_path: Path, monkeypatch: MonkeyPatch) -> Generator[str]:
    """Point application settings at a throwaway file-based SQLite DB."""
    from app.core.config import get_settings

    url = f"sqlite:///{(tmp_path / 'test.db').as_posix()}"
    monkeypatch.setenv("DATABASE_URL", url)
    get_settings.cache_clear()
    yield url
    get_settings.cache_clear()


@pytest.fixture
def migrated_db_url(db_url: str) -> str:
    """Apply Alembic migrations to the throwaway DB (exercises env.py + the migration)."""
    command.upgrade(_alembic_config(), "head")
    return db_url


@pytest.fixture
def db_session(migrated_db_url: str) -> Generator[Session]:
    engine = create_engine(migrated_db_url, connect_args={"check_same_thread": False})
    session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    with session_factory() as session:
        yield session
    engine.dispose()


@pytest.fixture
def client(migrated_db_url: str) -> Generator[TestClient]:
    """TestClient with the get_db dependency overridden to the migrated test DB."""
    from app.db.session import get_db
    from app.main import app

    engine = create_engine(migrated_db_url, connect_args={"check_same_thread": False})
    session_factory = sessionmaker(bind=engine, expire_on_commit=False)

    def override_get_db() -> Generator[Session]:
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    engine.dispose()
