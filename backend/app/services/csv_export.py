"""Build CSV exports of leads: UTF-8, optional BOM, formula-injection guarded."""

import csv
import io
from datetime import datetime
from enum import Enum

from app.models.lead import Lead

# OWASP CSV-injection guidance: cells starting with these characters can be
# interpreted as formulas by spreadsheet software. Prefix with a single quote
# so they are always read back as plain text.
_DANGEROUS_PREFIXES = ("=", "+", "-", "@", "\t", "\r")

_COLUMNS: list[tuple[str, str]] = [
    ("id", "ID"),
    ("name", "Name"),
    ("email", "Email"),
    ("company", "Company"),
    ("source", "Source"),
    ("status", "Status"),
    ("priority", "Priority"),
    ("category", "Category"),
    ("budget_text", "Budget"),
    ("budget_min", "Budget min"),
    ("budget_max", "Budget max"),
    ("currency", "Currency"),
    ("deadline_text", "Deadline"),
    ("description", "Description"),
    ("ai_summary", "AI summary"),
    ("recommended_action", "Recommended action"),
    ("tags", "Tags"),
    ("created_at", "Created at"),
    ("updated_at", "Updated at"),
]


def _sanitize_cell(value: str) -> str:
    if value and value[0] in _DANGEROUS_PREFIXES:
        return f"'{value}"
    return value


def _cell_value(lead: Lead, field: str) -> str:
    value = getattr(lead, field)
    if value is None:
        return ""
    if field == "tags":
        return "; ".join(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, Enum):
        return str(value.value)
    return str(value)


def build_leads_csv(leads: list[Lead], *, bom: bool = False) -> bytes:
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\r\n")
    writer.writerow(label for _, label in _COLUMNS)
    for lead in leads:
        writer.writerow(_sanitize_cell(_cell_value(lead, field)) for field, _ in _COLUMNS)

    content = buffer.getvalue().encode("utf-8")
    return b"\xef\xbb\xbf" + content if bom else content
