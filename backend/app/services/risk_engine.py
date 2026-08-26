import math
from typing import Dict, Any, List, Optional
from app.schemas.risk import ScoreBreakdown, WbgtCalculationResult, VulnerabilityHeuristicResult, HeatExposureMetric

class HeatShieldRiskEngine:
    """
    Deterministic Heat Risk Engine implementing:
    1. HeatShield Score (0-100)
    2. WBGT & Work-Rest Guidance (with explicit assumptions)
    3. Heat Exposure = Intensity x Duration x Context
    4. Vulnerability Profile Heuristics
    """

    @staticmethod
    def calculate_heatshield_score(
        ambient_temp_c: float,
        surface_temp_c: float,
        consecutive_hours_above_35c: float = 4.0,
        hours_above_38c: float = 2.0,
        nighttime_cooling_deficit_c: float = 2.5,
        canopy_cover_pct: float = 15.0,
        albedo: float = 0.20,
        baseline_temp_c: float = 38.0
    ) -> ScoreBreakdown:
        """
        Deterministic 100-point HeatShield Score:
        - Temperature Score (Max 35): Delta vs baseline and absolute intensity
        - Persistence Score (Max 25): Duration above threshold & nocturnal deficit
        - Exceedance Score (Max 20): Extreme temperature accumulation (>38C)
        - Environmental Score (Max 20): Canopy deficit and low albedo retention
        """
        # 1. Temperature Score (Max 35)
        # Baseline 30C = 10 pts, 40C = 25 pts, 48C+ = 35 pts
        temp_score = min(35.0, max(0.0, (ambient_temp_c - 28.0) * 1.75 + (surface_temp_c - 35.0) * 0.35))
        temp_score = round(temp_score, 1)

        # 2. Persistence Score (Max 25)
        # Consecutive hours + nocturnal deficit (trapped heat)
        persist_score = min(25.0, max(0.0, (consecutive_hours_above_35c * 1.8) + (nighttime_cooling_deficit_c * 1.5)))
        persist_score = round(persist_score, 1)

        # 3. Exceedance Score (Max 20)
        # Severe peak hours (>38C)
        exceed_score = min(20.0, max(0.0, hours_above_38c * 2.5))
        exceed_score = round(exceed_score, 1)

        # 4. Environmental Score (Max 20)
        # Low canopy = higher score (canopy deficit), low albedo (dark pavement) = higher score
        canopy_penalty = (1.0 - min(1.0, canopy_cover_pct / 60.0)) * 12.0
        albedo_penalty = (1.0 - min(1.0, albedo / 0.40)) * 8.0
        env_score = round(min(20.0, max(0.0, canopy_penalty + albedo_penalty)), 1)

        total = int(round(temp_score + persist_score + exceed_score + env_score))
        total = max(0, min(100, total))

        if total >= 80:
            level = "Extreme"
            summary = "Hazardous microclimate heat accumulation with severe persistence and critical radiative exposure."
        elif total >= 65:
            level = "Very High"
            summary = "Significant thermal stress; prolonged outdoor activity poses high physiological strain."
        elif total >= 45:
            level = "High"
            summary = "Elevated heat conditions requiring hydration monitoring and periodic shaded rest."
        elif total >= 25:
            level = "Moderate"
            summary = "Noticeable warm microclimate; manageable with standard hydration precautions."
        else:
            level = "Low"
            summary = "Thermal conditions within benign seasonal threshold."

        return ScoreBreakdown(
            temperature_score=temp_score,
            persistence_score=persist_score,
            exceedance_score=exceed_score,
            environment_score=env_score,
            total_score=total,
            risk_level=level,
            summary=summary
        )

    @staticmethod
    def calculate_wbgt(
        ambient_temp_c: Optional[float],
        relative_humidity_pct: Optional[float],
        wind_speed_mps: Optional[float] = 1.5,
        solar_radiation_wm2: Optional[float] = 850.0,
        clothing_type: str = "Standard Workwear"
    ) -> WbgtCalculationResult:
        """
        Calculates outdoor Wet Bulb Globe Temperature (WBGT) using standard approximations.
        Explicitly states methodology, inputs used, assumptions, and confidence.
        """
        if ambient_temp_c is None or relative_humidity_pct is None:
            return WbgtCalculationResult(
                is_available=False,
                wbgt_c=None,
                thermal_flag=None,
                calculation_method="Liljegren/Bernard WBGT Approximation",
                inputs_used={"ambient_temp_c": ambient_temp_c, "relative_humidity_pct": relative_humidity_pct},
                assumptions=["Environmental inputs incomplete"],
                confidence="Unavailable",
                work_rest_recommendation="WBGT unavailable: required environmental inputs (temperature & humidity) are missing.",
                hydration_recommendation="Maintain standard hydration."
            )

        # Stull formula for Wet-Bulb Temperature approximation
        T = ambient_temp_c
        RH = relative_humidity_pct
        tw = (
            T * math.atan(0.151977 * math.sqrt(RH + 8.313659))
            + math.atan(T + RH)
            - math.atan(RH - 1.676331)
            + 0.00391838 * (RH ** 1.5) * math.atan(0.023101 * RH)
            - 4.686035
        )

        # Globe temperature approximation from solar radiation and wind speed
        v = max(0.5, wind_speed_mps if wind_speed_mps is not None else 1.5)
        solar = max(0.0, solar_radiation_wm2 if solar_radiation_wm2 is not None else 850.0)
        # Radiative elevation over ambient
        tg = T + 0.013 * solar / (math.sqrt(v))

        # Outdoor WBGT: 0.7 * Tw + 0.2 * Tg + 0.1 * Ta
        wbgt_val = round(0.7 * tw + 0.2 * tg + 0.1 * T, 1)

        # Occupational Thermal Flag & Work/Rest schedule
        if wbgt_val >= 32.2:
            flag = "Black"
            work_rest = "15 min work / 45 min rest per hour in air-conditioned or chilled shade."
            hydration = "Drink 1.0 to 1.2 liters (approx. 4 cups) of cold electrolyte water per hour."
        elif wbgt_val >= 31.1:
            flag = "Red"
            work_rest = "20 min work / 40 min rest per hour with continuous shade access."
            hydration = "Drink 1.0 liter of water/electrolytes per hour in frequent sips."
        elif wbgt_val >= 29.4:
            flag = "Orange"
            work_rest = "30 min work / 30 min rest per hour under shaded canopy."
            hydration = "Drink 0.75 to 1.0 liter of water per hour."
        elif wbgt_val >= 26.7:
            flag = "Yellow"
            work_rest = "45 min work / 15 min rest per hour; monitor unacclimatized personnel."
            hydration = "Drink 0.5 to 0.75 liter of water per hour."
        else:
            flag = "Green"
            work_rest = "Standard work pace with regular hydration breaks every 60 minutes."
            hydration = "Drink 0.5 liter of water per hour."

        assumptions = [
            f"Moderate metabolic workload (approx. 300W)",
            f"Wind speed assumed at {v} m/s",
            f"Direct solar radiation estimated at {solar} W/m²",
            f"Clothing thermal resistance: {clothing_type}"
        ]

        return WbgtCalculationResult(
            is_available=True,
            wbgt_c=wbgt_val,
            thermal_flag=flag,
            calculation_method="Stull Wet-Bulb & Outdoor WBGT Approximation",
            inputs_used={
                "ambient_temp_c": T,
                "relative_humidity_pct": RH,
                "wind_speed_mps": v,
                "solar_radiation_wm2": solar
            },
            assumptions=assumptions,
            confidence="High (deterministic empirical model)",
            work_rest_recommendation=work_rest,
            hydration_recommendation=hydration
        )

    @staticmethod
    def calculate_heat_exposure(
        location_name: str,
        ambient_temp_c: float,
        duration_hours: float,
        direct_sun_exposure: bool = True
    ) -> HeatExposureMetric:
        """
        Heat Exposure = Intensity x Duration x Context
        Explains why prolonged moderate-high heat is more dangerous than a brief spike.
        """
        sun_multiplier = 1.3 if direct_sun_exposure else 0.85
        # Cumulative index = (Temp - 25C) x Hours x Context
        base_delta = max(0.0, ambient_temp_c - 25.0)
        exposure_index = round(base_delta * duration_hours * sun_multiplier, 1)

        if duration_hours >= 5.0 and ambient_temp_c >= 40.0:
            rationale = (
                f"Sustained elevated exposure ({duration_hours}h at {ambient_temp_c}°C) causes cumulative physiological "
                f"heat debt and thermoregulatory fatigue. Prolonged duration multiplies cardiovascular strain."
            )
        elif duration_hours <= 1.0:
            rationale = (
                f"Short acute exposure ({duration_hours}h). Body can manage transient heat load provided immediate shade "
                f"and hydration follow."
            )
        else:
            rationale = (
                f"Moderate duration exposure ({duration_hours}h). Shaded breaks are required to prevent core temperature escalation."
            )

        return HeatExposureMetric(
            location_name=location_name,
            intensity_c=ambient_temp_c,
            duration_hours=duration_hours,
            context_description="Direct Solar Exposure" if direct_sun_exposure else "Shaded / Filtered",
            cumulative_exposure_score=exposure_index,
            hazard_rationale=rationale
        )

    @staticmethod
    def evaluate_vulnerability_profile(
        profile_name: str,
        base_heatshield_score: int
    ) -> VulnerabilityHeuristicResult:
        """
        Decision-support heuristic for personalized sensitivity.
        """
        multipliers = {
            "Senior (65+)": (1.35, ["Reduced thermoregulatory efficiency", "Cardiovascular vulnerability", "Delayed thirst reflex"]),
            "Child / Infant": (1.40, ["Higher surface area to body mass ratio", "Faster dehydration rate", "Immature sweat glands"]),
            "Outdoor Worker": (1.30, ["Continuous high metabolic heat production", "Prolonged direct solar flux", "Heavy protective gear"]),
            "Cardiovascular Condition": (1.45, ["Excess circulatory strain under heat dissipation", "Medication dehydration risks"]),
            "Athlete": (1.15, ["High internal metabolic heat output", "Rapid electrolyte loss"]),
            "General": (1.0, ["Standard population baseline resilience"])
        }

        mult, hazards = multipliers.get(profile_name, multipliers["General"])
        personalized_score = min(100, int(round(base_heatshield_score * mult)))

        if personalized_score >= 80:
            level = "Critical / Extreme Danger"
            actions = [
                "Remain indoors in air-conditioned environments during peak sun (11:00 - 17:00).",
                "Utilize verified city cooling shelters immediately if home cooling is inadequate.",
                "Drink chilled water with electrolytes every 20-30 minutes.",
                "Monitor for heat exhaustion signs (dizziness, nausea, rapid pulse)."
            ]
        elif personalized_score >= 60:
            level = "High Caution"
            actions = [
                "Limit outdoor transit to shaded 'Cool Corridors'.",
                "Carry minimum 1L insulated water container.",
                "Avoid strenuous outdoor exertion."
            ]
        else:
            level = "Moderate Alert"
            actions = [
                "Stay hydrated and seek shade periodically during outdoor movement."
            ]

        return VulnerabilityHeuristicResult(
            profile_name=profile_name,
            base_heatshield_score=base_heatshield_score,
            personalized_risk_score=personalized_score,
            risk_level=level,
            primary_hazards=hazards,
            recommended_actions=actions
        )

    @staticmethod
    def calculate_operational_risk(*args, **kwargs):
        from services.risk_engine import HeatShieldRiskEngine as ServiceRiskEngine
        return ServiceRiskEngine.calculate_operational_risk(*args, **kwargs)

risk_engine = HeatShieldRiskEngine()
