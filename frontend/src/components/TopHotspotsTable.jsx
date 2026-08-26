import React from 'react';
import { MapPin, AlertTriangle, ShieldCheck, Flame, ArrowUpRight, Users, Clock } from 'lucide-react';

export default function TopHotspotsTable({ hotspots, onSelectHotspot, tempUnit = 'C' }) {
  const isCelsius = tempUnit === 'C';
  const formatTemp = (cVal) => {
    if (!cVal) return '--';
    return isCelsius ? `${cVal.toFixed(1)}°C` : `${((cVal * 9) / 5 + 32).toFixed(1)}°F`;
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
        return 'bg-slate-700 text-slate-200';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Priority Thermal Hotspots</h3>
            <p className="text-xs text-slate-400 font-mono">Ranked Microclimate Danger Zones</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {hotspots?.length || 0} Critical Zones Identified
        </span>
      </div>

      {/* Grid of Hotspots Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(hotspots || []).map((spot) => (
          <div
            key={spot.id}
            onClick={() => onSelectHotspot && onSelectHotspot(spot)}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Card Top Row: Rank & Name */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-mono font-bold shrink-0 ${getRankBadge(spot.rank)}`}>
                    #{spot.rank}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-orange-300 transition-colors">
                      {spot.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">{spot.category}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold font-mono text-rose-400">
                    {spot.risk_score} <span className="text-[10px] text-slate-500">/100</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                    {spot.risk_level}
                  </span>
                </div>
              </div>

              {/* Thermal Delta Stats */}
              <div className="grid grid-cols-3 gap-2 my-2.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Ambient</span>
                  <span className="font-bold text-slate-200">{formatTemp(spot.ambient_c)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Surface</span>
                  <span className="font-bold text-rose-400">{formatTemp(spot.surface_c)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Persistence</span>
                  <span className="font-bold text-amber-400">{spot.persistence_hours}h &gt;35°</span>
                </div>
              </div>

              {/* Risk Factors Chips */}
              <div className="flex flex-wrap gap-1.5 my-2">
                {spot.primary_risk_factors?.map((factor, fIdx) => (
                  <span
                    key={fIdx}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Action */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-xs flex items-start space-x-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-snug"><strong className="text-emerald-300">Action:</strong> {spot.recommended_action}</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
