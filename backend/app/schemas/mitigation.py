from pydantic import BaseModel, Field
from typing import List, Optional

class MitigationScenarioInput(BaseModel):
    zone_id: str
    canopy_increase_pct: float = Field(0.0, ge=0.0, le=50.0, description="Additional tree canopy coverage %")
    cool_roof_albedo_pct: float = Field(0.0, ge=0.0, le=50.0, description="Cool roof / high-albedo pavement %")
    misting_coverage_pct: float = Field(0.0, ge=0.0, le=50.0, description="Active evaporative misting deployment %")

class MitigationSimulationResult(BaseModel):
    zone_id: str
    zone_name: str
    baseline_surface_temp_c: float
    baseline_ambient_temp_c: float
    baseline_heatshield_score: int
    baseline_risk_level: str
    
    projected_surface_temp_c: float
    projected_ambient_temp_c: float
    projected_heatshield_score: int
    projected_risk_level: str
    
    delta_surface_temp_c: float
    delta_ambient_temp_c: float
    score_reduction_points: int
    
    estimated_affected_area_km2: float
    vulnerable_residents_relieved: int
    priority_level: str
    mitigation_breakdown: List[str]
    disclaimer: str = "DEMO - HeatShield Simulation: Deterministic microclimate reduction model based on thermal physics heuristics. Not a guaranteed real-world forecast."
