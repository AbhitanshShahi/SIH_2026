import joblib
import pandas as pd
from pathlib import Path


MODEL_PATH = Path(
    "ml/models/xgboost_final.pkl"
)


FEATURE_ORDER = [
    "brightness",
    "scan",
    "track",
    "satellite",
    "confidence",
    "version",
    "bright_t31",
    "frp",
    "daynight",
    "month",
    "hour",
    "landcover_class"
]


CLASS_NAMES = {
    0: "Other Thermal Anomaly",
    1: "Industrial Thermal Source",
    2: "Flare-like Thermal Source"
}


model = joblib.load(MODEL_PATH)


encoders = {
    "satellite": {
        "N20": 0,
        "SNPP": 1
    },
    "confidence": {
        "low": 0,
        "nominal": 1,
        "high": 2
    },
    "daynight": {
        "D": 0,
        "N": 1
    }
}


def preprocess_input(data):

    df = pd.DataFrame([data])

    for column, mapping in encoders.items():
        if column in df.columns:
            df[column] = df[column].map(mapping)

    df = df[FEATURE_ORDER]

    return df


def predict(data):

    processed_data = preprocess_input(data)

    prediction = model.predict(
        processed_data
    )[0]

    probabilities = model.predict_proba(
        processed_data
    )[0]

    confidence = float(
        max(probabilities)
    )

    return {
        "class_id": int(prediction),
        "class_name": CLASS_NAMES[int(prediction)],
        "confidence": round(confidence, 4)
    }

if __name__ == "__main__":
    sample_input = {
        "brightness": 340,
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
        "landcover_class": 30
    }
    result = predict(sample_input)

    print(result)