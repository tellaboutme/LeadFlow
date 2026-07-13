from enum import StrEnum


class LeadStatus(StrEnum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    WON = "won"
    LOST = "lost"


class LeadPriority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class AnalysisStatus(StrEnum):
    NOT_REQUESTED = "not_requested"
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class NotificationStatus(StrEnum):
    NOT_REQUIRED = "not_required"
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class LeadSource(StrEnum):
    WEBSITE = "website"
    EMAIL = "email"
    TELEGRAM = "telegram"
    REFERRAL = "referral"
    MANUAL = "manual"
    OTHER = "other"
