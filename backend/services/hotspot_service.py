import math
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from services.risk_engine import HeatShieldRiskEngine, OperationalRiskResult

logger = logging.getLogger(__name__)

# --- Pydantic Hotspot Models ---

class CentroidLocation(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

class TemperatureSummary(BaseModel):
    ambient_c: float
    surface_c: Optional[float] = None

class HotspotItem(BaseModel):
    rank: int = Field(..., ge=1, description="Priority rank (1 is highest risk)")
    hotspot_id: str
    name: str
    centroid: CentroidLocation
    polygon_coordinates: Optional[List[List[float]]] = None
    risk_score: int = Field(..., ge=0, le=100, description="HeatShield Operational Risk Score")
    risk_level: str = Field(..., description="Low | Moderate | High | Very High | Extreme")
    temperature: TemperatureSummary
    persistence_hours: Optional[float] = Field(None, description="Consecutive hours above 35°C if available")
    exceedance_hours: Optional[float] = Field(None, description="Hours exceeding 38°C if available")
    primary_risk_factors: List[str] = Field(default_factory=list)
    data_source: str = "LIVE - FortyGuard"

class HotspotResponse(BaseModel):
    total_hotspots: int
    city: str
    timestamp: str
    data_source: str
    hotspots: List[HotspotItem]

# --- Hotspot Detection Service ---

class HotspotService:
    """
    Processes FortyGuard GeoJSON thermal grids, evaluates deterministic operational risk scores,
    and ranks hotspots by severity.
    """

    @staticmethod
    def calculate_polygon_centroid(coordinates: List[List[float]]) -> CentroidLocation:
        """Calculates geographic centroid of a polygon coordinate array [[lon, lat], ...]."""
        if not coordinates:
            return CentroidLocation(latitude=0.0, longitude=0.0)
        
        # GeoJSON is typically [longitude, latitude]
        lons = [p[0] for p in coordinates]
        lats = [p[1] for p in coordinates]
        return CentroidLocation(
            latitude=round(sum(lats) / len(lats), 5),
            longitude=round(sum(lons) / len(lons), 5)
        )

    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates the great-circle distance between two points in kilometers."""
        R = 6371.0  # Earth's radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2.0) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c

    def detect_and_rank_hotspots(
        self,
        geojson_feature_collection: Dict[str, Any],
        min_risk_score: int = 0,
        limit: int = 10,
        filter_lat: Optional[float] = None,
        filter_lng: Optional[float] = None,
        radius_km: Optional[float] = None
    ) -> List[HotspotItem]:
        """
        1. Iterates over GeoJSON features.
        2. Calculates HeatShield Operational Risk Score for each cell.
        3. Identifies and ranks high-risk cells.
        4. Applies spatial proximity filter if requested.
        """
        features = geojson_feature_collection.get("features", [])
        candidates: List[Dict[str, Any]] = []

        for idx, feat in enumerate(features):
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            coords = geom.get("coordinates", [[]])[0] if geom.get("type") == "Polygon" else []
            
            centroid = self.calculate_polygon_centroid(coords) if coords else CentroidLocation(
                latitude=props.get("latitude", 33.4484),
                longitude=props.get("longitude", -112.0740)
            )

            # Proximity filter
            if filter_lat is not None and filter_lng is not None and radius_km is not None:
                dist = self.haversine_distance_km(filter_lat, filter_lng, centroid.latitude, centroid.longitude)
                if dist > radius_km:
                    continue

            ambient_c = props.get("ambient_temp_c") or props.get("tcm") or props.get("temperature", 38.0)
            surface_c = props.get("surface_temp_c")
            forecast_peak_c = props.get("forecast_peak_c")
            persistence_hours = props.get("persistence_hours")
            exceedance_hours = props.get("exceedance_hours")
            apparent_temp_c = props.get("apparent_temp_c")
            heat_index_c = props.get("heat_index_c")
            wet_bulb_c = props.get("wet_bulb_c")
            humidity_pct = props.get("humidity_pct") or props.get("relative_humidity_pct")
            hour_of_day = props.get("hour_of_day", 14)

            # Compute transparent deterministic operational risk
            risk_result: OperationalRiskResult = HeatShieldRiskEngine.calculate_operational_risk(
                ambient_temp_c=ambient_c,
                surface_temp_c=surface_c,
                forecast_peak_c=forecast_peak_c,
                persistence_hours=persistence_hours,
                exceedance_hours=exceedance_hours,
                apparent_temp_c=apparent_temp_c,
                heat_index_c=heat_index_c,
                wet_bulb_c=wet_bulb_c,
                humidity_pct=humidity_pct,
                hour_of_day=hour_of_day
            )

            if risk_result.risk_score >= min_risk_score:
                candidates.append({
                    "id": props.get("tile_id") or props.get("id") or f"cell_{idx+1}",
                    "name": props.get("name") or props.get("zone_name") or f"Thermal Grid Cell #{idx+1}",
                    "centroid": centroid,
                    "polygon_coordinates": coords,
                    "risk_score": risk_result.risk_score,
                    "risk_level": risk_result.risk_level,
                    "temperature": TemperatureSummary(
                        ambient_c=ambient_c,
                        surface_c=surface_c
                    ),
                    "persistence_hours": persistence_hours,
                    "exceedance_hours": exceedance_hours,
                    "primary_risk_factors": risk_result.risk_factors,
                    "data_source": props.get("data_source", "LIVE - FortyGuard")
                })

        # Rank candidates descending by risk_score, then ambient_c
        candidates.sort(key=lambda x: (x["risk_score"], x["temperature"].ambient_c), reverse=True)

        ranked_hotspots: List[HotspotItem] = []
        for rank_idx, item in enumerate(candidates[:limit], start=1):
            ranked_hotspots.append(HotspotItem(
                rank=rank_idx,
                hotspot_id=item["id"],
                name=item["name"],
                centroid=item["centroid"],
                polygon_coordinates=item["polygon_coordinates"],
                risk_score=item["risk_score"],
                risk_level=item["risk_level"],
                temperature=item["temperature"],
                persistence_hours=item["persistence_hours"],
                exceedance_hours=item["exceedance_hours"],
                primary_risk_factors=item["primary_risk_factors"],
                data_source=item["data_source"]
            ))

        return ranked_hotspots

    def get_mock_hotspots(
        self,
        city: str = "Phoenix",
        min_risk_score: int = 0,
        limit: int = 10,
        filter_lat: Optional[float] = None,
        filter_lng: Optional[float] = None,
        radius_km: Optional[float] = None
    ) -> List[HotspotItem]:
        """
        Generates deterministic mock hotspots formatted for FortyGuard compatibility.
        """
        city_lower = city.strip().lower()
        if "dubai" in city_lower:
            raw_cells = [
                {
                    "properties": {
                        "id": "hs_dxb_01",
                        "name": "Al Quoz Industrial Concrete Basin",
                        "latitude": 25.1320,
                        "longitude": 55.2340,
                        "ambient_temp_c": 46.2,
                        "surface_temp_c": 64.5,
                        "forecast_peak_c": 47.0,
                        "persistence_hours": 9.5,
                        "exceedance_hours": 7.0,
                        "apparent_temp_c": 51.0,
                        "data_source": "DEMO - HeatShield Simulation"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[55.230, 25.129], [55.238, 25.129], [55.238, 25.135], [55.230, 25.135], [55.230, 25.129]]]
                    }
                },
                {
                    "properties": {
                        "id": "hs_dxb_02",
                        "name": "Deira Commercial Asphalt Corridor",
                        "latitude": 25.2690,
                        "longitude": 55.3090,
                        "ambient_temp_c": 44.8,
                        "surface_temp_c": 61.0,
                        "forecast_peak_c": 45.5,
                        "persistence_hours": 8.0,
                        "exceedance_hours": 5.5,
                        "apparent_temp_c": 48.5,
                        "data_source": "DEMO - HeatShield Simulation"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[55.305, 25.265], [55.313, 25.265], [55.313, 25.273], [55.305, 25.273], [55.305, 25.265]]]
                    }
                }
            ]
        elif "london" in city_lower:
            raw_cells = [
                {
                    "properties": {
                        "id": "hs_ldn_01",
                        "name": "Bank Junction Masonry Heat Island",
                        "latitude": 51.5134,
                        "longitude": -0.0890,
                        "ambient_temp_c": 36.2,
                        "surface_temp_c": 46.5,
                        "forecast_peak_c": 37.0,
                        "persistence_hours": 4.5,
                        "exceedance_hours": 2.0,
                        "apparent_temp_c": 37.5,
                        "data_source": "DEMO - HeatShield Simulation"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[-0.092, 51.511], [-0.086, 51.511], [-0.086, 51.515], [-0.092, 51.515], [-0.092, 51.511]]]
                    }
                }
            ]
        else:
            # Phoenix default
            raw_cells = [
                {
                    "properties": {
                        "id": "hs_phx_01",
                        "name": "Warehouse District Rail Yards",
                        "latitude": 33.4421,
                        "longitude": -112.0760,
                        "ambient_temp_c": 45.2,
                        "surface_temp_c": 62.8,
                        "forecast_peak_c": 46.0,
                        "persistence_hours": 9.0,
                        "exceedance_hours": 6.5,
                        "apparent_temp_c": 48.0,
                        "data_source": "DEMO - HeatShield Simulation"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[-112.080, 33.439], [-112.072, 33.439], [-112.072, 33.445], [-112.080, 33.445], [-112.080, 33.439]]]
                    }
                },
                {
                    "properties": {
                        "id": "hs_phx_02",
                        "name": "South Central Asphalt Transit Hub",
                        "latitude": 33.4360,
                        "longitude": -112.0710,
                        "ambient_temp_c": 44.6,
                        "surface_temp_c": 60.5,
                        "forecast_peak_c": 45.2,
                        "persistence_hours": 8.0,
                        "exceedance_hours": 5.0,
                        "apparent_temp_c": 47.0,
                        "data_source": "DEMO - HeatShield Simulation"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[-112.075, 33.433], [-112.067, 33.433], [-112.067, 33.439], [-112.075, 33.439], [-112.075, 33.433]]]
                    }
                },
                {
                    "properties": {
                        "id": "hs_phx_03",
                        "name": "Downtown Central Business District",
                        "latitude": 33.4484,
                        "longitude": -112.0740,
                        "ambient_temp_c": 42.8,
                        "surface_temp_c": 56.4,
                        "forecast_peak_c": 43.5,
                        "persistence_hours": 6.5,
                        "exceedance_hours": 3.5,
                        "apparent_temp_c": 44.5,
                        "data_source": "DEMO - HeatShield Simulation"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[-112.078, 33.445], [-112.070, 33.445], [-112.070, 33.451], [-112.078, 33.451], [-112.078, 33.445]]]
                    }
                },
                {
                    "properties": {
                        "id": "hs_phx_04",
                        "name": "Roosevelt Row Arts District",
                        "latitude": 33.4570,
                        "longitude": -112.0700,
                        "ambient_temp_c": 40.5,
                        "surface_temp_c": 51.2,
                        "forecast_peak_c": 41.5,
                        "persistence_hours": 4.5,
                        "exceedance_hours": 2.0,
                        "apparent_temp_c": 42.0,
                        "data_source": "DEMO - HeatShield Simulation"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[-112.074, 33.454], [-112.066, 33.454], [-112.066, 33.460], [-112.074, 33.460], [-112.074, 33.454]]]
                    }
                }
            ]

        fc = {"type": "FeatureCollection", "features": raw_cells}
        return self.detect_and_rank_hotspots(
            geojson_feature_collection=fc,
            min_risk_score=min_risk_score,
            limit=limit,
            filter_lat=filter_lat,
            filter_lng=filter_lng,
            radius_km=radius_km
        )

hotspot_service = HotspotService()
