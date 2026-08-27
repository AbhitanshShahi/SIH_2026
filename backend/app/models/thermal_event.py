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

    geometry = Column(
        Geometry("POINT", srid=4326),
        nullable=False
    )