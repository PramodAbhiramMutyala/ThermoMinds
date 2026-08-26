import pytest
from services.risk_engine import HeatShieldRiskEngine, OperationalRiskResult

def test_low_risk_scenario():
    """1. Test Low Risk (< 30)"""
    result = HeatShieldRiskEngine.calculate_operational_risk(
        ambient_temp_c=20.0,
        surface_temp_c=22.0,
        forecast_peak_c=24.0,
        persistence_hours=0.0,
        exceedance_hours=0.0,
        hour_of_day=8
    )
    assert isinstance(result, OperationalRiskResult)
    assert result.risk_level == "Low"
    assert 0 <= result.risk_score < 30
    assert len(result.risk_factors) > 0
    assert result.contributing_metrics.temperature_points < 5.0
    assert "HeatShield Operational Risk Score is a deterministic decision-support heuristic" in result.disclaimer

def test_moderate_risk_scenario():
    """2. Test Moderate Risk (30 - 49)"""
    result = HeatShieldRiskEngine.calculate_operational_risk(
        ambient_temp_c=32.0,
        surface_temp_c=38.0,
        forecast_peak_c=35.0,
        persistence_hours=2.0,
        exceedance_hours=0.0,
        hour_of_day=11
    )
    assert result.risk_level == "Moderate"
    assert 30 <= result.risk_score < 50
    assert result.contributing_metrics.ambient_temp_c == 32.0

def test_high_risk_scenario():
    """3. Test High Risk (50 - 69)"""
    result = HeatShieldRiskEngine.calculate_operational_risk(
        ambient_temp_c=39.0,
        surface_temp_c=48.0,
        forecast_peak_c=41.0,
        persistence_hours=4.5,
        exceedance_hours=2.0,
        hour_of_day=13
    )
    assert result.risk_level == "High"
    assert 50 <= result.risk_score < 70
    assert any("High ambient temperature" in f for f in result.risk_factors)
    assert any("solar radiation window" in f for f in result.risk_factors)

def test_very_high_risk_scenario():
    """4. Test Very High Risk (70 - 84)"""
    result = HeatShieldRiskEngine.calculate_operational_risk(
        ambient_temp_c=41.5,
        surface_temp_c=52.0,
        forecast_peak_c=42.0,
        persistence_hours=5.0,
        exceedance_hours=3.0,
        apparent_temp_c=43.0,
        hour_of_day=14
    )
    assert result.risk_level == "Very High"
    assert 70 <= result.risk_score < 85
    assert any("persistence" in f.lower() for f in result.risk_factors)
    assert any("exceedance" in f.lower() for f in result.risk_factors)

def test_extreme_risk_scenario():
    """5. Test Extreme Risk (85 - 100)"""
    result = HeatShieldRiskEngine.calculate_operational_risk(
        ambient_temp_c=46.5,
        surface_temp_c=64.0,
        forecast_peak_c=47.5,
        persistence_hours=9.5,
        exceedance_hours=7.0,
        apparent_temp_c=49.0,
        wet_bulb_c=29.5,
        humidity_pct=35.0,
        hour_of_day=15
    )
    assert result.risk_level == "Extreme"
    assert result.risk_score >= 85
    assert result.risk_score <= 100
    assert any("Extreme forecast" in f or "High ambient" in f for f in result.risk_factors)
    assert any("exceedance" in f.lower() for f in result.risk_factors)
    assert any("wet-bulb" in f.lower() for f in result.risk_factors)

def test_missing_optional_environmental_data():
    """6. Test handling when optional environmental inputs (apparent temp, humidity, wet bulb, forecast) are missing"""
    result = HeatShieldRiskEngine.calculate_operational_risk(
        ambient_temp_c=41.5,
        surface_temp_c=None,
        forecast_peak_c=None,
        persistence_hours=None,
        exceedance_hours=None,
        apparent_temp_c=None,
        heat_index_c=None,
        wet_bulb_c=None,
        humidity_pct=None,
        hour_of_day=None
    )
    assert isinstance(result, OperationalRiskResult)
    assert 0 <= result.risk_score <= 100
    assert result.contributing_metrics.environmental_points == 0.0
    assert result.contributing_metrics.humidity_pct is None
    assert result.contributing_metrics.apparent_temp_c is None
    assert result.contributing_metrics.wet_bulb_c is None
    # No exception was raised, values were not fabricated
