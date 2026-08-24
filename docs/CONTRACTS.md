# System Contracts
## Purpose
This document defines the communication contracts between the major components of the Industrial Fire Detection System.
The project consists of three independent development tracks:
## Machine Learning Pipeline
## Backend API System ## Frontend GIS Dashboard
These contracts ensure that each team can work independently while maintaining compatibility during integration.
The core principle:
**ML produces intelligence → Backend exposes intelligence → Frontend visualizes intelligence**
---
# 1. Overall System Flow
### Satellite Data Sources
|
|
v 
ML Data Processing Pipeline
    |
    |
    v
### Feature Engineering
    |
    |
    v
ML Classification Model
    |
    |
    v
Backend **API**
    |
    |
    v
Frontend **GIS** Dashboard

---

# 2. Data Flow Contract

## ML Pipeline → Backend

The ML system is responsible for:

- Collecting satellite thermal data
- Processing raw hotspot information
- Creating feature vectors
- Running classification
- Providing prediction results

The backend must receive:

- Classification result
- Confidence score
- Feature importance/reasoning
- Location information

---

# 3. ML Model Contract

## Input Contract

The ML model expects a feature vector containing:

```json
{
    *frp*: **120**,
    *brightness_temperature*: **340**,
    *confidence*: 85,
    *persistence_score*: 0.8,
    *night_ratio*: 0.9,
    *cluster_size*: 5,
    *distance_to_industry*: **300**,
    *land_cover*: *industrial*
}

### Feature Description

FeatureDescriptionfrpFire Radiative Power indicating thermal intensitybrightness_temperatureTemperature detected by satelliteconfidenceFIRMS confidence valuepersistence_scoreHow frequently hotspot appears at same locationnight_ratioPercentage of nighttime detectionscluster_sizeNumber of nearby thermal pointsdistance_to_industryDistance from nearest industrial facilityland_coverEnvironmental classification ## ML Model Output Contract The model must return:

{
    *classification*: *Industrial Source*,
    *confidence*: 0.94,
    *reasoning*: [
    *High persistence detected*,
    *Located near industrial facility*,
    *Nighttime activity dominant*
    ]
}

## Classification Contract

Phase 1 Classification The primary model will perform binary classification:

### Thermal Anomaly

    |
    |
 -------------------
 |                 |
Industrial     Natural Fire
Source

Phase 2 Classification (Optional) Extended classification:

### Thermal Anomaly

        |
##         |
|          |          |          |
Industrial Flare   Wildfire   Crop Burning

## Backend API Contract

The backend acts as the communication layer between the ML system and frontend. Responsibilities:

Receive frontend requests

Execute prediction pipeline

Convert results into frontend-compatible format

Provide GeoJSON responses ## Hotspot API Contract Endpoint **GET** /hotspots

Purpose: Retrieve classified thermal anomalies for map visualization.

Request Example:

**GET** /hotspots?region=gujarat&date=**2026**-08-24

Response

{
    *type*: *FeatureCollection*,
    *features*: [
    {
    *type*: *Feature*,
    *geometry*: {
    *type*: *Point*,
    *coordinates*: [
    70.05,
    22.33
    ]
    },
    *properties*: {
    *classification*: *Industrial Source*,
    *confidence*: 94,
    *frp*: **120**,
    *persistence*: 25
    }
    }
    ]
}

## Prediction API Contract

Endpoint **POST** /predict

Purpose: Run classification on a thermal anomaly.

Request

{
    *latitude*:22.33,
    *longitude*:70.05,
    *frp*:**120**,
    *persistence_score*:0.9,
    *distance_to_industry*:**500**
}

Response

{
    *classification*:*Industrial Source*,
    *confidence*:0.94,
    *reasoning*:[
    *High persistence*,
    *Industrial region*
    ]
}

## Frontend Contract

The frontend is responsible only for:

Visualization

User interaction

Map rendering

Filtering

Displaying model explanations The frontend should not:

Run ML models

Process satellite data

Perform classification logic ## Frontend Expected Data The frontend requires:

{
    *location*:{
    *latitude*:22.33,
    *longitude*:70.05
    },

    *classification*:*Industrial Source*,

    *confidence*:94,

    *details*:{
    *frp*:**120**,
    *persistence_days*:30,
    *distance_to_industry*:**500**
    },

    *reasoning*:[
    *Detected repeatedly*,
    *Near refinery*
    ]
}

## Map Visualization Contract

Classification colors: ClassDisplayIndustrial SourceRedNatural FireBlueGas FlareYellowUnknownGrey Each hotspot marker must display:

Classification

Confidence

**FRP** value

Persistence score

Reason for prediction ## Integration Rules ML Team Must provide:

Trained model file

Feature list

Training metrics

Prediction interface Output:

fire_classifier.pkl metrics.json feature_schema.json

### Backend Team

Must provide:

Running **API**

**API** documentation

Sample responses Output:

/hotspots /predict

### Frontend Team

Must consume only backend APIs. No direct ML or data access. ## Development Strategy All teams work independently using mock data initially.

Stage 1 Frontend uses:

mock_hotspots.json

Backend uses:

dummy_prediction()

ML develops:

trained_model.pkl

Stage 2 Replace:

dummy_prediction()

with:

actual ML model inference

Stage 3 Complete integration:

Real **FIRMS** Data

        |

ML Prediction

        |

FastAPI

        |

**GIS** Dashboard

## Non-Negotiable Requirements

Every prediction displayed on the dashboard must include:

Classification

Confidence score

Location

Reasoning behind prediction The system should never display only:

### Industrial Fire

without explaining:

Why?

## Final Integration Goal

The completed system should demonstrate:

Satellite thermal anomaly detected

        ↓

Context gathered from multiple sources

        ↓

AI classifies event

        ↓

**GIS** dashboard displays result

        ↓

Human understands why the decision was made

This contract defines the boundary between ML, backend, and frontend development.