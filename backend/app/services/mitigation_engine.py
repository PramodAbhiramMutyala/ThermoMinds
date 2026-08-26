from typing import Dict, Any, List
from app.schemas.mitigation import MitigationScenarioInput, MitigationSimulationResult
from app.services.fortyguard_client import fortyguard_client
from app.services.risk_engine import risk_engine

class UrbanMitigationEngine:
    """
    Simulates urban heat mitigation interventions:
    - Tree canopy expansion (evapotranspiration & direct shade)
    - Cool roofs & high-albedo pavements (solar reflectance)
    - Evaporative misting cannons (sensible heat absorption)
    """

    async def simulate_scenario(self, scenario: MitigationScenarioInput, city: str = "Phoenix") -> MitigationSimulationResult:
        zone = await fortyguard_client.get_zone_by_id(scenario.zone_id, city=city)
        if not zone:
            # Fallback to first zone in city
            data = await fortyguard_client.get_city_temperature_data(city=city)
            zone = data["zones"][0]

        base_ambient = zone["ambient_temp_c"]
        base_surface = zone["surface_temp_c"]
        base_pop = zone.get("vulnerability_population", 5000)

        # Baseline HeatShield Score
        base_score_obj = risk_engine.calculate_heatshield_score(
            ambient_temp_c=base_ambient,
            surface_temp_c=base_surface,
            consecutive_hours_above_35c=zone.get("consecutive_hours_above_35c", 6.0),
            hours_above_38c=zone.get("hours_above_38c", 3.0),
            nighttime_cooling_deficit_c=zone.get("nighttime_cooling_deficit_c", 3.0),
            canopy_cover_pct=zone.get("canopy_cover_pct", 10.0),
            albedo=zone.get("albedo", 0.18)
        )

        canopy_inc = scenario.canopy_increase_pct
        albedo_inc = scenario.cool_roof_albedo_pct
        misting_inc = scenario.misting_coverage_pct

        # Deterministic microclimate reduction model
        # Canopy gives direct shade (reducing surface temp) and evapotranspiration (reducing ambient)
        # Cool roof reflects radiation (reducing surface temp and convective plume)
        # Misting directly cools air via latent heat of vaporization
        delta_surf = round((albedo_inc * 0.24) + (canopy_inc * 0.20), 1)
        delta_amb = round((canopy_inc * 0.070) + (albedo_inc * 0.035) + (misting_inc * 0.060), 1)

        projected_surface = round(max(25.0, base_surface - delta_surf), 1)
        projected_ambient = round(max(22.0, base_ambient - delta_amb), 1)

        # Projected canopy & albedo
        proj_canopy = min(80.0, zone.get("canopy_cover_pct", 10.0) + canopy_inc)
        proj_albedo = min(0.65, zone.get("albedo", 0.18) + (albedo_inc * 0.005))

        proj_score_obj = risk_engine.calculate_heatshield_score(
            ambient_temp_c=projected_ambient,
            surface_temp_c=projected_surface,
            consecutive_hours_above_35c=max(0.0, zone.get("consecutive_hours_above_35c", 6.0) - (delta_amb * 0.8)),
            hours_above_38c=max(0.0, zone.get("hours_above_38c", 3.0) - (delta_amb * 0.9)),
            nighttime_cooling_deficit_c=max(0.2, zone.get("nighttime_cooling_deficit_c", 3.0) - (albedo_inc * 0.04)),
            canopy_cover_pct=proj_canopy,
            albedo=proj_albedo
        )

        score_reduction = max(0, base_score_obj.total_score - proj_score_obj.total_score)
        
        # Priority level determination
        if base_score_obj.total_score >= 80 and score_reduction >= 15:
            priority = "Critical Priority Intervention"
        elif score_reduction >= 10:
            priority = "High Impact Strategic Project"
        else:
            priority = "Moderate / Incremental Benefit"

        breakdown = []
        if canopy_inc > 0:
            breakdown.append(f"Tree Canopy Expansion (+{canopy_inc}%): Delivers continuous shade and -{round(canopy_inc*0.07, 1)}°C ambient cooling via evapotranspiration.")
        if albedo_inc > 0:
            breakdown.append(f"Cool Roof / High-Albedo Coating (+{albedo_inc}%): Reflects solar flux, dropping surface temperature by -{round(albedo_inc*0.24, 1)}°C.")
        if misting_inc > 0:
            breakdown.append(f"Active Misting Cannons (+{misting_inc}%): Absorbs sensible heat in pedestrian zones (-{round(misting_inc*0.06, 1)}°C ambient).")
        if not breakdown:
            breakdown.append("No active interventions configured in this scenario.")

        affected_area = round(1.2 + (canopy_inc + albedo_inc) * 0.05, 2)
        relieved_residents = int(base_pop * min(1.0, (score_reduction / 50.0) + 0.2))

        return MitigationSimulationResult(
            zone_id=zone["id"],
            zone_name=zone["name"],
            baseline_surface_temp_c=base_surface,
            baseline_ambient_temp_c=base_ambient,
            baseline_heatshield_score=base_score_obj.total_score,
            baseline_risk_level=base_score_obj.risk_level,
            projected_surface_temp_c=projected_surface,
            projected_ambient_temp_c=projected_ambient,
            projected_heatshield_score=proj_score_obj.total_score,
            projected_risk_level=proj_score_obj.risk_level,
            delta_surface_temp_c=delta_surf,
            delta_ambient_temp_c=delta_amb,
            score_reduction_points=score_reduction,
            estimated_affected_area_km2=affected_area,
            vulnerable_residents_relieved=relieved_residents,
            priority_level=priority,
            mitigation_breakdown=breakdown
        )

mitigation_engine = UrbanMitigationEngine()
