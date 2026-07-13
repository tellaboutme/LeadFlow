# LeadFlow backend

FastAPI service. Run from this directory:

```powershell
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Checks:

```powershell
uv run ruff format .
uv run ruff check .
uv run mypy .
uv run pytest
```
