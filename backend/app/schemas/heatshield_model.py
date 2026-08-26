from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.utils.conversions import (
    celsius_to_fahrenheit,
    calculate_apparent_temperature,
    calculate_heat_index_c,
    calculate_wet_bulb_c
)

class Location(BaseModel):
    id: str = Field(..., description="Unique zone or site identifier")
    name: str = Field(..., description="Human-readable microclimate zone name")
    city: str = Field(..., description="City or metropolitan region")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    elevation_m: Optional[float] = Field(None, description="Elevation in meters if available")
    area_km2: Optional[float] = Field(None, description="Zone coverage area in km²")
    polygon_coordinates: Optional[List[List[float]]] = Field(None, description="Bounding polygon coordinates")

class TemperatureObservation(BaseModel):
    ambient_c: float = Field(..., description="Ambient air temperature in °C")
    surface_c: float = Field(..., description="Radiant surface temperature in °C")
    time_of_measure: Optional[str] = Field(None, description="Timestamp or hour of measure (e.g. '14:00')")
    is_peak: bool = Field(False, description="True if this observation represents diurnal peak")
    confidence: str = Field("high", description="high | moderate | low")
    timestamp: str = Field(..., description="ISO 8601 observation timestamp")
    source: str = Field("LIVE - FortyGuard", description="Data provenance label")

    @property
    def ambient_f(self) -> float:
        return celsius_to_fahrenheit(self.ambient_c)

    @property
    def surface_f(self) -> float:
        return celsius_to_fahrenheit(self.surface_c)

class ForecastObservation(BaseModel):
    forecast_hour: int = Field(..., ge=0, le=23, description="Hour of the day for forecast")
    target_time: str = Field(..., description="Target ISO timestamp or hour string")
    forecast_ambient_c: float = Field(..., description="Forecasted ambient temperature in °C")
    forecast_surface_c: float = Field(..., description="Forecasted surface temperature in °C")
    confidence: str = Field("moderate", description="high | moderate | low")

class EnvironmentalConditions(BaseModel):
    """
    Environmental parameters.
    Missing parameters are strictly represented as None rather than fabricated.
    """
    relative_humidity_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    wind_speed_mps: Optional[float] = Field(None, ge=0.0)
    solar_radiation_wm2: Optional[float] = Field(None, ge=0.0)
    apparent_temperature_c: Optional[float] = None
    heat_index_c: Optional[float] = None
    wet_bulb_temperature_c: Optional[float] = None
    wbgt_c: Optional[float] = None
    canopy_cover_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    albedo: Optional[float] = Field(None, ge=0.0, le=1.0)
    ndvi: Optional[float] = Field(None, ge=-1.0, le=1.0)

class PersistenceResult(BaseModel):
    threshold_c: float = Field(35.0, description="Temperature threshold evaluated (°C)")
    direction: str = Field("above", description="'above' or 'below'")
    continuous_hours_past_threshold: float = Field(..., description="Longest consecutive hours beyond threshold")
    nighttime_cooling_deficit_c: Optional[float] = Field(None, description="Nocturnal heat trap elevation over baseline")
    is_persistent_hotspot: bool = Field(False, description="Flagged as high-persistence hotspot")

class ExceedanceResult(BaseModel):
    threshold_c: float = Field(38.0, description="Critical danger threshold (°C)")
    direction: str = Field("above", description="'above' or 'below'")
    cumulative_hours_exceeded: float = Field(..., description="Total hours exceeding threshold")
    severity_index: float = Field(..., description="Cumulative severity metric (Hours x Delta)")

class HeatRiskResult(BaseModel):
    heatshield_score: int = Field(..., ge=0, le=100, description="Deterministic 0-100 HeatShield Score")
    risk_level: str = Field(..., description="Low | Moderate | High | Very High | Extreme")
    risk_factors: List[str] = Field(default_factory=list, description="Primary drivers of risk score")
    score_breakdown: Dict[str, float] = Field(default_factory=dict, description="Component points (temp, persist, exceed, env)")
    exposure_index: float = Field(..., description="Cumulative exposure = Intensity x Duration x Context")

