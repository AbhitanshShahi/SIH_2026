import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.thermal_event import ThermalEvent
from app.schemas.thermal_event import (
    SyncStatusResponse,
    SyncSummaryResponse,
)
from app.services.classification import classification_service
from app.services.firms import firms_service
from app.services.live_sync import run_firms_sync
from app.services.websocket_manager import connection_manager

logger = logging.getLogger("live_routes")

router = APIRouter(
    tags=["Live FIRMS Ingestion"]
)


@router.post(
    "/live/sync",
    response_model=SyncSummaryResponse,
    summary="Synchronize and classify recent NASA FIRMS thermal detections",
    description=(
        "Queries NASA FIRMS API for recent Talcher-Angul hotspot "
        "detections across all configured NRT VIIRS instruments, "
        "runs the trained XGBoost model to classify each event, "
        "and stores new unique thermal observations in "
        "PostgreSQL/PostGIS."
    ),
)
async def sync_firms_data(
    days: int = Query(
        1,
        ge=1,
        le=5,
        description=(
            "Day range for FIRMS query "
            "(1-5, per NASA API limit)"
        ),
    ),
    source: str = Query(
        "auto",
        description=(
            "FIRMS sensor source: 'auto' merges "
            "VIIRS_SNPP_NRT + VIIRS_NOAA20_NRT"
        ),
    ),
    db: Session = Depends(get_db),
):
    return await run_firms_sync(
        db=db,
        days=days,
        source=source,
    )


@router.get(
    "/live/status",
    response_model=SyncStatusResponse,
    summary="Get live sync status and system health",
    description=(
        "Returns metadata on live ingestion pipeline, "
        "database event count, and ML model availability."
    ),
)
def get_live_sync_status(
    db: Session = Depends(get_db),
):
    last_timestamp = db.query(
        func.max(ThermalEvent.timestamp)
    ).scalar()

    total_count = db.query(
        func.count(ThermalEvent.id)
    ).scalar() or 0

    return SyncStatusResponse(
        last_sync_timestamp=last_timestamp,
        total_events_in_db=total_count,
        firms_api_configured=(
            firms_service.is_configured()
        ),
        model_loaded=(
            classification_service.is_available()
        ),
    )

@router.websocket("/live/ws")
async def live_websocket(websocket: WebSocket):
    await connection_manager.connect(websocket)

    try:
        await websocket.send_json({
            "type": "connected",
            "message": "Live FIRMS WebSocket connected."
        })

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)

    except Exception:
        connection_manager.disconnect(websocket)
