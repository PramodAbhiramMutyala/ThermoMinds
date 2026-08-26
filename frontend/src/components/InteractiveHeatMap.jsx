import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, CircleMarker, useMap } from 'react-leaflet';
import { Layers, Eye, Compass, Flame, Info } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Helper component to center map when selected city changes
function MapRecenter({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

export default function InteractiveHeatMap({ city, mapZones, selectedHotspot, onSelectZone, tempUnit = 'C' }) {
  const [activeLayer, setActiveLayer] = useState('surface'); // 'surface' | 'ambient' | 'persistence'

  const center = [city?.lat || 33.4484, city?.lng || -112.0740];
  const isCelsius = tempUnit === 'C';

  const formatTemp = (cVal) => {
    if (!cVal) return '--';
    return isCelsius ? `${cVal.toFixed(1)}°C` : `${((cVal * 9) / 5 + 32).toFixed(1)}°F`;
  };

  const getPolygonColor = (zone) => {
    if (activeLayer === 'surface') {
      const s = zone.surface || 50;
      if (s >= 62) return '#e11d48'; // Rose-600
      if (s >= 58) return '#f43f5e'; // Rose-500
      if (s >= 54) return '#f97316'; // Orange-500
      if (s >= 48) return '#fbbf24'; // Amber-400
      return '#38bdf8'; // Sky-400
    } else if (activeLayer === 'ambient') {
      const a = zone.temp || 38;
      if (a >= 45) return '#e11d48';
      if (a >= 42) return '#f97316';
      if (a >= 38) return '#fbbf24';
      return '#34d399';
    } else {
      // Persistence
      const r = zone.risk_score || 50;
      if (r >= 85) return '#be123c';
      if (r >= 70) return '#ea580c';
      if (r >= 50) return '#d97706';
      return '#059669';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl mb-6">
      
      {/* Map Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Hyperlocal Microclimate Heatmap</h3>
            <p className="text-xs text-slate-400 font-mono">FortyGuard 80m Thermal Intelligence Overlay</p>
          </div>
        </div>

        {/* Layer Selector */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveLayer('surface')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeLayer === 'surface'
                ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Radiant Surface
          </button>
          <button
            onClick={() => setActiveLayer('ambient')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeLayer === 'ambient'
                ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ambient Air (TCM)
          </button>
          <button
            onClick={() => setActiveLayer('persistence')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeLayer === 'persistence'
                ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk Persistence
          </button>
        </div>
      </div>

      {/* Map Frame */}
      <div className="h-80 sm:h-96 w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer
          center={center}
          zoom={city?.zoom || 13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <MapRecenter center={center} zoom={city?.zoom || 13} />
          
          {/* Dark Matter Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Microclimate Polygons */}
          {(mapZones || []).map((zone) => {
            const color = getPolygonColor(zone);
            return (
              <Polygon
                key={zone.id}
                positions={zone.coords}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.55,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => onSelectZone && onSelectZone(zone)
                }}
              >
                <Popup>
                  <div className="p-2 font-sans">
                    <h4 className="font-bold text-sm text-white mb-1">{zone.name}</h4>
                    <div className="text-xs space-y-1 font-mono">
                      <p className="text-orange-400">Ambient: <strong>{formatTemp(zone.temp)}</strong></p>
                      <p className="text-rose-400">Surface: <strong>{formatTemp(zone.surface)}</strong></p>
                      <p className="text-amber-400">Risk Score: <strong>{zone.risk_score} / 100 ({zone.level})</strong></p>
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* Hotspot Indicator Pin */}
          {selectedHotspot && (
            <CircleMarker
              center={[selectedHotspot.centroid.latitude, selectedHotspot.centroid.longitude]}
              radius={10}
              pathOptions={{
                color: '#f43f5e',
                fillColor: '#f43f5e',
                fillOpacity: 0.9,
                weight: 3
              }}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <span className="text-xs font-bold text-rose-400">Selected Hotspot</span>
                  <p className="text-sm font-bold text-white">{selectedHotspot.name}</p>
                </div>
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] glass-panel px-3 py-2 rounded-xl text-[11px] font-mono border border-slate-800 text-slate-300 flex items-center space-x-3 shadow-lg">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>&lt;35°C</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>40°C</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>50°C</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>60°C+</span>
          </div>
        </div>

      </div>

    </div>
  );
}
