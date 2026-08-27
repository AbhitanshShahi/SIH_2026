import logging
import sys
from pathlib import Path
from typing import Any

from fastapi import HTTPException

# ---------------------------------------------------------------------------
# Ensure the project root (SIH_2026/) is on sys.path so that
# `from ml.inference.predict import ...` resolves correctly when the backend
# is run from the backend/ subdirectory.
# ---------------------------------------------------------------------------
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from ml.inference.predict import (  # noqa: E402
    CLASS_NAMES,
    predict as ml_predict,
)

logger = logging.getLogger("classification_service")

# Re-export CLASS_NAMES so existing imports like:
#   from app.services.classification import CLASS_NAMES
# continue to work without modification elsewhere.
__all__ = ["CLASS_NAMES", "classification_service", "ClassificationService"]


class ClassificationService:
    """
    Thin backend wrapper around ml/inference/predict.py.

    Responsibilities:
    - Hold the pre-loaded XGBoost model (injected at FastAPI startup).
    - Delegate all ML inference to ml.inference.predict.predict().
    - Provide generate_reasoning() as backend presentation logic only
      (not duplicating any ML preprocessing or model calls).

    NOT responsible for:
    - Feature encoding / preprocessing  (owned by ml/inference/predict.py)
    - Model downloading / loading       (owned by ml/inference/predict.py)
    - FEATURE_ORDER / ENCODERS          (owned by ml/inference/predict.py)
    """

    def __init__(self) -> None:
        # Model is NOT loaded here.  It is injected via load() during
        # FastAPI lifespan startup.  This prevents any download on import.
        self._model = None

    # ------------------------------------------------------------------
    # Public API used by routes
    # ------------------------------------------------------------------

    def load(self, model: Any) -> None:
        """
        Inject the pre-loaded model.  Called once from FastAPI lifespan.
        """
        self._model = model
        logger.info("ClassificationService: model injected successfully.")

    def is_available(self) -> bool:
        """Return True only when a model has been injected."""
        return self._model is not None

    def predict(self, data: dict[str, Any]) -> dict[str, Any]:
        """
        Run ML inference on feature dictionary.

        Delegates all preprocessing and prediction to:
            ml.inference.predict.predict(model, data)

        Adds backend presentation layer:
            - reasoning (explainable AI bullet points)

        Returns:
            {
                "class_id":   int,
                "class_name": str,
                "confidence": float,
                "reasoning":  list[str]
            }
        """
        if not self.is_available():
            raise HTTPException(
                status_code=503,
                detail=(
                    "ML model is currently unavailable. "
                    "The XGBoost model has not been loaded. "
                    "Check startup logs for model download errors."
                ),
            )

        # All ML logic lives in ml/inference/predict.py
        result = ml_predict(self._model, data)

        # Append backend presentation layer (not ML logic)
        result["reasoning"] = self.generate_reasoning(
            data, result["class_id"], result["confidence"]
        )
        return result

    def generate_reasoning(
        self, features: dict[str, Any], class_id: int, confidence: float
    ) -> list[str]:
        """
        Generates explainable AI reasoning bullet points for frontend display.

        This is backend presentation / business-logic only.
        It does NOT perform ML preprocessing or call the model.
        """
        reasons: list[str] = []

        frp = float(features.get("frp", 0.0))
        brightness = float(features.get("brightness", 0.0))
        daynight = str(features.get("daynight", "")).upper()
        landcover = int(features.get("landcover_class", 0))

        if class_id == 2:
            reasons.append("High-temperature flare signature detected")
            if frp >= 15.0:
                reasons.append(f"Elevated Fire Radiative Power ({frp:.1f} MW)")
            if daynight in ["N", "1"]:
                reasons.append("Continuous nocturnal thermal emission")
        elif class_id == 1:
            reasons.append("Thermal signature matches industrial power/manufacturing profile")
            if landcover == 50:
                reasons.append("Located within built-up/industrial land cover zone")
            if daynight in ["N", "1"]:
                reasons.append("Nighttime operational heat detected")
            if frp >= 5.0:
                reasons.append(f"Consistent thermal output ({frp:.1f} MW)")
        else:
            reasons.append("Low intensity / non-industrial thermal anomaly")
            if frp < 5.0:
                reasons.append(f"Low Fire Radiative Power ({frp:.1f} MW)")

        if brightness > 330:
            reasons.append(f"Elevated brightness temperature ({brightness:.1f} K)")

        return reasons


# Singleton — model is NOT loaded here; injected via lifespan.
classification_service = ClassificationService()
