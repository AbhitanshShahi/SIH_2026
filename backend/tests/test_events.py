from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.classification import classification_service
from app.services.features import feature_service
from app.services.firms import firms_service

client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. Health & Root Endpoints
# ---------------------------------------------------------------------------

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["version"] == "1.0.0"


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "model_loaded" in data

    # Also test /api/v1/health
    response_v1 = client.get("/api/v1/health")
    assert response_v1.status_code == 200
    data_v1 = response_v1.json()
    assert data_v1["status"] == "ok"
    assert "model_loaded" in data_v1


# ---------------------------------------------------------------------------
# 2. Prediction API Endpoint Tests
# ---------------------------------------------------------------------------

def test_predict_endpoint_when_model_unavailable():
    """When no model is loaded, the endpoint should return a 503 error."""
    with patch.object(classification_service, "is_available", return_value=False):
        sample_payload = {
            "brightness": 341.68,
            "scan": 0.5,
            "track": 0.4,
            "satellite": "SNPP",
            "confidence": "high",
            "version": 1,
            "bright_t31": 300.0,
            "frp": 20.0,
            "daynight": "N",
            "month": 8,
            "hour": 18,
            "landcover_class": 50
        }
        response = client.post("/api/v1/predict", json=sample_payload)
        assert response.status_code == 503
        assert "ML model is currently unavailable" in response.json()["detail"]


def test_predict_endpoint_with_mocked_model():
    """Tests successful prediction and response contract matching."""
    mock_model = MagicMock()
    mock_model.predict.return_value = [2]
    mock_model.predict_proba.return_value = [[0.02, 0.07, 0.91]]

    with patch.object(classification_service, "_model", mock_model), \
         patch.object(classification_service, "is_available", return_value=True):

        sample_payload = {
            "brightness": 341.68,
            "scan": 0.5,
            "track": 0.4,
            "satellite": "SNPP",
            "confidence": "high",
            "version": 1,
            "bright_t31": 300.0,
            "frp": 20.0,
            "daynight": "N",
            "month": 8,
            "hour": 18,
            "landcover_class": 50
        }
        response = client.post("/api/v1/predict", json=sample_payload)
        assert response.status_code == 200
        data = response.json()

        assert data["class_id"] == 2
        assert data["class_name"] == "Flare-like Thermal Source"
        assert data["confidence"] == 0.91
        assert isinstance(data["reasoning"], list)
        assert len(data["reasoning"]) > 0


def test_predict_validation_error():
    """Invalid input should return 422 Unprocessable Entity."""
    invalid_payload = {
        "brightness": -50.0,  # invalid negative brightness
        "month": 15           # invalid month
    }
    response = client.post("/api/v1/predict", json=invalid_payload)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# 3. Events, GeoJSON, and Statistics Endpoint Tests
# ---------------------------------------------------------------------------

def test_get_events_list():
    response = client.get("/api/v1/events?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_events_geojson():
    response = client.get("/api/v1/events/geojson?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert "features" in data
    assert isinstance(data["features"], list)


def test_get_events_stats():
    response = client.get("/api/v1/events/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_events" in data
    assert "industrial_sources" in data
    assert "flare_sources" in data
    assert "other_anomalies" in data
    assert "high_risk_events" in data
    assert "avg_frp" in data
    assert "date_range" in data


def test_get_live_status():
    response = client.get("/api/v1/live/status")
    assert response.status_code == 200
    data = response.json()
    assert "total_events_in_db" in data
    assert "firms_api_configured" in data
    assert "model_loaded" in data


# ---------------------------------------------------------------------------
# 4. Feature Service Transformation Unit Tests
# ---------------------------------------------------------------------------

def test_feature_transformation():
    raw_obs = {
        "latitude": 20.95,
        "longitude": 85.15,
        "acq_date": "2026-08-24",
        "acq_time": "1830",
        "bright_ti4": 345.2,
        "bright_ti5": 298.0,
        "frp": 25.5,
        "scan": 0.5,
        "track": 0.4,
        "satellite": "SNPP",
        "confidence": "high",
        "version": 1
    }
    features = feature_service.transform_firms_observation(raw_obs)

    assert features["brightness"] == 345.2
    assert features["bright_t31"] == 298.0
    assert features["frp"] == 25.5
    assert features["month"] == 8
    assert features["hour"] == 18
    assert features["daynight"] == "N"
    assert features["landcover_class"] == 50
    assert features["satellite"] == "SNPP"


# ---------------------------------------------------------------------------
# 5. Live Sync Endpoint Integration Test
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_live_sync_endpoint():
    mock_obs = [
        {
            "latitude": 20.9512,
            "longitude": 85.1524,
            "timestamp": datetime(2026, 8, 24, 18, 45, tzinfo=timezone.utc),
            "acq_date": "2026-08-24",
            "acq_time": "1845",
            "brightness": 348.5,
            "bright_t31": 302.1,
            "frp": 28.4,
            "scan": 0.5,
            "track": 0.4,
            "satellite": "SNPP",
            "confidence": "high",
            "version": 1,
            "daynight": "N"
        }
    ]

    mock_prediction = {
        "class_id": 2,
        "class_name": "Flare-like Thermal Source",
        "confidence": 0.92,
        "reasoning": ["High temperature flare signature detected"]
    }

    with patch.object(firms_service, "fetch_area_hotspots", AsyncMock(return_value=mock_obs)), \
         patch.object(classification_service, "predict", return_value=mock_prediction):

        response = client.post("/api/v1/live/sync?days=1")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["total_fetched"] == 1
        assert data["total_processed"] >= 0
        assert "sync_timestamp" in data
