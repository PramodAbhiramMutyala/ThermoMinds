import React from 'react';
import { ShieldAlert, Flame, MapPin, Bot, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, selectedCity }) {
  const tabs = [
    { id: 'live', label: 'Live Heat Intelligence', icon: Flame },
    { id: 'hotspots', label: 'Hotspots', icon: MapPin },
    { id: 'copilot', label: 'AI Copilot', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-600 shadow-lg shadow-orange-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  HeatShield <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  FortyGuard Powered
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Hyperlocal Climate-Tech & Heat Risk Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System Status Badge */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>40G TCM Live</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/30 border border-amber-500/30 text-amber-300 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{selectedCity?.activeAlert || 'Heatwave Active'}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
