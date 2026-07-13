# Decisions

## ADR-007 Mock providers are first-class

Приложение и CI должны работать без платных API.

## ADR-006 OpenAI Responses API + Structured Outputs

AI возвращает типизированную Pydantic-структуру, а не свободный JSON.

## ADR-005 React, not Vue

Один глубокий frontend-стек сильнее поверхностного переключения.

## ADR-004 No authentication in MVP

Это single-user portfolio demo с явным security warning.

## ADR-003 SQLite for MVP

Простой локальный запуск, миграции через Alembic, upgrade path через DATABASE_URL.

## ADR-002 Synchronous SQLAlchemy

Меньше сложности для текущей нагрузки.

## ADR-001 Modular monolith

Один FastAPI backend с чёткими слоями.
