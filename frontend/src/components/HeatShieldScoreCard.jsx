import React from 'react';
import { AlertTriangle, Thermometer, Clock, ShieldAlert, Trees, SunMedium } from 'lucide-react';

export default function HeatShieldScoreCard({ citySummary, activeZone }) {
  const score = activeZone ? activeZone.heatshield_score : (citySummary?.heatshield_score || 82);
  const riskLevel = activeZone ? activeZone.risk_level : (citySummary?.risk_level || 'Extreme');
  const ambient = activeZone ? activeZone.ambient_temp_c : (citySummary?.current_avg_ambient || 43.5);
  const surface = activeZone ? activeZone.surface_temp_c : (citySummary?.current_avg_surface || 58.2);
  const persistenceHours = activeZone?.consecutive_hours_above_35c || 8.0;
  const exceedanceHours = activeZone?.hours_above_38c || 5.0;

  // Approximate deterministic breakdown for display
  const tempScore = Math.min(35, Math.round((ambient - 28.0) * 1.75 + (surface - 35.0) * 0.35));
  const persistScore = Math.min(25, Math.round(persistenceHours * 2.2));
  const exceedScore = Math.min(20, Math.round(exceedanceHours * 2.8));
  const envScore = Math.max(5, 100 - (tempScore + persistScore + exceedScore) > 20 ? 18 : 12);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'extreme':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/40',
          text: 'text-red-400',
          badge: 'bg-red-500/20 text-red-300 border-red-500/50',
          glow: 'shadow-red-500/20'
        };
      case 'very high':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/40',
          text: 'text-orange-400',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
          glow: 'shadow-orange-500/20'
        };
      case 'high':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          glow: 'shadow-amber-500/20'
        };
      default:
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          glow: 'shadow-emerald-500/20'
        };
    }
  };

  const style = getRiskColor(riskLevel);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
      {/* 1. Main Unified HeatShield Score */}
      <div className={`glass-panel p-4 rounded-2xl border ${style.border} ${style.bg} relative overflow-hidden shadow-lg ${style.glow}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            HeatShield Score
          </span>
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${style.badge}`}>
            {riskLevel}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-4xl sm:text-5xl font-black tracking-tight ${style.text}`}>
            {score}
          </span>
          <span className="text-sm font-semibold text-slate-400">/ 100</span>
        </div>

        <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 leading-relaxed">
          {activeZone ? activeZone.name : `${citySummary?.city_name || 'City'} Metro Area`}
        </p>
      </div>

      {/* 2. Microclimate Temperatures */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-dark-850/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            Microclimate Temps
          </span>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
            FortyGuard
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <div className="text-[10px] text-slate-400">Ambient Air</div>
            <div className="text-2xl font-bold text-amber-300">{ambient}°C</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Radiant Surface</div>
            <div className="text-2xl font-bold text-red-400">{surface}°C</div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
          <span>Surface Delta:</span>
          <span className="font-semibold text-red-300">+{Math.round(surface - ambient)}°C Radiance</span>
        </div>
      </div>

      {/* 3. Heat Exposure & Persistence */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-dark-850/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            Heat Exposure
          </span>
          <span className="text-[10px] font-semibold text-orange-300 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
            {persistenceHours}h Sustained
          </span>
        </div>

        <div className="space-y-1.5 mt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Hours &gt; 35°C:</span>
            <span className="font-bold text-slate-200">{persistenceHours} hrs</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Critical &gt; 38°C:</span>
            <span className="font-bold text-red-400">{exceedanceHours} hrs</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
          <span className="text-amber-400 font-semibold">Exposure = </span>
          <span>Intensity × Duration × Context</span>
        </div>
      </div>

      {/* 4. Score Component Breakdown */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-dark-850/60 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Score Breakdown
          </span>
          <span className="text-[10px] text-slate-500 font-mono">100 Max</span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400 text-[11px]">Temp (35):</span>
            <span className="font-bold text-amber-300">{tempScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-[11px]">Persist (25):</span>
            <span className="font-bold text-orange-300">{persistScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-[11px]">Exceed (20):</span>
            <span className="font-bold text-red-400">{exceedScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-[11px]">Env (20):</span>
            <span className="font-bold text-cyan-300">{envScore}</span>
          </div>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 flex overflow-hidden">
          <div style={{ width: `${(tempScore / 100) * 100}%` }} className="bg-amber-400"></div>
          <div style={{ width: `${(persistScore / 100) * 100}%` }} className="bg-orange-500"></div>
          <div style={{ width: `${(exceedScore / 100) * 100}%` }} className="bg-red-500"></div>
          <div style={{ width: `${(envScore / 100) * 100}%` }} className="bg-cyan-500"></div>
        </div>
      </div>
    </div>
  );
}
