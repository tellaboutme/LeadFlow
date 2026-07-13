"""Idempotent demo seed: 12 synthetic leads plus the settings singleton.

Run after migrations: `uv run python -m app.db.seed`. Re-running is safe — rows
are keyed by deterministic UUIDs, so existing rows are skipped (no duplicates).
All data is synthetic; no real personal data.
"""

from uuid import NAMESPACE_URL, uuid5

from sqlalchemy.orm import Session

from app.models.enums import (
    AnalysisStatus,
    LeadPriority,
    LeadSource,
    LeadStatus,
    NotificationStatus,
)
from app.models.lead import Lead
from app.repositories.settings_repository import get_or_create_settings

_SEED_NAMESPACE = uuid5(NAMESPACE_URL, "leadflow/seed/leads")


def _seed_id(slug: str) -> str:
    return str(uuid5(_SEED_NAMESPACE, slug))


# 12 synthetic leads covering every status, priority, and a spread of
# categories/sources. "analyzed" rows carry AI fields; fresh rows do not.
SEED_LEADS: list[dict[str, object]] = [
    {
        "slug": "acme-web",
        "name": "Alice Anderson",
        "email": "alice@example.com",
        "company": "Acme Web Co",
        "source": LeadSource.WEBSITE,
        "description": "Marketing website redesign with a CMS and blog, needed within two months.",
        "status": LeadStatus.NEW,
        "analysis_status": AnalysisStatus.NOT_REQUESTED,
    },
    {
        "slug": "bright-mobile",
        "name": "Bob Brown",
        "email": "bob@example.com",
        "company": "Bright Apps",
        "source": LeadSource.REFERRAL,
        "description": "Cross-platform mobile app for field technicians and dispatch coordination.",
        "status": LeadStatus.NEW,
        "analysis_status": AnalysisStatus.NOT_REQUESTED,
    },
    {
        "slug": "cedar-consult",
        "name": "Carla Costa",
        "email": "carla@example.com",
        "company": "Cedar Consulting",
        "source": LeadSource.EMAIL,
        "description": "Fractional CTO to review architecture and set an engineering roadmap.",
        "status": LeadStatus.NEW,
        "priority": LeadPriority.LOW,
        "category": "Consulting",
        "analysis_status": AnalysisStatus.COMPLETED,
        "ai_summary": "Advisory engagement; low urgency, modest budget.",
        "budget_min": 3000,
        "budget_max": 6000,
        "currency": "USD",
        "confidence": 0.62,
        "tags": ["advisory", "architecture"],
        "analysis_reasons": ["Short-term scope", "No hard deadline"],
    },
    {
        "slug": "delta-ecom",
        "name": "David Diaz",
        "email": "david@example.com",
        "company": "Delta Commerce",
        "source": LeadSource.WEBSITE,
        "description": "Migrate our Shopify store to a faster headless storefront.",
        "status": LeadStatus.CONTACTED,
        "priority": LeadPriority.MEDIUM,
        "category": "E-commerce",
        "analysis_status": AnalysisStatus.COMPLETED,
        "ai_summary": "Headless commerce migration with a clear performance goal.",
        "budget_min": 15000,
        "budget_max": 25000,
        "currency": "USD",
        "confidence": 0.74,
        "tags": ["ecommerce", "headless", "performance"],
        "analysis_reasons": ["Defined scope", "Mid-range budget"],
    },
    {
        "slug": "echo-design",
        "name": "Elena Ivanova",
        "email": "elena@example.com",
        "company": "Echo Studio",
        "source": LeadSource.TELEGRAM,
        "description": "Design system and component library for a growing SaaS product suite.",
        "status": LeadStatus.CONTACTED,
        "priority": LeadPriority.HIGH,
        "category": "Design",
        "analysis_status": AnalysisStatus.COMPLETED,
        "ai_summary": "Design-system build for an established SaaS; high strategic value.",
        "budget_min": 20000,
        "budget_max": 40000,
        "currency": "USD",
        "confidence": 0.81,
        "tags": ["design-system", "saas"],
        "analysis_reasons": ["Established company", "Recurring need"],
    },
    {
        "slug": "foxtrot-data",
        "name": "Farid Hassan",
        "email": "farid@example.com",
        "company": "Foxtrot Analytics",
        "source": LeadSource.EMAIL,
        "description": "Urgent data pipeline rebuild before an investor demo in three weeks.",
        "status": LeadStatus.CONTACTED,
        "priority": LeadPriority.URGENT,
        "category": "Data Engineering",
        "analysis_status": AnalysisStatus.COMPLETED,
        "ai_summary": "Time-critical pipeline rebuild tied to a fundraising milestone.",
        "budget_min": 30000,
        "budget_max": 50000,
        "currency": "USD",
        "confidence": 0.88,
        "tags": ["data", "urgent", "pipeline"],
        "analysis_reasons": ["Hard deadline", "High budget", "Strategic event"],
        "notification_status": NotificationStatus.SENT,
    },
    {
        "slug": "golf-crm",
        "name": "Grace Green",
        "email": "grace@example.com",
        "company": "Golf CRM",
        "source": LeadSource.MANUAL,
        "description": "Integrate our CRM with a telephony provider and add call logging.",
        "status": LeadStatus.QUALIFIED,
        "priority": LeadPriority.MEDIUM,
        "category": "Integration",
        "analysis_status": AnalysisStatus.COMPLETED,
        "ai_summary": "CRM/telephony integration with automation; qualified opportunity.",
        "budget_min": 10000,
        "budget_max": 18000,
        "currency": "EUR",
        "confidence": 0.7,
        "tags": ["crm", "integration"],
        "analysis_reasons": ["Clear integration target"],
    },
    {
        "slug": "hotel-booking",
        "name": "Hana Kim",
        "email": "hana@example.com",
        "company": "Hotel Nexus",
        "source": LeadSource.WEBSITE,
        "description": "Build a booking engine with dynamic pricing and channel-manager sync.",
        "status": LeadStatus.QUALIFIED,
        "priority": LeadPriority.HIGH,
        "category": "Web Development",
        "analysis_status": AnalysisStatus.COMPLETED,
        "ai_summary": "Booking platform with dynamic pricing; strong fit and budget.",
        "budget_min": 35000,
        "budget_max": 60000,
        "currency": "USD",
        "confidence": 0.85,
        "tags": ["booking", "pricing"],
        "analysis_reasons": ["Well-defined product", "Strong budget"],
    },
    {
        "slug": "india-ai",
        "name": "Ishaan Rao",
        "email": "ishaan@example.com",
        "company": "Indus AI",
        "source": LeadSource.REFERRAL,
        "description": "Ship an AI assistant for our support desk with human-in-the-loop review.",
        "status": LeadStatus.WON,
        "priority": LeadPriority.HIGH,
        "category": "AI",
        "analysis_status": AnalysisStatus.COMPLETED,
        "ai_summary": "AI support assistant; won engagement with a phased rollout.",
        "budget_min": 40000,
        "budget_max": 70000,
        "currency": "USD",
        "confidence": 0.9,
        "tags": ["ai", "support", "won"],
        "analysis_reasons": ["Signed", "Phased scope"],
        "notification_status": NotificationStatus.SENT,
    },
    {
        "slug": "juliet-marketing",
        "name": "Julia Novak",
        "email": "julia@example.com",
        "company": "Juliet Marketing",
        "source": LeadSource.OTHER,
        "description": "Landing pages and analytics setup for a seasonal product launch campaign.",
        "status": LeadStatus.WON,
        "priority": LeadPriority.LOW,
        "category": "Marketing",
        "analysis_status": AnalysisStatus.COMPLETED,
        "ai_summary": "Small campaign build; won but low value.",
        "budget_min": 4000,
        "budget_max": 8000,
        "currency": "USD",
        "confidence": 0.6,
        "tags": ["marketing", "landing-page"],
        "analysis_reasons": ["Short campaign"],
    },
    {
        "slug": "kilo-legacy",
        "name": "Karl Meyer",
        "email": "karl@example.com",
        "company": "Kilo Systems",
        "source": LeadSource.EMAIL,
        "description": "Wanted a full ERP replacement but the budget and timeline did not align.",
        "status": LeadStatus.LOST,
        "priority": LeadPriority.MEDIUM,
        "category": "Enterprise",
        "analysis_status": AnalysisStatus.COMPLETED,
        "ai_summary": "Large ERP scope; lost on budget/timeline mismatch.",
        "budget_min": 80000,
        "budget_max": 120000,
        "currency": "USD",
        "confidence": 0.5,
        "tags": ["erp", "lost"],
        "analysis_reasons": ["Budget mismatch", "Unrealistic timeline"],
    },
    {
        "slug": "lima-spam",
        "name": "Liam Walsh",
        "email": "liam@example.com",
        "company": None,
        "source": LeadSource.WEBSITE,
        "description": "Vague inquiry with no clear scope; could not qualify despite follow-ups.",
        "status": LeadStatus.LOST,
        "analysis_status": AnalysisStatus.FAILED,
        "analysis_error": "Insufficient detail to analyze.",
    },
]


def run_seed(db: Session) -> int:
    """Create any missing seed rows; return the number newly inserted."""
    get_or_create_settings(db)

    inserted = 0
    for entry in SEED_LEADS:
        data = dict(entry)
        slug = str(data.pop("slug"))
        lead_id = _seed_id(slug)
        if db.get(Lead, lead_id) is not None:
            continue
        db.add(Lead(id=lead_id, **data))
        inserted += 1

    db.commit()
    return inserted


def main() -> None:
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        inserted = run_seed(db)
        print(f"Seed complete: {inserted} new lead(s) inserted, {len(SEED_LEADS)} total defined.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
