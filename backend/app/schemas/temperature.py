from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class DataSourceEnum(str, Enum):
    LIVE_FORTYGUARD = "LIVE - FortyGuard"
    DEMO_HEATSHIELD = "DEMO - HeatShield Simulation"
    EXTERNAL_DATA = "EXTERNAL - Sentinel-2 / Landsat / OSM"

class MicroclimatePoint(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    ambient_temp_c: float
    surface_temp_c: float
    relative_humidity_pct: float
    wind_speed_mps: float
    solar_radiation_wm2: float
    uhi_intensity_c: float  # Microclimate delta vs baseline
    canopy_cover_pct: float
    albedo: float
    shade_factor: float
    heatshield_score: int
    risk_level: str
    timestamp: str
    data_source: DataSourceEnum

class CitySummary(BaseModel):
    city_name: str
    center_lat: float
    center_lng: float
    current_avg_ambient: float
    current_avg_surface: float
    peak_temp_today: float
    heatshield_score: int
    active_hotspots_count: int
    data_source: DataSourceEnum

class DiurnalCurvePoint(BaseModel):
    hour: int
    hour_label: str
    ambient_temp_c: float
    surface_temp_c: float
    wbgt_c: Optional[float] = None
    heat_index_c: float
    is_peak_risk: bool
