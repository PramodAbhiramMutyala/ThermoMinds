import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from services.hotspot_service import HotspotService, hotspot_service, HotspotItem, HotspotResponse

SAMPLE_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "properties": {
                "id": "cell_mild_01",
                "name": "Shaded Park Perimeter",
                "ambient_temp_c": 32.0,
                "surface_temp_c": 36.0,
                "forecast_peak_c": 34.0,
                "persistence_hours": 1.0,
                "exceedance_hours": 0.0,
                "latitude": 33.4400,
                "longitude": -112.0700
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[-112.071, 33.439], [-112.069, 33.439], [-112.069, 33.441], [-112.071, 33.441], [-112.071, 33.439]]]
            }
        },
        {
            "properties": {
                "id": "cell_extreme_01",
                "name": "Industrial Concrete Basin",
                "ambient_temp_c": 46.5,
                "surface_temp_c": 64.0,
                "forecast_peak_c": 47.5,
                "persistence_hours": 9.5,
                "exceedance_hours": 7.0,
                "apparent_temp_c": 49.0,
                "wet_bulb_c": 29.5,
                "latitude": 33.4500,
                "longitude": -112.0800
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[-112.081, 33.449], [-112.079, 33.449], [-112.079, 33.451], [-112.081, 33.451], [-112.081, 33.449]]]
            }
        },
        {
            "properties": {
                "id": "cell_high_01",
                "name": "Commercial Transit Corridor",
                "ambient_temp_c": 41.0,
                "surface_temp_c": 52.0,
                "forecast_peak_c": 42.0,
                "persistence_hours": 5.0,
                "exceedance_hours": 3.0,
                "latitude": 33.4450,
                "longitude": -112.0750
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[-112.076, 33.444], [-112.074, 33.444], [-112.074, 33.446], [-112.076, 33.446], [-112.076, 33.444]]]
            }
        }
    ]
}

def test_process_geojson_cells_and_rank():
    """1. Test GeoJSON cell processing and descending ranking by risk score."""
    service = HotspotService()
    hotspots = service.detect_and_rank_hotspots(SAMPLE_GEOJSON, limit=10)

    assert len(hotspots) == 3
    # Rank 1 must have the highest risk score
    assert hotspots[0].rank == 1
    assert hotspots[0].hotspot_id == "cell_extreme_01"
    assert hotspots[0].risk_level == "Extreme"
    assert hotspots[0].risk_score >= 85

    # Rank 2 must be cell_high_01
    assert hotspots[1].rank == 2
    assert hotspots[1].hotspot_id == "cell_high_01"
    assert hotspots[1].risk_score < hotspots[0].risk_score

    # Rank 3 must be cell_mild_01
    assert hotspots[2].rank == 3
    assert hotspots[2].hotspot_id == "cell_mild_01"

def test_hotspot_attributes_completeness():
    """2. Test that every hotspot item contains required fields."""
    service = HotspotService()
    hotspots = service.detect_and_rank_hotspots(SAMPLE_GEOJSON, limit=1)
    h = hotspots[0]

    assert isinstance(h.rank, int)
    assert h.centroid.latitude is not None
    assert h.centroid.longitude is not None
    assert h.risk_score >= 0
    assert h.risk_level in ["Low", "Moderate", "High", "Very High", "Extreme"]
    assert h.temperature.ambient_c == 46.5
    assert h.temperature.surface_c == 64.0
    assert h.persistence_hours == 9.5
    assert h.exceedance_hours == 7.0
    assert len(h.primary_risk_factors) > 0

def test_geographic_proximity_filter():
    """3. Test spatial filtering using lat/lng and radius_km."""
    service = HotspotService()
    # Filter within 0.5km of cell_mild_01 (-112.070, 33.440)
    nearby = service.detect_and_rank_hotspots(
        SAMPLE_GEOJSON,
        filter_lat=33.4400,
        filter_lng=-112.0700,
        radius_km=0.5
    )
    assert len(nearby) == 1
    assert nearby[0].hotspot_id == "cell_mild_01"

def test_deterministic_mock_generation():
    """4. Test deterministic mock hotspots generation for Phoenix and Dubai."""
    service = HotspotService()
    phx_hotspots = service.get_mock_hotspots(city="Phoenix", limit=5)
    assert len(phx_hotspots) >= 3
    assert phx_hotspots[0].rank == 1
    assert phx_hotspots[0].risk_score >= phx_hotspots[1].risk_score

    dxb_hotspots = service.get_mock_hotspots(city="Dubai", limit=5)
    assert len(dxb_hotspots) >= 2
    assert "Al Quoz" in dxb_hotspots[0].name

@pytest.mark.anyio
async def test_api_get_hotspots_endpoint():
    """5. Test GET /api/hotspots endpoint integration."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Default Phoenix query
        resp = await client.get("/api/hotspots?city=Phoenix&limit=3")
        assert resp.status_code == 200
        data = resp.json()
        assert "hotspots" in data
        assert len(data["hotspots"]) <= 3
        assert data["hotspots"][0]["rank"] == 1
        assert "risk_score" in data["hotspots"][0]
        assert "temperature" in data["hotspots"][0]

        # 2. Query with coordinates
        resp2 = await client.get("/api/hotspots?latitude=33.4421&longitude=-112.0760&radius=5.0")
        assert resp2.status_code == 200
        data2 = resp2.json()
        assert len(data2["hotspots"]) > 0
