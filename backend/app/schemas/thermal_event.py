from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# ML Prediction Schemas
# ---------------------------------------------------------------------------

class PredictionRequest(BaseModel):
    """
    Features required by the XGBoost classification model.
    Follows docs/CONTRACTS.md and docs/work-doc.md.
    Note: Latitude, Longitude, and distance features are NOT passed to the model.
    """
    brightness: float = Field(..., ge=0, description="Brightness temperature 21 (Kelvin)")
    scan: float = Field(..., ge=0, description="Spatial resolution along scan")
    track: float = Field(..., ge=0, description="Spatial resolution along track")
    satellite: str = Field(..., description="Satellite identifier (e.g. SNPP, N20)")
    confidence: Any = Field(..., description="Confidence flag ('low', 'nominal', 'high') or value")
    version: Any = Field(default=1, description="Data processing version")
    bright_t31: float = Field(..., ge=0, description="Brightness temperature 31 (Kelvin)")
    frp: float = Field(..., ge=0, description="Fire Radiative Power (MW)")
    daynight: str = Field(..., description="Day or Night flag ('D' or 'N')")
    month: int = Field(..., ge=1, le=12, description="Month of acquisition (1-12)")
    hour: int = Field(..., ge=0, le=23, description="Hour of acquisition UTC (0-23)")
    landcover_class: int = Field(default=50, description="ESA WorldCover class code (e.g. 10=Tree, 50=Built-up)")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "brightness": 341.68,
                "scan": 0.5,
                "track": 0.4,
                "satellite": "SNPP",
                "confidence": "high",
                "version": 1,
                "bright_t31": 300,
                "frp": 20,
                "daynight": "N",
                "month": 8,
                "hour": 18,
                "landcover_class": 50
            }
        }
    )


class PredictionResponse(BaseModel):
    """
    ML Model Output contract.
    """
    class_id: int = Field(..., description="0=Other Thermal Anomaly, 1=Industrial Thermal Source, 2=Flare-like Thermal Source")
    class_name: str = Field(..., description="Human-readable classification label")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Prediction probability confidence (0.0 - 1.0)")
    reasoning: list[str] = Field(default_factory=list, description="Explainable AI bullet points")


# ---------------------------------------------------------------------------
# Database & Thermal Event CRUD Schemas
# ---------------------------------------------------------------------------

class ThermalEventBase(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude (EPSG:4326)")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude (EPSG:4326)")
    timestamp: datetime = Field(..., description="Observation acquisition timestamp")
    brightness: float | None = Field(default=None, description="Brightness temperature (Kelvin)")
    frp: float | None = Field(default=None, description="Fire Radiative Power (MW)")
    satellite: str | None = Field(default=None, description="Satellite sensor")
    prediction_class: int | None = Field(default=None, description="Predicted class integer")
    confidence: float | None = Field(default=None, description="Prediction confidence score")


class ThermalEventCreate(ThermalEventBase):
    pass


class ThermalEventResponse(ThermalEventBase):
    id: int
    class_name: str | None = Field(default=None, description="Human-readable class name")
    risk_level: str | None = Field(default=None, description="Calculated risk level (Low, Medium, High)")
    reasoning: list[str] = Field(default_factory=list, description="Explainable reasoning points")

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# GeoJSON Schemas for Frontend GIS Map
# ---------------------------------------------------------------------------

class GeoJSONGeometry(BaseModel):
    type: Literal["Point"] = "Point"
    coordinates: list[float] = Field(..., description="[longitude, latitude] in EPSG:4326")


class GeoJSONProperties(BaseModel):
    id: int
    latitude: float
    longitude: float
    timestamp: str
    frp: float | None = None
    brightness: float | None = None
    satellite: str | None = None
    prediction_class: int | None = None
    class_name: str | None = None
    confidence: float | None = None
    risk_level: str | None = None
    reasoning: list[str] = Field(default_factory=list)


class GeoJSONFeature(BaseModel):
    type: Literal["Feature"] = "Feature"
    geometry: GeoJSONGeometry
    properties: GeoJSONProperties


class GeoJSONFeatureCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: list[GeoJSONFeature]


# ---------------------------------------------------------------------------
# Statistics & Sync Summary Schemas
# ---------------------------------------------------------------------------

class EventStatsResponse(BaseModel):
    total_events: int = 0
    industrial_sources: int = 0
    flare_sources: int = 0
    other_anomalies: int = 0
    high_risk_events: int = 0
    avg_frp: float = 0.0
    max_frp: float = 0.0
    date_range: dict[str, str | None] = Field(default_factory=dict)


class SyncSummaryResponse(BaseModel):
    status: str
    total_fetched: int
    total_processed: int
    total_inserted: int
    total_skipped: int
    sync_timestamp: datetime
    message: str


class SyncStatusResponse(BaseModel):
    last_sync_timestamp: datetime | None = None
    total_events_in_db: int = 0
    firms_api_configured: bool = False
    model_loaded: bool = False
