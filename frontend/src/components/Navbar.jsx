import React from 'react';
import { 
  ShieldAlert, 
  Flame, 
  MapPin, 
  Bot, 
  Sliders, 
  Users, 
  BarChart3, 
  Radio, 
  ChevronDown, 
  Sun,
  Moon,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  selectedCity, 
  cities = [], 
  onSelectCity, 
  tempUnit = 'C', 
  setTempUnit,
  theme = 'dark',
  toggleTheme
}) {
  const tabs = [
    { id: 'live', label: 'Mission', fullLabel: 'Mission Control', icon: Flame },
    { id: 'hubs', label: 'Hubs', fullLabel: 'Operational Hubs', icon: Users },
    { id: 'simulator', label: 'Simulator', fullLabel: 'Mitigation Simulator', icon: Sliders },
    { id: 'hotspots', label: 'Hotspots', fullLabel: 'Hotspot Registry', icon: MapPin },
    { id: 'copilot', label: 'AI Copilot', fullLabel: 'Agentic Copilot', icon: Bot },
    { id: 'correlation', label: 'NDVI Data', fullLabel: 'Data Correlation', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/90 bg-[#05070c]/90 backdrop-blur-2xl">
      
      {/* Top Telemetry Ticker Ribbon */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 px-4 py-1 text-[11px] font-mono text-slate-400 flex items-center justify-between overflow-hidden">
        <div className="flex items-center space-x-3 truncate">
          <span className="flex items-center space-x-1.5 text-cyan-400 font-semibold uppercase tracking-wider shrink-0">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>40G Telemetry Live</span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="truncate text-slate-300">
            High-Resolution 80m Microclimate Grid Active &bull; FortyGuard TCM Diurnal Model Synchronized
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-4 shrink-0 text-[10px]">
          <span className="text-emerald-400 flex items-center space-x-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>API: LIVE (18ms)</span>
          </span>
          <span className="text-slate-500 font-mono">SYS: ONLINE</span>
        </div>
      </div>

      {/* Main Navbar Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand Identity */}
          <div 
            onClick={() => setActiveTab('live')}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 shadow-xl shadow-cyan-500/25 p-0.5 border border-cyan-400/40 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-display">
                  HeatShield <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-200 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="hidden xl:inline-block px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                  FortyGuard TCM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Hyperlocal Heat Risk & Decision Support
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/90 p-1 rounded-2xl border border-slate-800/80 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="font-sans">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle, City Selector & °C/°F Unit Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Theme Toggle Button (Light / Dark) */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full border border-slate-800 bg-slate-950/90 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all shadow-sm flex items-center justify-center group"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Light / Dark Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-500" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>
            )}

            {/* °C / °F Unit Toggle */}
            {setTempUnit && (
              <div className="flex bg-slate-950 p-0.5 rounded-full border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setTempUnit('C')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    tempUnit === 'C'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit('F')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    tempUnit === 'F'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  °F
                </button>
              </div>
            )}

            {/* City Dropdown Selector */}
            {cities && cities.length > 0 && onSelectCity && (
              <div className="relative flex items-center bg-surface-container-high px-3 py-1.5 rounded-full border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer group">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
                <select
                  value={selectedCity?.id || 'phoenix'}
                  onChange={(e) => onSelectCity(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-slate-200 focus:outline-none cursor-pointer pr-4 appearance-none"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none -ml-3" />
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
