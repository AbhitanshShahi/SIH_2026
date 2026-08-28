import joblib
import pandas as pd
import requests
import re
from io import BytesIO

MODEL_URL = "https://huggingface.co/abhitanshshahi/fire-risk-xgboost/resolve/main/xgboost_final.joblib"

def load_model():
    response = requests.get(MODEL_URL, timeout=30)

    if response.status_code != 200:
        raise Exception("Failed to download model from Hugging Face")

    return joblib.load(BytesIO(response.content))

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

# FIRMS CSV often abbreviates confidence to a single letter.
CONFIDENCE_ABBREV = {
    "l": "low",
    "n": "nominal",
    "h": "high",
}


def _encode_column(value, mapping, fallback):
    if value is None:
        return fallback
    if isinstance(value, str):
        value = value.strip().lower()
        value = CONFIDENCE_ABBREV.get(value, value)
    return mapping.get(value, fallback)


def _to_float(value, default=1.0):
    if isinstance(value, (int, float)):
        return float(value)
    match = re.search(r"[0-9]+(?:\.[0-9]+)?", str(value or ""))
    return float(match.group()) if match else default


def preprocess_input(data):

    df = pd.DataFrame([data])

    for column, mapping in encoders.items():
        fallback = 1 if column == "confidence" else mapping.get(mapping_default(column), 1)
        if column in df.columns:
            df[column] = df[column].map(lambda v: _encode_column(v, mapping, fallback))

    if "version" in df.columns:
        df["version"] = df["version"].map(_to_float)

    df = df[FEATURE_ORDER]

    return df


def mapping_default(column):
    if column == "satellite":
        return "SNPP"
    if column == "daynight":
        return "D"
    return "nominal"

def predict(model, data):
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
        "brightness": 333.94,
        "scan": 0.49,
        "track": 0.49,
        "satellite": "SNPP",
        "confidence": "nominal",
        "version": 2,
        "bright_t31": 300.46,
        "frp": 5.79,
        "daynight": "D",
        "month": 6,
        "hour": 70,
        "landcover_class": 60
    }
    model = load_model()
    result = predict(model, sample_input)
    print(result)