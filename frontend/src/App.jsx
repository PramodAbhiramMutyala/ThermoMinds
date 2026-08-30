import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LocationSelector from './components/LocationSelector';
import DiurnalScrubber from './components/DiurnalScrubber';
import SelectedLocationDashboard from './components/SelectedLocationDashboard';
import InteractiveHeatMap from './components/InteractiveHeatMap';
import PersonaRecommendationView from './components/PersonaRecommendationView';
import AuthorityView from './components/AuthorityView';
import HeatRiskTimeline from './components/HeatRiskTimeline';
import TopHotspotsTable from './components/TopHotspotsTable';
import AiCopilot from './components/AiCopilot';
import CorrelationView from './components/CorrelationView';
import { CITIES, MOCK_DASHBOARD_DATA } from './data/mockData';
import { fetchHeatmapGeoJSON, fetchHotspots } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'hubs' | 'simulator' | 'hotspots' | 'copilot' | 'correlation'
  const [selectedCityId, setSelectedCityId] = useState('phoenix');
  const [currentHour, setCurrentHour] = useState(14);
  const [tempUnit, setTempUnit] = useState('C');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [apiHotspots, setApiHotspots] = useState(null);

  // Light / Dark Theme State with LocalStorage persistence
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('heatshield_theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('heatshield_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#05070c] text-slate-900 dark:text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 bg-climate-mesh pb-24 md:pb-8 transition-colors duration-300">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCity={selectedCity}
        cities={CITIES}
        onSelectCity={(id) => {
          setSelectedCityId(id);
          setSelectedLocation(null);
        }}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Tab 1: Live Mission Control Command Center */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            
            {/* 1. Hero Selected Location Mission Control Dashboard */}
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

            {/* 2. Interactive Vector Heat Map */}
            <InteractiveHeatMap
              city={selectedCity}
              geoJsonData={geoJsonData}
              hotspots={apiHotspots || cityData.hotspots}
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              tempUnit={tempUnit}
            />

            {/* 3. Diurnal Cycle Interactive Scrubber (Peak Heat Window 12:00 - 16:30) */}
            <DiurnalScrubber
              currentHour={currentHour}
              onHourChange={setCurrentHour}
            />

            {/* 4. Diurnal Heat-Risk Timeline */}
            <HeatRiskTimeline
              timelineData={cityData.timeline}
              tempUnit={tempUnit}
            />

            {/* 5. Top Hotspots Table */}
            <TopHotspotsTable
              hotspots={apiHotspots || cityData.hotspots}
              onSelectHotspot={handleSelectHotspot}
              tempUnit={tempUnit}
            />

          </div>
        )}

        {/* Tab 2: Operational Safety & Action Hubs (Persona Switching) */}
        {activeTab === 'hubs' && (
          <div className="space-y-6">
            <PersonaRecommendationView
              selectedLocation={selectedLocation}
              cityData={cityData}
              selectedCity={selectedCity}
              tempUnit={tempUnit}
            />
          </div>
        )}

        {/* Tab 3: Urban Heat Mitigation Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <AuthorityView
              city={selectedCity.name}
              hotspots={apiHotspots || cityData.hotspots}
              selectedZone={selectedLocation || cityData.location}
            />
          </div>
        )}

        {/* Tab 4: Hotspots Deep-Dive Registry */}
        {activeTab === 'hotspots' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 bg-slate-950/70 shadow-2xl backdrop-blur-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
                    Autonomous Hotspot Intelligence & Vulnerability Registry
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Prioritizing immediate municipal & workplace mitigation interventions across {selectedCity.name}
                  </p>
                </div>
                <span className="px-3.5 py-1 text-xs font-bold font-mono rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/30">
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

        {/* Tab 5: Agentic AI Copilot & Autonomous Trace Feed */}
        {activeTab === 'copilot' && (
          <div className="space-y-6">
            <AiCopilot
              city={selectedCity.name}
              activePersona="worker"
              activeZone={selectedLocation || cityData.location}
            />
          </div>
        )}

        {/* Tab 6: Scientific Data Correlation Engine */}
        {activeTab === 'correlation' && (
          <div className="space-y-6">
            <CorrelationView city={selectedCity.name} />
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 shadow-2xl rounded-t-2xl">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'live'
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span>🛰️</span>
          <span className="text-[10px] mt-0.5">Mission</span>
        </button>

        <button
          onClick={() => setActiveTab('hubs')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'hubs'
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span>👥</span>
          <span className="text-[10px] mt-0.5">Hubs</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'simulator'
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span>🎛️</span>
          <span className="text-[10px] mt-0.5">Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('hotspots')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'hotspots'
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span>🔥</span>
          <span className="text-[10px] mt-0.5">Hotspots</span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'copilot'
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span>🤖</span>
          <span className="text-[10px] mt-0.5">Copilot</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-[#05070c] py-8 text-center text-xs text-slate-500 font-mono mt-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-slate-700 dark:text-slate-400 font-bold font-display text-sm">
            HeatShield AI &bull; Hyperlocal Heat Risk & Decision Support
          </p>
          <p className="text-slate-500 dark:text-slate-600">
            Powered by FortyGuard Street-Level Temperature Intelligence &bull; FortyGuard Global AI Hackathon 2026
          </p>
        </div>
      </footer>

    </div>
  );
}