class Hotspot(BaseModel):
    hotspot_id: str
    location: Location
    priority_rank: int = Field(..., ge=1, description="1 is highest priority hotspot")
    surface_anomaly_c: float = Field(..., description="Surface temperature delta vs baseline")
    persistence_hours: float
    risk_score: int = Field(..., ge=0, le=100)
    active_workers_count: Optional[int] = Field(None, description="Count of outdoor workers on site")
    vulnerable_population: Optional[int] = Field(None, description="Estimated vulnerable demographic count")

class ActionRecommendation(BaseModel):
    recommendation_id: str
    persona: str = Field(..., description="citizen | worker | authority")
    category: str = Field(..., description="route | hydration | work_rest | mitigation | respite")
    title: str
    description: str
    action_steps: List[str]
    urgency: str = Field("medium", description="low | medium | high | critical")

# --- Main Normalized HeatShield Data Object ---

class NormalizedHeatShieldReport(BaseModel):
    """
    Main normalized HeatShield representation independent of FortyGuard API schema.
    Strictly preserves None for unavailable fields without fabricating values.
    """
    location: Location
    current_temperature: TemperatureObservation
    forecast_temperature: Optional[ForecastObservation] = None
    peak_temperature: Optional[TemperatureObservation] = None
    
    # Environmental parameters (null if unavailable)
    humidity: Optional[float] = Field(None, description="Relative humidity % if available, otherwise null")
    heat_index: Optional[float] = Field(None, description="Heat index °C if available, otherwise null")
    apparent_temperature: Optional[float] = Field(None, description="Apparent temperature °C if available, otherwise null")
    wet_bulb_temperature: Optional[float] = Field(None, description="Wet-bulb temperature °C if available, otherwise null")
    
    # Analytics
    persistence_hours: Optional[float] = Field(None, description="Consecutive hours above 35°C if available")
    exceedance_hours: Optional[float] = Field(None, description="Hours exceeding 38°C if available")
    
    # Unified Risk Assessment
    risk_score: int = Field(..., ge=0, le=100, description="Unified HeatShield Score (0-100)")
    risk_level: str = Field(..., description="Low | Moderate | High | Very High | Extreme")
    risk_factors: List[str] = Field(default_factory=list)
    
    # Meta
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    source: str = Field("LIVE - FortyGuard", description="Provenance badge")

    @classmethod
    def create(
        cls,
        location: Location,
        ambient_c: float,
        surface_c: float,
        timestamp: str,
        humidity: Optional[float] = None,
        wind_mps: Optional[float] = None,
        persistence_hours: Optional[float] = None,
        exceedance_hours: Optional[float] = None,
        risk_score: int = 75,
        risk_level: str = "High",
        risk_factors: Optional[List[str]] = None,
        source: str = "LIVE - FortyGuard",
        forecast_obs: Optional[ForecastObservation] = None,
        peak_obs: Optional[TemperatureObservation] = None
    ) -> "NormalizedHeatShieldReport":
        """
        Factory method that calculates derived environmental values safely from available inputs,
        leaving missing inputs as null.
        """
        current_obs = TemperatureObservation(
            ambient_c=ambient_c,
            surface_c=surface_c,
            timestamp=timestamp,
            source=source
        )

        apparent_temp = calculate_apparent_temperature(ambient_c, humidity, wind_mps) if humidity is not None else None
        hi = calculate_heat_index_c(ambient_c, humidity) if humidity is not None else None
        wb = calculate_wet_bulb_c(ambient_c, humidity) if humidity is not None else None

        factors = risk_factors or []
        if ambient_c >= 40.0:
            factors.append("Extreme ambient thermal load")
        if surface_c >= 55.0:
            factors.append("Severe asphalt/roof radiant heat accumulation")
        if persistence_hours and persistence_hours >= 6.0:
            factors.append(f"Prolonged heat persistence ({persistence_hours} consecutive hours > 35°C)")

        return cls(
            location=location,
            current_temperature=current_obs,
            forecast_temperature=forecast_obs,
            peak_temperature=peak_obs,
            humidity=humidity,
            heat_index=hi,
            apparent_temperature=apparent_temp,
            wet_bulb_temperature=wb,
            persistence_hours=persistence_hours,
            exceedance_hours=exceedance_hours,
            risk_score=risk_score,
            risk_level=risk_level,
            risk_factors=factors,
            timestamp=timestamp,
            source=source
        )
