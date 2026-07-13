# Data model and API

## Enums

LeadStatus: `new`, `contacted`, `qualified`, `won`, `lost`  
LeadPriority: `low`, `medium`, `high`, `urgent`  
AnalysisStatus: `not_requested`, `pending`, `completed`, `failed`  
NotificationStatus: `not_required`, `pending`, `sent`, `failed`  
LeadSource: `website`, `email`, `telegram`, `referral`, `manual`, `other`

## Lead table

| Field | Rule |
|---|---|
| id | UUID primary key |
| name | 2–120 |
| email | validated, max 254 |
| company | optional, max 160 |
| source | enum, default manual |
| budget_text | original input, max 160 |
| deadline_text_input | original input, max 160 |
| description | 20–5000 |
| status | default new |
| priority | nullable AI/manual result |
| category | nullable, max 80 |
| ai_summary | nullable, max 500 |
| budget_min/max | nullable non-negative integers |
| currency | nullable ISO 3 letters |
| deadline_text | nullable, max 160 |
| recommended_action | nullable, max 300 |
| tags | JSON array |
| confidence | nullable 0..1 |
| analysis_reasons | JSON array |
| analysis_status/error | typed state and safe error |
| ai_model/prompt_version | audit fields |
| notification_status/error | typed state and safe error |
| last_notified_at | UTC nullable |
| created_at/updated_at | UTC |

Indexes: created_at, status, priority, email, composite status+priority.

## Settings singleton

`id=1`, company_name, telegram_chat_id, telegram_enabled, notify_min_priority, timestamps. Never stores tokens.

## API base

`/api/v1`

### Health/meta

- GET `/health`
- GET `/ready`
- GET `/meta/config`

### Leads

- POST `/leads`
- GET `/leads`
- GET `/leads/{id}`
- PATCH `/leads/{id}`
- DELETE `/leads/{id}`
- POST `/leads/{id}/analyze`
- POST `/leads/{id}/notify`
- GET `/leads/export.csv`

List query:

- search
- status
- priority
- source
- sort_by: created_at, updated_at, name, priority, status
- sort_order: asc/desc
- limit 1–100
- offset >=0

Paginated response:

```json
{"items": [], "total": 0, "limit": 20, "offset": 0}
```

Create behavior:

- invalid body → 422
- AI failure → still 201 with `analysis_status=failed`
- Telegram failure → still 201 with `notification_status=failed`

### Dashboard

GET `/dashboard/stats` returns total, new, high_priority, urgent, won, conversion_rate, by_priority and recent_leads.

### Settings

- GET `/settings`
- PATCH `/settings`
- POST `/settings/test-telegram`

### CSV

Columns: created_at, name, email, company, source, status, priority, category, budget, currency, deadline, summary, action, tags.

Protect cells starting with `=`, `+`, `-`, `@` from spreadsheet formula injection.
