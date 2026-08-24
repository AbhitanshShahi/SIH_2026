# Backend

FastAPI backend for the SIH2026 industrial thermal anomaly detection system.

## Folder Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── events.py
│   │   │   └── live.py
│   │   │
│   │   └── router.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   │
│   ├── models/
│   │   └── thermal_event.py
│   │
│   ├── schemas/
│   │   └── thermal_event.py
│   │
│   ├── services/
│   │   ├── firms.py
│   │   ├── classification.py
│   │   └── features.py
│   │
│   └── main.py
│
├── tests/
│   └── test_events.py
│
└── README.md

Responsibilities
Expose REST APIs using FastAPI
Fetch latest FIRMS thermal anomaly data
Process incoming thermal events
Generate features for classification
Run the trained ML model
Store and retrieve classified events
Provide data to the frontend GIS dashboard