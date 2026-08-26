import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LocationSelector from './components/LocationSelector';
import DiurnalScrubber from './components/DiurnalScrubber';
import SelectedLocationDashboard from './components/SelectedLocationDashboard';
import InteractiveHeatMap from './components/InteractiveHeatMap';
import HeatRiskCard from './components/HeatRiskCard';
import TemperatureCard from './components/TemperatureCard';
import PersistenceCard from './components/PersistenceCard';
import ExceedanceCard from './components/ExceedanceCard';
import PersonaRecommendationView from './components/PersonaRecommendationView';
import HeatRiskTimeline from './components/HeatRiskTimeline';
import TopHotspotsTable from './components/TopHotspotsTable';
import AiAssistantPanel from './components/AiAssistantPanel';
import { CITIES, MOCK_DASHBOARD_DATA } from './data/mockData';
import { fetchHeatmapGeoJSON, fetchHotspots, fetchLocationSummary } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'hotspots' | 'copilot'
  const [selectedCityId, setSelectedCityId] = useState('phoenix');
  const [currentHour, setCurrentHour] = useState(14);
  const [tempUnit, setTempUnit] = useState('C');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [apiHotspots, setApiHotspots] = useState(null);

  const selectedCity = CITIES.find((c) => c.id === selectedCityId) || CITIES[0];
  const cityData = MOCK_DASHBOARD_DATA[selectedCityId] || MOCK_DASHBOARD_DATA.phoenix;

  // Diurnal sinusoidal temperature factor relative to 14:00 peak
  const diurnalFactor = Math.sin(((currentHour - 7) / 24) * 2 * Math.PI);
  const ambientOffset = Math.round((diurnalFactor * 4.2 - 2.0) * 10) / 10;
  const surfaceOffset = Math.round((diurnalFactor * 8.5 - 4.0) * 10) / 10;

  // Adjust temperature and risk values dynamically with the hour scrubber
  const adjustedTempData = {
    ...cityData.temperature,
    ambient_c: Math.round((cityData.temperature.ambient_c + ambientOffset) * 10) / 10,
    surface_c: Math.round((cityData.temperature.surface_c + surfaceOffset) * 10) / 10,
  };

  const adjustedRiskData = {
    ...cityData.risk,
    risk_score: Math.min(100, Math.max(25, Math.round(cityData.risk.risk_score + (diurnalFactor > 0 ? diurnalFactor * 8 : -15))))
  };

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
            setGeoJsonData({
              type: 'FeatureCollection',
              features: cityData.map_zones.map((z) => ({
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [z.coords.map((pt) => [pt[1], pt[0]])]
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
    <div className="min-h-screen bg-[#05070c] text-slate-100 font-sans selection:bg-orange-500/30 selection:text-orange-200 bg-climate-mesh">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCity={selectedCity}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* 1. Sector Selector */}
        <LocationSelector
          selectedCityId={selectedCityId}
          onSelectCity={(id) => {
            setSelectedCityId(id);
            setSelectedLocation(null);
          }}
          tempUnit={tempUnit}
          setTempUnit={setTempUnit}
        />

        {/* 2. Diurnal Cycle Interactive Scrubber */}
        <DiurnalScrubber
          currentHour={currentHour}
          onHourChange={setCurrentHour}
        />

        {/* Tab 1: Live Heat Intelligence (Main Command Center) */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            
            {/* 3. Hero Selected Location Mission Control Dashboard */}
            <SelectedLocationDashboard
              locationData={selectedLocation || {
                id: cityData.location.id,
                name: cityData.location.name,
                ambient_c: adjustedTempData.ambient_c,
                surface_c: adjustedTempData.surface_c,
                risk_score: adjustedRiskData.risk_score,
                risk_level: adjustedRiskData.risk_level,
                persistence_hours: cityData.persistence.continuous_hours,
                exceedance_hours: cityData.exceedance.cumulative_hours,
                primary_risk_factors: cityData.risk.risk_factors
              }}
              riskData={adjustedRiskData}
              tempData={adjustedTempData}
              persistenceData={cityData.persistence}
              exceedanceData={cityData.exceedance}
              tempUnit={tempUnit}
            />

            {/* 4. Interactive Heat Map (Connected to GET /api/heatmap) */}
            <InteractiveHeatMap
              city={selectedCity}
              geoJsonData={geoJsonData}
              hotspots={apiHotspots || cityData.hotspots}
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              tempUnit={tempUnit}
            />

            {/* 5. Targeted Action Priorities by Persona */}
            <PersonaRecommendationView
              selectedLocation={selectedLocation}
              cityData={cityData}
              selectedCity={selectedCity}
            />

            {/* 6. Top Row 4-Cards Grid: Heat Risk, Temperature, Persistence, Exceedance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <HeatRiskCard riskData={adjustedRiskData} />
              <TemperatureCard tempData={adjustedTempData} tempUnit={tempUnit} />
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
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 bg-slate-950/70 shadow-2xl mb-6 backdrop-blur-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                    Autonomous Hotspot Intelligence & Vulnerability Registry
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Prioritizing immediate municipal & workplace mitigation interventions
                  </p>
                </div>
                <span className="px-3.5 py-1 text-xs font-bold font-mono rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
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
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-950/70 shadow-2xl backdrop-blur-2xl">
              <h2 className="text-2xl font-black text-white font-display mb-2">
                Agentic Heat Decision Support System
              </h2>
              <p className="text-xs text-slate-400 font-mono mb-6">
                Empowering Citizens, Occupational Safety Officers, and Municipal Planners with deterministic tool execution
              </p>
              <AiAssistantPanel selectedCity={selectedCity} />
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#05070c] py-8 text-center text-xs text-slate-500 font-mono mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-slate-400 font-bold font-display text-sm">HeatShield AI &bull; Hyperlocal Heat Risk & Action Assistant</p>
          <p className="text-slate-600">
            Powered by FortyGuard Temperature Intelligence | FortyGuard Global AI Hackathon 2026
          </p>
        </div>
      </footer>

    </div>
  );
}
