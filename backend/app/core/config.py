from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
REPO_ROOT_ENV_FILE = BACKEND_DIR.parent / ".env"
DEFAULT_DB_PATH = BACKEND_DIR / "data" / "leadflow.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=REPO_ROOT_ENV_FILE, extra="ignore")

    app_name: str = "LeadFlow AI"
    app_version: str = "0.1.0"
    environment: str = "development"
    log_level: str = "INFO"
    api_v1_prefix: str = "/api/v1"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    database_url: str = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"

    ai_provider: str = "mock"
    openai_api_key: str = ""
    openai_model: str = "gpt-5.6-luna"
    ai_timeout_seconds: int = 30

    telegram_provider: str = "mock"
    telegram_bot_token: str = ""
    telegram_timeout_seconds: int = 10

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
