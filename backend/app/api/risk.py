from fastapi import APIRouter, Query
from typing import Optional
from app.services.risk_engine import risk_engine

router = APIRouter(prefix="/risk", tags=["Risk Engine"])

@router.get("/calculate")
async def calculate_heatshield_score(
    ambient_temp_c: float = Query(..., description="Ambient temperature (°C)"),
    surface_temp_c: float = Query(..., description="Surface temperature (°C)"),
    consecutive_hours_above_35c: float = Query(6.0, description="Hours > 35°C"),
    hours_above_38c: float = Query(3.0, description="Hours > 38°C"),
    nighttime_cooling_deficit_c: float = Query(3.0, description="Night cooling deficit (°C)"),
    canopy_cover_pct: float = Query(10.0, description="Canopy %"),
    albedo: float = Query(0.18, description="Albedo")
):
    return risk_engine.calculate_heatshield_score(
        ambient_temp_c=ambient_temp_c,
        surface_temp_c=surface_temp_c,
        consecutive_hours_above_35c=consecutive_hours_above_35c,
        hours_above_38c=hours_above_38c,
        nighttime_cooling_deficit_c=nighttime_cooling_deficit_c,
        canopy_cover_pct=canopy_cover_pct,
        albedo=albedo
    )

@router.get("/wbgt")
async def calculate_wbgt_guidance(
    ambient_temp_c: Optional[float] = Query(None, description="Ambient temperature (°C)"),
    relative_humidity_pct: Optional[float] = Query(None, description="Relative humidity (%)"),
    wind_speed_mps: Optional[float] = Query(1.5, description="Wind speed (m/s)"),
    solar_radiation_wm2: Optional[float] = Query(850.0, description="Solar radiation (W/m²)")
):
    return risk_engine.calculate_wbgt(
        ambient_temp_c=ambient_temp_c,
        relative_humidity_pct=relative_humidity_pct,
        wind_speed_mps=wind_speed_mps,
        solar_radiation_wm2=solar_radiation_wm2
    )

@router.get("/exposure")
async def calculate_heat_exposure(
    location_name: str = Query("Downtown Core", description="Location name"),
    ambient_temp_c: float = Query(44.0, description="Ambient temperature (°C)"),
    duration_hours: float = Query(4.0, description="Duration in hours"),
    direct_sun_exposure: bool = Query(True, description="Direct sun vs shaded")
):
    return risk_engine.calculate_heat_exposure(
        location_name=location_name,
        ambient_temp_c=ambient_temp_c,
        duration_hours=duration_hours,
        direct_sun_exposure=direct_sun_exposure
    )

@router.get("/vulnerability")
async def evaluate_vulnerability(
    profile_name: str = Query("Senior (65+)", description="Vulnerability profile"),
    base_score: int = Query(75, ge=0, le=100, description="Base HeatShield score")
):
    return risk_engine.evaluate_vulnerability_profile(
        profile_name=profile_name,
        base_heatshield_score=base_score
    )
