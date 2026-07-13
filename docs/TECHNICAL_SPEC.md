# Technical specification

## Runtime and package policy

- Python 3.12 managed by uv.
- Node 22 LTS managed with npm.
- Commit `uv.lock` and `package-lock.json`.
- Use current compatible packages at M01, then avoid broad upgrades.
- Add no package without a current, demonstrated need.

## Backend dependencies

Runtime:

- fastapi
- uvicorn
- sqlalchemy
- alembic
- pydantic
- pydantic-settings
- openai
- httpx
- email-validator

Development:

- pytest
- pytest-cov
- ruff
- mypy

## Frontend dependencies

- react
- react-dom
- react-router-dom
- @tanstack/react-query
- react-hook-form
- zod
- @hookform/resolvers
- recharts
- lucide-react
- sonner
- tailwindcss
- @tailwindcss/vite
- shadcn/ui components as copied/generated code
- vitest
- @testing-library/react
- @testing-library/user-event
- playwright

## Deliberate omissions

- Axios: use a typed fetch wrapper.
- Redux/Zustand: no complex local state.
- TanStack Table: plain typed table is enough.
- Async SQLAlchemy: sync sessions reduce complexity.
- PostgreSQL: only future upgrade via DATABASE_URL.
- SQLModel: keep ORM and API schemas explicit.

## Backend layers

- routers: HTTP only
- services: business rules
- repositories: SQL queries
- integrations: OpenAI/Telegram
- schemas: typed boundaries
- core: config, errors, logging

## Configuration

Required settings:

- APP_NAME
- APP_VERSION
- ENVIRONMENT
- LOG_LEVEL
- API_V1_PREFIX
- DATABASE_URL
- CORS_ORIGINS
- AI_PROVIDER
- OPENAI_API_KEY
- OPENAI_MODEL
- AI_TIMEOUT_SECONDS
- TELEGRAM_PROVIDER
- TELEGRAM_BOT_TOKEN
- TELEGRAM_DEFAULT_CHAT_ID
- TELEGRAM_TIMEOUT_SECONDS

## Logging

Each request logs request_id, method, path, status and duration. Never log keys, tokens, full `.env` or full lead descriptions.

## Transactions

Create lead sequence:

1. Insert raw lead and commit.
2. Analyze.
3. Persist analysis or safe failure.
4. Notify.
5. Persist notification result.

This intentionally avoids rolling back user data because an external service failed.

## Approved advanced frontend tooling

- `@tanstack/react-table`
- `openapi-typescript`
- `openapi-fetch`
- `msw`
- Storybook React+Vite
- `@storybook/addon-a11y`
- `motion`
- `react-error-boundary`
- `date-fns`
- `@axe-core/playwright`
- optional `@sentry/react`

Generated OpenAPI types replace duplicate handwritten API response types.

## Approved production backend tooling

- `tenacity` only if retry logic becomes clearer than a small explicit implementation;
- `sentry-sdk` for optional monitoring;
- `psycopg` for M13 PostgreSQL;
- JWT/JWKS validation dependencies required by the Auth0 FastAPI quickstart.

Do not add Redis solely for rate limiting; M13 applies initial limits at nginx. A distributed rate-limit store is future work for horizontally scaled deployments.

## Design-source policy

Primary system: shadcn/ui.  
Decorative source: Magic UI under strict limits.  
Discovery: official shadcn registry directory.  
Do not mix full UI frameworks.
