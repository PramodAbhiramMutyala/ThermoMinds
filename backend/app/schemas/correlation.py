from pydantic import BaseModel, Field
from typing import List, Optional

class CorrelationDataPoint(BaseModel):
    zone_id: str
    zone_name: str
    surface_temp_c: float
    ambient_temp_c: float
    ndvi_vegetation_index: float  # -1.0 to 1.0 (Sentinel-2 NDVI)
    canopy_cover_pct: float
    impervious_surface_pct: float
    albedo: float
    heatshield_score: int

class CorrelationAnalysisResult(BaseModel):
    title: str
    x_variable: str
    y_variable: str
    correlation_coefficient_r: float  # Pearson r
    r_squared: float
    p_value: float
    sample_size: int
    data_points: List[CorrelationDataPoint]
    scientific_takeaway: str
    data_source: str = "EXTERNAL - Sentinel-2 NDVI & FortyGuard Hyperlocal Intelligence"
