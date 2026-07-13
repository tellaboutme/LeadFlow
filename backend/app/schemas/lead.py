from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints

from app.models.enums import (
    AnalysisStatus,
    LeadPriority,
    LeadSource,
    LeadStatus,
    NotificationStatus,
)

# Reusable constrained string types (validation mirrors DATA_AND_API.md).
Name = Annotated[str, StringConstraints(min_length=2, max_length=120, strip_whitespace=True)]
Email = Annotated[EmailStr, Field(max_length=254)]
Company = Annotated[str, StringConstraints(max_length=160, strip_whitespace=True)]
ShortText = Annotated[str, StringConstraints(max_length=160, strip_whitespace=True)]
Description = Annotated[
    str, StringConstraints(min_length=20, max_length=5000, strip_whitespace=True)
]
Category = Annotated[str, StringConstraints(max_length=80, strip_whitespace=True)]


class LeadCreate(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Alice Anderson",
                "email": "alice@example.com",
                "company": "Acme Web Co",
                "source": "website",
                "budget_text": "around $20k",
                "deadline_text_input": "within 2 months",
                "description": "We need a marketing website redesign with a CMS and blog.",
            }
        }
    )

    name: Name
    email: Email
    company: Company | None = None
    source: LeadSource = LeadSource.MANUAL
    budget_text: ShortText | None = None
    deadline_text_input: ShortText | None = None
    description: Description


class LeadUpdate(BaseModel):
    """Partial update; only provided fields are changed."""

    model_config = ConfigDict(
        json_schema_extra={"example": {"status": "contacted", "priority": "high"}}
    )

    name: Name | None = None
    email: Email | None = None
    company: Company | None = None
    source: LeadSource | None = None
    budget_text: ShortText | None = None
    deadline_text_input: ShortText | None = None
    description: Description | None = None
    status: LeadStatus | None = None
    priority: LeadPriority | None = None
    category: Category | None = None


class LeadRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    company: str | None
    source: LeadSource
    budget_text: str | None
    deadline_text_input: str | None
    description: str

    status: LeadStatus
    priority: LeadPriority | None
    category: str | None

    ai_summary: str | None
    budget_min: int | None
    budget_max: int | None
    currency: str | None
    deadline_text: str | None
    recommended_action: str | None
    tags: list[str]
    confidence: float | None
    analysis_reasons: list[str]

    analysis_status: AnalysisStatus
    analysis_error: str | None
    ai_model: str | None
    prompt_version: str | None

    notification_status: NotificationStatus
    notification_error: str | None
    last_notified_at: datetime | None

    created_at: datetime
    updated_at: datetime


class LeadListResponse(BaseModel):
    items: list[LeadRead]
    total: int
    limit: int
    offset: int
