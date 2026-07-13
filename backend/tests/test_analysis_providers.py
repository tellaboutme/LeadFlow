from typing import Any

import httpx
import pytest
from openai import APITimeoutError

from app.models.enums import AnalysisStatus, LeadPriority
from app.schemas.analysis import AnalysisCategory, LeadAnalysisInput, LeadAnalysisResult
from app.services.ai.base import AIProviderError
from app.services.ai.openai_provider import OpenAIResponsesProvider

SAMPLE_RESULT = LeadAnalysisResult(
    category=AnalysisCategory.OTHER,
    priority=LeadPriority.LOW,
    summary="A placeholder analysis summary that is at least forty characters long.",
    recommended_action="Follow up soon.",
    tags=["misc"],
    confidence=0.5,
    reasons=["placeholder"],
)


def _timeout() -> APITimeoutError:
    return APITimeoutError(request=httpx.Request("POST", "https://api.openai.com/v1/responses"))


def _make_provider() -> OpenAIResponsesProvider:
    return OpenAIResponsesProvider(api_key="test-key", model="test-model", timeout_seconds=5)


def test_openai_provider_requires_key() -> None:
    with pytest.raises(AIProviderError):
        OpenAIResponsesProvider(api_key="", model="m", timeout_seconds=5)


def test_retries_once_then_succeeds(monkeypatch: pytest.MonkeyPatch) -> None:
    provider = _make_provider()
    calls = {"n": 0}

    def fake_invoke(_data: LeadAnalysisInput) -> LeadAnalysisResult:
        calls["n"] += 1
        if calls["n"] == 1:
            raise _timeout()
        return SAMPLE_RESULT

    monkeypatch.setattr(provider, "_invoke", fake_invoke)
    result = provider.analyze(LeadAnalysisInput(name="x", description="desc"))
    assert result is SAMPLE_RESULT
    assert calls["n"] == 2


def test_non_retryable_fails_immediately(monkeypatch: pytest.MonkeyPatch) -> None:
    provider = _make_provider()
    calls = {"n": 0}

    def fake_invoke(_data: LeadAnalysisInput) -> LeadAnalysisResult:
        calls["n"] += 1
        raise ValueError("bad")

    monkeypatch.setattr(provider, "_invoke", fake_invoke)
    with pytest.raises(AIProviderError):
        provider.analyze(LeadAnalysisInput(name="x", description="desc"))
    assert calls["n"] == 1


def test_gives_up_after_one_retry(monkeypatch: pytest.MonkeyPatch) -> None:
    provider = _make_provider()
    calls = {"n": 0}

    def fake_invoke(_data: LeadAnalysisInput) -> LeadAnalysisResult:
        calls["n"] += 1
        raise _timeout()

    monkeypatch.setattr(provider, "_invoke", fake_invoke)
    with pytest.raises(AIProviderError):
        provider.analyze(LeadAnalysisInput(name="x", description="desc"))
    assert calls["n"] == 2


class _FailingProvider:
    name = "failing"
    model = "failing"
    prompt_version = "v"

    def analyze(self, data: Any) -> LeadAnalysisResult:
        raise AIProviderError("simulated failure")


def test_analysis_service_records_failure_and_keeps_lead(db_session: Any) -> None:
    from app.models.lead import Lead
    from app.services.analysis_service import AnalysisService

    lead = Lead(name="Test", email="t@example.com", description="A description long enough here.")
    db_session.add(lead)
    db_session.commit()

    AnalysisService(db_session, _FailingProvider()).analyze(lead)

    stored = db_session.get(Lead, lead.id)
    assert stored is not None
    assert stored.analysis_status == AnalysisStatus.FAILED
    assert stored.analysis_error == "simulated failure"
