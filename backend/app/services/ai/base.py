from typing import Protocol

from app.schemas.analysis import LeadAnalysisInput, LeadAnalysisResult


class AIProviderError(Exception):
    """Raised when a provider cannot produce a valid analysis (network, timeout,
    provider error, or invalid output). Carries a safe, user-facing message."""


class AIProvider(Protocol):
    """Analyzes a lead into structured output. Implementations must be side-effect
    free with respect to the database (the service persists the result)."""

    name: str
    model: str
    prompt_version: str

    def analyze(self, data: LeadAnalysisInput) -> LeadAnalysisResult: ...
