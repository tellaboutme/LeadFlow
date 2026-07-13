from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    CheckConstraint,
    Enum,
    Float,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy import (
    DateTime as SQLDateTime,
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.db.base import Base, TimestampMixin
from app.models.enums import (
    AnalysisStatus,
    LeadPriority,
    LeadSource,
    LeadStatus,
    NotificationStatus,
)


def _new_uuid() -> str:
    return str(uuid4())


class Lead(TimestampMixin, Base):
    __tablename__ = "leads"
    __table_args__ = (
        CheckConstraint("budget_min IS NULL OR budget_min >= 0", name="ck_leads_budget_min_nonneg"),
        CheckConstraint("budget_max IS NULL OR budget_max >= 0", name="ck_leads_budget_max_nonneg"),
        CheckConstraint(
            "confidence IS NULL OR (confidence >= 0 AND confidence <= 1)",
            name="ck_leads_confidence_range",
        ),
        Index("ix_leads_created_at", "created_at"),
        Index("ix_leads_status", "status"),
        Index("ix_leads_priority", "priority"),
        Index("ix_leads_email", "email"),
        Index("ix_leads_status_priority", "status", "priority"),
    )

    # Identity
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)

    # User-provided fields
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    company: Mapped[str | None] = mapped_column(String(160), nullable=True)
    source: Mapped[LeadSource] = mapped_column(
        Enum(LeadSource, native_enum=False, length=20),
        nullable=False,
        default=LeadSource.MANUAL,
    )
    budget_text: Mapped[str | None] = mapped_column(String(160), nullable=True)
    deadline_text_input: Mapped[str | None] = mapped_column(String(160), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Workflow state
    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, native_enum=False, length=20),
        nullable=False,
        default=LeadStatus.NEW,
    )
    priority: Mapped[LeadPriority | None] = mapped_column(
        Enum(LeadPriority, native_enum=False, length=20), nullable=True
    )
    category: Mapped[str | None] = mapped_column(String(80), nullable=True)

    # AI analysis result
    ai_summary: Mapped[str | None] = mapped_column(String(500), nullable=True)
    budget_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    budget_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    deadline_text: Mapped[str | None] = mapped_column(String(160), nullable=True)
    recommended_action: Mapped[str | None] = mapped_column(String(300), nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    analysis_reasons: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    # Analysis audit / state
    analysis_status: Mapped[AnalysisStatus] = mapped_column(
        Enum(AnalysisStatus, native_enum=False, length=20),
        nullable=False,
        default=AnalysisStatus.NOT_REQUESTED,
    )
    analysis_error: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ai_model: Mapped[str | None] = mapped_column(String(80), nullable=True)
    prompt_version: Mapped[str | None] = mapped_column(String(40), nullable=True)

    # Notification state
    notification_status: Mapped[NotificationStatus] = mapped_column(
        Enum(NotificationStatus, native_enum=False, length=20),
        nullable=False,
        default=NotificationStatus.NOT_REQUIRED,
    )
    notification_error: Mapped[str | None] = mapped_column(String(500), nullable=True)
    last_notified_at: Mapped[datetime | None] = mapped_column(
        SQLDateTime(timezone=True), nullable=True
    )
