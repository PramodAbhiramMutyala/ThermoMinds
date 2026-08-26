import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class ContributingMetrics(BaseModel):
    temperature_points: float = Field(..., description="Points from current ambient & surface temperature (Max 35)")
    forecast_points: float = Field(..., description="Points from forecasted peak temperature (Max 15)")
    persistence_points: float = Field(..., description="Points from consecutive hours > 35°C (Max 20)")
    exceedance_points: float = Field(..., description="Points from cumulative hours > 38°C (Max 15)")
    environmental_points: float = Field(..., description="Points from humidity, heat index, wet bulb (Max 10)")
    time_of_day_points: float = Field(..., description="Points from diurnal peak solar timing (Max 5)")
    
    # Input snapshots (None if unavailable)
    ambient_temp_c: float
    surface_temp_c: Optional[float] = None
    forecast_peak_c: Optional[float] = None
    persistence_hours: Optional[float] = None
    exceedance_hours: Optional[float] = None
    apparent_temp_c: Optional[float] = None
    heat_index_c: Optional[float] = None
    wet_bulb_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    hour_of_day: Optional[int] = None

class OperationalRiskResult(BaseModel):
    risk_score: int = Field(..., ge=0, le=100, description="HeatShield Operational Risk Score (0-100)")
    risk_level: str = Field(..., description="Low | Moderate | High | Very High | Extreme")
    risk_factors: List[str] = Field(default_factory=list, description="Explicit drivers contributing to the risk score")
    contributing_metrics: ContributingMetrics
    summary: str
    disclaimer: str = (
        "HeatShield Operational Risk Score is a deterministic decision-support heuristic "
        "for operational risk management and is not a medically validated health index."
    )

