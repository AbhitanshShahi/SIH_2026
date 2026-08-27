import csv
import io
import logging
from datetime import datetime, timezone
from typing import Any
import httpx

from app.core.config import FIRMS_MAP_KEY

logger = logging.getLogger("firms_service")

# Talcher-Angul Industrial Belt Bounding Box (Odisha, India)
# BBOX format for FIRMS API: min_lon,min_lat,max_lon,max_lat
TALCHER_MIN_LAT = 20.5
TALCHER_MAX_LAT = 21.2
TALCHER_MIN_LON = 84.4
TALCHER_MAX_LON = 85.3
TALCHER_BBOX = f"{TALCHER_MIN_LON},{TALCHER_MIN_LAT},{TALCHER_MAX_LON},{TALCHER_MAX_LAT}"


class FirmsService:
    """
    Client for fetching thermal anomaly observations from NASA FIRMS API.
    """

    def __init__(self, map_key: str | None = None):
        self.map_key = (map_key or FIRMS_MAP_KEY or "").strip()

    def is_configured(self) -> bool:
        return bool(self.map_key and len(self.map_key) > 5)

    async def fetch_area_hotspots(
        self,
        source: str = "VIIRS_SNPP_NRT",
        day_range: int = 1
    ) -> list[dict[str, Any]]:
        """
        Queries NASA FIRMS area API for the Talcher-Angul industrial region.
        URL format: https://firms.modaps.eosdis.nasa.gov/api/area/csv/[MAP_KEY]/[SOURCE]/[BBOX]/[DAYS]
        """
        if not self.is_configured():
            logger.warning("FIRMS_MAP_KEY is not configured in .env. Falling back to sample observations.")
            return self.get_sample_observations()

        url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{self.map_key}/{source}/{TALCHER_BBOX}/{day_range}"

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url)
                if response.status_code != 200:
                    logger.error(f"NASA FIRMS API returned status {response.status_code}: {response.text}")
                    return self.get_sample_observations()

                csv_text = response.text.strip()
                if not csv_text or "Bad request" in csv_text or "Invalid MAP_KEY" in csv_text:
                    logger.warning(f"NASA FIRMS API error message: {csv_text}")
                    return self.get_sample_observations()

                return self._parse_firms_csv(csv_text, default_satellite=source)

        except Exception as e:
            logger.error(f"Exception while requesting NASA FIRMS API: {e}")
            return self.get_sample_observations()

    def _parse_firms_csv(self, csv_content: str, default_satellite: str = "SNPP") -> list[dict[str, Any]]:
        """Parses FIRMS CSV response into standardized observation dictionaries."""
        observations = []
        reader = csv.DictReader(io.StringIO(csv_content))

        for row in reader:
            try:
                lat = float(row.get("latitude", 0))
                lon = float(row.get("longitude", 0))

                # Skip invalid coordinates outside area
                if not (TALCHER_MIN_LAT - 0.5 <= lat <= TALCHER_MAX_LAT + 0.5 and
                        TALCHER_MIN_LON - 0.5 <= lon <= TALCHER_MAX_LON + 0.5):
                    continue

                acq_date_str = row.get("acq_date", datetime.utcnow().strftime("%Y-%m-%d"))
                acq_time_str = str(row.get("acq_time", "0000")).zfill(4)

                # Parse timestamp
                try:
                    dt = datetime.strptime(f"{acq_date_str} {acq_time_str}", "%Y-%m-%d %H%M")
                except ValueError:
                    dt = datetime.now(timezone.utc)

                sat_val = row.get("satellite") or ("SNPP" if "SNPP" in default_satellite else "N20")
                if "N" in str(sat_val) and "20" in str(sat_val):
                    satellite = "N20"
                else:
                    satellite = "SNPP"

                brightness = float(row.get("bright_ti4") or row.get("brightness") or 330.0)
                bright_t31 = float(row.get("bright_ti5") or row.get("bright_t31") or 295.0)
                frp = float(row.get("frp", 10.0))
                confidence = row.get("confidence", "nominal")
                daynight = row.get("daynight", "D")

                obs = {
                    "latitude": lat,
                    "longitude": lon,
                    "timestamp": dt,
                    "acq_date": acq_date_str,
                    "acq_time": acq_time_str,
                    "brightness": brightness,
                    "bright_t31": bright_t31,
                    "frp": frp,
                    "scan": float(row.get("scan", 0.5)),
                    "track": float(row.get("track", 0.4)),
                    "satellite": satellite,
                    "confidence": confidence,
                    "version": row.get("version", 1),
                    "daynight": daynight
                }
                observations.append(obs)
            except Exception as row_err:
                logger.debug(f"Failed to parse CSV row: {row_err}")
                continue

        return observations

    @staticmethod
    def get_sample_observations() -> list[dict[str, Any]]:
        """
        Provides realistic sample observations from the Talcher-Angul Industrial Belt
        for demonstration and testing when live API keys are offline or unavailable.
        """
        now = datetime.now(timezone.utc)
        return [
            {
                "latitude": 20.9512,
                "longitude": 85.1524,
                "timestamp": now,
                "acq_date": now.strftime("%Y-%m-%d"),
                "acq_time": "1845",
                "brightness": 348.5,
                "bright_t31": 302.1,
                "frp": 28.4,
                "scan": 0.5,
                "track": 0.4,
                "satellite": "SNPP",
                "confidence": "high",
                "version": 1,
                "daynight": "N"
            },
            {
                "latitude": 20.8421,
                "longitude": 85.0932,
                "timestamp": now,
                "acq_date": now.strftime("%Y-%m-%d"),
                "acq_time": "1845",
                "brightness": 339.2,
                "bright_t31": 298.6,
                "frp": 14.8,
                "scan": 0.45,
                "track": 0.38,
                "satellite": "SNPP",
                "confidence": "nominal",
                "version": 1,
                "daynight": "N"
            },
            {
                "latitude": 21.0125,
                "longitude": 85.2210,
                "timestamp": now,
                "acq_date": now.strftime("%Y-%m-%d"),
                "acq_time": "0730",
                "brightness": 322.0,
                "bright_t31": 290.5,
                "frp": 4.2,
                "scan": 0.52,
                "track": 0.41,
                "satellite": "N20",
                "confidence": "low",
                "version": 1,
                "daynight": "D"
            }
        ]


firms_service = FirmsService()
