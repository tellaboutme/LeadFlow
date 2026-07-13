# Testing and security

## Test pyramid

1. Backend unit/service tests.
2. Backend API integration tests with temporary SQLite.
3. Frontend component tests with mocked API.
4. Playwright E2E with mock AI/Telegram.
5. Mandatory manual visual/technical gates.

## Backend cases

- valid/invalid create
- not found
- update/delete
- filters/search/sort/pagination
- deterministic AI
- prompt-injection fixture
- AI failure keeps lead
- re-analysis
- Telegram threshold/disabled/missing config/error/timeout
- dashboard counts and zero division
- CSV filters, Unicode and formula guard

Coverage target: overall >=80%, services/integrations >=90%.

## Frontend cases

- form validation
- submit loading
- API failure preserves data
- badge labels
- empty/filter-empty states
- delete dialog
- analysis failure/retry
- settings validation
- dashboard loading/error/empty

## E2E

Core flow: create → analyze → details → status → list → dashboard.  
Filters flow.  
Failed-analysis and retry flow.

Tests use deterministic test DB and never external APIs.

## Secrets

Only backend `.env`:

- OPENAI_API_KEY
- TELEGRAM_BOT_TOKEN

`.env` is gitignored; API returns only configured booleans. No secret in frontend, logs, screenshots or video.

## Input/security rules

- length and enum validation
- sorting allowlist
- bounded pagination
- prompt injection defense
- no dangerouslySetInnerHTML
- escaped Telegram HTML
- CSV formula injection protection
- explicit CORS origins
- external call timeouts
- synthetic data only

## Security limitation

MVP has no authentication and must not be deployed publicly with real lead data. README must state this clearly.

## Added quality gates

- Storybook component-state coverage.
- MSW network mocks.
- `@axe-core/playwright` accessibility tests.
- Lighthouse CI performance/accessibility budgets.
- OpenAPI generated-type drift check.
- CodeQL.
- Dependabot.
- Python and npm dependency audits.
- Trivy filesystem/image/secret/misconfiguration scans.
- OWASP ZAP baseline and API scans.

## Production boundary

Auth0, PostgreSQL, nginx hardening, Sentry privacy configuration, backups and production scans are implemented in M13. Before M13, do not claim safe public deployment with real lead data.
