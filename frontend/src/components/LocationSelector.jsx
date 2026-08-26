import React from 'react';
import { MapPin, Globe, Compass, AlertCircle, Sparkles } from 'lucide-react';
import { CITIES } from '../data/mockData';

export default function LocationSelector({ selectedCityId, onSelectCity, tempUnit, setTempUnit }) {
  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* City Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono uppercase tracking-wider mr-1">
            <Globe className="w-4 h-4 text-orange-400" />
            <span>Region:</span>
          </div>
          {CITIES.map((city) => {
            const isSelected = selectedCityId === city.id;
            return (
              <button
                key={city.id}
                onClick={() => onSelectCity(city.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-orange-500/20 border border-orange-500/60 text-orange-300 shadow-sm shadow-orange-500/10'
                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-slate-500'}`} />
                <span className="font-semibold text-slate-100">{city.name}</span>
                <span className="text-[11px] text-slate-400 font-normal">({city.region})</span>
              </button>
            );
          })}
        </div>

        {/* Location Metadata & Unit Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Resolution: 80m Microclimate Grid</span>
          </div>

          {/* Unit Toggle °C / °F */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setTempUnit('C')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                tempUnit === 'C'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setTempUnit('F')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                tempUnit === 'F'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
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
