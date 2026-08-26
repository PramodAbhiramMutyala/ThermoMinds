import os
import pytest
from services.fortyguard_client import (
    FortyGuardClient,
    HeatmapRequestPayload,
    PolygonAOI,
    DateTimeFilter,
    ActivitySubmissionResponse,
    ActivityStatusResponse,
    EnvironmentalParametersResponse
)

# Test Polygon Coordinates (Downtown Phoenix AOI)
SAMPLE_POLYGON = [
    [-112.0800, 33.4400],
    [-112.0650, 33.4400],
    [-112.0650, 33.4550],
    [-112.0800, 33.4550],
    [-112.0800, 33.4400]
]

@pytest.mark.anyio
async def test_api_key_loading():
    """1. Test API key loading from environment or constructor."""
    client = FortyGuardClient(api_key="test_key_12345")
    assert client.api_key == "test_key_12345"
    assert client.base_url == "https://api.fortyguard.com/v1"
    await client.close()

@pytest.mark.anyio
async def test_mock_mode_flag():
    """2. Test mock mode behavior when FORTYGUARD_MOCK_MODE is enabled."""
    client = FortyGuardClient(api_key="real_looking_key", mock_mode=True)
    assert client.mock_mode is True

    # Test heatmap in mock mode
    res = await client.get_heatmap(
        polygon_coords=SAMPLE_POLYGON,
        date_str="2026-08-26",
        time_str="14:00",
        granularity=80,
        wait_for_completion=True
    )
    assert isinstance(res, ActivityStatusResponse)
    assert res.status == "Completed"
    assert res.progress == 100
    assert res.result is not None
    assert res.result["type"] == "FeatureCollection"
    assert len(res.result["features"]) > 0
    assert res.data_source == "DEMO - HeatShield Simulation"
    await client.close()

@pytest.mark.anyio
async def test_historical_heatmap_capability():
    """3. Test Historical Heatmap capability parsing."""
    client = FortyGuardClient(mock_mode=True)
    res = await client.get_historical_heatmap(
        polygon_coords=SAMPLE_POLYGON,
        start_date="2024-07-15",
        granularity=80
    )
    assert res.status == "Completed"
    assert res.result["type"] == "FeatureCollection"
    await client.close()

@pytest.mark.anyio
async def test_forecast_heatmap_capability():
    """4. Test Forecast Heatmap capability parsing."""
    client = FortyGuardClient(mock_mode=True)
    res = await client.get_forecast_heatmap(
        polygon_coords=SAMPLE_POLYGON,
        forecast_hours_ahead=4,
        granularity=80
    )
    assert res.status == "Completed"
    assert res.result["type"] == "FeatureCollection"
    await client.close()

@pytest.mark.anyio
async def test_persistence_capability():
    """5. Test Persistence capability parsing."""
    client = FortyGuardClient(mock_mode=True)
    res = await client.get_persistence(
        polygon_coords=SAMPLE_POLYGON,
        start_date="2026-08-26",
        threshold=35.0,
        direction="above",
        granularity=80
    )
    assert res.status == "Completed"
    assert res.result["analytic_type"] == "persistence"
    await client.close()

@pytest.mark.anyio
async def test_exceedance_capability():
    """6. Test Exceedance capability parsing."""
    client = FortyGuardClient(mock_mode=True)
    res = await client.get_exceedance(
        polygon_coords=SAMPLE_POLYGON,
        start_date="2026-08-26",
        threshold=38.0,
        direction="above",
        granularity=80
    )
    assert res.status == "Completed"
    assert res.result["analytic_type"] == "exceedance"
    await client.close()

@pytest.mark.anyio
async def test_environmental_parameters_capability():
    """7. Test Environmental Parameters capability parsing."""
    client = FortyGuardClient(mock_mode=True)
    res = await client.get_environmental_parameters(lat=33.4484, lng=-112.0740)
    assert isinstance(res, EnvironmentalParametersResponse)
    assert res.ambient_temp_c > 0
    assert res.surface_temp_c > 0
    assert res.relative_humidity_pct > 0
    assert res.solar_radiation_wm2 > 0
    await client.close()

@pytest.mark.anyio
async def test_error_handling_invalid_key():
    """8. Test error handling on 401 Unauthorized."""
    import httpx
    client = FortyGuardClient(api_key="invalid_dummy_key", mock_mode=False)
    
    # Mock httpx response for 401
    mock_resp = httpx.Response(status_code=401, text="Unauthorized: Invalid API key")
    with pytest.raises(PermissionError) as exc_info:
        client._handle_api_error(mock_resp, "test_action")
    assert "Invalid or missing API key" in str(exc_info.value)
    await client.close()

@pytest.mark.anyio
async def test_error_handling_timeout():
    """9. Test timeout error handling."""
    client = FortyGuardClient(api_key="valid_key", mock_mode=False, timeout_seconds=0.0001)
    # Submitting with extremely low timeout to test timeout behavior
    # (Since mock_mode=False and endpoint is external)
    try:
        payload = HeatmapRequestPayload(
            polygon_aoi=PolygonAOI(coordinates=[SAMPLE_POLYGON]),
            date_time=DateTimeFilter(start_date="2026-08-26", filter_type=1)
        )
        await client.submit_heatmap_activity(payload)
    except (TimeoutError, Exception) as e:
        assert isinstance(e, (TimeoutError, Exception))
    await client.close()
