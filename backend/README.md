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

## Run locally

From the repository root, install the Python dependencies and start the API:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

The API is available at `http://localhost:8000`, with interactive documentation at `/docs`.

- `GET /health` checks that the service is running.
- `GET /hotspots?region=angul` returns Talcher-area GeoJSON features.
- `POST /predict` runs the server-side classification adapter.

The current classifier is a documented server-side baseline. Replace `app/services/classification.py` with the trained-model adapter when the production model artifact is available.
