# Frontend UX

## Brand

LeadFlow AI / demo company Northstar Digital.

Style: dark slate sidebar, white workspace, indigo accent, subtle borders, compact professional SaaS. No excessive gradients or glassmorphism.

## Routes

- `/` Dashboard
- `/leads` list
- `/leads/new` create form
- `/leads/:leadId` details
- `/settings`
- `*` not found

## App shell

Desktop: fixed 240px sidebar.  
Mobile: top bar + drawer.  
Test widths: 1440, 1024, 768, 375.

## Dashboard

- Total
- New
- High priority
- Won
- Recharts priority chart
- Five recent leads
- loading skeleton
- onboarding empty state
- error retry

## Leads list

Columns: Client, Company, Category, Priority, Status, Budget, Created, Actions.

Controls: search, status, priority, source, sort, New Lead, Export CSV, pagination.

Rules:

- filters reflected in URL;
- search debounce around 300ms;
- filter change resets offset;
- delete confirmation;
- separate “no data” and “no filter results” states.

## New lead form

Fields: name, email, company, source, budget text, deadline text, description, analyze toggle.

Use RHF + Zod. Preserve values on API error. Prevent double submit. Show description character counter. Success navigates to details.

## Lead details

- contact/original request
- status select
- priority badge
- AI analysis card
- not requested/pending/completed/failed states
- re-analyze
- notification state and manual send
- delete
- readable timestamps

## Settings

- company name
- Telegram enabled
- Telegram chat ID
- minimum priority
- read-only provider/model/configured badges
- save and test buttons

## Shared components

AppShell, PageHeader, StatCard, PriorityBadge, StatusBadge, AnalysisStatusBadge, NotificationStatusBadge, LoadingSkeleton, EmptyState, ErrorState, ConfirmDialog, Pagination, CopyButton.

## Accessibility

Visible labels, semantic headings, keyboard focus, aria-label for icon buttons, no status conveyed only by color, dialog focus management, no `dangerouslySetInnerHTML`.

## Production UI additions

- Lead table logic uses TanStack Table while server filtering/pagination remain authoritative.
- API client and types come from FastAPI OpenAPI through openapi-typescript/openapi-fetch.
- Storybook documents shared components and all integration states.
- MSW provides the same mock handlers to Storybook and frontend tests.
- Motion is limited to short, reduced-motion-aware transitions.
- React Error Boundary wraps route-level and high-value widgets.
- Every copied block is adapted to project tokens and accessibility requirements.

See `23_UI_TOOLKIT.md`.
