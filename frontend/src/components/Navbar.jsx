import React from 'react';
import { Flame, Compass, HardHat, Building2, BarChart3, Bot, ChevronDown } from 'lucide-react';
import DataSourceBadge from './DataSourceBadge';

export default function Navbar({
  selectedCity,
  onCityChange,
  activePersona,
  onPersonaChange,
  copilotOpen,
  onToggleCopilot,
  dataSource
}) {
  const cities = [
    { id: 'Phoenix', label: 'Phoenix, AZ (USA)' },
    { id: 'Dubai', label: 'Dubai (UAE)' },
    { id: 'London', label: 'London (UK)' }
  ];

  const personas = [
    { id: 'citizen', label: 'Citizen', icon: Compass },
    { id: 'worker', label: 'Workforce Safety', icon: HardHat },
    { id: 'authority', label: 'City Authority', icon: Building2 },
    { id: 'correlation', label: 'Data Correlation', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-dark-850/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-red-400 bg-clip-text text-transparent">
                HeatShield AI
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                FortyGuard '26
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Hyperlocal Heat Risk & Action Assistant
            </p>
          </div>
        </div>

        {/* City Selector & Data Source Provenance */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="appearance-none bg-dark-800 text-slate-200 border border-slate-700 hover:border-slate-600 px-3.5 py-1.5 pr-8 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-sm"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="hidden md:block">
            <DataSourceBadge source={dataSource} />
          </div>
        </div>

        {/* Persona Mode Tabs */}
        <div className="hidden lg:flex items-center bg-dark-800/80 p-1 rounded-xl border border-slate-800">
          {personas.map((p) => {
            const Icon = p.icon;
            const isActive = activePersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPersonaChange(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* AI Copilot Toggle Button */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            copilotOpen
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-dark-900 border-amber-400 font-bold shadow-lg shadow-orange-500/20'
              : 'bg-dark-800 text-slate-200 border-slate-700 hover:border-amber-500/50 hover:text-amber-300'
          }`}
        >
          <Bot className={`w-4 h-4 ${copilotOpen ? 'text-dark-900 animate-bounce' : 'text-amber-400'}`} />
          <span>AI Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </div>

      {/* Mobile Persona Tabs */}
      <div className="lg:hidden flex items-center justify-around px-2 py-1.5 bg-dark-900/95 border-t border-slate-800 overflow-x-auto">
        {personas.map((p) => {
          const Icon = p.icon;
          const isActive = activePersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onPersonaChange(p.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400'
              }`}
            >
              <Icon className="w-3 h-3" />
              {p.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
