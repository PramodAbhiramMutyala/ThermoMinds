import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Flame, Shield, MapPin, Eye, Trees } from 'lucide-react';
import DataSourceBadge from './DataSourceBadge';

// Helper to update map center dynamically when city changes
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Custom icons for cooling centers
const shelterIcon = L.divIcon({
  className: 'custom-shelter-icon',
  html: `<div style="background-color: #06b6d4; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(6, 182, 212, 0.8);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

export default function HeatMap({
  citySummary,
  zones = [],
  activeZone,
  onSelectZone,
  coolingCenters = [],
  activeRoute = null,
  dataSource
}) {
  const center = citySummary ? [citySummary.center_lat, citySummary.center_lng] : [33.4484, -112.0740];
  const zoom = citySummary?.zoom || 13;

  const getThermalColor = (temp, score) => {
    if (score >= 80 || temp >= 44) return '#ef4444'; // Extreme crimson
    if (score >= 65 || temp >= 41) return '#f97316'; // Very high orange
    if (score >= 45 || temp >= 38) return '#f59e0b'; // High amber
    if (score >= 30 || temp >= 34) return '#eab308'; // Moderate yellow
    return '#10b981'; // Cool green
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Floating Map Header / Legend */}
      <div className="absolute top-3 left-3 z-[1000] glass-panel px-3.5 py-2 rounded-xl border border-slate-700/70 bg-dark-900/90 flex flex-wrap items-center gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-xs font-bold text-slate-100">
            {citySummary?.city_name || 'City'} Hyperlocal Heatmap
          </span>
        </div>
        <div className="h-3.5 w-px bg-slate-700 hidden sm:block"></div>
        {/* Heat color gradient legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium">
          <span className="text-emerald-400">Cool</span>
          <div className="w-16 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"></div>
          <span className="text-red-400 font-bold">46°C+</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[420px]"
        zoomControl={false}
      >
        <ChangeMapView center={center} zoom={zoom} />

        {/* Dark Basemap Tiles */}
        <TileLayer
<<<<<<< HEAD
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> | Data: FortyGuard'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
=======
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> | Data: FortyGuard'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
>>>>>>> 657cfa4e12c27351126d901567920e698e26623c
        />

        {/* Microclimate Zones & Hotspot Circles */}
        {zones.map((z) => {
          const isSelected = activeZone?.id === z.id;
          const color = getThermalColor(z.ambient_temp_c, z.heatshield_score || 50);

          return (
            <React.Fragment key={z.id}>
              {/* Outer Heat Dispersion Glow */}
              <CircleMarker
                center={[z.lat, z.lng]}
                radius={isSelected ? 36 : 24}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.35 : 0.2,
                  weight: isSelected ? 2.5 : 1,
                }}
                eventHandlers={{
                  click: () => onSelectZone(z)
                }}
              />

              {/* Core Sensor / Zone Marker */}
              <CircleMarker
                center={[z.lat, z.lng]}
                radius={isSelected ? 9 : 6}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: color,
                  fillOpacity: 0.95,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => onSelectZone(z)
                }}
              >
                <Popup>
                  <div className="p-2 space-y-2 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                      <span className="font-bold text-xs text-slate-100">{z.name}</span>
                      <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                        Score: {z.heatshield_score || 75}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Ambient</div>
                        <div className="font-extrabold text-amber-300">{z.ambient_temp_c}°C</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Surface</div>
                        <div className="font-extrabold text-red-400">{z.surface_temp_c}°C</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-300 space-y-0.5 pt-1 border-t border-slate-800">
                      <div>• Canopy: <span className="font-semibold text-slate-100">{z.canopy_cover_pct}%</span></div>
                      <div>• Persistence: <span className="font-semibold text-orange-400">{z.consecutive_hours_above_35c || 6}h &gt; 35°C</span></div>
                      <div>• Nocturnal Deficit: <span className="font-semibold text-red-400">+{z.nighttime_cooling_deficit_c || 3}°C</span></div>
                    </div>

                    <div className="pt-1">
                      <DataSourceBadge source={z.data_source || dataSource} size="xs" />
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}

        {/* Cooling Respite Centers */}
        {coolingCenters.map((cc) => (
          <Marker
            key={cc.id}
            position={[cc.lat, cc.lng]}
            icon={shelterIcon}
          >
            <Popup>
              <div className="p-2 space-y-1.5 min-w-[210px]">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{cc.name}</span>
                </div>
                <div className="text-[10px] text-slate-300">{cc.address}</div>
                <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Indoor AC: {cc.indoor_temp_c}°C • {cc.capacity_status}
                </div>
                <div className="text-[10px] text-slate-400">Hours: {cc.hours}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Cool Route vs Direct Route Polylines */}
        {activeRoute && (
          <>
            {/* Direct Scorching Route (Red dashed) */}
            <Polyline
              positions={activeRoute.direct_route.path}
              pathOptions={{
                color: '#ef4444',
                weight: 4,
                dashArray: '6, 8',
                opacity: 0.85
              }}
            />
            {/* Cool Shaded Corridor (Cyan/Emerald solid) */}
            <Polyline
              positions={activeRoute.cool_route.path}
              pathOptions={{
                color: '#06b6d4',
                weight: 6,
                opacity: 0.95
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
