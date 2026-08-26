from typing import Dict, Any, List
from app.schemas.route import RouteComparisonResponse, RouteDetails

class CoolRouteEngine:
    """
    Finds and compares direct (scorching) routes vs shade-optimized cool corridors.
    """

    @staticmethod
    def calculate_route_comparison(
        city: str = "Phoenix",
        origin: str = "Downtown Financial Core",
        destination: str = "Burton Barr Central Library"
    ) -> RouteComparisonResponse:
        city_lower = city.lower()

        if "dubai" in city_lower:
            origin_name = "Business Bay Metro"
            dest_name = "Dubai Mall Shaded Concourse"
            direct_path = [
                [25.1870, 55.2600],
                [25.1910, 55.2660],
                [25.1950, 55.2710],
                [25.1972, 55.2744]
            ]
            cool_path = [
                [25.1870, 55.2600],
                [25.1890, 55.2630],
                [25.1925, 55.2690],
                [25.1960, 55.2730],
                [25.1972, 55.2744]
            ]
            direct = RouteDetails(
                route_name="Direct Arterial Path (Sheikh Zayed Link)",
                distance_km=2.3,
                duration_minutes=28.0,
                avg_surface_temp_c=58.5,
                avg_ambient_temp_c=45.2,
                shade_coverage_pct=15.0,
                heat_exposure_score=82.0,
                path=direct_path,
                highlights=["Unshaded concrete sidewalks", "High reflective glass glare", "Heavy vehicle heat exhaust"]
            )
            cool = RouteDetails(
                route_name="Cool Corridor (Air-Conditioned Metro Link & Shaded Boulevard)",
                distance_km=2.6,
                duration_minutes=31.0,
                avg_surface_temp_c=44.0,
                avg_ambient_temp_c=39.5,
                shade_coverage_pct=68.0,
                heat_exposure_score=41.0,
                path=cool_path,
                highlights=["Enclosed AC footbridge segment", "Landscaped canopy coverage", "Misting station checkpoint"]
            )
        elif "london" in city_lower:
            origin_name = "Oxford Circus"
            dest_name = "British Library Sanctuary"
            direct_path = [
                [51.5152, -0.1419],
                [51.5200, -0.1360],
                [51.5250, -0.1310],
                [51.5299, -0.1278]
            ]
            cool_path = [
                [51.5152, -0.1419],
                [51.5180, -0.1450],
                [51.5230, -0.1380],
                [51.5280, -0.1320],
                [51.5299, -0.1278]
            ]
            direct = RouteDetails(
                route_name="Direct Commercial Corridor (Tottenham Court Rd)",
                distance_km=1.9,
                duration_minutes=24.0,
                avg_surface_temp_c=46.5,
                avg_ambient_temp_c=36.0,
                shade_coverage_pct=20.0,
                heat_exposure_score=68.0,
                path=direct_path,
                highlights=["Dense unshaded asphalt", "Slow pedestrian crowding", "No tree canopy"]
            )
            cool = RouteDetails(
                route_name="Cool Corridor (Bloomsbury Tree Squares)",
                distance_km=2.2,
                duration_minutes=27.0,
                avg_surface_temp_c=35.0,
                avg_ambient_temp_c=31.8,
                shade_coverage_pct=65.0,
                heat_exposure_score=34.0,
                path=cool_path,
                highlights=["Russell Square mature tree shade", "Lush garden square microclimate", "Water fountain rest stop"]
            )
        else:
            # Phoenix Default
            origin_name = "Downtown Transit Core (1st Ave)"
            dest_name = "Burton Barr Central Library"
            direct_path = [
                [33.4490, -112.0735],
                [33.4530, -112.0736],
                [33.4575, -112.0738],
                [33.4618, -112.0740]
            ]
            cool_path = [
                [33.4490, -112.0735],
                [33.4510, -112.0770],
                [33.4560, -112.0772],
                [33.4600, -112.0755],
                [33.4618, -112.0740]
            ]
            direct = RouteDetails(
                route_name="Direct Route (Central Ave Arterial)",
                distance_km=2.1,
                duration_minutes=26.0,
                avg_surface_temp_c=59.2,
                avg_ambient_temp_c=44.3,
                shade_coverage_pct=18.0,
                heat_exposure_score=86.0,
                path=direct_path,
                highlights=["Dark unshaded asphalt roadway", "Direct midday solar exposure", "No vegetative buffer"]
            )
            cool = RouteDetails(
                route_name="Cool Corridor (Roosevelt Tree Canopy & Shaded Colonnades)",
                distance_km=2.4,
                duration_minutes=29.0,
                avg_surface_temp_c=45.5,
                avg_ambient_temp_c=39.8,
                shade_coverage_pct=61.0,
                heat_exposure_score=44.0,
                path=cool_path,
                highlights=["Mature Desert Willow tree canopy", "Building arcade overhangs", "Harmon Park misting oasis"]
            )

        delta_time = round(cool.duration_minutes - direct.duration_minutes, 1)
        thermal_reduction = round(((direct.avg_surface_temp_c - cool.avg_surface_temp_c) / direct.avg_surface_temp_c) * 100.0, 1)

        reasoning = (
            f"Recommended: Cool Route. While adding only +{delta_time} minutes of travel time, "
            f"it increases continuous shade coverage from {direct.shade_coverage_pct}% to {cool.shade_coverage_pct}% "
            f"and reduces surface heat exposure by {thermal_reduction}%."
        )

        return RouteComparisonResponse(
            origin_name=origin_name,
            destination_name=dest_name,
            direct_route=direct,
            cool_route=cool,
            recommended_route="cool",
            delta_time_min=delta_time,
            thermal_reduction_pct=thermal_reduction,
            reasoning=reasoning
        )

route_engine = CoolRouteEngine()
