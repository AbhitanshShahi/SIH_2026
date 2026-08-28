import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import CORS_ORIGINS
from app.api.router import api_router
from app.api.routes.health import router as health_router
from app.core.base import Base
from app.core.database import SessionLocal, engine
from app.models.thermal_event import ThermalEvent
from app.services.classification import classification_service
from app.services.context import backfill_context, ensure_schema
from app.services.scheduler import firms_sync_loop
from ml.inference.predict import load_model

logger = logging.getLogger("main")

logging.basicConfig(
    level=logging.INFO
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "Starting up — initializing database schema..."
    )

    try:
        Base.metadata.create_all(
            bind=engine
        )
        ensure_schema(engine)
        db = SessionLocal()
        try:
            backfill_context(db)
        finally:
            db.close()

        logger.info(
            "Database schema is ready."
        )
    except Exception:
        logger.exception(
            "Database schema initialization failed."
        )
        raise
    logger.info(
        "Starting up — loading XGBoost model "
        "from Hugging Face..."
    )
    try:
        model = load_model()

        classification_service.load(
            model
        )

        logger.info(
            "XGBoost model loaded and ready."
        )

    except Exception as exc:
        logger.error(
            "Model loading failed at startup: %s. "
            "The /predict endpoint will return 503 "
            "until the model is available.",
            exc,
        )

    scheduler_task = asyncio.create_task(
        firms_sync_loop()
    )

    try:
        yield

    finally:
        scheduler_task.cancel()

        try:
            await scheduler_task
        except asyncio.CancelledError:
            pass

        logger.info(
            "Shutting down."
        )


app = FastAPI(
    title=(
        "SIH 2026 Industrial Thermal "
        "Intelligence Platform"
    ),
    description=(
        "Backend API for NASA FIRMS Thermal "
        "Anomaly Detection & XGBoost Classification "
        "(Talcher-Angul Belt)"
    ),
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        CORS_ORIGINS
        if CORS_ORIGINS
        else ["*"]
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    api_router,
    prefix="/api/v1"
)

app.include_router(
    health_router
)


@app.get("/")
def root():
    return {
        "message": (
            "SIH 2026 Industrial Thermal "
            "Intelligence Platform API is running!"
        ),
        "version": "1.0.0",
        "docs": "/docs",
        "api_v1": "/api/v1",
    }