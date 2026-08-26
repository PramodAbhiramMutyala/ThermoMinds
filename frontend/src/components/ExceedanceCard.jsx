import React from 'react';
import { AlertOctagon, TrendingUp, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

export default function ExceedanceCard({ exceedanceData }) {
  const hours = exceedanceData?.cumulative_hours ?? 6.5;
  const severity = exceedanceData?.severity_index ?? 38.4;
  const alertLevel = exceedanceData?.osha_alert_level ?? 'High Hazard (> 4 hrs > 38°C)';
  const description = exceedanceData?.description ?? 'Cumulative duration exceeding critical physiological limit.';

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl relative overflow-hidden flex flex-col justify-between">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Heat Exceedance</h3>
              <p className="text-xs text-slate-400 font-mono">Critical Threshold &gt; 38°C Accumulation</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            FortyGuard Analytic
          </span>
        </div>

        {/* Big Exceedance Stat */}
        <div className="grid grid-cols-2 gap-3 my-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div>
            <div className="text-xs text-slate-400 font-medium mb-1">Cumulative Exceedance</div>
            <div className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
              {hours} <span className="text-sm font-semibold text-slate-400 font-sans">Hrs</span>
            </div>
            <div className="text-[11px] text-rose-300/80 font-mono mt-0.5">&gt; 38°C Exposure Window</div>
          </div>

          <div className="border-l border-slate-800/80 pl-3">
            <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
              <span>Severity Index</span>
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {severity}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Hours × Temperature Delta</div>
          </div>
        </div>
      </div>

      {/* Hazard Advisory & Disclaimer */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold text-rose-200">{alertLevel}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {description}
        </p>
        <p className="text-[10px] text-slate-500 font-mono leading-tight">
          * Heat risk thresholds reflect empirical microclimate analytics and do not constitute an official OSHA determination.
        </p>
      </div>

    </div>
  );
}
