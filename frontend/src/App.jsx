import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeatShieldScoreCard from './components/HeatShieldScoreCard';
import TimeSlider from './components/TimeSlider';
import HeatMap from './components/HeatMap';
import CitizenView from './components/CitizenView';
import WorkerView from './components/WorkerView';
import AuthorityView from './components/AuthorityView';
import CorrelationView from './components/CorrelationView';
import AiCopilot from './components/AiCopilot';
import {
  fetchHyperlocalData,
  fetchCitySummary,
  fetchRankedHotspots,
  fetchCoolingCenters
} from './services/api';

export default function App() {
  const [selectedCity, setSelectedCity] = useState('Phoenix');
  const [activePersona, setActivePersona] = useState('citizen');
  const [currentHour, setCurrentHour] = useState(14);
  
  const [citySummary, setCitySummary] = useState(null);
  const [zones, setZones] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [coolingCenters, setCoolingCenters] = useState([]);
  const [activeZone, setActiveZone] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [dataSource, setDataSource] = useState('DEMO - HeatShield Simulation');
  const [loading, setLoading] = useState(true);

  // Load city and temperature data
  useEffect(() => {
    loadCityData();
  }, [selectedCity, currentHour]);

  const loadCityData = async () => {
    try {
      setLoading(true);
      const [tempData, summaryData, rankedData, sheltersData] = await Promise.all([
        fetchHyperlocalData(selectedCity, currentHour),
        fetchCitySummary(selectedCity),
        fetchRankedHotspots(selectedCity, currentHour),
        fetchCoolingCenters(selectedCity)
      ]);

      setZones(tempData.zones || []);
      setCitySummary(summaryData);
      setHotspots(rankedData.hotspots || []);
      setCoolingCenters(sheltersData.cooling_centers || []);
      setDataSource(tempData.data_source || 'DEMO - HeatShield Simulation');

      if (!activeZone && tempData.zones?.length > 0) {
        setActiveZone(tempData.zones[0]);
      } else if (activeZone && tempData.zones) {
        // Refresh active zone with updated diurnal temps
        const match = tempData.zones.find((z) => z.id === activeZone.id);
        if (match) setActiveZone(match);
      }
    } catch (err) {
      console.error('Error loading city data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    setActiveZone(null);
    setActiveRoute(null);
  };

  const handleSelectZone = (zone) => {
    setActiveZone(zone);
  };

  const handleShowRouteOnMap = (routeComparison) => {
    setActiveRoute(routeComparison);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Global Navigation Bar */}
      <Navbar
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
        activePersona={activePersona}
        onPersonaChange={setActivePersona}
        copilotOpen={copilotOpen}
        onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
        dataSource={dataSource}
      />

      {/* 2. Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Unified HeatShield Score Card Strip */}
        <HeatShieldScoreCard
          citySummary={citySummary}
          activeZone={activeZone}
        />

        {/* 24-Hour Diurnal Scrubber Bar */}
        <TimeSlider
          currentHour={currentHour}
          onHourChange={setCurrentHour}
        />

        {/* Primary Interactive Map Area */}
        <div className="h-[460px] w-full rounded-2xl overflow-hidden shadow-2xl">
          <HeatMap
            citySummary={citySummary}
            zones={zones}
            activeZone={activeZone}
            onSelectZone={handleSelectZone}
            coolingCenters={coolingCenters}
            activeRoute={activeRoute}
            dataSource={dataSource}
          />
        </div>

        {/* Persona Specific Specialized Views */}
        <div className="pt-2">
          {activePersona === 'citizen' && (
            <CitizenView
              city={selectedCity}
              baseScore={activeZone?.heatshield_score || citySummary?.heatshield_score}
              onShowRouteOnMap={handleShowRouteOnMap}
            />
          )}

          {activePersona === 'worker' && (
            <WorkerView
              city={selectedCity}
              activeZone={activeZone}
            />
          )}

          {activePersona === 'authority' && (
            <AuthorityView
              city={selectedCity}
              hotspots={hotspots}
              onSelectZone={handleSelectZone}
              selectedZone={activeZone}
            />
          )}

          {activePersona === 'correlation' && (
            <CorrelationView
              city={selectedCity}
            />
          )}
        </div>
      </main>

      {/* 3. Floating Agentic AI Copilot Drawer */}
      <AiCopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        city={selectedCity}
        activePersona={activePersona}
        activeZone={activeZone}
        onTriggerAction={(action) => console.log('Copilot action:', action)}
      />

      {/* 4. Footer with Hackathon & Provenance Notes */}
      <footer className="border-t border-slate-800/80 bg-dark-850 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">
            HeatShield AI • Built for FortyGuard Global AI Hackathon 2026
          </p>
          <p className="text-[11px] text-slate-500">
            Primary Track: <span className="text-amber-400 font-medium">Agentic AI</span> | Secondary Track: <span className="text-cyan-400 font-medium">Data Analysis & Correlation</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
