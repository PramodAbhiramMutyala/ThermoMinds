from datetime import datetime
from fastapi import APIRouter, Query
from typing import Optional, List
from services.hotspot_service import hotspot_service, HotspotItem, HotspotResponse
from app.services.persistence_engine import persistence_engine
from app.data.cooling_centers import get_cooling_centers_for_city

router = APIRouter(prefix="/hotspots", tags=["Hotspots & Shelters"])

@router.get("", response_model=HotspotResponse)
@router.get("/", response_model=HotspotResponse)
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
    Returns ranked heat hotspots evaluated by the HeatShield Operational Risk Engine.
    Supports coordinate/radius spatial filtering and city queries.
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

@router.get("/ranked")
async def get_ranked_hotspots(
    city: str = Query("Phoenix", description="City name"),
    hour: int = Query(14, ge=0, le=23, description="Hour of day (0-23)")
):
    return await persistence_engine.get_hotspots_ranked(city=city, hour_offset=hour)

@router.get("/cooling-centers")
async def get_cooling_centers(
    city: str = Query("Phoenix", description="City name")
):
    return {
        "city": city,
        "cooling_centers": get_cooling_centers_for_city(city),
        "data_source": "MUNICIPAL - Heat Relief Network Respite Database"
    }
