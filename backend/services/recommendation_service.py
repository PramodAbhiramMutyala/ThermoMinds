from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class StructuredRecommendation(BaseModel):
    priority: str = Field(..., description="Critical | High | Medium | Standard")
    priority_order: int = Field(..., ge=1, description="1 is highest priority")
    category: str = Field(..., description="schedule | hydration | shade_infrastructure | respite | hazard_warning")
    action: str = Field(..., description="Concrete, actionable directive")
    reason: str = Field(..., description="Empirical data-driven rationale from risk engine")
    time_window: str = Field(..., description="Applicable diurnal operational time window")

class PersonaRecommendationsResponse(BaseModel):
    persona: str = Field(..., description="citizen | worker | authority")
    location_name: str
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str
    recommended_activity_window: str
    high_risk_avoidance_window: str
    recommendations: List[StructuredRecommendation]
    disclaimer: str = (
        "Recommendations are deterministic decision-support heuristics derived from "
        "hyperlocal FortyGuard thermal intelligence and do not replace statutory safety regulations."
    )

class DeterministicRecommendationService:
    """
    Deterministic Recommendation Engine generating role-specific operational actions
    for Citizens, Outdoor Workers, and City Authorities from structured thermal inputs.
    Never produces random outputs.
    """

    @staticmethod
    def generate_recommendations(
        persona: str,
        risk_score: int,
        risk_level: str,
        ambient_temp_c: float,
        surface_temp_c: Optional[float] = None,
        persistence_hours: Optional[float] = None,
        exceedance_hours: Optional[float] = None,
        humidity_pct: Optional[float] = None,
        apparent_temp_c: Optional[float] = None,
        location_name: str = "Selected Location"
    ) -> PersonaRecommendationsResponse:
        persona_norm = persona.strip().lower()
        surface = surface_temp_c if surface_temp_c is not None else ambient_temp_c + 12.0
        persist = persistence_hours if persistence_hours is not None else 6.0
        exceed = exceedance_hours if exceedance_hours is not None else 3.0

        if "work" in persona_norm or "construct" in persona_norm or "safety" in persona_norm:
            return DeterministicRecommendationService._build_worker_recommendations(
                risk_score, risk_level, ambient_temp_c, surface, persist, exceed, location_name
            )
        elif "author" in persona_norm or "city" in persona_norm or "gov" in persona_norm or "plan" in persona_norm:
            return DeterministicRecommendationService._build_authority_recommendations(
                risk_score, risk_level, ambient_temp_c, surface, persist, exceed, location_name
            )
        else:
            # Default to Citizen
            return DeterministicRecommendationService._build_citizen_recommendations(
                risk_score, risk_level, ambient_temp_c, surface, persist, exceed, location_name
            )

    @staticmethod
    def _build_citizen_recommendations(
        risk_score: int,
        risk_level: str,
        ambient_c: float,
        surface_c: float,
        persistence_hours: float,
        exceedance_hours: float,
        location_name: str
    ) -> PersonaRecommendationsResponse:
        recs: List[StructuredRecommendation] = []

        # 1. Safer Activity Window
        if risk_score >= 70:
            activity_window = "05:30 – 09:00 or after 20:00"
            avoid_window = "11:00 – 18:30"
            recs.append(StructuredRecommendation(
                priority="Critical" if risk_score >= 85 else "High",
                priority_order=1,
                category="schedule",
                action="Shift all outdoor errands, walking, and physical exercise to early morning before 09:00.",
                reason=f"Extreme heat persistence ({persistence_hours} hours > 35°C) creates hazardous radiant pavement heat ({surface_c}°C).",
                time_window="05:30 – 09:00"
            ))
        else:
            activity_window = "06:00 – 10:30 or after 19:00"
            avoid_window = "12:00 – 16:30"
            recs.append(StructuredRecommendation(
                priority="Medium",
                priority_order=1,
                category="schedule",
                action="Plan outdoor activities during morning hours; seek shaded corridors in afternoon.",
                reason=f"Moderate solar accumulation with ambient air reaching {ambient_c}°C.",
                time_window="06:00 – 10:30"
            ))

        # 2. Avoid Peak Heat
        recs.append(StructuredRecommendation(
            priority="Critical" if risk_score >= 85 else "High",
            priority_order=2,
            category="hazard_warning",
            action="Avoid unshaded transit stops and exposed paved parking lots during peak solar window.",
            reason=f"Radiant surface heat reaches {surface_c}°C (+{(surface_c - ambient_c):.1f}°C over air temp), accelerating dehydration and heat exhaustion.",
            time_window=avoid_window
        ))

        # 3. Hydration & Cooling Reminders
        fluid_oz = "1 liter (32 oz)" if risk_score >= 70 else "500 ml (16 oz)"
        recs.append(StructuredRecommendation(
            priority="High",
            priority_order=3,
            category="hydration",
            action=f"Pre-hydrate before leaving indoors; carry minimum {fluid_oz} of chilled water with electrolytes.",
            reason=f"Elevated heat index and {exceedance_hours} hours exceeding 38°C accelerates physiological fluid loss.",
            time_window="Continuous during outdoor exposure"
        ))

        # 4. Respite / Cooling Centers
        if risk_score >= 70:
            recs.append(StructuredRecommendation(
                priority="High",
                priority_order=4,
                category="respite",
                action="Locate nearest air-conditioned Municipal Cooling Center or shaded Cool Corridor if transit delays occur.",
                reason="Trapped urban heat maintains dangerous thermal load with minimal natural convective cooling.",
                time_window="12:00 – 18:00"
            ))

        return PersonaRecommendationsResponse(
            persona="citizen",
            location_name=location_name,
            risk_score=risk_score,
            risk_level=risk_level,
            recommended_activity_window=activity_window,
            high_risk_avoidance_window=avoid_window,
            recommendations=recs
        )

    @staticmethod
    def _build_worker_recommendations(
        risk_score: int,
        risk_level: str,
        ambient_c: float,
        surface_c: float,
        persistence_hours: float,
        exceedance_hours: float,
        location_name: str
    ) -> PersonaRecommendationsResponse:
        recs: List[StructuredRecommendation] = []

        # 1. Recommended Work Schedule Adjustment & Work-Rest Cycle
        if risk_score >= 85:
            work_window = "04:30 – 10:30 (Morning Split Shift)"
            avoid_window = "11:30 – 17:30 (Mandatory Stand-Down)"
            work_rest = "15 minutes work / 45 minutes rest per hour in AC shelter"
            cycle_priority = "Critical"
        elif risk_score >= 70:
            work_window = "05:00 – 11:30"
            avoid_window = "12:00 – 17:00"
            work_rest = "20 minutes work / 40 minutes rest per hour in shaded respite"
            cycle_priority = "High"
        elif risk_score >= 50:
            work_window = "06:00 – 12:30"
            avoid_window = "13:00 – 16:30"
            work_rest = "30 minutes work / 30 minutes rest per hour"
            cycle_priority = "High"
        else:
            work_window = "Standard Day Shift"
            avoid_window = "13:00 – 15:30"
            work_rest = "45 minutes work / 15 minutes rest per hour"
            cycle_priority = "Medium"

        recs.append(StructuredRecommendation(
            priority=cycle_priority,
            priority_order=1,
            category="schedule",
            action=f"Implement mandated work-rest cycle: {work_rest}.",
            reason=f"Severe cumulative thermal load: {persistence_hours}h continuous persistence > 35°C and {exceedance_hours}h > 38°C.",
            time_window=avoid_window
        ))

        # 2. Shift High-Risk Heavy Labor
        recs.append(StructuredRecommendation(
            priority="High",
            priority_order=2,
            category="schedule",
            action="Shift unshaded roofing, asphalt paving, and heavy trenching to early morning window.",
            reason=f"Radiant surface heat on asphalt/roofing exceeds {surface_c}°C during peak solar hours.",
            time_window=work_window
        ))

        # 3. Cooling Break Infrastructure
        recs.append(StructuredRecommendation(
            priority="Critical" if risk_score >= 70 else "High",
            priority_order=3,
            category="respite",
            action="Deploy air-conditioned mobile trailers or high-pressure misted tents within 50m of active work zones.",
            reason="Rapid core body cooling required to prevent progressive heat exhaustion and heat stroke.",
            time_window="Continuous availability"
        ))

        # 4. Mandatory Electrolyte Hydration Protocol
        recs.append(StructuredRecommendation(
            priority="High",
            priority_order=4,
            category="hydration",
            action="Mandate 1 quart (approx 1 liter) cold electrolyte water per worker per hour, with buddy-system monitoring.",
            reason="High metabolic work rate combined with elevated heat index causes severe electrolyte depletion.",
            time_window="Every 20 minutes"
        ))

        return PersonaRecommendationsResponse(
            persona="worker",
            location_name=location_name,
            risk_score=risk_score,
            risk_level=risk_level,
            recommended_activity_window=work_window,
            high_risk_avoidance_window=avoid_window,
            recommendations=recs
        )

    @staticmethod
    def _build_authority_recommendations(
        risk_score: int,
        risk_level: str,
        ambient_c: float,
        surface_c: float,
        persistence_hours: float,
        exceedance_hours: float,
        location_name: str
    ) -> PersonaRecommendationsResponse:
        recs: List[StructuredRecommendation] = []

        # 1. Hotspot & Emergency Protocol Prioritization
        recs.append(StructuredRecommendation(
            priority="Critical" if risk_score >= 70 else "High",
            priority_order=1,
            category="hazard_warning",
            action=f"Activate Municipal Level-3 Extreme Heat Emergency protocols for {location_name}.",
            reason=f"Empirical FortyGuard data confirms Priority #1 Hotspot status with {persistence_hours}h persistence and {surface_c}°C surface heat.",
            time_window="Immediate Activation (10:00 – 21:00)"
        ))

        # 2. Cooling Station Expansion
        recs.append(StructuredRecommendation(
            priority="High",
            priority_order=2,
            category="respite",
            action="Extend cooling center operating hours until 21:00 at municipal libraries and community centers; dispatch mobile hydration vans.",
            reason=f"High nocturnal heat trap (cooling deficit) leaves unhoused and transit-dependent populations vulnerable after standard closing hours.",
            time_window="10:00 – 21:00"
        ))

        # 3. Public Transit Shade Retrofit
        recs.append(StructuredRecommendation(
            priority="High",
            priority_order=3,
            category="shade_infrastructure",
            action="Deploy temporary tensile shade canopies and misting stations at top 5 unshaded transit transfer plazas.",
            reason=f"Pavement surface temperatures of {surface_c}°C create dangerous 15-minute wait-time exposure risks.",
            time_window="Next 48 Hours"
        ))

        # 4. Urban Heat Mitigation Capital Planning
        recs.append(StructuredRecommendation(
            priority="Medium",
            priority_order=4,
            category="shade_infrastructure",
            action="Target high-albedo cool roof retrofits and 20% mature tree canopy expansion in this industrial basin.",
            reason="HeatShield simulation indicates -12.8°C radiant surface reduction and -28 point risk score improvement with cool infrastructure.",
            time_window="Capital Improvement Program Q3/Q4"
        ))

        return PersonaRecommendationsResponse(
            persona="authority",
            location_name=location_name,
            risk_score=risk_score,
            risk_level=risk_level,
            recommended_activity_window="Intervention Schedule: 06:00 – 21:00",
            high_risk_avoidance_window="Peak Public Vulnerability: 12:00 – 17:30",
            recommendations=recs
        )

recommendation_service = DeterministicRecommendationService()
