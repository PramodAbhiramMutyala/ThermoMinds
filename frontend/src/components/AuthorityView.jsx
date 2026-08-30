import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sliders, 
  Trees, 
  Paintbrush, 
  Droplet, 
  Sparkles, 
  TrendingDown, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw,
  Send,
  ChevronRight,
  Sun,
  Flame,
  Activity,
  Wind
} from 'lucide-react';
import { simulateMitigation } from '../services/api';
import DataSourceBadge from './DataSourceBadge';

export default function AuthorityView({ city = 'Phoenix', hotspots = [], onSelectZone, selectedZone }) {
  const activeZoneId = selectedZone?.id || (hotspots.length > 0 ? (hotspots[0].hotspot_id || hotspots[0].id) : 'phx-zone-1');
  
  const [canopyPct, setCanopyPct] = useState(25);
  const [albedoPct, setAlbedoPct] = useState(15);
  const [mistingPct, setMistingPct] = useState(10);
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [strategyDeployed, setStrategyDeployed] = useState(false);

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

  const handleReset = () => {
    setCanopyPct(0);
    setAlbedoPct(0);
    setMistingPct(0);
  };

  const handleDeploy = () => {
    setStrategyDeployed(true);
    setTimeout(() => setStrategyDeployed(false), 3000);
  };

  const deltaAmbient = simResult?.delta_ambient_temp_c || Math.round((canopyPct * 0.08 + albedoPct * 0.04 + mistingPct * 0.06) * 10) / 10 || 3.2;
  const deltaSurface = simResult?.delta_surface_temp_c || Math.round((canopyPct * 0.22 + albedoPct * 0.28 + mistingPct * 0.08) * 10) / 10 || 9.5;
  const baselineScore = simResult?.baseline_heatshield_score || 84;
  const projectedScore = simResult?.projected_heatshield_score || Math.max(35, Math.round(baselineScore - (deltaAmbient * 4 + deltaSurface * 1.5)));
  const residentsRelieved = simResult?.vulnerable_residents_relieved || 14200;

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-widest">
              Simulation Mode
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
              SYS: ONLINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display">
            Urban Mitigation Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Adjust physical microclimate cooling interventions in real-time to calculate projected thermal relief across {city} sectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-full text-xs font-mono font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Params
          </button>
          <button 
            onClick={handleDeploy}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2 rounded-full text-xs font-mono font-black transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
          >
            <Send className="w-3.5 h-3.5" />
            {strategyDeployed ? 'Strategy Deployed!' : 'Deploy Strategy'}
          </button>
        </div>
      </div>

      {/* Bento Grid Layout (4 cols left controls, 8 cols right outputs) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Intervention Controls (Spans 4 cols on desktop) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/70 p-6 flex flex-col h-full shadow-2xl backdrop-blur-2xl">
            
            <div className="border-b border-slate-800/80 pb-4 mb-6 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                Intervention Levers
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                ACTIVE
              </span>
            </div>

            <div className="flex flex-col gap-6 flex-1 justify-around">
              
              {/* Slider 1: Tree Canopy Expansion */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                    <Trees className="w-4 h-4 text-emerald-400" />
                    Tree Canopy Exp.
                  </label>
                  <span className="font-mono text-base font-black text-emerald-400">
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
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Baseline (0%)</span>
                  <span>Max (50%)</span>
                </div>
              </div>

              {/* Slider 2: Cool Roofs / Albedo */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                    <Paintbrush className="w-4 h-4 text-amber-400" />
                    Cool Roofs / Albedo
                  </label>
                  <span className="font-mono text-base font-black text-amber-400">
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Baseline (0%)</span>
                  <span>Max (50%)</span>
                </div>
              </div>

              {/* Slider 3: Smart Misting Cannons */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-cyan-400" />
                    Smart Misting Cannons
                  </label>
                  <span className="font-mono text-base font-black text-cyan-400">
                    +{mistingPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={mistingPct}
                  onChange={(e) => setMistingPct(e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Baseline (0%)</span>
                  <span>Max (30%)</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Visual Outputs & Impact Metrics (Spans 8 cols on desktop) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Tactical Map Simulation Area */}
          <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/80 overflow-hidden relative h-[260px] sm:h-[320px] shadow-2xl flex items-center justify-center backdrop-blur-2xl">
            
            {/* Cyber Grid Background Pattern */}
            <div className="absolute inset-0 bg-climate-mesh opacity-50"></div>

            {/* Radar Simulation Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full border border-cyan-500/20 animate-ping opacity-30"></div>
              <div className="w-48 h-48 rounded-full border border-cyan-500/40"></div>
            </div>

            {/* Simulated Hotspot A Marker */}
            <div className="absolute top-1/3 left-1/4 flex flex-col items-center">
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </div>
              <span className="mt-1 font-mono text-[9px] font-bold text-rose-400 bg-slate-950/90 px-1.5 py-0.5 rounded border border-rose-500/30">
                HOTSPOT_ALPHA (61.2°C)
              </span>
            </div>

            {/* Simulated Active Mitigation Zone with Rotating Canopy Shield */}
            <div className="absolute top-1/2 right-1/4 w-36 h-36 border-2 border-dashed border-emerald-500/50 rounded-full bg-emerald-500/10 flex flex-col items-center justify-center animate-[spin_20s_linear_infinite]">
              <div className="w-20 h-20 border border-emerald-400/60 rounded-full animate-ping opacity-40"></div>
            </div>
            
            <div className="absolute top-1/2 right-1/4 flex flex-col items-center pointer-events-none">
              <Trees className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] font-bold text-emerald-300 bg-slate-950/90 px-2 py-0.5 rounded border border-emerald-500/30 mt-1">
                COOLING_SECTOR (-{deltaSurface}°C)
              </span>
            </div>

            {/* Live Telemetry Overlay Pill */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="bg-slate-950/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono text-[11px] text-slate-300">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                <span>LIVE TELEMETRY MODEL &bull; {city}</span>
              </div>
            </div>

          </div>

          {/* 3 Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Metric Card 1: Ambient Temp Drop */}
            <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/70 p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-colors shadow-xl">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-cyan-400" />
                  Projected Temp Drop
                </span>
                <span className="text-[10px] font-mono text-slate-500">01</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-cyan-400 font-display">
                  -{deltaAmbient}°C
                </span>
                <TrendingDown className="w-4 h-4 text-cyan-400 mb-1" />
              </div>
            </div>

            {/* Metric Card 2: Surface Heat Drop */}
            <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/70 p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors shadow-xl">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Trees className="w-4 h-4 text-emerald-400" />
                  Surface Heat Drop
                </span>
                <span className="text-[10px] font-mono text-slate-500">02</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-400 font-display">
                  -{deltaSurface}°C
                </span>
                <TrendingDown className="w-4 h-4 text-emerald-400 mb-1" />
              </div>
            </div>

            {/* Metric Card 3: Risk Score Change */}
            <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/70 p-5 flex flex-col justify-between hover:border-amber-500/40 transition-colors shadow-xl">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Risk Score Change
                </span>
                <span className="text-[10px] font-mono text-slate-500">03</span>
              </div>
              <div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xl font-bold text-rose-400 line-through opacity-75">{baselineScore}</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="text-2xl font-black text-amber-400 font-display">{projectedScore}</span>
                </div>
                <div className="flex gap-2 font-mono text-[10px] mt-1">
                  <span className="text-rose-400 font-bold">Extreme</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="text-amber-400 font-bold">Moderate</span>
                </div>
              </div>
            </div>

          </div>

          {/* Population Impact Banner */}
          <div className="glass-panel rounded-3xl border border-slate-800 border-l-4 border-l-cyan-400 bg-slate-950/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 text-cyan-400 shrink-0 shadow-md shadow-cyan-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[11px] font-mono uppercase text-slate-400">
                  Estimated Population Impact
                </h4>
                <p className="text-xl font-extrabold text-slate-100 font-display">
                  {residentsRelieved.toLocaleString()} <span className="text-cyan-400 font-normal text-sm">Residents Protected</span>
                </p>
              </div>
            </div>

            <button className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold hover:text-white transition-colors bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 hover:border-cyan-500/40">
              <span>View Demographics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
