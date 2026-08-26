from fastapi import APIRouter, Query
from app.services.correlation_engine import correlation_engine

router = APIRouter(prefix="/correlation", tags=["Correlation Analysis"])

@router.get("/ndvi-temperature")
async def get_vegetation_correlation(
    city: str = Query("Phoenix", description="City name")
):
    return await correlation_engine.get_vegetation_temperature_correlation(city=city)
