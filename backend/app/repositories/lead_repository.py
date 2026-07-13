from __future__ import annotations

import builtins
from enum import StrEnum

from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import InstrumentedAttribute, Session
from sqlalchemy.sql.elements import ColumnElement

from app.models.enums import LeadPriority, LeadStatus
from app.models.lead import Lead
from app.schemas.lead_query import LeadFilterParams, LeadListParams, LeadSortField, SortOrder


def _enum_rank(
    column: InstrumentedAttribute[str | None], enum_cls: type[StrEnum]
) -> ColumnElement[int]:
    """Rank by declaration order (low->urgent, new->lost), not alphabetically."""
    return case(
        *[(column == member.value, index) for index, member in enumerate(enum_cls)],
        else_=-1,
    )


_SORT_COLUMNS = {
    LeadSortField.CREATED_AT: Lead.created_at,
    LeadSortField.UPDATED_AT: Lead.updated_at,
    LeadSortField.NAME: Lead.name,
    LeadSortField.PRIORITY: _enum_rank(Lead.priority, LeadPriority),
    LeadSortField.STATUS: _enum_rank(Lead.status, LeadStatus),
}


class LeadRepository:
    """Data access for leads: persistence plus filtered/sorted/paged listing."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def add(self, lead: Lead) -> Lead:
        self.db.add(lead)
        self.db.flush()
        return lead

    def get(self, lead_id: str) -> Lead | None:
        return self.db.get(Lead, lead_id)

    def delete(self, lead: Lead) -> None:
        self.db.delete(lead)

    @staticmethod
    def _build_filters(params: LeadFilterParams) -> list[ColumnElement[bool]]:
        filters = []
        if params.search:
            term = f"%{params.search.strip()}%"
            filters.append(
                or_(
                    Lead.name.ilike(term),
                    Lead.email.ilike(term),
                    Lead.company.ilike(term),
                )
            )
        if params.status is not None:
            filters.append(Lead.status == params.status)
        if params.priority == "none":
            filters.append(Lead.priority.is_(None))
        elif params.priority is not None:
            filters.append(Lead.priority == params.priority)
        if params.source is not None:
            filters.append(Lead.source == params.source)
        return filters

    @staticmethod
    def _ordering(params: LeadFilterParams) -> ColumnElement[object]:
        column = _SORT_COLUMNS[params.sort_by]
        return column.asc() if params.sort_order == SortOrder.ASC else column.desc()

    def list(self, params: LeadListParams) -> tuple[list[Lead], int]:
        """Return (items for the requested page, total matching count)."""
        filters = self._build_filters(params)

        total = self.db.scalar(select(func.count()).select_from(Lead).where(*filters)) or 0

        stmt = (
            select(Lead)
            .where(*filters)
            .order_by(self._ordering(params), Lead.id.asc())
            .limit(params.limit)
            .offset(params.offset)
        )
        items = list(self.db.scalars(stmt).all())
        return items, total

    def list_for_export(self, params: LeadFilterParams) -> builtins.list[Lead]:
        """Return all matching leads (no pagination) for CSV export."""
        filters = self._build_filters(params)
        stmt = select(Lead).where(*filters).order_by(self._ordering(params), Lead.id.asc())
        return list(self.db.scalars(stmt).all())

    def count_all(self) -> int:
        return self.db.scalar(select(func.count()).select_from(Lead)) or 0

    def counts_by_status(self) -> dict[str, int]:
        rows = self.db.execute(select(Lead.status, func.count()).group_by(Lead.status)).all()
        return {status.value: count for status, count in rows}

    def counts_by_priority(self) -> dict[str | None, int]:
        rows = self.db.execute(select(Lead.priority, func.count()).group_by(Lead.priority)).all()
        return {(priority.value if priority else None): count for priority, count in rows}

    def recent(self, limit: int) -> builtins.list[Lead]:
        stmt = select(Lead).order_by(Lead.created_at.desc(), Lead.id.desc()).limit(limit)
        return list(self.db.scalars(stmt).all())
