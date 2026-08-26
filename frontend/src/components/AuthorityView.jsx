import React, { useState, useEffect } from 'react';
import { Building2, Sliders, Trees, Paintbrush, Droplet, Sparkles, TrendingDown, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { simulateMitigation } from '../services/api';
import DataSourceBadge from './DataSourceBadge';

export default function AuthorityView({ city, hotspots = [], onSelectZone, selectedZone }) {
  const activeZoneId = selectedZone?.id || (hotspots.length > 0 ? hotspots[0].id : 'phx-zone-1');
  
  const [canopyPct, setCanopyPct] = useState(25);
  const [albedoPct, setAlbedoPct] = useState(25);
  const [mistingPct, setMistingPct] = useState(15);
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    runSimulation();
  }, [activeZoneId, canopyPct, albedoPct, mistingPct, city]);

  const runSimulation = async () => {
    try {
      setSimulating(true);
      const res = await simulateMitigation(
        {
          zone_id: activeZoneId,
          canopy_increase_pct: parseFloat(canopyPct),
          cool_roof_albedo_pct: parseFloat(albedoPct),
          misting_coverage_pct: parseFloat(mistingPct)
        },
        city
      );
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Marquee Feature: Interactive Urban Mitigation Simulator */}
      <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-dark-850/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-base text-slate-100">
                Urban Heat Mitigation Simulator
              </h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                DEMO • Simulation
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate microclimate cooling interventions and project risk reduction for municipal urban planning.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-300 bg-dark-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
            Target: <span className="text-amber-400">{simResult?.zone_name || 'Selected Hotspot'}</span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Slider 1: Tree Canopy Expansion */}
          <div className="p-3.5 rounded-xl bg-dark-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Trees className="w-4 h-4 text-emerald-400" />
                Tree Canopy Expansion
              </span>
              <span className="font-mono font-black text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                +{canopyPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={canopyPct}
              onChange={(e) => setCanopyPct(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (None)</span>
              <span>25%</span>
              <span>50% (Dense)</span>
            </div>
          </div>

          {/* Slider 2: Cool Roofs / Albedo */}
          <div className="p-3.5 rounded-xl bg-dark-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Paintbrush className="w-4 h-4 text-cyan-400" />
                Cool Roofs & Albedo
              </span>
              <span className="font-mono font-black text-xs text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                +{albedoPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={albedoPct}
              onChange={(e) => setAlbedoPct(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0%</span>
              <span>25%</span>
              <span>50% (High Reflect)</span>
            </div>
          </div>

          {/* Slider 3: Misting Cannons */}
          <div className="p-3.5 rounded-xl bg-dark-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-blue-400" />
                Smart Misting Canopies
              </span>
              <span className="font-mono font-black text-xs text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                +{mistingPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={mistingPct}
              onChange={(e) => setMistingPct(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0%</span>
              <span>25%</span>
              <span>50% (Full Grid)</span>
            </div>
          </div>
        </div>

        {/* Simulation Output Cards */}
        {simResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Projected Ambient Reduction */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-slate-400 font-medium">Ambient Reduction</span>
                <div className="text-2xl font-black text-emerald-400">
                  -{simResult.delta_ambient_temp_c}°C
                </div>
                <div className="text-[11px] text-slate-300">
                  {simResult.baseline_ambient_temp_c}°C → <span className="font-bold text-emerald-300">{simResult.projected_ambient_temp_c}°C</span>
                </div>
              </div>

              {/* Projected Surface Reduction */}
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-[10px] text-slate-400 font-medium">Radiant Surface Drop</span>
                <div className="text-2xl font-black text-cyan-400">
                  -{simResult.delta_surface_temp_c}°C
                </div>
                <div className="text-[11px] text-slate-300">
                  {simResult.baseline_surface_temp_c}°C → <span className="font-bold text-cyan-300">{simResult.projected_surface_temp_c}°C</span>
                </div>
              </div>

              {/* Score Reduction */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[10px] text-slate-400 font-medium">HeatShield Score Drop</span>
                <div className="text-2xl font-black text-amber-400">
                  -{simResult.score_reduction_points} pts
                </div>
                <div className="text-[11px] text-slate-300">
                  {simResult.baseline_heatshield_score} → <span className="font-bold text-amber-300">{simResult.projected_heatshield_score} ({simResult.projected_risk_level})</span>
                </div>
              </div>

              {/* Beneficiaries Relieved */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <span className="text-[10px] text-slate-400 font-medium">Residents Relieved</span>
                <div className="text-2xl font-black text-indigo-400">
                  ~{simResult.vulnerable_residents_relieved.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-300">
                  Across {simResult.estimated_affected_area_km2} km²
                </div>
              </div>
            </div>

            {/* Breakdown Highlights */}
            <div className="p-3 rounded-xl bg-dark-900/50 border border-slate-800 text-xs space-y-1.5">
              <span className="font-bold text-slate-200">Intervention Physics Breakdown:</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {simResult.mitigation_breakdown.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Simulation Disclaimer */}
            <div className="text-[10px] text-slate-500 italic">
              {simResult.disclaimer}
            </div>
          </div>
        )}
      </div>

      {/* 2. Ranked Hotspots Prioritization Matrix */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-dark-850/80">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-400" />
            <h4 className="font-extrabold text-base text-slate-100">
              Microclimate Hotspot Prioritization Ranking
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {hotspots.length} Zones Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2">Zone Name</th>
                <th className="pb-2">HeatShield Score</th>
                <th className="pb-2">Ambient</th>
                <th className="pb-2">Surface</th>
                <th className="pb-2">Persistence (&gt;35°C)</th>
                <th className="pb-2">Night Heat Deficit</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {hotspots.map((h) => {
                const isSelected = h.id === activeZoneId;
                return (
                  <tr
                    key={h.id}
                    className={`hover:bg-dark-700/50 transition-colors ${
                      isSelected ? 'bg-amber-500/10 font-bold text-amber-200' : ''
                    }`}
                  >
                    <td className="py-2.5 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${h.heatshield_score >= 80 ? 'bg-red-400 animate-ping' : 'bg-amber-400'}`}></span>
                      <span>{h.name}</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded font-black text-xs ${
                        h.heatshield_score >= 80 ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {h.heatshield_score} / 100
                      </span>
                    </td>
                    <td className="py-2.5 text-amber-300">{h.ambient_temp_c}°C</td>
                    <td className="py-2.5 text-red-400">{h.surface_temp_c}°C</td>
                    <td className="py-2.5 text-orange-300">{h.consecutive_hours_above_35c} hrs</td>
                    <td className="py-2.5 text-slate-300">+{h.nighttime_cooling_deficit_c}°C</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onSelectZone(h)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-dark-700 hover:bg-amber-500 hover:text-dark-900 border border-slate-600 transition-all"
                      >
                        Select & Simulate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
