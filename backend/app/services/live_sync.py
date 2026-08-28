import asyncio
import logging
from datetime import datetime, timezone
from fastapi import HTTPException
from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session
from app.models.thermal_event import ThermalEvent
from app.schemas.thermal_event import SyncSummaryResponse
from app.services.classification import classification_service
from app.services.context import context_service
from app.services.features import feature_service
from app.services.firms import firms_service
from app.services.websocket_manager import connection_manager

logger = logging.getLogger("live_sync_service")

sync_lock = asyncio.Lock()


async def run_firms_sync(
    db: Session,
    days: int = 5,
    source: str = "auto",
) -> SyncSummaryResponse:
    async with sync_lock:
        sync_time = datetime.now(timezone.utc)

        if not firms_service.is_configured():
            raise HTTPException(
                status_code=503,
                detail=(
                    "FIRMS_MAP_KEY is not configured. "
                    "Live synchronization is unavailable."
                ),
            )

        if not classification_service.is_available():
            raise HTTPException(
                status_code=503,
                detail=(
                    "XGBoost model is not loaded. "
                    "Live synchronization is unavailable."
                ),
            )

        if source.lower() in ("auto", "all", ""):
            observations = await firms_service.fetch_recent_detections(
                day_range=days
            )
        else:
            observations = await firms_service.fetch_area_hotspots(
                source=source,
                day_range=days,
            )

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
                message=(
                    "No new thermal anomaly detections "
                    "found from NASA FIRMS."
                ),
            )

        for obs in observations:
            try:
                lat = float(obs["latitude"])
                lon = float(obs["longitude"])
                ts = obs["timestamp"]

                existing = db.query(ThermalEvent.id).filter(
                    ThermalEvent.latitude == lat,
                    ThermalEvent.longitude == lon,
                    ThermalEvent.timestamp == ts,
                ).first()

                if existing:
                    total_skipped += 1
                    continue

                features = feature_service.transform_firms_observation(
                    obs
                )

                prediction = classification_service.predict(
                    features
                )

                pred_class = prediction["class_id"]
                confidence = prediction["confidence"]

                context = context_service.compute_event_context(
                    db,
                    lat,
                    lon,
                    ts,
                    float(features.get("frp", 0.0) or 0.0),
                    pred_class,
                    features.get("daynight"),
                )

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
                    distance_to_industry=context[
                        "distance_to_industry"
                    ],
                    persistence_days=context[
                        "persistence_days"
                    ],
                    night_ratio=context["night_ratio"],
                    cluster_size=context["cluster_size"],
                    nearby_facility=context["nearby_facility"],
                    land_cover=context["land_cover"],
                    geometry=WKTElement(
                        point_wkt,
                        srid=4326,
                    ),
                )

                db.add(new_event)

                total_processed += 1
                total_inserted += 1

            except HTTPException:
                raise

            except Exception as exc:
                logger.error(
                    "Error processing FIRMS observation: %s",
                    exc,
                )
                db.rollback()
                total_skipped += 1

        try:
            db.commit()
        except Exception as exc:
            db.rollback()
            logger.error("Database commit failed during FIRMS sync: %s", exc)
            raise HTTPException( status_code=500, detail=f"Database commit failed: {exc}")
        if total_inserted > 0:
            await connection_manager.broadcast({
                "type": "data_updated",
                "inserted": total_inserted,
                "timestamp": sync_time.isoformat(),
            })

        message = (
            f"Successfully synchronized "
            f"{total_inserted} new thermal events "
            f"({total_skipped} skipped/duplicate) "
            f"from NASA FIRMS."
        )

        return SyncSummaryResponse(
            status="success",
            total_fetched=total_fetched,
            total_processed=total_processed,
            total_inserted=total_inserted,
            total_skipped=total_skipped,
            sync_timestamp=sync_time,
            message=message,
        )