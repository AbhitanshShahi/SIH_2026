import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# IMPORTANT: config must be imported first — it inserts the project root into
# sys.path so that `from ml.inference.predict import ...` resolves correctly
# in all subsequent imports (events.py, classification.py, etc.).
from app.core.config import CORS_ORIGINS  # noqa: F401  (side-effect: sets sys.path)

from app.api.router import api_router
from app.api.routes.health import router as health_router
from app.core.base import Base
from app.core.database import SessionLocal, engine
from app.models.thermal_event import ThermalEvent
from app.services.context import backfill_context, ensure_schema
from ml.inference.predict import load_model
from app.services.classification import classification_service

logger = logging.getLogger("main")
logging.basicConfig(level=logging.INFO)


# ---------------------------------------------------------------------------
# FastAPI lifespan — model is loaded ONCE here, never inside /predict
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load the XGBoost model at startup and inject it into the
    classification service.  The model stays in memory for all
    subsequent requests.
    """
    logger.info("Starting up — initializing database schema...")
    try:
        # ThermalEvent is imported above so its table is registered on Base.
        # create_all is idempotent and allows a fresh configured PostGIS
        # database to serve the dashboard without a separate migration step.
        Base.metadata.create_all(bind=engine)
        # Add context columns for pre-existing databases and backfill the
        # operational context so historic events expose the same live fields.
        ensure_schema(engine)
        db = SessionLocal()
        try:
            backfill_context(db)
        finally:
            db.close()
        logger.info("Database schema is ready.")
    except Exception:
        logger.exception("Database schema initialization failed.")
        raise

    logger.info("Starting up — loading XGBoost model from Hugging Face...")
    try:
        model = load_model()
        classification_service.load(model)
        logger.info("XGBoost model loaded and ready.")
    except Exception as exc:
        logger.error(
            "Model loading failed at startup: %s. "
            "The /predict endpoint will return 503 until the model is available.",
            exc,
        )
    yield
    logger.info("Shutting down.")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="SIH 2026 Industrial Thermal Intelligence Platform",
    description=(
        "Backend API for NASA FIRMS Thermal Anomaly Detection "
        "& XGBoost Classification (Talcher-Angul Belt)"
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix="/api/v1")
app.include_router(health_router)  # Keep GET /health available at root


@app.get("/")
def root():
    return {
        "message": "SIH 2026 Industrial Thermal Intelligence Platform API is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "api_v1": "/api/v1",
    }
