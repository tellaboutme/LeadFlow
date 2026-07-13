from sqlalchemy import Boolean, CheckConstraint, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin
from app.models.enums import LeadPriority

SETTINGS_SINGLETON_ID = 1


class AppSettings(TimestampMixin, Base):
    """Single-row application settings. Never stores Telegram/API tokens."""

    __tablename__ = "app_settings"
    __table_args__ = (CheckConstraint("id = 1", name="ck_app_settings_singleton"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=SETTINGS_SINGLETON_ID)
    company_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    telegram_chat_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    telegram_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notify_min_priority: Mapped[LeadPriority] = mapped_column(
        Enum(LeadPriority, native_enum=False, length=20),
        nullable=False,
        default=LeadPriority.HIGH,
    )
