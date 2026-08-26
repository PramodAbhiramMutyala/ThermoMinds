import React from 'react';
import { MapPin, Globe, Compass, Sparkles, Navigation, Layers } from 'lucide-react';
import { CITIES } from '../data/mockData';

export default function LocationSelector({ selectedCityId, onSelectCity, tempUnit, setTempUnit }) {
  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/80 bg-slate-950/60 shadow-xl mb-6 backdrop-blur-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* City Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono uppercase tracking-widest mr-1">
            <Globe className="w-4 h-4 text-orange-400" />
            <span>Sector:</span>
          </div>

          {CITIES.map((city) => {
            const isSelected = selectedCityId === city.id;
            return (
              <button
                key={city.id}
                onClick={() => onSelectCity(city.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/80 text-orange-200 shadow-md shadow-orange-500/15 scale-[1.02]'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400 fill-orange-400/20' : 'text-slate-500'}`} />
                <span className="font-display font-bold tracking-tight text-white">{city.name}</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">({city.region})</span>
              </button>
            );
          })}
        </div>

        {/* Tactical Metadata & Temperature Switcher */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
          
          {/* Spatial Grid Indicator */}
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Grid: <strong className="text-slate-200">80m High-Res</strong></span>
          </div>

          {/* Unit Toggle °C / °F */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-mono shadow-inner">
            <button
              onClick={() => setTempUnit('C')}
              className={`px-3 py-1 rounded-lg font-bold transition-all duration-200 ${
                tempUnit === 'C'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setTempUnit('F')}
              className={`px-3 py-1 rounded-lg font-bold transition-all duration-200 ${
                tempUnit === 'F'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °F
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
