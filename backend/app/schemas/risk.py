from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ScoreBreakdown(BaseModel):
    temperature_score: float = Field(..., description="Max 35 points: Intensity vs baseline")
    persistence_score: float = Field(..., description="Max 25 points: Hours > 35C & nocturnal heat trap")
    exceedance_score: float = Field(..., description="Max 20 points: Hours > 38C or WBGT > 30C")
    environment_score: float = Field(..., description="Max 20 points: Albedo, canopy deficit, vulnerability")
    total_score: int = Field(..., ge=0, le=100, description="HeatShield Unified Score (0-100)")
    risk_level: str = Field(..., description="Low | Moderate | High | Very High | Extreme")
    summary: str

class WbgtCalculationResult(BaseModel):
    is_available: bool
    wbgt_c: Optional[float] = None
    thermal_flag: Optional[str] = None  # Green, Yellow, Orange, Red, Black
    calculation_method: str = "Liljegren / Bernard WBGT Approximation"
    inputs_used: Dict[str, Any]
    assumptions: List[str]
    confidence: str  # High, Moderate, Low
    work_rest_recommendation: str
    hydration_recommendation: str
    disclaimer: str = "HeatShield Work-Rest Recommendation: Based on calculated WBGT and configured occupational guidance. Not an official OSHA determination."

class VulnerabilityHeuristicResult(BaseModel):
    profile_name: str
    base_heatshield_score: int
    personalized_risk_score: int
    risk_level: str
    primary_hazards: List[str]
    recommended_actions: List[str]
    disclaimer: str = "HeatShield Exposure Vulnerability Profile is a decision-support heuristic, not a medical diagnosis."

class HeatExposureMetric(BaseModel):
    location_name: str
    intensity_c: float
    duration_hours: float
    context_description: str
    cumulative_exposure_score: float
    hazard_rationale: str
