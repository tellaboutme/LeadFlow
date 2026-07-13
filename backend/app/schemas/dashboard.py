from pydantic import BaseModel

from app.schemas.lead import LeadRead


class PriorityBucket(BaseModel):
    priority: str
    count: int


class DashboardStats(BaseModel):
    total: int
    new: int
    high_priority: int
    urgent: int
    won: int
    conversion_rate: float
    by_priority: list[PriorityBucket]
    recent_leads: list[LeadRead]
