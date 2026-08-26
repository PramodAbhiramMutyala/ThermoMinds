import React from 'react';
import { Thermometer, Sun, Wind, Droplets, ArrowUpRight, Gauge, Activity } from 'lucide-react';

export default function TemperatureCard({ tempData, tempUnit = 'C' }) {
  const isCelsius = tempUnit === 'C';
  const formatTemp = (cVal) => {
    if (cVal === undefined || cVal === null) return '--';
    if (isCelsius) return `${cVal.toFixed(1)}°C`;
    return `${((cVal * 9) / 5 + 32).toFixed(1)}°F`;
  };

  const ambient = tempData?.ambient_c ?? 44.8;
  const surface = tempData?.surface_c ?? 61.2;
  const delta = surface - ambient;
  const peak = tempData?.peak_temp_c ?? 46.2;
  const apparent = tempData?.apparent_c ?? 47.6;
  const wetBulb = tempData?.wet_bulb_c ?? 24.2;
  const wbgt = tempData?.wbgt_c ?? 33.1;
  const wbgtFlag = tempData?.wbgt_flag ?? 'Black Flag';
  const humidity = tempData?.humidity_pct ?? 14.0;
  const solar = tempData?.solar_radiation_wm2 ?? 960.0;
  const wind = tempData?.wind_speed_mps ?? 1.4;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl relative overflow-hidden flex flex-col justify-between">
      
      {/* Header & Source Tag */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hyperlocal Temperature</h3>
              <p className="text-xs text-slate-400 font-mono">FortyGuard TCM High-Resolution Grid</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            FortyGuard TCM
          </span>
        </div>

        {/* Ambient vs Surface Temperature Big Stat */}
        <div className="grid grid-cols-2 gap-4 my-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div>
            <div className="text-xs text-slate-400 font-medium mb-1">Ambient Air Temp</div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {formatTemp(ambient)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Peak {formatTemp(peak)} at 15:30</div>
          </div>
          <div className="border-l border-slate-800/80 pl-4">
            <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
              <span>Radiant Surface</span>
              <span className="text-[10px] font-bold text-rose-400 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded">
                +{delta.toFixed(1)}°C Delta
              </span>
            </div>
            <div className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
              {formatTemp(surface)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Tar Roofs / Asphalt Trap</div>
          </div>
        </div>
      </div>

      {/* Environmental Sub-Grid */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Apparent Temp</span>
          </div>
          <span className="text-sm font-bold font-mono text-slate-100">{formatTemp(apparent)}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px]">WBGT Outdoor</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-bold font-mono text-slate-100">{formatTemp(wbgt)}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
              {wbgtFlag}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Wet Bulb</span>
          </div>
          <span className="text-sm font-bold font-mono text-slate-100">{formatTemp(wetBulb)}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <Sun className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[11px]">Solar Flux</span>
          </div>
          <span className="text-sm font-bold font-mono text-slate-100">{solar} W/m²</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">Humidity</span>
          </div>
          <span className="text-sm font-bold font-mono text-slate-100">{humidity}%</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[11px]">Wind Speed</span>
          </div>
          <span className="text-sm font-bold font-mono text-slate-100">{wind} m/s</span>
        </div>
      </div>

    </div>
  );
}
