import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app

@pytest.mark.anyio
async def test_root_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["project"] == "HeatShield AI"
        assert "LIVE" in data["data_source_mode"] or "DEMO" in data["data_source_mode"]

@pytest.mark.anyio
async def test_temperature_hyperlocal():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/temperature/hyperlocal?city=Phoenix&hour=14")
        assert response.status_code == 200
        data = response.json()
        assert "zones" in data
        assert len(data["zones"]) > 0
        assert "data_source" in data

@pytest.mark.anyio
async def test_city_summary():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/temperature/city-summary?city=Phoenix")
        assert response.status_code == 200
        data = response.json()
        assert "heatshield_score" in data
        assert "peak_temp_today" in data

@pytest.mark.anyio
async def test_ranked_hotspots():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/hotspots/ranked?city=Phoenix&hour=14")
        assert response.status_code == 200
        data = response.json()
        assert "hotspots" in data
        assert len(data["hotspots"]) > 0
        # Ensure descending sort
        scores = [h["heatshield_score"] for h in data["hotspots"]]
        assert scores == sorted(scores, reverse=True)

@pytest.mark.anyio
async def test_cool_corridor_route():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/routes/cool-corridor?city=Phoenix")
        assert response.status_code == 200
        data = response.json()
        assert "direct_route" in data
        assert "cool_route" in data
        assert data["cool_route"]["shade_coverage_pct"] > data["direct_route"]["shade_coverage_pct"]

@pytest.mark.anyio
async def test_mitigation_simulation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "zone_id": "phx-zone-1",
            "canopy_increase_pct": 25.0,
            "cool_roof_albedo_pct": 25.0,
            "misting_coverage_pct": 10.0
        }
        response = await client.post("/api/mitigation/simulate?city=Phoenix", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["delta_ambient_temp_c"] > 0
        assert data["delta_surface_temp_c"] > 0
        assert data["projected_heatshield_score"] < data["baseline_heatshield_score"]
        assert "disclaimer" in data

@pytest.mark.anyio
async def test_ndvi_correlation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/correlation/ndvi-temperature?city=Phoenix")
        assert response.status_code == 200
        data = response.json()
        assert "correlation_coefficient_r" in data
        assert data["correlation_coefficient_r"] < 0  # Inverse correlation
        assert len(data["data_points"]) > 0

@pytest.mark.anyio
async def test_agent_chat():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "message": "Find a shaded cool route to the central library",
            "persona": "citizen",
            "city": "Phoenix"
        }
        response = await client.post("/api/agent/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "tool_traces" in data
        assert len(data["tool_traces"]) > 0
        assert "action_cards" in data
        assert "response_text" in data
