import pytest
from app.schemas.heatshield_model import (
    Location,
    TemperatureObservation,
    ForecastObservation,
    EnvironmentalConditions,
    PersistenceResult,
    ExceedanceResult,
    HeatRiskResult,
    Hotspot,
    ActionRecommendation,
    NormalizedHeatShieldReport
)
from app.utils.conversions import (
    celsius_to_fahrenheit,
    fahrenheit_to_celsius,
    mps_to_mph,
    mph_to_mps,
    mps_to_kmh,
    calculate_apparent_temperature,
    calculate_heat_index_c,
    calculate_wet_bulb_c
)

# --- 1. Unit Conversion Tests ---

def test_celsius_to_fahrenheit_conversion():
    assert celsius_to_fahrenheit(0.0) == 32.0
    assert celsius_to_fahrenheit(100.0) == 212.0
    assert celsius_to_fahrenheit(40.0) == 104.0
    assert celsius_to_fahrenheit(None) is None

def test_fahrenheit_to_celsius_conversion():
    assert fahrenheit_to_celsius(32.0) == 0.0
    assert fahrenheit_to_celsius(212.0) == 100.0
    assert fahrenheit_to_celsius(104.0) == 40.0
    assert fahrenheit_to_celsius(None) is None

def test_speed_conversions():
    assert mps_to_mph(1.0) == 2.24
    assert mph_to_mps(2.23694) == 1.0
    assert mps_to_kmh(10.0) == 36.0
    assert mps_to_mph(None) is None

def test_apparent_temperature_calculation():
    # Valid inputs
    at = calculate_apparent_temperature(temp_c=40.0, rh_pct=30.0, wind_mps=1.5)
    assert at is not None
    assert at > 35.0

    # Missing humidity returns None (strictly no fabrication)
    assert calculate_apparent_temperature(temp_c=40.0, rh_pct=None) is None

def test_heat_index_calculation():
    # 40C with 40% RH produces high heat index
    hi = calculate_heat_index_c(temp_c=40.0, rh_pct=40.0)
    assert hi is not None
    assert hi >= 44.0

    # Missing humidity returns None
    assert calculate_heat_index_c(temp_c=40.0, rh_pct=None) is None

def test_wet_bulb_calculation():
    wb = calculate_wet_bulb_c(temp_c=42.0, rh_pct=25.0)
    assert wb is not None
    assert 20.0 <= wb <= 35.0

    # Missing humidity returns None
    assert calculate_wet_bulb_c(temp_c=42.0, rh_pct=None) is None

# --- 2. Pydantic Model Tests ---

def test_location_model():
    loc = Location(
        id="loc_phx_01",
        name="Warehouse District",
        city="Phoenix",
        latitude=33.4421,
        longitude=-112.0760,
        elevation_m=331.0,
        area_km2=2.4
    )
    assert loc.id == "loc_phx_01"
    assert loc.latitude == 33.4421
    assert loc.city == "Phoenix"

def test_temperature_observation_model():
    obs = TemperatureObservation(
        ambient_c=44.5,
        surface_c=62.0,
        timestamp="2026-08-26T14:00:00Z",
        source="LIVE - FortyGuard"
    )
    assert obs.ambient_c == 44.5
    assert obs.surface_c == 62.0
    assert obs.ambient_f == 112.1
    assert obs.surface_f == 143.6

def test_environmental_conditions_null_handling():
    # Environmental conditions with missing values must retain None
    env = EnvironmentalConditions(
        relative_humidity_pct=None,
        wind_speed_mps=1.8,
        solar_radiation_wm2=None
    )
    assert env.relative_humidity_pct is None
    assert env.solar_radiation_wm2 is None
    assert env.wind_speed_mps == 1.8

def test_persistence_and_exceedance_models():
    persist = PersistenceResult(
        threshold_c=35.0,
        continuous_hours_past_threshold=8.5,
        nighttime_cooling_deficit_c=4.2,
        is_persistent_hotspot=True
    )
    assert persist.continuous_hours_past_threshold == 8.5
    assert persist.is_persistent_hotspot is True

    exceed = ExceedanceResult(
        threshold_c=38.0,
        cumulative_hours_exceeded=6.0,
        severity_index=24.0
    )
    assert exceed.cumulative_hours_exceeded == 6.0

def test_hotspot_and_action_recommendations():
    loc = Location(id="l1", name="Transit Plaza", city="Phoenix", latitude=33.45, longitude=-112.07)
    hotspot = Hotspot(
        hotspot_id="hs_01",
        location=loc,
        priority_rank=1,
        surface_anomaly_c=12.5,
        persistence_hours=9.0,
        risk_score=92
    )
    assert hotspot.priority_rank == 1
    assert hotspot.risk_score == 92

    action = ActionRecommendation(
        recommendation_id="act_01",
        persona="worker",
        category="work_rest",
        title="Black Flag Protocol",
        description="Implement 15m work / 45m rest schedule",
        action_steps=["Relocate to AC trailer", "Hydrate with 1L electrolytes"],
        urgency="critical"
    )
    assert action.urgency == "critical"
    assert len(action.action_steps) == 2

def test_normalized_heatshield_report_full_and_partial():
    loc = Location(id="l1", name="Downtown Core", city="Phoenix", latitude=33.45, longitude=-112.07)
    
    # 1. Full data report
    report_full = NormalizedHeatShieldReport.create(
        location=loc,
        ambient_c=43.5,
        surface_c=59.0,
        timestamp="2026-08-26T14:00:00Z",
        humidity=22.0,
        wind_mps=1.5,
        persistence_hours=8.0,
        exceedance_hours=5.0,
        risk_score=88,
        risk_level="Extreme",
        source="LIVE - FortyGuard"
    )
    assert report_full.risk_score == 88
    assert report_full.risk_level == "Extreme"
    assert report_full.heat_index is not None
    assert report_full.apparent_temperature is not None
    assert report_full.wet_bulb_temperature is not None
    assert report_full.persistence_hours == 8.0

    # 2. Partial data report (missing humidity & wind) - must NOT invent values
    report_partial = NormalizedHeatShieldReport.create(
        location=loc,
        ambient_c=41.0,
        surface_c=52.0,
        timestamp="2026-08-26T14:00:00Z",
        humidity=None,
        wind_mps=None,
        persistence_hours=None,
        risk_score=72,
        risk_level="Very High"
    )
    assert report_partial.humidity is None
    assert report_partial.heat_index is None
    assert report_partial.apparent_temperature is None
    assert report_partial.wet_bulb_temperature is None
    assert report_partial.persistence_hours is None
    assert report_partial.risk_score == 72
