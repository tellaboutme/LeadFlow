from fastapi import APIRouter

from app.api.v1 import dashboard, health, leads, meta, settings, testing

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(meta.router)
api_router.include_router(leads.router)
api_router.include_router(settings.router)
api_router.include_router(dashboard.router)
api_router.include_router(testing.router)
