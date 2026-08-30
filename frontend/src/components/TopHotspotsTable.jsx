import React from 'react';
import { MapPin, AlertTriangle, ShieldCheck, Flame, ArrowUpRight, Users, Clock } from 'lucide-react';

export default function TopHotspotsTable({ hotspots, onSelectHotspot, tempUnit = 'C' }) {
  const isCelsius = tempUnit === 'C';
  const formatTemp = (cVal) => {
    if (cVal === undefined || cVal === null) return '--';
    return isCelsius ? `${Number(cVal).toFixed(1)}°C` : `${((Number(cVal) * 9) / 5 + 32).toFixed(1)}°F`;
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-rose-500 text-white shadow-md shadow-rose-500/30';
      case 2:
        return 'bg-orange-500 text-white shadow-md shadow-orange-500/30';
      case 3:
        return 'bg-amber-500 text-white shadow-md shadow-amber-500/30';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xl mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Priority Thermal Hotspots
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Ranked Microclimate Danger Zones
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {hotspots?.length || 0} Critical Zones Identified
        </span>
      </div>

      {/* Grid of Hotspots Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(hotspots || []).map((spot, idx) => {
          const amb = spot.ambient_c ?? spot.temperature?.ambient_c ?? spot.ambient_temp_c ?? 44.2;
          const surf = spot.surface_c ?? spot.temperature?.surface_c ?? spot.surface_temp_c ?? 60.5;
          const persist = spot.persistence_hours ?? spot.persistence ?? 6.5;
          const rank = spot.rank || (idx + 1);
          const score = spot.risk_score || 88;
          const level = spot.risk_level || 'Extreme';

          return (
            <div
              key={spot.hotspot_id || spot.id || idx}
              onClick={() => onSelectHotspot && onSelectHotspot(spot)}
              className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-slate-100 dark:hover:bg-slate-900/80 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                {/* Card Top Row: Rank & Name */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-mono font-bold shrink-0 ${getRankBadge(rank)}`}>
                      #{rank}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {spot.name || `Sector Zone #${rank}`}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {spot.category || 'High-Risk Urban Sector'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold font-mono text-rose-500 dark:text-rose-400">
                      {score} <span className="text-[10px] text-slate-400">/100</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-rose-500 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      {level}
                    </span>
                  </div>
                </div>

                {/* Thermal Delta Stats */}
                <div className="grid grid-cols-3 gap-2 my-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 text-xs font-mono shadow-inner">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Ambient</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatTemp(amb)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Surface</span>
                    <span className="font-bold text-rose-500 dark:text-rose-400">{formatTemp(surf)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Persistence</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{persist}h &gt;35°</span>
                  </div>
                </div>

                {/* Risk Factors Chips */}
                <div className="flex flex-wrap gap-1.5 my-2">
                  {(spot.primary_risk_factors || [
                    `Radiant surface heat (${formatTemp(surf)})`,
                    `High ambient temperature (${formatTemp(amb)})`,
                    `Prolonged persistence (${persist}h > 35°C)`
                  ]).map((factor, fIdx) => (
                    <span
                      key={fIdx}
                      className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/50 font-mono"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/60 text-xs flex items-start space-x-1.5 text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  <strong className="text-emerald-600 dark:text-emerald-300 font-bold">Action:</strong> {spot.recommended_action || 'Enforce shaded canopy transit and mandatory 15m/45m work-rest hydration cycles.'}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
