import logging
from datetime import datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.thermal_event import ThermalEvent
from app.schemas.thermal_event import (
    EventStatsResponse,
    GeoJSONFeature,
    GeoJSONFeatureCollection,
    GeoJSONGeometry,
    GeoJSONProperties,
    PredictionRequest,
    PredictionResponse,
    ThermalEventResponse,
)
from ml.inference.predict import CLASS_NAMES
from app.services.classification import classification_service

logger = logging.getLogger("events_routes")
router = APIRouter(tags=["Thermal Events & Predictions"])


def determine_risk_level(frp: float | None, prediction_class: int | None) -> str:
    """Calculates operational risk level based on FRP and classification."""
    if prediction_class == 2:  # Flare-like source
        return "High"
    if frp is not None:
        if frp >= 25.0:
            return "High"
        if frp >= 10.0:
            return "Medium"
    return "Low"


def format_event_response(event: ThermalEvent) -> ThermalEventResponse:
    """Formats a ThermalEvent ORM object into a rich API response."""
    class_id = event.prediction_class
    class_name = CLASS_NAMES.get(class_id, "Other Thermal Anomaly") if class_id is not None else None
    risk_level = determine_risk_level(event.frp, class_id)

    # Generate explainable AI reasoning
    dummy_feat = {
        "frp": event.frp or 0.0,
        "brightness": event.brightness or 0.0,
        "daynight": "N" if event.timestamp and (event.timestamp.hour >= 18 or event.timestamp.hour < 6) else "D",
        "landcover_class": 50
    }
    reasoning = classification_service.generate_reasoning(dummy_feat, class_id or 0, event.confidence or 0.0)

    return ThermalEventResponse(
        id=event.id,
        latitude=event.latitude,
        longitude=event.longitude,
        timestamp=event.timestamp,
        brightness=event.brightness,
        frp=event.frp,
        satellite=event.satellite,
        prediction_class=event.prediction_class,
        confidence=event.confidence,
        class_name=class_name,
        risk_level=risk_level,
        reasoning=reasoning
    )


# ---------------------------------------------------------------------------
# 1. Prediction Endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Classify a FIRMS thermal anomaly",
    description="Passes 12 FIRMS & contextual features to the trained XGBoost model and returns classification + reasoning."
)
def predict_thermal_anomaly(request: PredictionRequest):
    """
    ML Prediction endpoint conforming strictly to docs/CONTRACTS.md.
    """
    input_data = request.model_dump()
    result = classification_service.predict(input_data)
    return PredictionResponse(**result)


# ---------------------------------------------------------------------------
# 2. Thermal Events Retrieval (Paginated & Filterable)
# ---------------------------------------------------------------------------

@router.get(
    "/events",
    response_model=list[ThermalEventResponse],
    summary="List stored thermal events",
    description="Retrieve historical and near-real-time thermal detections with optional filtering."
)
def list_thermal_events(
    start_date: datetime | None = Query(None, description="Filter events after this timestamp (ISO format)"),
    end_date: datetime | None = Query(None, description="Filter events before this timestamp (ISO format)"),
    prediction_class: int | None = Query(None, ge=0, le=2, description="Filter by class (0=Other, 1=Industrial, 2=Flare)"),
    min_frp: float | None = Query(None, ge=0.0, description="Filter by minimum Fire Radiative Power (MW)"),
    min_confidence: float | None = Query(None, ge=0.0, le=1.0, description="Filter by minimum AI confidence"),
    satellite: str | None = Query(None, description="Filter by satellite (e.g. SNPP, N20)"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db)
):
    query = db.query(ThermalEvent)

    if start_date:
        query = query.filter(ThermalEvent.timestamp >= start_date)
    if end_date:
        query = query.filter(ThermalEvent.timestamp <= end_date)
    if prediction_class is not None:
        query = query.filter(ThermalEvent.prediction_class == prediction_class)
    if min_frp is not None:
        query = query.filter(ThermalEvent.frp >= min_frp)
    if min_confidence is not None:
        query = query.filter(ThermalEvent.confidence >= min_confidence)
    if satellite:
        query = query.filter(ThermalEvent.satellite.ilike(f"%{satellite.strip()}%"))

    events = query.order_by(ThermalEvent.timestamp.desc()).offset(offset).limit(limit).all()
    return [format_event_response(ev) for ev in events]


# ---------------------------------------------------------------------------
# 3. GeoJSON FeatureCollection for Map Rendering
# ---------------------------------------------------------------------------

