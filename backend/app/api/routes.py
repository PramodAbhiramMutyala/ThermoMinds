from fastapi import APIRouter, Query
from app.services.route_engine import route_engine

router = APIRouter(prefix="/routes", tags=["Cool Routes"])

@router.get("/cool-corridor")
async def get_cool_corridor_comparison(
    city: str = Query("Phoenix", description="City name"),
    origin: str = Query("Downtown Transit Core", description="Origin name"),
    destination: str = Query("Burton Barr Central Library", description="Destination name")
):
    return route_engine.calculate_route_comparison(city=city, origin=origin, destination=destination)
