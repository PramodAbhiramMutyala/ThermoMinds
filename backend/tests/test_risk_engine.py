import pytest
from app.services.risk_engine import risk_engine

def test_heatshield_score_calculation():
    # Extreme heat condition
    score = risk_engine.calculate_heatshield_score(
        ambient_temp_c=45.0,
        surface_temp_c=62.0,
        consecutive_hours_above_35c=9.0,
        hours_above_38c=6.0,
        nighttime_cooling_deficit_c=4.5,
        canopy_cover_pct=5.0,
        albedo=0.12
    )
    assert score.total_score >= 80
    assert score.risk_level == "Extreme"
    assert score.temperature_score > 0
    assert score.persistence_score > 0
    assert score.exceedance_score > 0
    assert score.environment_score > 0
    assert 0 <= score.total_score <= 100

def test_heatshield_score_mild_condition():
    # Mild condition
    score = risk_engine.calculate_heatshield_score(
        ambient_temp_c=26.0,
        surface_temp_c=28.0,
        consecutive_hours_above_35c=0.0,
        hours_above_38c=0.0,
        nighttime_cooling_deficit_c=0.5,
        canopy_cover_pct=60.0,
        albedo=0.35
    )
    assert score.total_score <= 30
    assert score.risk_level in ["Low", "Moderate"]

def test_wbgt_calculation_valid():
    res = risk_engine.calculate_wbgt(
        ambient_temp_c=42.0,
        relative_humidity_pct=25.0,
        wind_speed_mps=1.5,
        solar_radiation_wm2=850.0
    )
    assert res.is_available is True
    assert res.wbgt_c is not None
    assert res.thermal_flag in ["Green", "Yellow", "Orange", "Red", "Black"]
    assert len(res.assumptions) > 0
    assert "Not an official OSHA determination" in res.disclaimer

def test_wbgt_calculation_missing_inputs():
    res = risk_engine.calculate_wbgt(
        ambient_temp_c=None,
        relative_humidity_pct=None
    )
    assert res.is_available is False
    assert res.wbgt_c is None
    assert "missing" in res.work_rest_recommendation.lower()

def test_heat_exposure_prolonged():
    exp = risk_engine.calculate_heat_exposure(
        location_name="Warehouse District",
        ambient_temp_c=42.0,
        duration_hours=6.0,
        direct_sun_exposure=True
    )
    assert exp.cumulative_exposure_score > 50.0
    assert "cumulative physiological heat debt" in exp.hazard_rationale

def test_vulnerability_profile_multiplier():
    senior = risk_engine.evaluate_vulnerability_profile("Senior (65+)", base_heatshield_score=60)
    general = risk_engine.evaluate_vulnerability_profile("General", base_heatshield_score=60)
    assert senior.personalized_risk_score > general.personalized_risk_score
    assert len(senior.primary_hazards) > 0
    assert "decision-support heuristic" in senior.disclaimer
