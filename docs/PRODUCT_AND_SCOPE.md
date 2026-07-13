# Product and scope

## Problem

Small teams receive unstructured inquiries and manually decide whether a lead is serious, what it needs, whether a budget is present and what to do next.

## Product promise

LeadFlow AI turns a raw inquiry into a persistent structured record with:

- category;
- priority;
- concise summary;
- explicit budget/deadline extraction;
- recommended next action;
- tags and confidence;
- optional Telegram alert.

## Target user

Small software agency, freelance developer, automation consultant, local service business or marketing team without a full CRM.

## Success criteria

A first-time user can create a lead, see analysis, change status and find the lead again within 60 seconds.

## Must have

- Lead CRUD
- AI mock and OpenAI
- Telegram mock and real
- dashboard
- filters
- settings
- CSV
- seed
- tests
- Docker/CI
- portfolio documentation

## Explicitly excluded

Auth, payments, multi-user teams, webhooks, public form, Kanban, emails, attachments, queues, agents and vector search.

## Product principles

1. Save raw data before calling external APIs.
2. Integration failure must never lose a lead.
3. AI fields are visible and retryable.
4. UI always has loading, empty and error states.
5. Synthetic demo data only.
