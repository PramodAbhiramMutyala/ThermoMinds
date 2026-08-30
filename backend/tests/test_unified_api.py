import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from services.fortyguard_client import fortyguard_client

@pytest.fixture(autouse=True)
def setup_mock_fortyguard():
    prev = fortyguard_client.mock_mode
    fortyguard_client.mock_mode = True
    yield
    fortyguard_client.mock_mode = prev

@pytest.mark.anyio
async def test_api_health_endpoint():
    """1. Test GET /api/health"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert "data_source_mode" in data
        assert "version" in data

@pytest.mark.anyio
async def test_api_heatmap_endpoint():
    """2. Test GET /api/heatmap"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/heatmap?city=Phoenix&granularity=80")
        assert resp.status_code == 200
        data = resp.json()
        assert "activity_id" in data
        assert data["status"] == "Completed"
        assert "result" in data

@pytest.mark.anyio
async def test_api_forecast_endpoint():
    """3. Test GET /api/forecast"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/forecast?city=Phoenix&hours_ahead=4")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "Completed"
        assert "result" in data

@pytest.mark.anyio
async def test_api_environment_endpoint():
    """4. Test GET /api/environment"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/environment?latitude=33.4484&longitude=-112.0740")
        assert resp.status_code == 200
        data = resp.json()
        assert "relative_humidity_pct" in data
        assert "wind_speed_mps" in data
        assert "solar_radiation_wm2" in data
        assert data["relative_humidity_pct"] is not None

@pytest.mark.anyio
async def test_api_persistence_endpoint():
    """5. Test GET /api/persistence"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/persistence?city=Phoenix&threshold=35.0")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "Completed"
        assert data["result"]["analytic_type"] == "persistence"

@pytest.mark.anyio
async def test_api_exceedance_endpoint():
    """6. Test GET /api/exceedance"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/exceedance?city=Phoenix&threshold=38.0")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "Completed"
        assert data["result"]["analytic_type"] == "exceedance"

@pytest.mark.anyio
async def test_api_risk_endpoint():
    """7. Test GET /api/risk"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Explicit params
        resp = await client.get("/api/risk?ambient_temp_c=42.0&surface_temp_c=58.0&persistence_hours=6.0&exceedance_hours=3.5")
        assert resp.status_code == 200
        data = resp.json()
        assert 0 <= data["risk_score"] <= 100
        assert data["risk_level"] in ["Low", "Moderate", "High", "Very High", "Extreme"]
        assert len(data["risk_factors"]) > 0
        assert "contributing_metrics" in data
        assert "disclaimer" in data

@pytest.mark.anyio
async def test_api_hotspots_endpoint():
    """8. Test GET /api/hotspots"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/hotspots?city=Phoenix&limit=5")
        assert resp.status_code == 200
        data = resp.json()
        assert "hotspots" in data
        assert len(data["hotspots"]) > 0
        h1 = data["hotspots"][0]
        assert h1["rank"] == 1
        assert "centroid" in h1
        assert "temperature" in h1
        assert "risk_score" in h1

@pytest.mark.anyio
async def test_api_location_summary_endpoint():
    """9. Test GET /api/location-summary"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/location-summary?city=Phoenix")
        assert resp.status_code == 200
        data = resp.json()
        assert "location" in data
        assert data["location"]["city"] == "Phoenix"
        assert "current_temperature" in data
        assert "risk_score" in data
        assert "risk_level" in data
        assert "risk_factors" in data
        assert "source" in data

@pytest.mark.anyio
async def test_get_recommendations_endpoint():
    """10. Test GET /api/recommendations"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            "/api/recommendations?persona=worker&city=Phoenix&risk_score=88&risk_level=Extreme&ambient_temp_c=44.8&surface_temp_c=61.2&persistence_hours=9.5&exceedance_hours=6.5"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["persona"] == "worker"
        assert data["risk_score"] == 88
        assert len(data["recommendations"]) > 0
        assert "work-rest" in data["recommendations"][0]["action"].lower() or "stand-down" in data["high_risk_avoidance_window"].lower()
