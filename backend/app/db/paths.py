from pathlib import Path


def ensure_sqlite_parent(url: str) -> None:
    """Create the parent directory for a file-based SQLite URL if it is missing.

    Alembic and the app engine both need this so a fresh checkout (where the
    gitignored data/ directory does not exist yet) can open the database.
    """
    if not url.startswith("sqlite"):
        return
    db_path = url.split("sqlite:///", 1)[-1]
    if db_path and db_path != ":memory:":
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
