import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from geoalchemy2.elements import WKTElement
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.thermal_event import ThermalEvent
from app.schemas.thermal_event import SyncStatusResponse, SyncSummaryResponse
from app.services.classification import classification_service
from app.services.context import context_service
from app.services.features import feature_service
from app.services.firms import firms_service

logger = logging.getLogger("live_routes")
router = APIRouter(tags=["Live FIRMS Ingestion"])


@router.post(
    "/live/sync",
    response_model=SyncSummaryResponse,
    summary="Synchronize and classify recent NASA FIRMS thermal detections",
    description=(
        "Queries NASA FIRMS API for recent Talcher-Angul hotspot detections across "
        "all configured NRT VIIRS instruments, runs the trained XGBoost model to classify "
        "each event, and stores new unique thermal observations in PostgreSQL/PostGIS."
    )
)
async def sync_firms_data(
    days: int = Query(1, ge=1, le=5, description="Day range for FIRMS query (1-5, per NASA API limit)"),
    source: str = Query("auto", description="FIRMS sensor source: 'auto' merges VIIRS_SNPP_NRT + VIIRS_NOAA20_NRT"),
    db: Session = Depends(get_db)
):
    sync_time = datetime.now(timezone.utc)

    # 1. Fetch observations from FIRMS service (all configured NRT instruments)
    if source.lower() in ("auto", "all", ""):
        observations = await firms_service.fetch_recent_detections(day_range=days)
    else:
        observations = await firms_service.fetch_area_hotspots(source=source, day_range=days)
    total_fetched = len(observations)
    total_processed = 0
    total_inserted = 0
    total_skipped = 0

    if total_fetched == 0:
        return SyncSummaryResponse(
            status="success",
            total_fetched=0,
            total_processed=0,
            total_inserted=0,
            total_skipped=0,
            sync_timestamp=sync_time,
            message="No thermal anomaly detections found for the specified period."
        )

    for obs in observations:
        try:
            lat = float(obs["latitude"])
            lon = float(obs["longitude"])
            ts = obs["timestamp"]

            # Deduplication check
            existing = db.query(ThermalEvent.id).filter(
                ThermalEvent.latitude == lat,
                ThermalEvent.longitude == lon,
                ThermalEvent.timestamp == ts
            ).first()

            if existing:
                total_skipped += 1
                continue

            # 2. Extract 12 ML features
            features = feature_service.transform_firms_observation(obs)

            # 3. Classify with XGBoost
            prediction = classification_service.predict(features)
            pred_class = prediction["class_id"]
            confidence = prediction["confidence"]

            # 4. Compute operational context (industry distance, persistence, night ratio, cluster)
            context = context_service.compute_event_context(
                db,
                lat,
                lon,
                ts,
                float(features.get("frp", 0.0) or 0.0),
                pred_class,
                features.get("daynight"),
            )

            # 5. Insert into PostGIS
            point_wkt = f"POINT({lon} {lat})"
            new_event = ThermalEvent(
                latitude=lat,
                longitude=lon,
                timestamp=ts,
                brightness=features.get("brightness"),
                frp=features.get("frp"),
                satellite=obs.get("satellite", "SNPP"),
                prediction_class=pred_class,
                confidence=confidence,
                distance_to_industry=context["distance_to_industry"],
                persistence_days=context["persistence_days"],
                night_ratio=context["night_ratio"],
                cluster_size=context["cluster_size"],
                nearby_facility=context["nearby_facility"],
                land_cover=context["land_cover"],
                geometry=WKTElement(point_wkt, srid=4326)
            )

            db.add(new_event)
            total_processed += 1
            total_inserted += 1

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing FIRMS observation: {e}")
            total_skipped += 1
            continue

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database commit failed during FIRMS sync: {e}")
        raise HTTPException(status_code=500, detail=f"Database commit failed: {str(e)}")

    message = (
        f"Successfully synchronized {total_inserted} new thermal events "
        f"({total_skipped} skipped/duplicate) from NASA FIRMS."
    )

    return SyncSummaryResponse(
        status="success",
        total_fetched=total_fetched,
        total_processed=total_processed,
        total_inserted=total_inserted,
        total_skipped=total_skipped,
        sync_timestamp=sync_time,
        message=message
    )


@router.get(
    "/live/status",
    response_model=SyncStatusResponse,
    summary="Get live sync status and system health",
    description="Returns metadata on live ingestion pipeline, database event count, and ML model availability."
)
def get_live_sync_status(db: Session = Depends(get_db)):
    last_timestamp = db.query(func.max(ThermalEvent.timestamp)).scalar()
    total_count = db.query(func.count(ThermalEvent.id)).scalar() or 0

    return SyncStatusResponse(
        last_sync_timestamp=last_timestamp,
        total_events_in_db=total_count,
        firms_api_configured=firms_service.is_configured(),
        model_loaded=classification_service.is_available()
    )
