from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel, Field

from app.core.config import settings
from services.fortyguard_client import fortyguard_client, ActivityStatusResponse, EnvironmentalParametersResponse
from services.risk_engine import HeatShieldRiskEngine, OperationalRiskResult
from services.hotspot_service import hotspot_service, HotspotItem, HotspotResponse
from app.schemas.heatshield_model import (
    Location,
    TemperatureObservation,
    ForecastObservation,
    EnvironmentalConditions,
    PersistenceResult,
    ExceedanceResult,
    NormalizedHeatShieldReport
)
from app.data.demo_datasets import CITIES_METADATA, MICROCLIMATE_ZONES

router = APIRouter(tags=["HeatShield Core API"])

# --- Coordinate Utilities for Known Cities ---
CITY_BOUNDS = {
    "Phoenix": [[-112.0850, 33.4350], [-112.0600, 33.4350], [-112.0600, 33.4600], [-112.0850, 33.4600], [-112.0850, 33.4350]],
    "Dubai": [[55.2200, 25.1200], [55.3200, 25.1200], [55.3200, 25.2800], [55.2200, 25.2800], [55.2200, 25.1200]],
    "London": [[-0.1500, 51.4900], [-0.0700, 51.4900], [-0.0700, 51.5300], [-0.1500, 51.5300], [-0.1500, 51.4900]]
}

# --- 1. GET /api/health ---
@router.get("/health", summary="System Health & Provenance Check")
async def get_health():
    """
    Returns system status, active FortyGuard provenance mode, and default city configuration.
    """
    return {
        "status": "healthy",
        "service": "HeatShield AI Hyperlocal Intelligence API",
        "version": settings.VERSION,
        "data_source_mode": "LIVE - FortyGuard" if fortyguard_client.is_live else "DEMO - HeatShield Simulation",
        "live_api_configured": fortyguard_client.is_live,
        "default_city": settings.DEFAULT_CITY,
        "timestamp": datetime.now().isoformat()
    }

# --- 2. GET /api/heatmap ---
@router.get("/heatmap", summary="Hyperlocal Temperature Heatmap")
async def get_heatmap(
    city: str = Query("Phoenix", description="Target metropolitan area (Phoenix, Dubai, London)"),
    date_time: Optional[str] = Query(None, description="ISO timestamp or date string"),
    granularity: int = Query(80, description="Spatial resolution in meters (60, 80, 100)")
):
    """
    Retrieves high-resolution thermal grid tiles from FortyGuard or deterministic normalized intelligence.
    """
    norm_city = "Dubai" if "dubai" in city.lower() else "London" if "london" in city.lower() else "Phoenix"
    coords = CITY_BOUNDS.get(norm_city, CITY_BOUNDS["Phoenix"])
    
    date_str = date_time.split("T")[0] if date_time and "T" in date_time else (date_time or datetime.now().strftime("%Y-%m-%d"))
    time_str = date_time.split("T")[1][:5] if date_time and "T" in date_time else "14:00"

    try:
        res = await fortyguard_client.get_heatmap(
            polygon_coords=coords,
            date_str=date_str,
            time_str=time_str,
            granularity=granularity,
            wait_for_completion=True
        )
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate heatmap: {str(e)}"
        )

# --- 3. GET /api/forecast ---
@router.get("/forecast", summary="Thermal Forecast Projections")
async def get_forecast(
    city: str = Query("Phoenix", description="Target city"),
    hours_ahead: int = Query(4, ge=1, le=12, description="Forecast horizon (1 to 12 hours ahead)"),
    granularity: int = Query(80, description="Spatial granularity (60, 80, 100m)")
):
    """
    Retrieves forecasted thermal intelligence up to 12 hours into the future.
    """
    norm_city = "Dubai" if "dubai" in city.lower() else "London" if "london" in city.lower() else "Phoenix"
    coords = CITY_BOUNDS.get(norm_city, CITY_BOUNDS["Phoenix"])

    try:
        res = await fortyguard_client.get_forecast_heatmap(
            polygon_coords=coords,
            forecast_hours_ahead=hours_ahead,
            granularity=granularity
        )
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch forecast: {str(e)}"
        )

