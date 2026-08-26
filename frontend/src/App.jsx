import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LocationSelector from './components/LocationSelector';
import HeatRiskCard from './components/HeatRiskCard';
import TemperatureCard from './components/TemperatureCard';
import PersistenceCard from './components/PersistenceCard';
import ExceedanceCard from './components/ExceedanceCard';
import HeatRiskTimeline from './components/HeatRiskTimeline';
import TopHotspotsTable from './components/TopHotspotsTable';
import InteractiveHeatMap from './components/InteractiveHeatMap';
import AiAssistantPanel from './components/AiAssistantPanel';
import SelectedLocationDashboard from './components/SelectedLocationDashboard';
import { CITIES, MOCK_DASHBOARD_DATA } from './data/mockData';
import { fetchHeatmapGeoJSON, fetchHotspots, fetchLocationSummary } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'hotspots' | 'copilot'
  const [selectedCityId, setSelectedCityId] = useState('phoenix');
  const [tempUnit, setTempUnit] = useState('C');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [apiHotspots, setApiHotspots] = useState(null);

  const selectedCity = CITIES.find((c) => c.id === selectedCityId) || CITIES[0];
  const cityData = MOCK_DASHBOARD_DATA[selectedCityId] || MOCK_DASHBOARD_DATA.phoenix;

  // Load live GeoJSON and hotspots from backend whenever selected city changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [geoRes, spotsRes] = await Promise.all([
          fetchHeatmapGeoJSON(selectedCity.name),
          fetchHotspots(selectedCity.name, 10)
        ]);

        if (isMounted) {
          if (geoRes && geoRes.features) {
            setGeoJsonData(geoRes);
          } else {
            // Local GeoJSON fallback formatted to match FortyGuard specification
            setGeoJsonData({
              type: 'FeatureCollection',
              features: cityData.map_zones.map((z) => ({
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [z.coords.map((pt) => [pt[1], pt[0]])] // [lng, lat]
                },
                properties: {
                  tile_id: z.id,
                  name: z.name,
                  ambient_temp_c: z.temp,
                  surface_temp_c: z.surface,
                  tcm: z.temp,
                  risk_score: z.risk_score,
                  risk_level: z.level,
                  persistence_hours: cityData.persistence.continuous_hours,
                  exceedance_hours: cityData.exceedance.cumulative_hours
                }
              }))
            });
          }

          if (spotsRes && spotsRes.length > 0) {
            setApiHotspots(spotsRes);
          } else {
            setApiHotspots(cityData.hotspots);
          }
        }
      } catch (err) {
        console.warn('Backend load error:', err);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [selectedCityId, selectedCity.name]);

  const handleSelectHotspot = (hotspot) => {
    setSelectedLocation({
      id: hotspot.hotspot_id || hotspot.id,
      name: hotspot.name,
      centroid: hotspot.centroid,
      ambient_c: hotspot.temperature?.ambient_c || hotspot.ambient_c,
      surface_c: hotspot.temperature?.surface_c || hotspot.surface_c,
      persistence_hours: hotspot.persistence_hours,
      exceedance_hours: hotspot.exceedance_hours,
      risk_score: hotspot.risk_score,
      risk_level: hotspot.risk_level,
      primary_risk_factors: hotspot.primary_risk_factors,
      recommended_action: hotspot.recommended_action
    });
  };

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCity={selectedCity}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* 1. Location Selector */}
        <LocationSelector
          selectedCityId={selectedCityId}
          onSelectCity={(id) => {
            setSelectedCityId(id);
            setSelectedLocation(null);
          }}
          tempUnit={tempUnit}
          setTempUnit={setTempUnit}
        />

        {/* Tab 1: Live Heat Intelligence (Main Dashboard) */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            
            {/* Dedicated Selected Location Risk Dashboard */}
            <SelectedLocationDashboard
              locationData={selectedLocation || {
                id: cityData.location.id,
                name: cityData.location.name,
                ambient_c: cityData.temperature.ambient_c,
                surface_c: cityData.temperature.surface_c,
                risk_score: cityData.risk.risk_score,
                risk_level: cityData.risk.risk_level,
                persistence_hours: cityData.persistence.continuous_hours,
                exceedance_hours: cityData.exceedance.cumulative_hours,
                primary_risk_factors: cityData.risk.risk_factors
              }}
              riskData={cityData.risk}
              tempData={cityData.temperature}
              persistenceData={cityData.persistence}
              exceedanceData={cityData.exceedance}
              tempUnit={tempUnit}
            />

            {/* 2. Interactive Heat Map (Connected to GET /api/heatmap) */}
            <InteractiveHeatMap
              city={selectedCity}
              geoJsonData={geoJsonData}
              hotspots={apiHotspots || cityData.hotspots}
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              tempUnit={tempUnit}
            />

            {/* Top Row 4-Cards Grid: Heat Risk, Temperature, Persistence, Exceedance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <HeatRiskCard riskData={cityData.risk} />
              <TemperatureCard tempData={cityData.temperature} tempUnit={tempUnit} />
              <PersistenceCard persistenceData={cityData.persistence} />
              <ExceedanceCard exceedanceData={cityData.exceedance} />
            </div>

            {/* 7. Diurnal Heat-Risk Timeline */}
            <HeatRiskTimeline
              timelineData={cityData.timeline}
              tempUnit={tempUnit}
            />

            {/* Bottom Row: Top Hotspots & AI Assistant Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 8. Top Hotspots */}
              <TopHotspotsTable
                hotspots={apiHotspots || cityData.hotspots}
                onSelectHotspot={handleSelectHotspot}
                tempUnit={tempUnit}
              />

              {/* 9. AI Assistant Panel */}
              <AiAssistantPanel
                selectedCity={selectedCity}
              />
            </div>

          </div>
        )}

        {/* Tab 2: Hotspots Deep-Dive */}
        {activeTab === 'hotspots' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-sans">
                    Autonomous Hotspot Intelligence & Vulnerability Registry
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Prioritizing immediate municipal & workplace mitigation interventions
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-bold font-mono rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {(apiHotspots || cityData.hotspots).length} Active Hotspots
                </span>
              </div>

              <InteractiveHeatMap
                city={selectedCity}
                geoJsonData={geoJsonData}
                hotspots={apiHotspots || cityData.hotspots}
                selectedLocation={selectedLocation}
                onSelectLocation={handleSelectLocation}
                tempUnit={tempUnit}
              />
            </div>

            <TopHotspotsTable
              hotspots={apiHotspots || cityData.hotspots}
              onSelectHotspot={handleSelectHotspot}
              tempUnit={tempUnit}
            />
          </div>
        )}

        {/* Tab 3: AI Copilot & Decision Support */}
        {activeTab === 'copilot' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-2">
                Agentic Heat Decision Support System
              </h2>
              <p className="text-xs text-slate-400 font-mono mb-4">
                Empowering Citizens, Occupational Safety Officers, and Municipal Planners with deterministic tool execution
              </p>
              <AiAssistantPanel selectedCity={selectedCity} />
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>HeatShield AI — Hyperlocal Heat Risk & Action Assistant</p>
          <p className="text-slate-600">
            Powered by FortyGuard Temperature Intelligence | FortyGuard Global AI Hackathon 2026
          </p>
        </div>
      </footer>

    </div>
  );
}
