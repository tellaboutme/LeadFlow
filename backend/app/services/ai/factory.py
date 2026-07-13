from app.core.config import Settings
from app.services.ai.base import AIProvider, AIProviderError
from app.services.ai.mock_provider import MockAIProvider
from app.services.ai.openai_provider import OpenAIResponsesProvider


def get_ai_provider(settings: Settings) -> AIProvider:
    provider = settings.ai_provider.strip().lower()
    if provider == "mock":
        return MockAIProvider()
    if provider == "openai":
        return OpenAIResponsesProvider(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            timeout_seconds=settings.ai_timeout_seconds,
        )
    raise AIProviderError(f"Unknown AI provider: {settings.ai_provider!r}")
