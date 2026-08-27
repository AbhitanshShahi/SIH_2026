from fastapi import APIRouter

from app.api.routes.events import router as events_router
from app.api.routes.health import router as health_router
from app.api.routes.live import router as live_router

api_router = APIRouter()

# Include sub-routers
api_router.include_router(health_router)
api_router.include_router(events_router)
api_router.include_router(live_router)
