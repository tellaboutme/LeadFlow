# syntax=docker/dockerfile:1

# ---- Build stage: resolve dependencies from the lockfile only ----------------
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Dependencies are installed from uv.lock alone, so this layer is cached until
# the lockfile changes. --no-dev keeps pytest/ruff/mypy out of the final image.
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen --no-dev


# ---- Runtime stage ----------------------------------------------------------
FROM python:3.14-slim-bookworm AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

# Run as an unprivileged user. The data directory is created (and owned) here so
# that a named volume mounted over it inherits this ownership on first use.
RUN useradd --system --uid 1001 --create-home --shell /usr/sbin/nologin app

WORKDIR /app

COPY --from=builder --chown=app:app /app/.venv /app/.venv
COPY --chown=app:app app ./app
COPY --chown=app:app migrations ./migrations
COPY --chown=app:app alembic.ini ./
COPY --chown=app:app docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && install -d -o app -g app /app/data

USER app

EXPOSE 8000

# Uses the stdlib rather than curl/wget, which the slim runtime does not ship
# and which would only widen the image's attack surface.
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
    CMD ["python", "-c", "import urllib.request,sys; sys.exit(0) if urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health', timeout=4).status == 200 else sys.exit(1)"]

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
