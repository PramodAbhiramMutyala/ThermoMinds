from fastapi import APIRouter, Query
from app.schemas.mitigation import MitigationScenarioInput
from app.services.mitigation_engine import mitigation_engine

router = APIRouter(prefix="/mitigation", tags=["Mitigation Simulation"])

@router.post("/simulate")
async def simulate_urban_mitigation(
    scenario: MitigationScenarioInput,
    city: str = Query("Phoenix", description="City name")
):
    return await mitigation_engine.simulate_scenario(scenario=scenario, city=city)
