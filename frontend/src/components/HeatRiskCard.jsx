import React from 'react';
import { ShieldAlert, AlertTriangle, Info, Flame, CheckCircle2, ChevronRight } from 'lucide-react';

export default function HeatRiskCard({ riskData }) {
  const score = riskData?.risk_score ?? 75;
  const level = riskData?.risk_level ?? 'High';
  const factors = riskData?.risk_factors ?? [];
  const metrics = riskData?.contributing_metrics ?? {};

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'Extreme':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          badge: 'bg-rose-500 text-white shadow-rose-500/30',
          gauge: 'text-rose-500',
          border: 'border-rose-500/40',
          glow: 'from-rose-500/20 to-orange-500/5'
        };
      case 'Very High':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          badge: 'bg-orange-500 text-white shadow-orange-500/30',
          gauge: 'text-orange-500',
          border: 'border-orange-500/40',
          glow: 'from-orange-500/20 to-amber-500/5'
        };
      case 'High':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          badge: 'bg-amber-500 text-white shadow-amber-500/30',
          gauge: 'text-amber-500',
          border: 'border-amber-500/40',
          glow: 'from-amber-500/20 to-yellow-500/5'
        };
      case 'Moderate':
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          badge: 'bg-cyan-500 text-white shadow-cyan-500/30',
          gauge: 'text-cyan-500',
          border: 'border-cyan-500/40',
          glow: 'from-cyan-500/20 to-blue-500/5'
        };
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          badge: 'bg-emerald-500 text-white shadow-emerald-500/30',
          gauge: 'text-emerald-500',
          border: 'border-emerald-500/40',
          glow: 'from-emerald-500/20 to-teal-500/5'
        };
    }
  };

  const style = getLevelColor(level);
  const strokeDashoffset = 440 - (440 * score) / 100;

  return (
    <div className={`glass-panel p-6 rounded-2xl border ${style.border} bg-gradient-to-br ${style.glow} shadow-2xl relative overflow-hidden`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">HeatShield Operational Risk</h3>
            <p className="text-xs text-slate-400 font-mono">Deterministic Multi-Factor Scoring</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${style.badge}`}>
          {level} Risk
        </span>
      </div>

      {/* Main Score Display with Circular Gauge */}
      <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-800/70"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`${style.gauge} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-white font-mono tracking-tight">{score}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">/ 100 PTS</span>
          </div>
        </div>

        {/* Breakdown of Contributing Metric Points */}
        <div className="flex-1 w-full space-y-2.5">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300">Ambient & Surface Heat</span>
              <span className="font-mono text-orange-400">{metrics.temperature_points ?? 30.0} / 35</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${((metrics.temperature_points ?? 30) / 35) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300">Persistence Duration (&gt;35°C)</span>
              <span className="font-mono text-amber-400">{metrics.persistence_points ?? 18.0} / 20</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${((metrics.persistence_points ?? 18) / 20) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300">Critical Exceedance (&gt;38°C)</span>
              <span className="font-mono text-rose-400">{metrics.exceedance_points ?? 14.0} / 15</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${((metrics.exceedance_points ?? 14) / 15) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300">Forecast Peak Alignment</span>
              <span className="font-mono text-cyan-400">{metrics.forecast_points ?? 12.0} / 15</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${((metrics.forecast_points ?? 12) / 15) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Risk Factors */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 font-mono">
          Primary Risk Drivers:
        </span>
        <div className="space-y-1.5">
          {factors.slice(0, 3).map((factor, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
              <ChevronRight className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology Disclaimer */}
      <p className="text-[10px] text-slate-500 font-mono mt-4 pt-2 border-t border-slate-800/60 leading-tight">
        * HeatShield Operational Risk Score is a deterministic decision-support heuristic for operational planning and is not a medically validated health index.
      </p>

    </div>
  );
}
