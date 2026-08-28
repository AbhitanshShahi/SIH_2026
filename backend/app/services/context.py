import json
import logging
import math
from datetime import datetime
from pathlib import Path

from sqlalchemy import func
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.models.thermal_event import ThermalEvent

logger = logging.getLogger("context_service")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

OSM_DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "raw" / "osm"

# Grouping tolerance (degrees) used to relate detections to the same hotspot.
# ~1.3 km at these latitudes — matches the FIRMS VIIRS grid footprint.
PERSISTENCE_TOL_DEG = 0.012
CLUSTER_TOL_DEG = 0.02  # ~2.2 km cluster radius within a single day
FACILITY_PRESENT_M = 2500.0  # consider the nearest OSM facility "nearby" within 2.5 km

NEW_COLUMNS = [
    "distance_to_industry DOUBLE PRECISION",
    "persistence_days INTEGER",
    "night_ratio DOUBLE PRECISION",
    "cluster_size INTEGER",
    "nearby_facility VARCHAR",
    "land_cover VARCHAR",
]


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in metres between two coordinates."""
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _is_night(dt: datetime) -> bool:
    return dt.hour >= 18 or dt.hour < 6


def _polygon_centroid(coords) -> tuple[float, float] | None:
    """Centroid of the outer ring of a Polygon or MultiPolygon coordinate array."""
    try:
        if len(coords) == 0:
            return None
        first = coords[0]
        if first and isinstance(first[0], (list, tuple)):
            ring = coords[0]
        else:
            ring = coords
        lats = [c[1] for c in ring if isinstance(c, (list, tuple)) and len(c) >= 2]
        lons = [c[0] for c in ring if isinstance(c, (list, tuple)) and len(c) >= 2]
        if not lats:
            return None
        return sum(lats) / len(lats), sum(lons) / len(lons)
    except Exception:
        return None


def _landcover_label(prediction_class: int | None, distance_m: float | None) -> str:
    if prediction_class == 2:
        return "Flare infrastructure zone"
    if prediction_class == 1 or (distance_m is not None and distance_m <= FACILITY_PRESENT_M):
        return "Industrial / built-up zone"
    return "Mixed land cover (industrial periphery)"


class ContextService:
    """
    Computes operational context for each thermal detection:

    - distance_to_industry : metres to the nearest OSM industrial feature
    - nearby_facility      : name of that feature when reasonably close
    - persistence_days     : distinct days with a detection near this location
    - night_ratio          : fraction of nearby detections acquired at night
    - cluster_size         : same-day satellite passes in the local cluster
    - land_cover           : human-readable land-use label
    """

    def __init__(self) -> None:
        self._industries: list[tuple[str, float, float]] | None = None

    # ------------------------------------------------------------------
    # OSM industry index
    # ------------------------------------------------------------------

    def _load_industries(self) -> list[tuple[str, float, float]]:
        if self._industries is not None:
            return self._industries

        records: list[tuple[str, float, float]] = []
        for fname in ("power_plants.geojson", "industrial_use.geojson", "mines.geojson", "angul_talcher_industries.geojson"):
            path = OSM_DATA_DIR / fname
            if not path.exists():
                continue
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except Exception as exc:
                logger.warning("Could not parse OSM file %s: %s", fname, exc)
                continue

            for feat in data.get("features", []):
                geom = feat.get("geometry") or {}
                coords = geom.get("coordinates")
                props = feat.get("properties") or {}
                name = (props.get("name") or props.get("name:en") or "").strip()

                gtype = geom.get("type")
                if gtype == "Point":
                    if not coords or len(coords) < 2:
                        continue
                    lat, lon = float(coords[1]), float(coords[0])
                elif gtype == "Polygon":
                    center = _polygon_centroid(coords)
                    if center is None:
                        continue
                    lat, lon = center
                elif gtype == "MultiPolygon":
                    center = None
                    for poly in coords:
                        center = _polygon_centroid(poly)
                        if center is not None:
                            break
                    if center is None:
                        continue
                    lat, lon = center
                else:
                    continue

                records.append((name, lat, lon))

        self._industries = records
        logger.info("Loaded %d OSM industrial records", len(records))
        return records

    def nearest_industry(self, lat: float, lon: float) -> tuple[float | None, str | None]:
        best_m: float | None = None
        best_name: str | None = None
        for name, ilat, ilon in self._load_industries():
            d = haversine_m(lat, lon, ilat, ilon)
            if best_m is None or d < best_m:
                best_m = d
                best_name = name
        return best_m, best_name

    # ------------------------------------------------------------------
    # Context computation
    # ------------------------------------------------------------------

    def compute_event_context(
        self,
        db: Session,
        lat: float,
        lon: float,
        timestamp: datetime,
        frp: float = 0.0,
        prediction_class: int = 0,
        daynight: str | None = None,
    ) -> dict:
        dist_m, facility = self.nearest_industry(lat, lon)

        # Historical detections grouped around this hotspot.
        prior = db.query(ThermalEvent).filter(
            ThermalEvent.latitude.between(lat - PERSISTENCE_TOL_DEG, lat + PERSISTENCE_TOL_DEG),
            ThermalEvent.longitude.between(lon - PERSISTENCE_TOL_DEG, lon + PERSISTENCE_TOL_DEG),
            ThermalEvent.timestamp.isnot(None),
        ).all()

        days: set = set()
        total = 0
        nights = 0
        for ev in prior:
            if ev.timestamp is None:
                continue
            days.add(ev.timestamp.date())
            total += 1
            if _is_night(ev.timestamp):
                nights += 1

        is_night = bool(daynight and str(daynight).strip().upper() == "N")
        if timestamp is not None:
            days.add(timestamp.date())
            total += 1
            if is_night or _is_night(timestamp):
                nights += 1

        # Same-day cluster density (includes this detection).
        cluster_size = 1
        if timestamp is not None:
            nearby_same_day = db.query(func.count(ThermalEvent.id)).filter(
                ThermalEvent.latitude.between(lat - CLUSTER_TOL_DEG, lat + CLUSTER_TOL_DEG),
                ThermalEvent.longitude.between(lon - CLUSTER_TOL_DEG, lon + CLUSTER_TOL_DEG),
                func.date(ThermalEvent.timestamp) == timestamp.date(),
            ).scalar() or 0
            cluster_size = int(nearby_same_day) + 1

        nearby = dist_m is not None and dist_m <= FACILITY_PRESENT_M

        return {
            "distance_to_industry": round(dist_m, 1) if dist_m is not None else None,
            "nearby_facility": facility if (nearby and facility) else None,
            "persistence_days": len(days),
            "night_ratio": round(nights / total, 3) if total else 0.0,
            "cluster_size": int(cluster_size),
            "land_cover": _landcover_label(prediction_class, dist_m),
        }


# ---------------------------------------------------------------------------
# Schema migration + backfill helpers
# ---------------------------------------------------------------------------

def ensure_schema(engine: Engine) -> None:
    """Adds the context columns to an already-created thermal_events table."""
    with engine.begin() as conn:
        for col in NEW_COLUMNS:
            conn.exec_driver_sql(f"ALTER TABLE thermal_events ADD COLUMN IF NOT EXISTS {col}")


def backfill_context(db: Session) -> int:
    """Backfills context intelligence for events stored before the upgrade."""
    rows = db.query(ThermalEvent).filter(
        ThermalEvent.distance_to_industry.is_(None)
        | ThermalEvent.persistence_days.is_(None)
        | ThermalEvent.night_ratio.is_(None)
        | ThermalEvent.cluster_size.is_(None)
        | ThermalEvent.land_cover.is_(None)
    ).all()
    if not rows:
        return 0
    for ev in rows:
        ctx = context_service.compute_event_context(
            db,
            ev.latitude,
            ev.longitude,
            ev.timestamp,
            ev.frp or 0.0,
            ev.prediction_class or 0,
        )
        for col, val in ctx.items():
            setattr(ev, col, val)
    db.commit()
    logger.info("Backfilled context for %d thermal events.", len(rows))
    return len(rows)


context_service = ContextService()