from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

from app.models.enums import LeadPriority


class SettingsRead(BaseModel):
    """Public settings view. Never includes the Telegram bot token."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str | None
    telegram_chat_id: str | None
    telegram_enabled: bool
    notify_min_priority: LeadPriority
    created_at: datetime
    updated_at: datetime


class SettingsUpdate(BaseModel):
    company_name: Annotated[str, StringConstraints(max_length=160)] | None = None
    telegram_chat_id: Annotated[str, StringConstraints(max_length=64)] | None = None
    telegram_enabled: bool | None = None
    notify_min_priority: LeadPriority | None = None


class TestTelegramRequest(BaseModel):
    chat_id: Annotated[str, StringConstraints(max_length=64)] | None = None


class TestTelegramResponse(BaseModel):
    ok: bool
    provider: str
    error: str | None = None
