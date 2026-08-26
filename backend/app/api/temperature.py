from fastapi import APIRouter, Query
from typing import Optional
from app.services.fortyguard_client import fortyguard_client
from app.services.persistence_engine import persistence_engine
from app.services.risk_engine import risk_engine
from app.schemas.temperature import DataSourceEnum

router = APIRouter(prefix="/temperature", tags=["Temperature"])

@router.get("/hyperlocal")
async def get_hyperlocal_temperature(
    city: str = Query("Phoenix", description="City name (Phoenix, Dubai, London)"),
    hour: int = Query(14, ge=0, le=23, description="Hour of day (0-23)")
):
    """
    Returns hyperlocal temperature intelligence.
    Sources: LIVE - FortyGuard (if API key configured) or DEMO - HeatShield Simulation.
    """
    return await fortyguard_client.get_city_temperature_data(city=city, hour_offset=hour)

@router.get("/city-summary")
async def get_city_summary(
    city: str = Query("Phoenix", description="City name")
):
    data = await fortyguard_client.get_city_temperature_data(city=city, hour_offset=14)
    zones = data.get("zones", [])
    if not zones:
        return {}

    avg_amb = round(sum(z["ambient_temp_c"] for z in zones) / len(zones), 1)
    avg_surf = round(sum(z["surface_temp_c"] for z in zones) / len(zones), 1)
    peak_temp = max(z["ambient_temp_c"] for z in zones)
    
    # Calculate overall city score
    score_obj = risk_engine.calculate_heatshield_score(
        ambient_temp_c=avg_amb,
        surface_temp_c=avg_surf,
        consecutive_hours_above_35c=6.0,
        hours_above_38c=3.0
    )

    meta = data.get("metadata", {})
    return {
        "city_name": meta.get("city_name", city),
        "state_country": meta.get("state_country", ""),
        "center_lat": meta.get("center_lat", 33.4484),
        "center_lng": meta.get("center_lng", -112.0740),
        "zoom": meta.get("zoom", 13),
        "current_avg_ambient": avg_amb,
        "current_avg_surface": avg_surf,
        "peak_temp_today": peak_temp,
        "heatshield_score": score_obj.total_score,
        "risk_level": score_obj.risk_level,
        "active_hotspots_count": sum(1 for z in zones if z["ambient_temp_c"] >= 40.0),
        "data_source": data.get("data_source", DataSourceEnum.DEMO_HEATSHIELD.value),
        "live_api_configured": data.get("live_api_configured", False)
    }

@router.get("/diurnal")
async def get_diurnal_curve(
    zone_id: str = Query("phx-zone-1", description="Microclimate zone ID"),
    city: str = Query("Phoenix", description="City name")
):
    return await persistence_engine.get_diurnal_curve(zone_id=zone_id, city=city)
