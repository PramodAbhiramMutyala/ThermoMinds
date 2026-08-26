import React from 'react';
import { Clock, Moon, Flame, ShieldAlert, Sparkles } from 'lucide-react';

export default function PersistenceCard({ persistenceData }) {
  const hours = persistenceData?.continuous_hours ?? 9.5;
  const maxHours = persistenceData?.max_continuous_hours ?? 12.0;
  const nightDeficit = persistenceData?.nighttime_deficit_c ?? 4.8;
  const description = persistenceData?.description ?? 'Thermal inertia maintains elevated heat load.';

  const pct = Math.min(100, Math.round((hours / maxHours) * 100));

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl relative overflow-hidden flex flex-col justify-between">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Heat Persistence</h3>
              <p className="text-xs text-slate-400 font-mono">Continuous Duration &gt; 35°C Threshold</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            FortyGuard Analytic
          </span>
        </div>

        {/* Big Persistence Stat & Visual Bar */}
        <div className="my-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">{hours}</span>
              <span className="text-sm font-semibold text-slate-400 ml-1.5">Hours Consecutive</span>
            </div>
            <span className="text-xs font-mono text-slate-400">{pct}% of Diurnal Cycle</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5">
            <span>0 hrs</span>
            <span>4 hrs (Caution)</span>
            <span>8 hrs (Severe)</span>
            <span>12 hrs (Critical)</span>
          </div>
        </div>
      </div>

      {/* Nocturnal Trap & Description */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="font-medium">Nocturnal Cooling Deficit:</span>
          </div>
          <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            +{nightDeficit}°C Trapped Heat
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          {description}
        </p>
      </div>

    </div>
  );
}
