import html

from app.models.lead import Lead


def _esc(value: object) -> str:
    text = str(value).strip() if value not in (None, "") else "-"
    return html.escape(text)


def _format_budget(lead: Lead) -> str:
    if lead.budget_min is None and lead.budget_max is None:
        return "-"
    currency = f" {lead.currency}" if lead.currency else ""
    if lead.budget_min == lead.budget_max:
        return html.escape(f"{lead.budget_min}{currency}")
    return html.escape(f"{lead.budget_min}-{lead.budget_max}{currency}")


def build_lead_message(lead: Lead) -> str:
    """Build a Telegram HTML message. Every user-controlled value is HTML-escaped
    so lead text cannot inject markup or break the message."""
    priority = lead.priority.value if lead.priority else "unrated"
    lines = [
        f"<b>New lead ({_esc(priority)})</b>",
        f"<b>Client:</b> {_esc(lead.name)}",
        f"<b>Company:</b> {_esc(lead.company)}",
        f"<b>Email:</b> {_esc(lead.email)}",
        f"<b>Category:</b> {_esc(lead.category)}",
        f"<b>Budget:</b> {_format_budget(lead)}",
        f"<b>Deadline:</b> {_esc(lead.deadline_text)}",
        f"<b>Summary:</b> {_esc(lead.ai_summary)}",
        f"<b>Action:</b> {_esc(lead.recommended_action)}",
    ]
    return "\n".join(lines)