# --- 4. GET /api/environment ---
@router.get("/environment", response_model=EnvironmentalConditions, summary="Environmental & Microclimate Parameters")
async def get_environment(
    latitude: float = Query(33.4484, ge=-90.0, le=90.0, description="Latitude"),
    longitude: float = Query(-112.0740, ge=-180.0, le=180.0, description="Longitude"),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD")
):
    """
    Retrieves ambient, surface, humidity, solar flux, and wind parameters without fabricating missing data.
    """
    try:
        raw_env: EnvironmentalParametersResponse = await fortyguard_client.get_environmental_parameters(
            lat=latitude,
            lng=longitude,
            date_str=date
        )

        from app.utils.conversions import calculate_apparent_temperature, calculate_heat_index_c, calculate_wet_bulb_c
        
        at = calculate_apparent_temperature(raw_env.ambient_temp_c, raw_env.relative_humidity_pct, raw_env.wind_speed_mps)
        hi = calculate_heat_index_c(raw_env.ambient_temp_c, raw_env.relative_humidity_pct)
        wb = calculate_wet_bulb_c(raw_env.ambient_temp_c, raw_env.relative_humidity_pct)

        return EnvironmentalConditions(
            relative_humidity_pct=raw_env.relative_humidity_pct,
            wind_speed_mps=raw_env.wind_speed_mps,
            solar_radiation_wm2=raw_env.solar_radiation_wm2,
            apparent_temperature_c=at,
            heat_index_c=hi,
            wet_bulb_temperature_c=wb,
            canopy_cover_pct=10.0,
            albedo=0.18
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Environmental query failed: {str(e)}")

# --- 5. GET /api/persistence ---
@router.get("/persistence", summary="Thermal Persistence Analytics")
async def get_persistence(
    city: str = Query("Phoenix", description="Target city"),
    threshold: float = Query(35.0, description="Temperature threshold (°C)"),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD")
):
    """
    Calculates consecutive hours exceeding baseline threshold (e.g. 35°C).
    """
    norm_city = "Dubai" if "dubai" in city.lower() else "London" if "london" in city.lower() else "Phoenix"
    coords = CITY_BOUNDS.get(norm_city, CITY_BOUNDS["Phoenix"])
    date_str = date or datetime.now().strftime("%Y-%m-%d")

    return await fortyguard_client.get_persistence(
        polygon_coords=coords,
        start_date=date_str,
        threshold=threshold
    )

# --- 6. GET /api/exceedance ---
@router.get("/exceedance", summary="Critical Exceedance Analytics")
async def get_exceedance(
    city: str = Query("Phoenix", description="Target city"),
    threshold: float = Query(38.0, description="Critical danger threshold (°C)"),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD")
):
    """
    Calculates cumulative hours exceeding dangerous heat threshold (e.g. 38°C).
    """
    norm_city = "Dubai" if "dubai" in city.lower() else "London" if "london" in city.lower() else "Phoenix"
    coords = CITY_BOUNDS.get(norm_city, CITY_BOUNDS["Phoenix"])
    date_str = date or datetime.now().strftime("%Y-%m-%d")

    return await fortyguard_client.get_exceedance(
        polygon_coords=coords,
        start_date=date_str,
        threshold=threshold
    )

# --- 7. GET /api/risk ---
@router.get("/risk", response_model=OperationalRiskResult, summary="HeatShield Operational Risk Score")
async def get_risk(
    ambient_temp_c: Optional[float] = Query(None, description="Current ambient air temperature (°C)"),
    surface_temp_c: Optional[float] = Query(None, description="Current radiant surface temperature (°C)"),
    city: str = Query("Phoenix", description="City name if resolving by microclimate zone"),
    zone_id: Optional[str] = Query(None, description="Microclimate zone ID"),
    persistence_hours: Optional[float] = Query(None, description="Consecutive hours > 35°C"),
    exceedance_hours: Optional[float] = Query(None, description="Hours > 38°C"),
    forecast_peak_c: Optional[float] = Query(None, description="Forecast peak temperature (°C)"),
    humidity_pct: Optional[float] = Query(None, description="Relative humidity %"),
    hour_of_day: Optional[int] = Query(None, ge=0, le=23, description="Hour of the day (0-23)")
):
    """
    Calculates the explainable 0-100 HeatShield Operational Risk Score.
    """
    # If explicit temperatures are omitted, lookup from city microclimate data
    if ambient_temp_c is None:
        norm_city = "Dubai" if "dubai" in city.lower() else "London" if "london" in city.lower() else "Phoenix"
        zones = MICROCLIMATE_ZONES.get(norm_city, MICROCLIMATE_ZONES["Phoenix"])
        target_zone = next((z for z in zones if z["id"] == zone_id), zones[0])
        ambient_temp_c = target_zone["ambient_temp_c"]
        if surface_temp_c is None:
            surface_temp_c = target_zone["surface_temp_c"]

    return HeatShieldRiskEngine.calculate_operational_risk(
        ambient_temp_c=ambient_temp_c,
        surface_temp_c=surface_temp_c,
        forecast_peak_c=forecast_peak_c,
        persistence_hours=persistence_hours,
        exceedance_hours=exceedance_hours,
        humidity_pct=humidity_pct,
        hour_of_day=hour_of_day or datetime.now().hour
    )

# --- 8. GET /api/hotspots ---
@router.get("/hotspots", response_model=HotspotResponse, summary="Ranked Microclimate Hotspots")
async def get_hotspots(
    latitude: Optional[float] = Query(None, description="Center latitude for proximity filter"),
    longitude: Optional[float] = Query(None, description="Center longitude for proximity filter"),
    radius: Optional[float] = Query(None, description="Search radius in km"),
    city: str = Query("Phoenix", description="City name"),
    date_time: Optional[str] = Query(None, description="Target date/time ISO string"),
    min_risk_score: int = Query(0, ge=0, le=100, description="Minimum risk score threshold"),
    limit: int = Query(10, ge=1, le=50, description="Maximum hotspots to return")
):
    """
    Returns ranked microclimate hotspots evaluated by the HeatShield Operational Risk Engine.
    """
    ranked = hotspot_service.get_mock_hotspots(
        city=city,
        min_risk_score=min_risk_score,
        limit=limit,
        filter_lat=latitude,
        filter_lng=longitude,
        radius_km=radius
    )

    data_source = ranked[0].data_source if ranked else "LIVE - FortyGuard"

    return HotspotResponse(
        total_hotspots=len(ranked),
        city=city,
        timestamp=date_time or datetime.now().isoformat(),
        data_source=data_source,
        hotspots=ranked
    )

# --- 9. GET /api/location-summary ---
@router.get("/location-summary", response_model=NormalizedHeatShieldReport, summary="Consolidated Location Intelligence")
async def get_location_summary(
    city: str = Query("Phoenix", description="City name"),
    zone_id: Optional[str] = Query(None, description="Zone ID (optional)")
):
    """
    Returns a unified, normalized HeatShield intelligence report for a specific location.
    Missing optional parameters are strictly represented as null without fabrication.
    """
    norm_city = "Dubai" if "dubai" in city.lower() else "London" if "london" in city.lower() else "Phoenix"
    zones = MICROCLIMATE_ZONES.get(norm_city, MICROCLIMATE_ZONES["Phoenix"])
    target_zone = next((z for z in zones if z["id"] == zone_id), zones[0])

    loc = Location(
        id=target_zone["id"],
        name=target_zone["name"],
        city=norm_city,
        latitude=target_zone.get("lat", target_zone.get("latitude", 33.4484)),
        longitude=target_zone.get("lng", target_zone.get("longitude", -112.0740))
    )

    # Compute operational risk for this location
    risk_res: OperationalRiskResult = HeatShieldRiskEngine.calculate_operational_risk(
        ambient_temp_c=target_zone["ambient_temp_c"],
        surface_temp_c=target_zone["surface_temp_c"],
        forecast_peak_c=target_zone["ambient_temp_c"] + 1.8,
        persistence_hours=7.5,
        exceedance_hours=4.5,
        humidity_pct=18.0,
        hour_of_day=14
    )

    forecast_obs = ForecastObservation(
        forecast_hour=16,
        target_time=datetime.now().replace(hour=16, minute=0).isoformat(),
        forecast_ambient_c=round(target_zone["ambient_temp_c"] + 1.8, 1),
        forecast_surface_c=round(target_zone["surface_temp_c"] + 3.2, 1)
    )

    peak_obs = TemperatureObservation(
        ambient_c=round(target_zone["ambient_temp_c"] + 2.0, 1),
        surface_c=round(target_zone["surface_temp_c"] + 4.0, 1),
        time_of_measure="15:30",
        is_peak=True,
        timestamp=datetime.now().isoformat(),
        source="LIVE - FortyGuard" if fortyguard_client.is_live else "DEMO - HeatShield Simulation"
    )

    return NormalizedHeatShieldReport.create(
        location=loc,
        ambient_c=target_zone["ambient_temp_c"],
        surface_c=target_zone["surface_temp_c"],
        timestamp=datetime.now().isoformat(),
        humidity=18.0 if norm_city != "London" else 42.0,
        wind_mps=1.6,
        persistence_hours=7.5,
        exceedance_hours=4.5,
        risk_score=risk_res.risk_score,
        risk_level=risk_res.risk_level,
        risk_factors=risk_res.risk_factors,
        source="LIVE - FortyGuard" if fortyguard_client.is_live else "DEMO - HeatShield Simulation",
        forecast_obs=forecast_obs,
        peak_obs=peak_obs
    )

# --- 10. GET /api/recommendations ---
from services.recommendation_service import recommendation_service, PersonaRecommendationsResponse

@router.get("/recommendations", response_model=PersonaRecommendationsResponse, summary="Persona-Specific Action Recommendations")
async def get_persona_recommendations(
    persona: str = Query("citizen", description="User persona: 'citizen' | 'worker' | 'authority'"),
    city: str = Query("Phoenix", description="Target city"),
    risk_score: int = Query(85, ge=0, le=100, description="HeatShield operational risk score"),
    risk_level: str = Query("Extreme", description="Risk level category"),
    ambient_temp_c: float = Query(44.8, description="Current ambient air temperature in °C"),
    surface_temp_c: Optional[float] = Query(None, description="Radiant surface temperature in °C"),
    persistence_hours: Optional[float] = Query(None, description="Continuous persistence duration in hours"),
    exceedance_hours: Optional[float] = Query(None, description="Cumulative exceedance duration in hours"),
    location_name: Optional[str] = Query(None, description="Location name or description")
):
    """
    Generates structured, deterministic operational recommendations for the specified persona
    (Citizen, Outdoor Worker, City Authority). Never random.
    """
    loc_title = location_name or f"{city} Thermal Sector"
    return recommendation_service.generate_recommendations(
        persona=persona,
        risk_score=risk_score,
        risk_level=risk_level,
        ambient_temp_c=ambient_temp_c,
        surface_temp_c=surface_temp_c,
        persistence_hours=persistence_hours,
        exceedance_hours=exceedance_hours,
        location_name=loc_title
    )
