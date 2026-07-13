from sqlalchemy.orm import Session

from app.models.enums import LeadPriority, LeadStatus
from app.repositories.lead_repository import LeadRepository
from app.schemas.dashboard import DashboardStats, PriorityBucket
from app.schemas.lead import LeadRead

RECENT_LEADS_LIMIT = 5


def get_stats(db: Session) -> DashboardStats:
    repo = LeadRepository(db)
    total = repo.count_all()
    status_counts = repo.counts_by_status()
    priority_counts = repo.counts_by_priority()

    won = status_counts.get(LeadStatus.WON.value, 0)
    conversion_rate = round(won / total, 4) if total else 0.0

    by_priority = [
        PriorityBucket(priority=priority.value, count=priority_counts.get(priority.value, 0))
        for priority in LeadPriority
    ]
    unclassified = priority_counts.get(None, 0)
    if unclassified:
        by_priority.append(PriorityBucket(priority="unclassified", count=unclassified))

    return DashboardStats(
        total=total,
        new=status_counts.get(LeadStatus.NEW.value, 0),
        high_priority=priority_counts.get(LeadPriority.HIGH.value, 0),
        urgent=priority_counts.get(LeadPriority.URGENT.value, 0),
        won=won,
        conversion_rate=conversion_rate,
        by_priority=by_priority,
        recent_leads=[LeadRead.model_validate(lead) for lead in repo.recent(RECENT_LEADS_LIMIT)],
    )
