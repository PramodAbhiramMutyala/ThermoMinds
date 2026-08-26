from typing import Dict, Any, List
from app.services.fortyguard_client import fortyguard_client
from app.services.risk_engine import risk_engine
from app.schemas.temperature import DiurnalCurvePoint

class PersistenceAndExceedanceEngine:
    """
    Computes:
    1. Hotspot spatial rankings and thermal persistence
    2. Nocturnal heat trap anomalies (failure to cool at night)
    3. Diurnal 24-hour temperature & WBGT simulation curves
    """

    async def get_hotspots_ranked(self, city: str = "Phoenix", hour_offset: int = 14) -> Dict[str, Any]:
        data = await fortyguard_client.get_city_temperature_data(city=city, hour_offset=hour_offset)
        zones = data.get("zones", [])

        ranked_hotspots = []
        for z in zones:
            score = risk_engine.calculate_heatshield_score(
                ambient_temp_c=z["ambient_temp_c"],
                surface_temp_c=z["surface_temp_c"],
                consecutive_hours_above_35c=z.get("consecutive_hours_above_35c", 6.0),
                hours_above_38c=z.get("hours_above_38c", 3.0),
                nighttime_cooling_deficit_c=z.get("nighttime_cooling_deficit_c", 3.0),
                canopy_cover_pct=z.get("canopy_cover_pct", 10.0),
                albedo=z.get("albedo", 0.18)
            )

            wbgt = risk_engine.calculate_wbgt(
                ambient_temp_c=z["ambient_temp_c"],
                relative_humidity_pct=z.get("relative_humidity_pct", 20.0),
                wind_speed_mps=z.get("wind_speed_mps", 1.5),
                solar_radiation_wm2=z.get("solar_radiation_wm2", 850.0)
            )

            ranked_hotspots.append({
                "id": z["id"],
                "name": z["name"],
                "lat": z["lat"],
                "lng": z["lng"],
                "ambient_temp_c": z["ambient_temp_c"],
                "surface_temp_c": z["surface_temp_c"],
                "heatshield_score": score.total_score,
                "risk_level": score.risk_level,
                "score_breakdown": score.model_dump(),
                "wbgt_c": wbgt.wbgt_c,
                "thermal_flag": wbgt.thermal_flag,
                "consecutive_hours_above_35c": z.get("consecutive_hours_above_35c", 6.0),
                "hours_above_38c": z.get("hours_above_38c", 3.0),
                "nighttime_cooling_deficit_c": z.get("nighttime_cooling_deficit_c", 3.0),
                "vulnerability_population": z.get("vulnerability_population", 5000),
                "active_construction_sites": z.get("active_construction_sites", 0),
                "data_source": z.get("data_source", "DEMO - HeatShield Simulation")
            })

        # Sort descending by HeatShield Score
        ranked_hotspots.sort(key=lambda x: x["heatshield_score"], reverse=True)

        return {
            "city": city,
            "hour_offset": hour_offset,
            "hotspots_count": len(ranked_hotspots),
            "extreme_hotspots_count": sum(1 for h in ranked_hotspots if h["heatshield_score"] >= 80),
            "hotspots": ranked_hotspots,
            "data_source": data.get("data_source", "DEMO - HeatShield Simulation")
        }

    async def get_diurnal_curve(self, zone_id: str, city: str = "Phoenix") -> List[DiurnalCurvePoint]:
        zone = await fortyguard_client.get_zone_by_id(zone_id, city=city)
        if not zone:
            data = await fortyguard_client.get_city_temperature_data(city=city)
            zone = data["zones"][0]

        base_ambient = zone["ambient_temp_c"]
        base_surface = zone["surface_temp_c"]
        rh = zone.get("relative_humidity_pct", 20.0)

        curve_points: List[DiurnalCurvePoint] = []
        for h in range(24):
            factor = fortyguard_client._get_diurnal_factor(h)
            amb = round(base_ambient - 4.5 + (factor * 7.5), 1)
            surf = round(base_surface - 9.0 + (factor * 16.0), 1)
            
            # Solar radiation peaks in mid-day
            solar = round(950.0 * factor, 1) if 6 <= h <= 19 else 0.0
            wbgt_res = risk_engine.calculate_wbgt(
                ambient_temp_c=amb,
                relative_humidity_pct=rh,
                solar_radiation_wm2=solar
            )

            # Simple heat index
            hi = round(amb + (rh * 0.1) - 2.0, 1)

            curve_points.append(DiurnalCurvePoint(
                hour=h,
                hour_label=f"{h:02d}:00",
                ambient_temp_c=amb,
                surface_temp_c=surf,
                wbgt_c=wbgt_res.wbgt_c,
                heat_index_c=hi,
                is_peak_risk=(12 <= h <= 17)
            ))

        return curve_points

persistence_engine = PersistenceAndExceedanceEngine()
