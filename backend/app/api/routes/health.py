from fastapi import APIRouter

from app.services.classification import classification_service

router = APIRouter()


@router.get("/health")
def health_check():
    """
    Returns backend status and whether the XGBoost model is loaded.
    Does NOT attempt to download the model — simply reflects startup state.
    """
    return {
        "status": "ok",
        "model_loaded": classification_service.is_available(),
    }