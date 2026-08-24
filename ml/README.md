
---

## `ml/README.md`

```markdown
# Machine Learning

Machine learning and geospatial data-processing pipeline for the SIH2026 industrial thermal anomaly detection system.

## Folder Structure

```text
ml/
├── notebooks/
│   ├── 01_firms_exploration.ipynb
│   ├── 02_osm_exploration.ipynb
│   ├── 03_worldcover_exploration.ipynb
│   ├── 04_feature_engineering.ipynb
│   └── 05_model_training.ipynb
│
├── preprocessing/
│   ├── firms.py
│   ├── osm.py
│   └── worldcover.py
│
├── features/
│   └── engineering.py
│
├── models/
│   └── thermal_classifier.joblib
│
├── evaluation/
│   └── metrics.py
│
└── README.md

Responsibilities
Explore and validate FIRMS thermal anomaly data
Process OSM industrial infrastructure data
Extract land-cover information from WorldCover
Perform spatial and temporal feature engineering
Create the ML training dataset
Train and evaluate classification models
Save the final trained model for backend inference
Primary Data Sources
NASA FIRMS
OpenStreetMap
ESA WorldCover