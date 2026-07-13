#!/bin/sh
# Bring the database schema up to date before serving, so a fresh volume works
# on first boot and an existing one is migrated in place.
set -eu

alembic upgrade head

# Opt-in only. run_seed is idempotent (rows are keyed by deterministic UUIDs),
# so this is safe across restarts, but a real deployment should not auto-insert
# demo leads — compose enables it for the local demo stack.
if [ "${SEED_ON_START:-false}" = "true" ]; then
    python -m app.db.seed
fi

exec "$@"
