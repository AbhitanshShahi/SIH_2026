import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load the backend environment file regardless of the process working directory.
# This lets the documented command (`uvicorn ... --app-dir backend`) work when
# it is run from the repository root.
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BACKEND_DIR / ".env")

# ---------------------------------------------------------------------------
# Project root on sys.path — allows `from ml.inference.predict import ...`
# to resolve whether the process is started from backend/ or the project root.
# BASE_DIR = SIH_2026/ (four levels up from app/core/config.py)
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Database
DATABASE_URL = os.getenv("DATABASE_URL")

# NASA FIRMS API
FIRMS_MAP_KEY = os.getenv("FIRMS_MAP_KEY", "")

# Machine Learning Model Configuration
DEFAULT_MODEL_PATH = str(BASE_DIR / "ml" / "models" / "xgboost_final.pkl")

MODEL_PATH = os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH)
HF_MODEL_REPO = os.getenv("HF_MODEL_REPO", "")
HF_MODEL_FILENAME = os.getenv("HF_MODEL_FILENAME", "xgboost_final.pkl")

# CORS Origins
CORS_ORIGINS_RAW = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"
)
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",") if origin.strip()]
if "*" not in CORS_ORIGINS and os.getenv("ENVIRONMENT") == "development":
    CORS_ORIGINS.append("*")