class HeatShieldRiskEngine:
    """
    Deterministic HeatShield Operational Risk Engine.
    Computes a transparent, explainable 0-100 risk score and categorical risk level
    from structured temperature, forecast, persistence, exceedance, and environmental inputs.
    Never uses an LLM for numerical calculations. Never fabricates missing inputs.
    """

    @staticmethod
    def calculate_operational_risk(
        ambient_temp_c: float,
        surface_temp_c: Optional[float] = None,
        forecast_peak_c: Optional[float] = None,
        persistence_hours: Optional[float] = None,
        exceedance_hours: Optional[float] = None,
        apparent_temp_c: Optional[float] = None,
        heat_index_c: Optional[float] = None,
        wet_bulb_c: Optional[float] = None,
        humidity_pct: Optional[float] = None,
        hour_of_day: Optional[int] = None,
        canopy_cover_pct: Optional[float] = None,
        albedo: Optional[float] = None
    ) -> OperationalRiskResult:
        factors: List[str] = []

        # 1. Current Temperature Component (Max 35 points)
        # Baseline 20C = 0, 30C = 15, 38C = 26, 45C+ = 33-35
        if ambient_temp_c <= 20.0:
            temp_pts = 0.0
        elif ambient_temp_c <= 30.0:
            temp_pts = (ambient_temp_c - 20.0) * 1.5  # 0 to 15
        elif ambient_temp_c <= 38.0:
            temp_pts = 15.0 + (ambient_temp_c - 30.0) * 1.375  # 15 to 26
        elif ambient_temp_c <= 45.0:
            temp_pts = 26.0 + (ambient_temp_c - 38.0) * 1.0  # 26 to 33
        else:
            temp_pts = min(35.0, 33.0 + (ambient_temp_c - 45.0) * 0.5)

        # Radiant surface delta contribution (if available)
        if surface_temp_c is not None and surface_temp_c > ambient_temp_c:
            surf_delta = surface_temp_c - ambient_temp_c
            if surf_delta >= 10.0:
                temp_pts = min(35.0, temp_pts + min(3.0, (surf_delta - 10.0) * 0.3 + 1.0))
                if surface_temp_c >= 55.0:
                    factors.append(f"Elevated radiant surface temperature ({surface_temp_c}°C)")

        temp_pts = round(min(35.0, max(0.0, temp_pts)), 1)
        if ambient_temp_c >= 38.0:
            factors.append(f"High ambient temperature ({ambient_temp_c}°C)")

        # 2. Forecast Peak Component (Max 15 points)
        forecast_pts = 0.0
        if forecast_peak_c is not None:
            if forecast_peak_c >= 45.0:
                forecast_pts = 15.0
                factors.append(f"Extreme forecast peak temperature ({forecast_peak_c}°C)")
            elif forecast_peak_c >= 40.0:
                forecast_pts = 11.0 + (forecast_peak_c - 40.0) * 0.8
                factors.append(f"High forecast peak temperature ({forecast_peak_c}°C)")
            elif forecast_peak_c >= 35.0:
                forecast_pts = 7.0 + (forecast_peak_c - 35.0) * 0.8
            elif forecast_peak_c >= 25.0:
                forecast_pts = (forecast_peak_c - 25.0) * 0.7
        else:
            # If forecast is unavailable, redistribute proportional to ambient without fabricating
            forecast_pts = round(temp_pts * (15.0 / 35.0), 1)

        forecast_pts = round(min(15.0, max(0.0, forecast_pts)), 1)

        # 3. Persistence Duration Component (Max 20 points)
        # Consecutive hours above 35C
        persist_pts = 0.0
        if persistence_hours is not None and persistence_hours > 0:
            if persistence_hours >= 8.0:
                persist_pts = 20.0
                factors.append(f"Severe prolonged heat persistence ({persistence_hours} consecutive hours > 35°C)")
            elif persistence_hours >= 5.0:
                persist_pts = 13.0 + (persistence_hours - 5.0) * 2.33
                factors.append(f"Prolonged heat persistence ({persistence_hours} hours > 35°C)")
            elif persistence_hours >= 2.0:
                persist_pts = 5.0 + (persistence_hours - 2.0) * 2.66
            else:
                persist_pts = persistence_hours * 2.5
        persist_pts = round(min(20.0, max(0.0, persist_pts)), 1)

        # 4. Exceedance Duration Component (Max 15 points)
        # Hours exceeding critical threshold (>38C)
        exceed_pts = 0.0
        if exceedance_hours is not None and exceedance_hours > 0:
            if exceedance_hours >= 6.0:
                exceed_pts = 15.0
                factors.append(f"Extended critical exceedance period ({exceedance_hours} hours > 38°C)")
            elif exceedance_hours >= 3.0:
                exceed_pts = 8.0 + (exceedance_hours - 3.0) * 2.33
                factors.append(f"Exceedance of critical heat threshold ({exceedance_hours} hours > 38°C)")
            else:
                exceed_pts = exceedance_hours * 2.66
        exceed_pts = round(min(15.0, max(0.0, exceed_pts)), 1)

        # 5. Environmental / Thermal Stress Component (Max 10 points)
        # Evaluated strictly from available optional data
        env_pts = 0.0
        if apparent_temp_c is not None and apparent_temp_c >= 42.0:
            env_pts = max(env_pts, min(10.0, 3.0 + (apparent_temp_c - 42.0) * 0.8))
            factors.append(f"High apparent temperature ({apparent_temp_c}°C)")
        elif heat_index_c is not None and heat_index_c >= 42.0:
            env_pts = max(env_pts, min(10.0, 3.0 + (heat_index_c - 42.0) * 0.8))
            factors.append(f"Elevated heat index ({heat_index_c}°C)")

        if wet_bulb_c is not None and wet_bulb_c >= 28.0:
            env_pts = max(env_pts, min(10.0, 4.0 + (wet_bulb_c - 28.0) * 1.2))
            factors.append(f"Elevated wet-bulb temperature ({wet_bulb_c}°C) reducing evaporative cooling")

        if humidity_pct is not None and humidity_pct >= 55.0 and ambient_temp_c >= 35.0:
            env_pts = max(env_pts, min(10.0, env_pts + 2.5))
            factors.append(f"High relative humidity ({humidity_pct}%) amplifying thermal stress")

        env_pts = round(min(10.0, max(0.0, env_pts)), 1)

        # 6. Time of Day Component (Max 5 points)
        # Peak diurnal solar hours (12:00 - 16:30)
        time_pts = 0.0
        if hour_of_day is not None:
            if 12 <= hour_of_day <= 16:
                time_pts = 5.0
                factors.append("Peak diurnal solar radiation window (12:00 - 16:30)")
            elif (10 <= hour_of_day < 12) or (16 < hour_of_day <= 18):
                time_pts = 2.5
            else:
                time_pts = 0.0
        time_pts = round(min(5.0, max(0.0, time_pts)), 1)

        # Total Calculation (0 - 100)
        total_raw = temp_pts + forecast_pts + persist_pts + exceed_pts + env_pts + time_pts
        score = int(round(min(100.0, max(0.0, total_raw))))

        # Determine Categorical Risk Level
        if score >= 85:
            level = "Extreme"
            summary = "Extreme operational heat hazard. Severe cumulative thermal accumulation requiring urgent mitigation and activity stand-down."
        elif score >= 70:
            level = "Very High"
            summary = "Very high operational heat stress. Significant physiological strain; strict work-rest intervals and continuous hydration mandatory."
        elif score >= 50:
            level = "High"
            summary = "High operational heat conditions. Elevated heat accumulation requiring proactive shade scheduling and hydration monitoring."
        elif score >= 30:
            level = "Moderate"
            summary = "Moderate heat conditions. Manageable with standard hydration and periodic respite breaks."
        else:
            level = "Low"
            summary = "Low operational heat risk. Thermal conditions are within benign baseline thresholds."

        if not factors:
            factors.append("Thermal parameters within seasonal baseline limits.")

        metrics = ContributingMetrics(
            temperature_points=temp_pts,
            forecast_points=forecast_pts,
            persistence_points=persist_pts,
            exceedance_points=exceed_pts,
            environmental_points=env_pts,
            time_of_day_points=time_pts,
            ambient_temp_c=ambient_temp_c,
            surface_temp_c=surface_temp_c,
            forecast_peak_c=forecast_peak_c,
            persistence_hours=persistence_hours,
            exceedance_hours=exceedance_hours,
            apparent_temp_c=apparent_temp_c,
            heat_index_c=heat_index_c,
            wet_bulb_c=wet_bulb_c,
            humidity_pct=humidity_pct,
            hour_of_day=hour_of_day
        )

        return OperationalRiskResult(
            risk_score=score,
            risk_level=level,
            risk_factors=factors,
            contributing_metrics=metrics,
            summary=summary
        )

    # Legacy helper maintaining backwards-compatibility for existing components
    @classmethod
    def calculate_heatshield_score(cls, *args, **kwargs):
        from app.services.risk_engine import HeatShieldRiskEngine as AppRiskEngine
        return AppRiskEngine.calculate_heatshield_score(*args, **kwargs)

    @classmethod
    def calculate_wbgt(cls, *args, **kwargs):
        from app.services.risk_engine import HeatShieldRiskEngine as AppRiskEngine
        return AppRiskEngine.calculate_wbgt(*args, **kwargs)

    @classmethod
    def calculate_heat_exposure(cls, *args, **kwargs):
        from app.services.risk_engine import HeatShieldRiskEngine as AppRiskEngine
        return AppRiskEngine.calculate_heat_exposure(*args, **kwargs)

    @classmethod
    def evaluate_vulnerability_profile(cls, *args, **kwargs):
        from app.services.risk_engine import HeatShieldRiskEngine as AppRiskEngine
        return AppRiskEngine.evaluate_vulnerability_profile(*args, **kwargs)

risk_engine = HeatShieldRiskEngine()
