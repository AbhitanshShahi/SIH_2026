# 🔥 AgniDrishti

> **AI-powered geospatial fire detection and monitoring system using satellite data, machine learning, and real-time geospatial analysis.**

AgniDrishti is an end-to-end platform designed to help detect, classify, visualize, and monitor potential fire events using satellite-derived data and machine learning.

The project combines an ML classification pipeline with a geospatial backend, PostGIS database, and a Next.js dashboard to provide a single interface for understanding fire-related events.

---

## 🌐 Live Deployment

| Service | Link |
|---|---|
| **AgniDrishti Frontend** | [Open Dashboard](https://agnidrishti-v1.vercel.app/) |
| **AgniDrishti Backend Health Check** | [Restart / Wake Backend](https://sih-2026-iuwy.onrender.com/health) |

### ⚡ Backend Wake-Up

The backend is deployed on Render and may sleep when it has not received traffic for some time.

If the dashboard appears unable to communicate with the backend:

1. Open **[Backend Health Check](https://sih-2026-iuwy.onrender.com/health)**.
2. Wait for the health response.
3. Return to **[AgniDrishti Dashboard](https://agnidrishti-v1.vercel.app/)** and refresh.

The `/health` endpoint is intentionally kept available as a simple way to wake/check the deployed backend.

---

## 🎯 Problem Statement

Wildfires and thermal anomalies can spread rapidly and become difficult to monitor over large geographical areas.

Traditional monitoring approaches can suffer from:

- Large geographic coverage requirements
- Delayed identification of potential events
- Difficulty correlating satellite observations with geographic locations
- Large volumes of satellite data
- Limited visualization for non-technical users

AgniDrishti addresses this by combining **machine learning, satellite-derived observations, geospatial storage, and an interactive web dashboard**.

---

## 💡 What AgniDrishti Does

The platform is built around the following workflow:

```text
Satellite / Geospatial Data
          ↓
     Data Processing
          ↓
   ML Fire Classification
          ↓
  Thermal / Fire Events
          ↓
      PostGIS Database
          ↓
      Backend APIs
          ↓
    Next.js Dashboard
          ↓
 Visualization & Monitoring
```

The goal is to transform raw or processed geospatial observations into information that can be inspected through a user-friendly interface.

---

## 🛰️ Role of Sentinel-2

**Sentinel-2** satellite imagery/data is used as an important source of Earth-observation information for the project.

The ML pipeline uses satellite-derived features to classify observations into fire-related categories.

Sentinel-2 is therefore primarily part of the **remote-sensing / data layer**, while the backend and dashboard handle storage, processing, APIs, and visualization.

> **Important:** AgniDrishti should not be interpreted as claiming that Sentinel-2 alone provides instantaneous wildfire detection. Satellite revisit frequency, cloud cover, data availability, preprocessing, and the specific classification pipeline all affect detection capability.

---

## 🤖 Machine Learning

The project includes a trained machine-learning classification model for identifying fire-related observations.

### Model Classes

The classification setup includes three classes:

| Class | Meaning |
|---|---|
| **0** | Non-fire / background observation |
| **1** | Fire |
| **2** | Fire-like / related observation |

The exact interpretation of a prediction depends on the feature engineering and dataset used during training.

### Model Performance

The evaluated model achieved approximately:

| Class | Precision | Recall | F1-score |
|---|---:|---:|---:|
| 0 | 0.98 | 0.97 | 0.98 |
| 1 | 0.76 | 0.84 | 0.80 |
| 2 | 0.83 | 0.89 | 0.86 |

These results indicate that the model is substantially better at identifying the majority/background class, while still providing useful recall for the fire-related classes.

### Dataset Distribution

The reported evaluation contained approximately:

- **24,771** samples for class 0
- **2,939** samples for class 1
- The remaining samples belonging to class 2

Because the dataset is imbalanced, accuracy alone is not sufficient for evaluating the model. Precision, recall, and F1-score are therefore important metrics.

---

## 🗺️ Geospatial Processing

AgniDrishti uses geospatial technologies to associate detected events with geographic coordinates and enable spatial querying.

The system is designed around:

- Geographic coordinates
- Thermal/fire event records
- Spatial database storage
- Geospatial API responses
- Map-based visualization

### PostGIS

The backend uses **PostgreSQL with PostGIS** for storing and querying geospatial information.

This allows the application to work with spatial data rather than treating latitude and longitude as ordinary text/numeric fields.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │ Satellite / EO Data  │
                    │    Sentinel-2 etc.   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Data Processing & ML  │
                    │ Fire Classification   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Thermal Fire       │
                    │      Events          │
                    └──────────┬───────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │ PostgreSQL + PostGIS Database   │
              └────────────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ FastAPI Backend      │
                    │ REST APIs            │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Next.js Frontend     │
                    │ Dashboard + Maps     │
                    └──────────────────────┘
```

---

## 🧩 Technology Stack

### Frontend

- **Next.js**
- **React**
- **TypeScript**
- Modern component-based UI
- Interactive geospatial visualization

### Backend

- **Python**
- **FastAPI**
- REST APIs
- **SQLAlchemy**
- **Alembic** for database migrations

### Database

- **PostgreSQL**
- **PostGIS**
- **Neon** for the deployed database infrastructure

### Machine Learning

- Python ML ecosystem
- Trained classification model
- Satellite-derived/geospatial features
- Classification evaluation using precision, recall, and F1-score

### Deployment

- **Vercel** — frontend
- **Render** — backend
- **Neon** — PostgreSQL/PostGIS database

---

## 📁 Project Structure

The repository is organized broadly into frontend and backend components:

```text
AgniDrishti/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── ...
│   └── ...
│
├── README.md
└── ...
```

> The exact directory structure may evolve as the project develops.

---

## 🔌 Backend API

The backend exposes REST endpoints consumed by the frontend.

The deployment also provides a health endpoint:

**[Backend `/health` — wake/check deployed server](https://sih-2026-iuwy.onrender.com/health)**

A successful health response confirms that the deployed backend process is reachable.

---

## 🗄️ Database

The project uses a PostgreSQL database with PostGIS support.

Database responsibilities include storing information such as:

- Thermal events
- Geographic coordinates
- Detection/classification information
- Event metadata
- Spatial information required by the dashboard

Database schema changes are managed using **Alembic migrations**.

---

## 🚀 Running the Project Locally

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd AgniDrishti
```

### 2. Backend

Create and activate a Python virtual environment, install the backend dependencies, and configure the required environment variables.

The backend requires access to the PostgreSQL/PostGIS database.

Run the FastAPI application using the project's configured development command.

### 3. Frontend

Install the frontend dependencies:

```bash
cd frontend
npm install
```

Configure the frontend environment variables so that the API base URL points to the backend.

Then start the Next.js development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

---

## ⚙️ Environment Variables

The deployed application uses environment-specific configuration.

Typical configuration includes:

### Backend

```text
DATABASE_URL=...
```

Additional variables may be required depending on the enabled services and deployment configuration.

### Frontend

```text
NEXT_PUBLIC_API_URL=...
```

The frontend API URL should point to the deployed backend in production.

> Never commit database credentials, API keys, tokens, or other secrets to GitHub.

---

## 🔄 End-to-End Detection Flow

1. **Satellite / Earth-observation data** provides the underlying observations.
2. Relevant features are extracted and processed.
3. The **ML classifier** evaluates observations for fire-related patterns.
4. Classified observations can be represented as events.
5. Geographic information is stored using **PostgreSQL + PostGIS**.
6. The **FastAPI backend** exposes the resulting information through APIs.
7. The **Next.js frontend** requests the data.
8. The dashboard presents the events geographically and visually for monitoring and analysis.

---

## 📊 Why Machine Learning?

A large amount of Earth-observation data can make manual inspection impractical.

Machine learning provides a way to:

- Automatically classify observations
- Reduce manual screening
- Identify patterns in satellite-derived features
- Prioritize potentially relevant observations
- Scale analysis to larger datasets

The model is therefore a **decision-support component**, rather than a replacement for ground verification or authoritative emergency-management systems.

---

## ⚠️ Limitations

AgniDrishti is a prototype/engineering project and should not be treated as a certified operational wildfire-warning system.

Important limitations include:

- Satellite observations are not continuous ground-level monitoring.
- Cloud cover and atmospheric conditions can affect observations.
- Satellite revisit intervals introduce temporal gaps.
- ML predictions depend on the quality and distribution of training data.
- Class imbalance can affect model behavior.
- A model prediction does not by itself prove that a real-world fire exists.
- Operational deployment would require extensive validation against independent, geographically diverse datasets.
- Real-world emergency response would require authoritative data sources and appropriate verification procedures.

---

## 🔮 Future Improvements

Potential improvements include:

- Integration of additional satellite data sources
- More frequent data ingestion
- Improved temporal analysis
- Multi-satellite data fusion
- Improved handling of class imbalance
- Model calibration and uncertainty estimation
- Automated alert generation
- Historical fire-event analysis
- Fire spread prediction
- Advanced geospatial analytics
- Independent validation across different geographic regions
- Integration with authoritative fire/emergency datasets
- Improved scalability for large-scale satellite data ingestion

---

## 🎓 Project Context

AgniDrishti was developed as a **Smart India Hackathon 2026** project focused on applying machine learning and geospatial technologies to fire detection and monitoring.

The project demonstrates an end-to-end engineering pipeline:

**Machine Learning → Geospatial Data → Database → Backend APIs → Interactive Web Dashboard**

---

## 📜 License

Add the appropriate license for the project before making the repository public.

---

## 🔗 Quick Links

- **[🔥 Open AgniDrishti Dashboard](https://agnidrishti-v1.vercel.app/)**
- **[❤️ Backend Health / Wake Server](https://sih-2026-iuwy.onrender.com/health)**

### If the dashboard is not loading

Try the following:

```text
1. Open Backend Health / Wake Server
2. Wait for the health endpoint to respond
3. Open the AgniDrishti Dashboard
4. Refresh the page
```

---

<p align="center">
  <strong>AgniDrishti — From Satellite Data to Actionable Fire Intelligence.</strong>
</p>
