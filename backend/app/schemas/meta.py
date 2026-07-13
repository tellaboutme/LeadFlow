from pydantic import BaseModel


class MetaConfigResponse(BaseModel):
    app_name: str
    app_version: str
    environment: str
    ai_provider: str
    telegram_provider: str
