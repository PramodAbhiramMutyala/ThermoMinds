from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Union
from services.fortyguard_client import (
    fortyguard_client,
    HeatmapRequestPayload,
    ActivitySubmissionResponse,
    ActivityStatusResponse,
    EnvironmentalParametersResponse
)

router = APIRouter(prefix="/fortyguard", tags=["FortyGuard Temperature Intelligence"])

@router.post("/heatmap", response_model=Union[ActivityStatusResponse, ActivitySubmissionResponse])
async def generate_heatmap(
    payload: HeatmapRequestPayload,
    wait_for_completion: bool = Query(True, description="Whether to poll until completed")
):
    """
    Submits an asynchronous heatmap task (tcm, exceedance, persistence, or time_of_measure)
    and returns either the initial activity_id or the completed GeoJSON result.
    """
    try:
        sub = await fortyguard_client.submit_heatmap_activity(payload)
        if not wait_for_completion:
            return sub
        return await fortyguard_client.poll_activity_status(sub.activity_id)
    except PermissionError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate heatmap: {type(e).__name__}")

@router.get("/status/{activity_id}", response_model=ActivityStatusResponse)
async def check_activity_status(activity_id: str):
    """
    Polls the status of an ongoing or completed FortyGuard activity.
    """
    try:
        return await fortyguard_client.poll_activity_status(activity_id, max_attempts=1)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/environmental-parameters", response_model=EnvironmentalParametersResponse)
async def get_environmental_parameters(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD")
):
    """
    Retrieves environmental parameters (ambient temp, surface temp, humidity, solar flux, wind).
    """
    return await fortyguard_client.get_environmental_parameters(lat=lat, lng=lng, date_str=date)

@router.get("/persistence")
async def get_persistence_analysis(
    city: str = Query("Phoenix", description="City name"),
    threshold: float = Query(35.0, description="Temperature threshold (°C)")
):
    """
    Analyzes persistence (consecutive hours past threshold).
    """
    # Sample polygon for downtown core of selected city
    coords = [[-112.0800, 33.4400], [-112.0650, 33.4400], [-112.0650, 33.4550], [-112.0800, 33.4550], [-112.0800, 33.4400]]
    return await fortyguard_client.get_persistence(
        polygon_coords=coords,
        start_date="2026-08-26",
        threshold=threshold
    )

@router.get("/exceedance")
async def get_exceedance_analysis(
    city: str = Query("Phoenix", description="City name"),
    threshold: float = Query(38.0, description="Critical threshold (°C)")
):
    """
    Analyzes exceedance (number of hours exceeding critical threshold).
    """
    coords = [[-112.0800, 33.4400], [-112.0650, 33.4400], [-112.0650, 33.4550], [-112.0800, 33.4550], [-112.0800, 33.4400]]
    return await fortyguard_client.get_exceedance(
        polygon_coords=coords,
        start_date="2026-08-26",
        threshold=threshold
    )