@router.get(
    "/events/geojson",
    response_model=GeoJSONFeatureCollection,
    summary="Get thermal events formatted as GeoJSON",
    description="Returns a standard GeoJSON FeatureCollection tailored for GIS mapping tools (Leaflet, Mapbox)."
)
def get_thermal_events_geojson(
    start_date: datetime | None = Query(None, description="Filter after timestamp"),
    end_date: datetime | None = Query(None, description="Filter before timestamp"),
    prediction_class: int | None = Query(None, ge=0, le=2, description="Filter by class"),
    min_frp: float | None = Query(None, ge=0.0, description="Filter by min FRP"),
    limit: int = Query(500, ge=1, le=2000, description="Max features"),
    db: Session = Depends(get_db)
):
    query = db.query(ThermalEvent)

    if start_date:
        query = query.filter(ThermalEvent.timestamp >= start_date)
    if end_date:
        query = query.filter(ThermalEvent.timestamp <= end_date)
    if prediction_class is not None:
        query = query.filter(ThermalEvent.prediction_class == prediction_class)
    if min_frp is not None:
        query = query.filter(ThermalEvent.frp >= min_frp)

    events = query.order_by(ThermalEvent.timestamp.desc()).limit(limit).all()

    features = []
    for ev in events:
        class_id = ev.prediction_class
        class_name = CLASS_NAMES.get(class_id, "Other Thermal Anomaly") if class_id is not None else None
        risk_level = determine_risk_level(ev.frp, class_id)

        dummy_feat = {
            "frp": ev.frp or 0.0,
            "brightness": ev.brightness or 0.0,
            "daynight": "N" if ev.timestamp and (ev.timestamp.hour >= 18 or ev.timestamp.hour < 6) else "D",
            "landcover_class": 50
        }
        reasoning = classification_service.generate_reasoning(dummy_feat, class_id or 0, ev.confidence or 0.0)

        feature = GeoJSONFeature(
            type="Feature",
            geometry=GeoJSONGeometry(
                type="Point",
                coordinates=[float(ev.longitude), float(ev.latitude)]
            ),
            properties=GeoJSONProperties(
                id=ev.id,
                latitude=float(ev.latitude),
                longitude=float(ev.longitude),
                timestamp=ev.timestamp.isoformat() if ev.timestamp else "",
                frp=ev.frp,
                brightness=ev.brightness,
                satellite=ev.satellite,
                prediction_class=ev.prediction_class,
                class_name=class_name,
                confidence=ev.confidence,
                risk_level=risk_level,
                reasoning=reasoning
            )
        )
        features.append(feature)

    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)


# ---------------------------------------------------------------------------
# 4. Statistics & Metrics
# ---------------------------------------------------------------------------

@router.get(
    "/events/stats",
    response_model=EventStatsResponse,
    summary="Summary analytics & metrics",
    description="Provides aggregate detection metrics for dashboard risk cards and charts."
)
def get_event_statistics(db: Session = Depends(get_db)):
    total = db.query(func.count(ThermalEvent.id)).scalar() or 0

    if total == 0:
        return EventStatsResponse(
            total_events=0,
            industrial_sources=0,
            flare_sources=0,
            other_anomalies=0,
            high_risk_events=0,
            avg_frp=0.0,
            max_frp=0.0,
            date_range={"min": None, "max": None}
        )

    industrial = db.query(func.count(ThermalEvent.id)).filter(ThermalEvent.prediction_class == 1).scalar() or 0
    flares = db.query(func.count(ThermalEvent.id)).filter(ThermalEvent.prediction_class == 2).scalar() or 0
    others = db.query(func.count(ThermalEvent.id)).filter(ThermalEvent.prediction_class == 0).scalar() or 0
    high_risk = db.query(func.count(ThermalEvent.id)).filter(
        (ThermalEvent.prediction_class == 2) | (ThermalEvent.frp >= 25.0)
    ).scalar() or 0

    avg_frp = db.query(func.avg(ThermalEvent.frp)).scalar() or 0.0
    max_frp = db.query(func.max(ThermalEvent.frp)).scalar() or 0.0

    min_time = db.query(func.min(ThermalEvent.timestamp)).scalar()
    max_time = db.query(func.max(ThermalEvent.timestamp)).scalar()

    return EventStatsResponse(
        total_events=total,
        industrial_sources=industrial,
        flare_sources=flares,
        other_anomalies=others,
        high_risk_events=high_risk,
        avg_frp=round(float(avg_frp), 2),
        max_frp=round(float(max_frp), 2),
        date_range={
            "min": min_time.isoformat() if min_time else None,
            "max": max_time.isoformat() if max_time else None
        }
    )


# ---------------------------------------------------------------------------
# 5. Single Event Detail
# ---------------------------------------------------------------------------

@router.get(
    "/events/{event_id}",
    response_model=ThermalEventResponse,
    summary="Get single thermal event detail"
)
def get_thermal_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(ThermalEvent).filter(ThermalEvent.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thermal event with id {event_id} not found."
        )
    return format_event_response(event)
