from pydantic import BaseModel, Field
from typing import List, Optional

class RouteSegment(BaseModel):
    lat: float
    lng: float
    surface_temp_c: float
    ambient_temp_c: float
    shade_coverage_pct: float
    is_shaded: bool

class RouteDetails(BaseModel):
    route_name: str
    distance_km: float
    duration_minutes: float
    avg_surface_temp_c: float
    avg_ambient_temp_c: float
    shade_coverage_pct: float
    heat_exposure_score: float  # (Duration x Temp x Sun factor)
    path: List[List[float]]  # [[lat, lng], ...]
    highlights: List[str]

class RouteComparisonResponse(BaseModel):
    origin_name: str
    destination_name: str
    direct_route: RouteDetails
    cool_route: RouteDetails
    recommended_route: str  # "cool" or "direct"
    delta_time_min: float
    thermal_reduction_pct: float
    reasoning: str
    data_source: str = "DEMO - HeatShield Microclimate Routing Engine & FortyGuard Hyperlocal Intelligence"
