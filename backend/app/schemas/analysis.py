from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints

from app.models.enums import LeadPriority


class AnalysisCategory(StrEnum):
    WEBSITE_DEVELOPMENT = "Website Development"
    ECOMMERCE = "E-commerce"
    AUTOMATION = "Automation"
    AI_CHATBOT = "AI Chatbot"
    DATA_EXTRACTION = "Data Extraction"
    API_INTEGRATION = "API Integration"
    MOBILE_APP = "Mobile App"
    OTHER = "Other"


class LeadAnalysisInput(BaseModel):
    """Raw, untrusted lead fields handed to a provider for classification."""

    name: str
    company: str | None = None
    description: str
    budget_text: str | None = None
    deadline_text_input: str | None = None


class LeadAnalysisResult(BaseModel):
    """Structured analysis output. Shared by the mock and OpenAI providers.

    Also used directly as the OpenAI Structured Outputs schema (no manual JSON
    parsing). Field bounds mirror docs/AI_AND_TELEGRAM.md.
    """

    category: AnalysisCategory
    priority: LeadPriority
    summary: Annotated[str, StringConstraints(min_length=40, max_length=500)]
    budget_min: int | None = Field(default=None, ge=0)
    budget_max: int | None = Field(default=None, ge=0)
    currency: Annotated[str, StringConstraints(min_length=3, max_length=3)] | None = None
    deadline_text: Annotated[str, StringConstraints(max_length=160)] | None = None
    recommended_action: Annotated[str, StringConstraints(min_length=10, max_length=300)]
    tags: Annotated[list[str], Field(min_length=1, max_length=5)]
    confidence: Annotated[float, Field(ge=0.0, le=1.0)]
    reasons: Annotated[list[str], Field(min_length=1, max_length=3)]
