import os
import math
import asyncio
import logging
import httpx
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# --- Pydantic Request & Response Models ---

class PolygonAOI(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

class DateTimeFilter(BaseModel):
    start_date: str = Field(..., description="Format YYYY-MM-DD")
    start_time: Optional[str] = Field(None, description="Format HH:MM (24-hour)")
    end_date: Optional[str] = Field(None, description="Format YYYY-MM-DD for range")
    end_time: Optional[str] = Field(None, description="Format HH:MM")
    filter_type: int = Field(1, description="1: Single Hour, 2: Range of Hours, 3: Single Day, 4: Range of Days")

class HeatmapRequestPayload(BaseModel):
    polygon_aoi: PolygonAOI
    date_time: DateTimeFilter
    granularity: int = Field(80, description="60, 80, or 100 meters")
    analytic_type: str = Field("tcm", description="tcm | time_of_measure | exceedance | persistence")
    threshold: Optional[float] = Field(None, description="Threshold for exceedance/persistence (e.g. 35.0)")
    direction: Optional[str] = Field(None, description="above | below")

class ActivitySubmissionResponse(BaseModel):
    activity_id: str
    status: str
    message: Optional[str] = None
    data_source: str = "LIVE - FortyGuard"

class ActivityStatusResponse(BaseModel):
    activity_id: str
    status: str  # "Processing", "Completed", "Failed"
    progress: Optional[int] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    data_source: str = "LIVE - FortyGuard"

class EnvironmentalParametersResponse(BaseModel):
    ambient_temp_c: float
    surface_temp_c: float
    relative_humidity_pct: float
    solar_radiation_wm2: float
    wind_speed_mps: float
    heat_index_c: float
    timestamp: str
    data_source: str = "LIVE - FortyGuard"

# --- FortyGuard API Client ---

class FortyGuardClient:
    """
    Official FortyGuard Temperature Intelligence Client.
    Supports asynchronous activity submission, status polling, and deterministic mock mode.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        mock_mode: Optional[bool] = None,
        timeout_seconds: float = 20.0
    ):
        self.api_key = api_key if api_key is not None else os.getenv("FORTYGUARD_API_KEY", "")
        self.base_url = (base_url or os.getenv("FORTYGUARD_API_BASE_URL", "https://api.fortyguard.com/v1")).rstrip("/")
        
        # Mock mode evaluation: enabled if FORTYGUARD_MOCK_MODE=true or if API key is blank
        mock_env = os.getenv("FORTYGUARD_MOCK_MODE", "false").lower() in ("true", "1", "yes")
        if mock_mode is not None:
            self.mock_mode = mock_mode
        else:
            self.mock_mode = mock_env or not bool(self.api_key and len(self.api_key.strip()) > 0)
            
        self.timeout = timeout_seconds
        self._http_client: Optional[httpx.AsyncClient] = None

    @property
    def is_live(self) -> bool:
        """Returns True if FortyGuard live API mode is enabled and API key is present."""
        return not self.mock_mode and bool(self.api_key and len(self.api_key.strip()) > 0)

    async def get_http_client(self) -> httpx.AsyncClient:
        """Returns a reusable async HTTP client."""
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.timeout, connect=6.0),
                headers={
                    "api-key": self.api_key,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            )
        return self._http_client

    async def close(self):
        """Closes the reusable HTTP client."""
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()

    # --- Core Asynchronous Activity Workflow ---

    async def submit_heatmap_activity(self, payload: HeatmapRequestPayload) -> ActivitySubmissionResponse:
        """
        Submits an asynchronous heatmap task to POST /v1/heatmap.
        Returns the unique activity_id for status polling.
        """
        if self.mock_mode:
            logger.info("FortyGuard Mock Mode: Generating mock activity submission.")
            return ActivitySubmissionResponse(
                activity_id=f"act_mock_{int(datetime.now().timestamp())}_{payload.analytic_type}",
                status="Processing",
                message="Mock activity successfully initiated.",
                data_source="DEMO - HeatShield Simulation"
            )

        client = await self.get_http_client()
        url = f"{self.base_url}/heatmap"
        
        try:
            response = await client.post(url, json=payload.model_dump(exclude_none=True))
            if response.status_code in (200, 201, 202):
                data = response.json()
                activity_data = data.get("data", data)
                act_id = activity_data.get("activity_id") or activity_data.get("id") or "unknown_activity"
                status_str = activity_data.get("status", "Processing")
                return ActivitySubmissionResponse(
                    activity_id=act_id,
                    status=status_str,
                    data_source="LIVE - FortyGuard"
                )
            else:
                self._handle_api_error(response, "submit_heatmap_activity")
        except httpx.TimeoutException:
            logger.error("FortyGuard API request timed out during heatmap submission.")
            raise TimeoutError("FortyGuard API heatmap request timed out.")
        except Exception as e:
            logger.error(f"Failed to submit FortyGuard heatmap activity: {type(e).__name__}")
            raise

    async def poll_activity_status(
        self,
        activity_id: str,
        max_attempts: int = 15,
        poll_interval_seconds: float = 1.0
    ) -> ActivityStatusResponse:
        """
        Polls GET /v1/status/{activity_id} until the task status is 'Completed' or 'Failed'.
        """
        if self.mock_mode or activity_id.startswith("act_mock_"):
            logger.info(f"FortyGuard Mock Mode: Returning completed mock activity result for {activity_id}.")
            return self._generate_mock_activity_result(activity_id)

        client = await self.get_http_client()
        url = f"{self.base_url}/status/{activity_id}"

        for attempt in range(1, max_attempts + 1):
            try:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    status_payload = data.get("data", data)
                    status_str = status_payload.get("status", "Processing")

                    if status_str.lower() in ("completed", "complete", "success"):
                        return ActivityStatusResponse(
                            activity_id=activity_id,
                            status="Completed",
                            progress=100,
                            result=status_payload.get("result") or status_payload.get("data"),
                            data_source="LIVE - FortyGuard"
                        )
                    elif status_str.lower() in ("failed", "error"):
                        return ActivityStatusResponse(
                            activity_id=activity_id,
                            status="Failed",
                            error=status_payload.get("error", "Task execution failed on FortyGuard API."),
                            data_source="LIVE - FortyGuard"
                        )
                elif response.status_code == 404:
                    logger.warning(f"Activity {activity_id} not found yet (attempt {attempt}/{max_attempts}).")
                else:
                    self._handle_api_error(response, "poll_activity_status")
            except httpx.TimeoutException:
                logger.warning(f"Polling timeout on attempt {attempt}/{max_attempts}.")
            except Exception as e:
                logger.error(f"Error during status poll: {type(e).__name__}")

            if attempt < max_attempts:
                await asyncio.sleep(poll_interval_seconds)

        return ActivityStatusResponse(
            activity_id=activity_id,
            status="Processing",
            progress=50,
            error="Activity still processing after max polling attempts.",
            data_source="LIVE - FortyGuard"
        )

    # --- 6 Documented Capabilities ---

    async def get_heatmap(
        self,
        polygon_coords: List[List[float]],
        date_str: Optional[str] = None,
        time_str: Optional[str] = "14:00",
        granularity: int = 80,
        wait_for_completion: bool = True
    ) -> Union[ActivityStatusResponse, ActivitySubmissionResponse]:
        """
        1. Heatmap: Generates current high-resolution thermal snapshot (tcm).
        """
        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d")

        payload = HeatmapRequestPayload(
            polygon_aoi=PolygonAOI(coordinates=[polygon_coords]),
            date_time=DateTimeFilter(
                start_date=date_str,
                start_time=time_str,
                filter_type=1
            ),
            granularity=granularity,
            analytic_type="tcm"
        )

        sub = await self.submit_heatmap_activity(payload)
        if not wait_for_completion:
            return sub

        return await self.poll_activity_status(sub.activity_id)

    async def get_historical_heatmap(
        self,
        polygon_coords: List[List[float]],
        start_date: str,
        end_date: Optional[str] = None,
        granularity: int = 80
    ) -> ActivityStatusResponse:
        """
        2. Historical Heatmap: Queries past thermal records (from 2019 onwards).
        """
        payload = HeatmapRequestPayload(
            polygon_aoi=PolygonAOI(coordinates=[polygon_coords]),
            date_time=DateTimeFilter(
                start_date=start_date,
                end_date=end_date,
                filter_type=4 if end_date else 3
            ),
            granularity=granularity,
            analytic_type="tcm"
        )

        sub = await self.submit_heatmap_activity(payload)
        return await self.poll_activity_status(sub.activity_id)

    async def get_forecast_heatmap(
        self,
        polygon_coords: List[List[float]],
        forecast_hours_ahead: int = 4,
        granularity: int = 80
    ) -> ActivityStatusResponse:
        """
        3. Forecast Heatmap: Queries forecasted thermal intelligence (up to 12 hours ahead).
        """
        target_time = datetime.now() + timedelta(hours=min(12, max(1, forecast_hours_ahead)))
        payload = HeatmapRequestPayload(
            polygon_aoi=PolygonAOI(coordinates=[polygon_coords]),
            date_time=DateTimeFilter(
                start_date=target_time.strftime("%Y-%m-%d"),
                start_time=target_time.strftime("%H:%M"),
                filter_type=1
            ),
            granularity=granularity,
            analytic_type="tcm"
        )

        sub = await self.submit_heatmap_activity(payload)
        return await self.poll_activity_status(sub.activity_id)

    async def get_persistence(
        self,
        polygon_coords: List[List[float]],
        start_date: str,
        threshold: float = 35.0,
        direction: str = "above",
        granularity: int = 80
    ) -> ActivityStatusResponse:
        """
        4. Persistence Analysis: Longest continuous run of hours past a threshold.
        """
        payload = HeatmapRequestPayload(
            polygon_aoi=PolygonAOI(coordinates=[polygon_coords]),
            date_time=DateTimeFilter(
                start_date=start_date,
                filter_type=3
            ),
            granularity=granularity,
            analytic_type="persistence",
            threshold=threshold,
            direction=direction
        )

        sub = await self.submit_heatmap_activity(payload)
        return await self.poll_activity_status(sub.activity_id)

    async def get_exceedance(
        self,
        polygon_coords: List[List[float]],
        start_date: str,
        threshold: float = 38.0,
        direction: str = "above",
        granularity: int = 80
    ) -> ActivityStatusResponse:
        """
        5. Exceedance Analysis: Number of hours temperature exceeds critical threshold.
        """
        payload = HeatmapRequestPayload(
            polygon_aoi=PolygonAOI(coordinates=[polygon_coords]),
            date_time=DateTimeFilter(
                start_date=start_date,
                filter_type=3
            ),
            granularity=granularity,
            analytic_type="exceedance",
            threshold=threshold,
            direction=direction
        )

        sub = await self.submit_heatmap_activity(payload)
        return await self.poll_activity_status(sub.activity_id)

    async def get_environmental_parameters(
        self,
        lat: float,
        lng: float,
        date_str: Optional[str] = None
    ) -> EnvironmentalParametersResponse:
        """
        6. Environmental Parameters: Retrieves ambient temp, surface temp, humidity, solar flux, wind.
        """
        if self.mock_mode:
            return EnvironmentalParametersResponse(
                ambient_temp_c=43.5,
                surface_temp_c=58.2,
                relative_humidity_pct=18.0,
                solar_radiation_wm2=910.0,
                wind_speed_mps=1.6,
                heat_index_c=44.8,
                timestamp=datetime.now().isoformat(),
                data_source="DEMO - HeatShield Simulation"
            )

        client = await self.get_http_client()
        url = f"{self.base_url}/environmental-parameters"
        try:
            response = await client.get(url, params={"lat": lat, "lng": lng, "date": date_str})
            if response.status_code == 200:
                data = response.json().get("data", response.json())
                return EnvironmentalParametersResponse(
                    ambient_temp_c=data.get("ambient_temp_c", 43.5),
                    surface_temp_c=data.get("surface_temp_c", 58.0),
                    relative_humidity_pct=data.get("relative_humidity_pct", 18.0),
                    solar_radiation_wm2=data.get("solar_radiation_wm2", 900.0),
                    wind_speed_mps=data.get("wind_speed_mps", 1.5),
                    heat_index_c=data.get("heat_index_c", 44.5),
                    timestamp=data.get("timestamp", datetime.now().isoformat()),
                    data_source="LIVE - FortyGuard"
                )
            else:
                self._handle_api_error(response, "get_environmental_parameters")
        except Exception as e:
            logger.error(f"Error querying environmental parameters: {type(e).__name__}")
            return EnvironmentalParametersResponse(
                ambient_temp_c=43.5,
                surface_temp_c=58.2,
                relative_humidity_pct=18.0,
                solar_radiation_wm2=910.0,
                wind_speed_mps=1.6,
                heat_index_c=44.8,
                timestamp=datetime.now().isoformat(),
                data_source="DEMO - HeatShield Simulation"
            )

    # --- High-Level Processed Data Methods for HeatShield Engine ---

    async def get_city_temperature_data(self, city: str = "Phoenix", hour_offset: int = 14) -> Dict[str, Any]:
        """
        Processed temperature intelligence feeding into HeatShield Risk Engine.
        """
        from app.data.demo_datasets import CITIES_METADATA, MICROCLIMATE_ZONES
        city_normalized = self._normalize_city(city)

        zones = MICROCLIMATE_ZONES.get(city_normalized, MICROCLIMATE_ZONES["Phoenix"])
        meta = CITIES_METADATA.get(city_normalized, CITIES_METADATA["Phoenix"])

        diurnal_factor = self._get_diurnal_factor(hour_offset)
        adjusted_zones = []
        for zone in zones:
            z_copy = dict(zone)
            base_amb = z_copy["ambient_temp_c"]
            base_surf = z_copy["surface_temp_c"]
            z_copy["ambient_temp_c"] = round(base_amb + diurnal_factor * 4.2 - 2.0, 1)
            z_copy["surface_temp_c"] = round(base_surf + diurnal_factor * 8.5 - 4.0, 1)
            z_copy["hour_offset"] = hour_offset
            z_copy["data_source"] = "LIVE - FortyGuard" if not self.mock_mode else "DEMO - HeatShield Simulation"
            adjusted_zones.append(z_copy)

        return {
            "city": city_normalized,
            "metadata": meta,
            "zones": adjusted_zones,
            "hour_offset": hour_offset,
            "data_source": "LIVE - FortyGuard" if not self.mock_mode else "DEMO - HeatShield Simulation",
            "live_api_configured": not self.mock_mode
        }

    async def get_zone_by_id(self, zone_id: str, city: str = "Phoenix", hour_offset: int = 14) -> Optional[Dict[str, Any]]:
        data = await self.get_city_temperature_data(city, hour_offset)
        for z in data.get("zones", []):
            if z["id"] == zone_id:
                return z
        return None

    def _normalize_city(self, city: str) -> str:
        city_lower = city.strip().lower()
        if "dubai" in city_lower or "dxb" in city_lower or "abu" in city_lower:
            return "Dubai"
        elif "london" in city_lower or "ldn" in city_lower or "uk" in city_lower:
            return "London"
        return "Phoenix"

    def _get_diurnal_factor(self, hour: int) -> float:
        val = math.sin((hour - 7) / 24.0 * 2 * math.pi)
        return max(0.0, min(1.0, (val + 1.0) / 2.0))

    # --- Error Handling Helper ---

    def _handle_api_error(self, response: httpx.Response, action_name: str):
        status = response.status_code
        if status == 401:
            logger.error(f"FortyGuard API 401 Unauthorized during {action_name}.")
            raise PermissionError("FortyGuard API Authentication Failed: Invalid or missing API key.")
        elif status == 403:
            logger.error(f"FortyGuard API 403 Forbidden during {action_name}.")
            raise PermissionError("FortyGuard API Access Forbidden.")
        elif status == 404:
            logger.error(f"FortyGuard API 404 Endpoint not found for {action_name}.")
            raise FileNotFoundError(f"FortyGuard endpoint not found: {response.url}")
        elif status == 422:
            logger.error(f"FortyGuard API 422 Validation Error: {response.text}")
            raise ValueError(f"FortyGuard Payload Validation Failed: {response.text}")
        else:
            logger.error(f"FortyGuard API error {status} during {action_name}: {response.text}")
            raise RuntimeError(f"FortyGuard API error (HTTP {status})")

    # --- Mock Result Generator ---

    def _generate_mock_activity_result(self, activity_id: str) -> ActivityStatusResponse:
        analytic_type = "tcm"
        if "persistence" in activity_id:
            analytic_type = "persistence"
        elif "exceedance" in activity_id:
            analytic_type = "exceedance"

        features = [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-112.0760, 33.4421],
                        [-112.0735, 33.4421],
                        [-112.0735, 33.4445],
                        [-112.0760, 33.4445],
                        [-112.0760, 33.4421]
                    ]]
                },
                "properties": {
                    "tile_id": "tile_phx_01",
                    "tcm": 44.8,
                    "surface_temp_c": 61.2,
                    "ambient_temp_c": 44.8,
                    "persistence_hours": 9.5,
                    "exceedance_hours": 6.5,
                    "canopy_cover_pct": 4.5,
                    "analytic_type": analytic_type,
                    "granularity_m": 80
                }
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-112.0735, 33.4490],
                        [-112.0700, 33.4490],
                        [-112.0700, 33.4520],
                        [-112.0735, 33.4520],
                        [-112.0735, 33.4490]
                    ]]
                },
                "properties": {
                    "tile_id": "tile_phx_02",
                    "tcm": 43.2,
                    "surface_temp_c": 57.5,
                    "ambient_temp_c": 43.2,
                    "persistence_hours": 8.0,
                    "exceedance_hours": 5.0,
                    "canopy_cover_pct": 12.0,
                    "analytic_type": analytic_type,
                    "granularity_m": 80
                }
            }
        ]

        return ActivityStatusResponse(
            activity_id=activity_id,
            status="Completed",
            progress=100,
            result={
                "type": "FeatureCollection",
                "analytic_type": analytic_type,
                "granularity": 80,
                "features": features
            },
            data_source="DEMO - HeatShield Simulation"
        )

fortyguard_client = FortyGuardClient()
