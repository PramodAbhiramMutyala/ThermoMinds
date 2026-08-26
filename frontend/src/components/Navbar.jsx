import React from 'react';
import { ShieldAlert, Flame, MapPin, Bot, Activity, AlertTriangle, Radio, Sparkles, Compass } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, selectedCity }) {
  const tabs = [
    { id: 'live', label: 'Live Heat Intelligence', icon: Flame },
    { id: 'hotspots', label: 'Hotspots Registry', icon: MapPin },
    { id: 'copilot', label: 'AI Decision Copilot', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/90 bg-[#05070c]/90 backdrop-blur-2xl">
      
      {/* Top Telemetry Ticker Ribbon */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 px-4 py-1 text-[11px] font-mono text-slate-400 flex items-center justify-between overflow-hidden">
        <div className="flex items-center space-x-3 truncate">
          <span className="flex items-center space-x-1.5 text-orange-400 font-semibold uppercase tracking-wider shrink-0">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>40G Telemetry Live</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="truncate text-slate-300">
            High-Resolution 80m Microclimate Grid Active &bull; FortyGuard TCM Diurnal Model Synchronized
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-4 shrink-0 text-[10px]">
          <span className="text-emerald-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>API: HEALTHY (18ms)</span>
          </span>
          <span className="text-slate-500 font-mono">UTC {new Date().toISOString().substring(11, 16)}</span>
        </div>
      </div>

      {/* Main Navbar Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-600 shadow-xl shadow-orange-500/25 p-0.5 border border-orange-400/40">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-orange-400 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-display">
                  HeatShield <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 font-mono shadow-sm shadow-orange-500/20">
                  FortyGuard TCM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Autonomous Hyperlocal Heat Risk & Decision Support System
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/90 p-1 rounded-2xl border border-slate-800/80 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="font-sans">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Regional Alert Pill */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 font-mono shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>{selectedCity?.activeAlert || 'Heatwave Active'}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
