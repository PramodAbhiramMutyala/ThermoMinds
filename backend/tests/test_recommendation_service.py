import pytest
from services.recommendation_service import recommendation_service, StructuredRecommendation

def test_citizen_recommendations_extreme_risk():
    res = recommendation_service.generate_recommendations(
        persona="citizen",
        risk_score=92,
        risk_level="Extreme",
        ambient_temp_c=45.2,
        surface_temp_c=62.8,
        persistence_hours=9.5,
        exceedance_hours=6.5,
        location_name="Warehouse District"
    )
    assert res.persona == "citizen"
    assert res.risk_score == 92
    assert "05:30" in res.recommended_activity_window
    assert len(res.recommendations) >= 3
    assert res.recommendations[0].priority in ("Critical", "High")
    assert "persistence" in res.recommendations[0].reason.lower() or "radiant" in res.recommendations[0].reason.lower()

def test_worker_recommendations_mandatory_work_rest_cycle():
    res = recommendation_service.generate_recommendations(
        persona="worker",
        risk_score=88,
        risk_level="Extreme",
        ambient_temp_c=44.8,
        surface_temp_c=61.2,
        persistence_hours=8.5,
        exceedance_hours=5.5,
        location_name="Downtown Core"
    )
    assert res.persona == "worker"
    assert "Mandatory Stand-Down" in res.high_risk_avoidance_window or "11:30" in res.high_risk_avoidance_window
    assert any("work-rest" in r.action.lower() or "rest" in r.action.lower() for r in res.recommendations)
    assert any("mobile" in r.action.lower() or "shelter" in r.action.lower() or "trailer" in r.action.lower() for r in res.recommendations)

def test_authority_recommendations_cooling_and_shade():
    res = recommendation_service.generate_recommendations(
        persona="authority",
        risk_score=78,
        risk_level="Very High",
        ambient_temp_c=43.0,
        surface_temp_c=58.0,
        persistence_hours=7.0,
        exceedance_hours=4.0,
        location_name="Al Quoz Basin"
    )
    assert res.persona == "authority"
    assert any("cooling" in r.action.lower() for r in res.recommendations)
    assert any("shade" in r.action.lower() or "canopy" in r.action.lower() for r in res.recommendations)

def test_deterministic_output_stability():
    # Same inputs must produce identical outputs
    res1 = recommendation_service.generate_recommendations("worker", 80, "Very High", 42.0, 56.0, 6.0, 3.0)
    res2 = recommendation_service.generate_recommendations("worker", 80, "Very High", 42.0, 56.0, 6.0, 3.0)
    assert res1.model_dump() == res2.model_dump()
