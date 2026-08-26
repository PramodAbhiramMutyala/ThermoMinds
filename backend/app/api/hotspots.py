from fastapi import APIRouter, Query
from app.services.persistence_engine import persistence_engine
from app.data.cooling_centers import get_cooling_centers_for_city

router = APIRouter(prefix="/hotspots", tags=["Hotspots & Shelters"])

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
