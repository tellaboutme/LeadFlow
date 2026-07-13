from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models.enums import AnalysisStatus
from app.models.lead import Lead
from app.schemas.analysis import LeadAnalysisInput
from app.services.ai.base import AIProvider, AIProviderError
from app.services.ai.factory import get_ai_provider


class AnalysisService:
    def __init__(self, db: Session, provider: AIProvider) -> None:
        self.db = db
        self.provider = provider

    def analyze(self, lead: Lead) -> Lead:
        data = LeadAnalysisInput(
            name=lead.name,
            company=lead.company,
            description=lead.description,
            budget_text=lead.budget_text,
            deadline_text_input=lead.deadline_text_input,
        )
        try:
            result = self.provider.analyze(data)
        except AIProviderError as exc:
            return self._mark_failed(lead, str(exc))
        except Exception:
            # Never surface provider internals; keep the lead persisted.
            return self._mark_failed(lead, "AI analysis failed.")

        lead.category = result.category.value
        lead.priority = result.priority
        lead.ai_summary = result.summary
        lead.budget_min = result.budget_min
        lead.budget_max = result.budget_max
        lead.currency = result.currency
        lead.deadline_text = result.deadline_text
        lead.recommended_action = result.recommended_action
        lead.tags = list(result.tags)
        lead.confidence = result.confidence
        lead.analysis_reasons = list(result.reasons)
        lead.analysis_status = AnalysisStatus.COMPLETED
        lead.analysis_error = None
        lead.ai_model = self.provider.model
        lead.prompt_version = self.provider.prompt_version
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def _mark_failed(self, lead: Lead, message: str) -> Lead:
        lead.analysis_status = AnalysisStatus.FAILED
        lead.analysis_error = message[:500]
        self.db.commit()
        self.db.refresh(lead)
        return lead


def analyze_lead(db: Session, settings: Settings, lead: Lead) -> Lead:
    """Safe entry point: a misconfigured provider is recorded as a failed analysis
    (lead is kept) rather than raising, so lead creation still returns 201."""
    try:
        provider = get_ai_provider(settings)
    except AIProviderError as exc:
        lead.analysis_status = AnalysisStatus.FAILED
        lead.analysis_error = str(exc)[:500]
        db.commit()
        db.refresh(lead)
        return lead
    return AnalysisService(db, provider).analyze(lead)
