from sqlalchemy import Column, Integer, Float, String, DateTime
from geoalchemy2 import Geometry

from app.core.base import Base


class ThermalEvent(Base):
    __tablename__ = "thermal_events"

    id = Column(Integer, primary_key=True, index=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    timestamp = Column(DateTime, nullable=False)

    brightness = Column(Float, nullable=True)
    frp = Column(Float, nullable=True)

    satellite = Column(String, nullable=True)

    prediction_class = Column(Integer, nullable=True)
    confidence = Column(Float, nullable=True)

    # Contextual intelligence (computed at ingest time)
    distance_to_industry = Column(Float, nullable=True)  # meters
    persistence_days = Column(Integer, nullable=True)    # distinct days detected near this location
    night_ratio = Column(Float, nullable=True)           # 0..1 fraction of night detections
    cluster_size = Column(Integer, nullable=True)        # satellite passes in the same cluster/day
    nearby_facility = Column(String, nullable=True)      # nearest OSM facility name
    land_cover = Column(String, nullable=True)           # human-readable land-use label

    geometry = Column(
        Geometry("POINT", srid=4326),
        nullable=False
    )