from alembic import command
from sqlalchemy import create_engine, func, inspect, select
from sqlalchemy.orm import Session

from app.db.seed import SEED_LEADS, run_seed
from app.models.enums import LeadSource, LeadStatus
from app.models.lead import Lead
from app.models.settings import SETTINGS_SINGLETON_ID, AppSettings
from app.repositories.settings_repository import get_or_create_settings
from tests.conftest import _alembic_config


def test_migration_creates_schema(migrated_db_url: str) -> None:
    engine = create_engine(migrated_db_url)
    tables = set(inspect(engine).get_table_names())
    assert {"leads", "app_settings", "alembic_version"} <= tables
    index_names = {ix["name"] for ix in inspect(engine).get_indexes("leads")}
    assert "ix_leads_status_priority" in index_names
    engine.dispose()


def test_migration_downgrade_is_clean(migrated_db_url: str) -> None:
    command.downgrade(_alembic_config(), "base")
    engine = create_engine(migrated_db_url)
    tables = set(inspect(engine).get_table_names())
    assert "leads" not in tables
    assert "app_settings" not in tables
    engine.dispose()


def test_lead_persistence(db_session: Session) -> None:
    lead = Lead(
        name="Test Person",
        email="test@example.com",
        description="A sufficiently long description for a persisted test lead record.",
        source=LeadSource.WEBSITE,
    )
    db_session.add(lead)
    db_session.commit()

    stored = db_session.get(Lead, lead.id)
    assert stored is not None
    assert stored.status == LeadStatus.NEW  # default applied
    assert stored.tags == []  # JSON default
    assert stored.created_at is not None
    assert stored.id  # UUID assigned


def test_settings_singleton(db_session: Session) -> None:
    first = get_or_create_settings(db_session)
    db_session.commit()
    second = get_or_create_settings(db_session)

    assert first.id == SETTINGS_SINGLETON_ID
    assert second.id == first.id
    assert db_session.scalar(select(func.count()).select_from(AppSettings)) == 1


def test_seed_is_idempotent(db_session: Session) -> None:
    first = run_seed(db_session)
    second = run_seed(db_session)

    assert first == len(SEED_LEADS)
    assert second == 0
    assert db_session.scalar(select(func.count()).select_from(Lead)) == len(SEED_LEADS)
    # settings singleton created exactly once by the seed
    assert db_session.scalar(select(func.count()).select_from(AppSettings)) == 1


def test_seed_covers_all_statuses(db_session: Session) -> None:
    run_seed(db_session)
    statuses = {lead.status for lead in db_session.scalars(select(Lead))}
    assert statuses == set(LeadStatus)
