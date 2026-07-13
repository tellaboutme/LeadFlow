# Changelog

## 1.0.0 — 2026-07-13

First public release.

### Features

- Lead CRUD API and UI — create, list, view, update and delete leads with search, status/priority/source filters, sorting and pagination.
- AI lead analysis — structured classification (category, priority, budget range, deadline, summary, tags, recommended action) via a deterministic mock provider or the OpenAI Responses API; resistant to instructions embedded in lead text.
- Telegram notifications — configurable alerts for qualified leads above a priority threshold, sent via a mock or the real Telegram Bot API; re-analysing a lead never re-sends a duplicate alert.
- Dashboard — totals, conversion rate, a clickable priority-distribution chart, and a sortable recent-leads list with live updates after any lead change.
- Settings — company name, Telegram enabled/chat ID/minimum priority, a test-message button, and read-only integration status.
- CSV export — respects active filters, Unicode-safe, optional Excel BOM, formula-injection guarded.
- Leads can be filtered to unclassified only (`priority=none`), both in the UI and the API.

### Architecture and quality

- FastAPI + SQLAlchemy 2 + Alembic backend (routers → services → repositories), React 19 + TypeScript strict + Tailwind v4 + shadcn/ui frontend.
- API types generated from the backend's OpenAPI schema; CI fails if they drift from the code.
- 78 backend tests (96% statement coverage), 92 frontend tests, 10 Playwright end-to-end tests against the production build, axe-core accessibility checks on every page.
- One-command `docker compose up` stack: non-root images, nginx serving the production bundle and proxying `/api` (same origin, no CORS), healthchecks, persistent SQLite volume, Content-Security-Policy and security headers.
- CI on every pull request: backend, frontend, API contract, E2E, accessibility, plus CodeQL, Trivy, dependency review, pip/npm audits, OWASP ZAP and SBOMs. External providers are mocked everywhere in CI.
