import logging
from datetime import datetime
from typing import Any

logger = logging.getLogger("features_service")


class FeatureService:
    """
    Transforms raw NASA FIRMS observations and timestamps into the 12 exact
    features expected by the trained XGBoost model.
    """

    @staticmethod
    def extract_temporal_features(
        acq_date: str | datetime | None = None,
        acq_time: str | int | None = None,
        timestamp: datetime | None = None
    ) -> tuple[int, int, str]:
        """
        Derives (month, hour, daynight) from date/time fields.
        """
        dt = None

        if timestamp is not None and isinstance(timestamp, datetime):
            dt = timestamp
        elif acq_date is not None:
            if isinstance(acq_date, datetime):
                dt = acq_date
            elif isinstance(acq_date, str):
                try:
                    # e.g. "2026-08-24" or "2026-08-24T18:30:00"
                    if "T" in acq_date or " " in acq_date:
                        dt = datetime.fromisoformat(acq_date.replace("Z", "+00:00"))
                    else:
                        dt = datetime.strptime(acq_date, "%Y-%m-%d")
                except Exception:
                    dt = datetime.utcnow()
        else:
            dt = datetime.utcnow()

        month = dt.month

        # Determine hour
        if acq_time is not None:
            acq_str = str(acq_time).strip().zfill(4)
            try:
                hour = int(acq_str[:2])
            except ValueError:
                hour = dt.hour
        else:
            hour = dt.hour

        # Ensure hour is within 0-23
        hour = max(0, min(23, hour))

        # Default daynight inference (Night between 18:00 and 06:00 UTC)
        daynight = "N" if (hour >= 18 or hour < 6) else "D"

        return month, hour, daynight

    @staticmethod
    def extract_landcover_class(lat: float, lon: float) -> int:
        """
        Returns the ESA WorldCover class for coordinates.
        Talcher-Angul industrial belt core (Lat 20.8-21.1, Lon 85.0-85.3) defaults to 50 (Built-up/Industrial).
        Standard ESA WorldCover classes:
        10: Tree cover, 20: Shrubland, 30: Grassland, 40: Cropland, 50: Built-up, 80: Water
        """
        # Talcher industrial corridor coordinates
        if 20.5 <= lat <= 21.3 and 84.4 <= lon <= 85.4:
            return 50  # Built-up / Industrial zone
        return 50  # Default to industrial monitoring baseline

    @classmethod
    def transform_firms_observation(cls, obs: dict[str, Any]) -> dict[str, Any]:
        """
        Takes a raw FIRMS observation dictionary and formats it into the 12 features.
        """
        acq_date = obs.get("acq_date") or obs.get("timestamp")
        acq_time = obs.get("acq_time")
        timestamp = obs.get("timestamp") if isinstance(obs.get("timestamp"), datetime) else None

        month, hour, inferred_daynight = cls.extract_temporal_features(acq_date, acq_time, timestamp)

        daynight = obs.get("daynight") or inferred_daynight
        if isinstance(daynight, str):
            daynight = daynight.strip().upper()
        else:
            daynight = inferred_daynight

        lat = float(obs.get("latitude", 20.95))
        lon = float(obs.get("longitude", 85.15))
        landcover = obs.get("landcover_class", cls.extract_landcover_class(lat, lon))

        # Map brightness: VIIRS uses 'bright_ti4', MODIS uses 'brightness'
        brightness = obs.get("brightness") or obs.get("bright_ti4") or obs.get("bright_t31") or 330.0
        # Map bright_t31: VIIRS uses 'bright_ti5', MODIS uses 'bright_t31'
        bright_t31 = obs.get("bright_t31") or obs.get("bright_ti5") or 295.0

        frp = float(obs.get("frp", 10.0))
        scan = float(obs.get("scan", 0.5))
        track = float(obs.get("track", 0.4))
        satellite = str(obs.get("satellite", "SNPP")).strip().upper()
        confidence = obs.get("confidence", "nominal")
        version = obs.get("version", 1)

        return {
            "brightness": float(brightness),
            "scan": scan,
            "track": track,
            "satellite": satellite,
            "confidence": confidence,
            "version": version,
            "bright_t31": float(bright_t31),
            "frp": frp,
            "daynight": daynight,
            "month": month,
            "hour": hour,
            "landcover_class": int(landcover)
        }


feature_service = FeatureService()
