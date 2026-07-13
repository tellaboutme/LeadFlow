from fastapi import APIRouter

from app.api.deps import SettingsDep
from app.schemas.meta import MetaConfigResponse
from app.services import meta_service

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/config", response_model=MetaConfigResponse)
def get_config(settings: SettingsDep) -> MetaConfigResponse:
    return meta_service.get_meta_config(settings)
