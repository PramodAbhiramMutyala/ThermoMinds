import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { Layers, MapPin, Eye, Flame, ShieldAlert, Sparkles, X, ChevronRight, Activity, Thermometer, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Helper component to center map smoothly on city or selected zone change
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function InteractiveHeatMap({
  city,
  geoJsonData,
  hotspots = [],
  selectedLocation,
  onSelectLocation,
  tempUnit = 'C'
}) {
  const [activeLayer, setActiveLayer] = useState('risk'); // 'risk' | 'surface' | 'ambient'
  const isCelsius = tempUnit === 'C';

  const formatTemp = (cVal) => {
    if (cVal === undefined || cVal === null) return '--';
    return isCelsius ? `${cVal.toFixed(1)}°C` : `${((cVal * 9) / 5 + 32).toFixed(1)}°F`;
  };

  const center = selectedLocation?.centroid
    ? [selectedLocation.centroid.latitude, selectedLocation.centroid.longitude]
    : [city?.lat || 33.4484, city?.lng || -112.0740];

  // Helper to extract polygon points [[lat, lng], ...] from GeoJSON coordinates [[lng, lat], ...]
  const getPolygonPositions = (feature) => {
    const coords = feature?.geometry?.coordinates?.[0] || [];
    // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
    return coords.map((pt) => [pt[1], pt[0]]);
  };

  // Determine risk level category & colors
  const getRiskStyle = (riskScore = 50, level = null) => {
    if (level === 'Extreme' || riskScore >= 85) {
      return {
        level: 'Extreme',
        fillColor: '#f43f5e',
        borderColor: '#be123c',
        badgeBg: 'bg-rose-500 text-white',
        textClass: 'text-rose-400'
      };
    } else if (level === 'Very High' || riskScore >= 70) {
      return {
        level: 'Very High',
        fillColor: '#f97316',
        borderColor: '#ea580c',
        badgeBg: 'bg-orange-500 text-white',
        textClass: 'text-orange-400'
      };
    } else if (level === 'High' || riskScore >= 50) {
      return {
        level: 'High',
        fillColor: '#f59e0b',
        borderColor: '#d97706',
        badgeBg: 'bg-amber-500 text-white',
        textClass: 'text-amber-400'
      };
    } else if (level === 'Moderate' || riskScore >= 30) {
      return {
        level: 'Moderate',
        fillColor: '#06b6d4',
        borderColor: '#0891b2',
        badgeBg: 'bg-cyan-500 text-white',
        textClass: 'text-cyan-400'
      };
    } else {
      return {
        level: 'Low',
        fillColor: '#10b981',
        borderColor: '#059669',
        badgeBg: 'bg-emerald-500 text-white',
        textClass: 'text-emerald-400'
      };
    }
  };

  // Dynamic Polygon styling based on active layer
  const getFeatureStyle = (feature) => {
    const props = feature.properties || {};
    const isSelected = selectedLocation?.id === (props.tile_id || props.id);

    let color = '#f97316';
    let fillColor = '#f97316';
    let fillOpacity = isSelected ? 0.85 : 0.6;

    if (activeLayer === 'risk') {
      const riskInfo = getRiskStyle(props.risk_score, props.risk_level);
      fillColor = riskInfo.fillColor;
      color = isSelected ? '#ffffff' : riskInfo.borderColor;
    } else if (activeLayer === 'surface') {
      const s = props.surface_temp_c || 50;
      if (s >= 62) fillColor = '#e11d48';
      else if (s >= 56) fillColor = '#f43f5e';
      else if (s >= 50) fillColor = '#f97316';
      else if (s >= 44) fillColor = '#fbbf24';
      else fillColor = '#06b6d4';
      color = isSelected ? '#ffffff' : fillColor;
    } else {
      // Ambient
      const a = props.ambient_temp_c || props.tcm || 38;
      if (a >= 45) fillColor = '#e11d48';
      else if (a >= 42) fillColor = '#f97316';
      else if (a >= 38) fillColor = '#fbbf24';
      else fillColor = '#10b981';
      color = isSelected ? '#ffffff' : fillColor;
    }

    return {
      color: color,
      fillColor: fillColor,
      fillOpacity: fillOpacity,
      weight: isSelected ? 3.5 : 2,
      dashArray: isSelected ? '4, 4' : null
    };
  };

  const handleFeatureClick = (feature) => {
    const props = feature.properties || {};
    const coords = feature.geometry?.coordinates?.[0] || [];
    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const centroidLat = lats.length ? lats.reduce((a, b) => a + b, 0) / lats.length : city?.lat || 33.4484;
    const centroidLng = lons.length ? lons.reduce((a, b) => a + b, 0) / lons.length : city?.lng || -112.0740;

    const locObj = {
      id: props.tile_id || props.id || 'cell-selected',
      name: props.name || `Thermal Grid Cell (${props.tile_id || 'Zone'})`,
      centroid: { latitude: centroidLat, longitude: centroidLng },
      ambient_c: props.ambient_temp_c || props.tcm || 42.0,
      surface_c: props.surface_temp_c || 58.0,
      persistence_hours: props.persistence_hours || 7.5,
      exceedance_hours: props.exceedance_hours || 4.5,
      risk_score: props.risk_score || 82,
      risk_level: props.risk_level || 'Very High',
      canopy_cover_pct: props.canopy_cover_pct || 8.0,
      primary_risk_factors: [
        `Ambient air heat: ${props.ambient_temp_c || props.tcm || 42}°C`,
        `Surface heat trap: ${props.surface_temp_c || 58}°C (+${((props.surface_temp_c || 58) - (props.ambient_temp_c || 42)).toFixed(1)}°C delta)`,
        `${props.persistence_hours || 7.5} consecutive hours > 35°C`
      ],
      action_guidance: 'Deploy canopy shade; enforce strict hydration intervals for field personnel.'
    };

    onSelectLocation && onSelectLocation(locObj);
  };

  const features = geoJsonData?.features || [];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl mb-6 relative overflow-hidden">
      
      {/* Map Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <span>Interactive Hyperlocal Heat Map</span>
              <span className="text-xs font-mono font-normal text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                GET /api/heatmap
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              FortyGuard High-Resolution GeoJSON Grids with Click-to-Inspect Risk Analytics
            </p>
          </div>
        </div>

        {/* Visual Layer Selector */}
        <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveLayer('risk')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeLayer === 'risk'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Operational Risk
          </button>
          <button
            onClick={() => setActiveLayer('surface')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeLayer === 'surface'
                ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Radiant Surface
          </button>
          <button
            onClick={() => setActiveLayer('ambient')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeLayer === 'ambient'
                ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ambient Air (TCM)
          </button>
        </div>
      </div>

      {/* Main Map Container + Selected Location Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Leaflet Canvas (2 columns on lg) */}
        <div className="lg:col-span-2 h-96 sm:h-[420px] rounded-xl overflow-hidden border border-slate-800 relative z-0">
          <MapContainer
            center={center}
            zoom={city?.zoom || 13}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <MapController center={center} zoom={city?.zoom || 13} />
            
            {/* CARTO Dark Matter Basemap */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Render GeoJSON Polygons */}
            {features.map((feature, fIdx) => {
              const positions = getPolygonPositions(feature);
              if (!positions.length) return null;
              const props = feature.properties || {};
              const style = getFeatureStyle(feature);

              return (
                <Polygon
                  key={props.tile_id || fIdx}
                  positions={positions}
                  pathOptions={style}
                  eventHandlers={{
                    click: () => handleFeatureClick(feature)
                  }}
                >
                  <Popup>
                    <div className="p-2 text-slate-100 font-sans text-xs">
                      <div className="flex items-center justify-between mb-1.5 border-b border-slate-700/80 pb-1">
                        <span className="font-bold text-sm text-white">{props.name || props.tile_id}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getRiskStyle(props.risk_score, props.risk_level).badgeBg}`}>
                          {props.risk_level || 'Risk'}
                        </span>
                      </div>
                      <div className="space-y-1 font-mono">
                        <p className="text-orange-400">Ambient Air: <strong>{formatTemp(props.ambient_temp_c || props.tcm)}</strong></p>
                        <p className="text-rose-400">Radiant Surface: <strong>{formatTemp(props.surface_temp_c)}</strong></p>
                        <p className="text-amber-400">Persistence: <strong>{props.persistence_hours || 0} hrs</strong></p>
                        <p className="text-cyan-400">Score: <strong>{props.risk_score || 0} / 100</strong></p>
                      </div>
                      <button
                        onClick={() => handleFeatureClick(feature)}
                        className="mt-2 w-full py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-[11px] font-bold transition-all"
                      >
                        Inspect Location Details →
                      </button>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {/* Render Hotspot Priority Markers */}
            {(hotspots || []).map((spot) => (
              <CircleMarker
                key={spot.id || spot.rank}
                center={[spot.centroid.latitude, spot.centroid.longitude]}
                radius={8}
                pathOptions={{
                  color: spot.rank === 1 ? '#e11d48' : '#f97316',
                  fillColor: spot.rank === 1 ? '#e11d48' : '#f97316',
                  fillOpacity: 0.9,
                  weight: 2.5
                }}
                eventHandlers={{
                  click: () => onSelectLocation && onSelectLocation({
                    ...spot,
                    centroid: spot.centroid
                  })
                }}
              >
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <span className="text-[10px] font-bold text-rose-400 uppercase font-mono">Priority Hotspot #{spot.rank}</span>
                    <h4 className="font-bold text-white text-sm mb-1">{spot.name}</h4>
                    <p className="text-orange-400 font-mono">Ambient: <strong>{formatTemp(spot.ambient_c)}</strong></p>
                    <p className="text-rose-400 font-mono">Surface: <strong>{formatTemp(spot.surface_c)}</strong></p>
                    <p className="text-amber-400 font-mono">Score: <strong>{spot.risk_score} / 100</strong></p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Color Scale Legend */}
          <div className="absolute bottom-3 left-3 z-[1000] glass-panel p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 shadow-xl">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">
              {activeLayer === 'risk' ? 'Risk Severity' : activeLayer === 'surface' ? 'Surface Temp' : 'Ambient Air'}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Low</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Mod</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>High</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>V.High</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Extreme</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Location Risk Information Drawer (1 column on lg) */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 bg-slate-950/80 shadow-xl flex flex-col justify-between">
          {selectedLocation ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {selectedLocation.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {selectedLocation.id || 'Custom Cell'}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRiskStyle(selectedLocation.risk_score, selectedLocation.risk_level).badgeBg}`}>
                  {selectedLocation.risk_level || 'Extreme'}
                </span>
              </div>

              {/* Thermal Delta Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Ambient Air</span>
                  <span className="text-lg font-bold text-white">{formatTemp(selectedLocation.ambient_c)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Radiant Surface</span>
                  <span className="text-lg font-bold text-rose-400">{formatTemp(selectedLocation.surface_c)}</span>
                </div>
              </div>

              {/* Score & Analytics */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">HeatShield Risk Score</span>
                  <span className="font-mono font-bold text-base text-orange-400">{selectedLocation.risk_score ?? 85} / 100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                    style={{ width: `${selectedLocation.risk_score ?? 85}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>Persistence: {selectedLocation.persistence_hours ?? 8.0} hrs</span>
                  <span>Exceedance: {selectedLocation.exceedance_hours ?? 5.0} hrs</span>
                </div>
              </div>

              {/* Primary Risk Drivers */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-mono">
                  Primary Risk Factors:
                </span>
                <div className="space-y-1 text-xs text-slate-300">
                  {(selectedLocation.primary_risk_factors || [
                    'Elevated radiant surface temperature accumulation',
                    'Prolonged persistence (>35°C)',
                    'Deficit in mature canopy shade'
                  ]).slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-start space-x-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-slate-300">
                <strong className="text-emerald-400 block mb-0.5">Recommended Response:</strong>
                <p className="text-[11px] leading-relaxed">
                  {selectedLocation.action_guidance || selectedLocation.recommended_action || 'Enforce shaded rest intervals and continuous hydration monitoring for active personnel.'}
                </p>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-3 text-orange-400">
                <MapPin className="w-6 h-6 animate-bounce" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Click Any Thermal Cell or Hotspot</h4>
              <p className="text-xs text-slate-400 max-w-xs font-mono">
                Select any 80m thermal grid polygon on the map to inspect live FortyGuard temperature delta, persistence, and deterministic risk scores.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Spatial Data: FortyGuard GeoJSON</span>
            <span>API: GET /api/heatmap</span>
          </div>
        </div>

      </div>

    </div>
  );
}
