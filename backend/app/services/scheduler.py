import asyncio
import logging

from app.core.database import SessionLocal
from app.services.classification import classification_service
from app.services.firms import firms_service
from app.services.live_sync import run_firms_sync

logger = logging.getLogger("firms_scheduler")

SYNC_INTERVAL_SECONDS = 300


async def run_scheduled_sync() -> None:
    if not firms_service.is_configured():
        logger.warning(
            "Automatic FIRMS sync disabled: "
            "FIRMS_MAP_KEY is not configured."
        )
        return

    if not classification_service.is_available():
        logger.warning(
            "Automatic FIRMS sync skipped: "
            "XGBoost model is not loaded."
        )
        return

    db = SessionLocal()

    try:
        result = await run_firms_sync(
            db=db,
            days=5,
            source="auto",
        )

        logger.info(
            "Automatic FIRMS sync completed: "
            "fetched=%s inserted=%s skipped=%s",
            result.total_fetched,
            result.total_inserted,
            result.total_skipped,
        )

    except Exception:
        logger.exception(
            "Automatic FIRMS sync failed."
        )

    finally:
        db.close()


async def firms_sync_loop() -> None:
    logger.info(
        "Automatic FIRMS synchronization started; "
        "interval=%s seconds.",
        SYNC_INTERVAL_SECONDS,
    )

    await run_scheduled_sync()

    while True:
        await asyncio.sleep(
            SYNC_INTERVAL_SECONDS
        )

        await run_scheduled_sync()