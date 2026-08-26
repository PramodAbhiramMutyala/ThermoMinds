import React, { useState } from 'react';
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
import { CITIES, MOCK_DASHBOARD_DATA } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'hotspots' | 'copilot'
  const [selectedCityId, setSelectedCityId] = useState('phoenix');
  const [tempUnit, setTempUnit] = useState('C');
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  const selectedCity = CITIES.find((c) => c.id === selectedCityId) || CITIES[0];
  const cityData = MOCK_DASHBOARD_DATA[selectedCityId] || MOCK_DASHBOARD_DATA.phoenix;

  const handleSelectHotspot = (hotspot) => {
    setSelectedHotspot(hotspot);
  };

  const handleSelectZone = (zone) => {
    console.log('Selected thermal zone:', zone);
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
        
        {/* 1. Location Selector (Always Available) */}
        <LocationSelector
          selectedCityId={selectedCityId}
          onSelectCity={(id) => {
            setSelectedCityId(id);
            setSelectedHotspot(null);
          }}
          tempUnit={tempUnit}
          setTempUnit={setTempUnit}
        />

        {/* Tab 1: Live Heat Intelligence (Main Dashboard) */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            
            {/* Top Row 4-Cards Grid: Heat Risk, Temperature, Persistence, Exceedance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <HeatRiskCard riskData={cityData.risk} />
              <TemperatureCard tempData={cityData.temperature} tempUnit={tempUnit} />
              <PersistenceCard persistenceData={cityData.persistence} />
              <ExceedanceCard exceedanceData={cityData.exceedance} />
            </div>

            {/* 2. Interactive Heat Map */}
            <InteractiveHeatMap
              city={selectedCity}
              mapZones={cityData.map_zones}
              selectedHotspot={selectedHotspot}
              onSelectZone={handleSelectZone}
              tempUnit={tempUnit}
            />

            {/* 7. Diurnal Heat-Risk Timeline */}
            <HeatRiskTimeline
              timelineData={cityData.timeline}
              tempUnit={tempUnit}
            />

            {/* Bottom Row: Top Hotspots & AI Assistant Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 8. Top Hotspots */}
              <TopHotspotsTable
                hotspots={cityData.hotspots}
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
                  {cityData.hotspots.length} Active Hotspots
                </span>
              </div>

              <InteractiveHeatMap
                city={selectedCity}
                mapZones={cityData.map_zones}
                selectedHotspot={selectedHotspot}
                onSelectZone={handleSelectZone}
                tempUnit={tempUnit}
              />
            </div>

            <TopHotspotsTable
              hotspots={cityData.hotspots}
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
