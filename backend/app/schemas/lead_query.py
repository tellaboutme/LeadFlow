from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field

from app.models.enums import LeadPriority, LeadSource, LeadStatus


class LeadSortField(StrEnum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    NAME = "name"
    PRIORITY = "priority"
    STATUS = "status"


class SortOrder(StrEnum):
    ASC = "asc"
    DESC = "desc"


class LeadFilterParams(BaseModel):
    """Search/filter/sort parameters shared by the lead list and CSV export."""

    search: str | None = Field(default=None, max_length=160)
    status: LeadStatus | None = None
    priority: LeadPriority | Literal["none"] | None = Field(
        default=None, description="Filter by priority; 'none' isolates unclassified leads."
    )
    source: LeadSource | None = None
    sort_by: LeadSortField = LeadSortField.CREATED_AT
    sort_order: SortOrder = SortOrder.DESC


class LeadListParams(LeadFilterParams):
    """Query parameters for the lead list endpoint (bounds enforce safe paging)."""

    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class LeadExportParams(LeadFilterParams):
    """Query parameters for the CSV export endpoint (filters plus format flags).

    FastAPI cannot mix a Pydantic-model query parameter with a sibling scalar
    query parameter (the model stops being flattened), so ``bom`` lives here
    instead of as a separate function argument.
    """

    bom: bool = Field(
        default=False, description="Prefix a UTF-8 BOM so Excel detects the encoding."
    )
