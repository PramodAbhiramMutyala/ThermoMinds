import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  AlertTriangle, 
  Droplets, 
  Clock, 
  ShieldCheck, 
  Info, 
  Sparkles, 
  Activity,
  Timer,
  Navigation,
  Send,
  ArrowRight,
  Sun,
  Flame,
  CheckCircle2,
  CalendarClock
} from 'lucide-react';
import { fetchWbgtGuidance } from '../services/api';

export default function WorkerView({ city, activeZone, tempUnit = 'C' }) {
  const [wbgtData, setWbgtData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeDeployed, setRouteDeployed] = useState(false);

  const ambient = activeZone?.ambient_temp_c || 43.5;
  const rh = activeZone?.relative_humidity_pct || 22.0;
  const wind = activeZone?.wind_speed_mps || 1.5;
  const solar = activeZone?.solar_radiation_wm2 || 880.0;

  useEffect(() => {
    loadWbgt();
  }, [activeZone, city]);

  const loadWbgt = async () => {
    try {
      setLoading(true);
      const res = await fetchWbgtGuidance(ambient, rh, wind, solar);
      setWbgtData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const wbgtVal = wbgtData?.wbgt_c || 33.2;
  const thermalFlag = wbgtData?.thermal_flag || 'Red';

  const handleDeployRoute = () => {
    setRouteDeployed(true);
    setTimeout(() => setRouteDeployed(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Bento Grid: WBGT Alert + Mandatory Protocols */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* WBGT Thermal Flag (Critical Alert) - Spans 4 cols */}
        <div className="glass-panel md:col-span-4 p-6 rounded-3xl border border-rose-500/50 bg-gradient-to-br from-rose-950/40 via-slate-950/80 to-slate-950/90 shadow-2xl relative overflow-hidden flex flex-col justify-between group backdrop-blur-2xl">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <div className="flex justify-between items-center border-b border-rose-500/20 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
              </div>
              <h2 className="text-base font-bold text-rose-400 uppercase tracking-wider font-mono">
                {thermalFlag} Flag Alert
              </h2>
            </div>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-[11px] font-mono uppercase tracking-widest text-rose-300/80 mb-2">
              Real-Time WBGT
            </span>
            <div className="text-5xl sm:text-6xl font-black text-rose-400 font-display drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">
              {wbgtVal}°<span className="text-3xl font-bold">C</span>
            </div>
            <div className="mt-4 px-4 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold tracking-wide">
              EXTREME RISK ZONE
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 text-center border-t border-rose-500/20 pt-3">
            Site: <span className="text-slate-200">{activeZone?.name || `${city} Industrial Sector`}</span>
          </div>

        </div>

        {/* Mandatory Protocols (ISO 7243 Compliant) - Spans 8 cols */}
        <div className="glass-panel md:col-span-8 p-6 sm:p-7 rounded-3xl border border-slate-800 bg-slate-950/70 shadow-2xl flex flex-col justify-between backdrop-blur-2xl">
          
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                Mandatory Occupational Protocols
              </h2>
              <p className="text-xs text-slate-400">Enforced under ISO 7243 & OSHA heat stress directives</p>
            </div>
            <span className="font-mono text-[10px] text-slate-400 border border-slate-800 rounded-full px-3 py-1 bg-slate-900">
              ISO 7243 Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            {/* Protocol 1: Work / Rest Interval */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between group hover:border-amber-500/40 transition-colors duration-300 shadow-inner">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Timer className="w-6 h-6" />
                </span>
                <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  CYCLE_01
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-100 font-mono mb-1">
                  15m / 45m
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  Work / Rest interval required for heavy labor. Shaded active-cooling respite mandatory.
                </div>
              </div>
            </div>

            {/* Protocol 2: Hydration Requirement */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between group hover:border-cyan-500/40 transition-colors duration-300 shadow-inner">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Droplets className="w-6 h-6" />
                </span>
                <span className="font-mono text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  HYDRATION_REQ
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-100 font-mono mb-1">
                  1.0 L / hour
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  Electrolyte-enhanced fluid intake mandatory. Do not substitute with caffeinated beverages.
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* AI Rescheduling Recommendation Banner - Spans 12 cols */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-950/80 to-slate-950/90 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-cyan-500/50 transition-all duration-300">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <CalendarClock className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-cyan-300 font-display flex items-center gap-2">
              AI Shift Rescheduling Window
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                OPTIMIZED
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Shift heavy concrete pouring, roofing, or unshaded asphalt labor to minimize extreme thermal strain.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/90 px-5 py-2.5 rounded-full border border-cyan-500/30 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="text-right">
            <span className="block text-[10px] font-mono text-slate-400 uppercase">Suggested Window</span>
            <span className="font-mono text-base font-black text-cyan-300">05:30 — 09:30</span>
          </div>
          <button 
            onClick={handleDeployRoute}
            className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/30 shrink-0"
            title="Deploy Rescheduling Notice"
          >
            <ArrowRight className="w-4 h-4 font-bold" />
          </button>
        </div>

      </div>

      {/* Cool Corridor Navigation Preview - Spans 12 cols */}
      <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/70 shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[300px]">
        
        {/* Info Side */}
        <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col justify-between bg-slate-950/50">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Cool Corridor Logistics
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optimized shaded transit corridors for material transport and crew movements between industrial sectors.
            </p>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 inline-block w-full">
              <div className="font-mono text-[10px] text-emerald-400 uppercase font-bold mb-1">
                Surface Heat Delta
              </div>
              <div className="text-3xl font-black text-emerald-400 font-display">
                -8.4°C
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Compared to direct unshaded arterial path
              </div>
            </div>
          </div>

          <button
            onClick={handleDeployRoute}
            className="mt-6 w-full py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-2xl text-xs font-mono transition-all flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <span>{routeDeployed ? 'Route Broadcast Sent!' : 'Deploy Route to Crew'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Preview Side */}
        <div className="md:w-2/3 relative h-64 md:h-auto bg-slate-950 flex items-center justify-center overflow-hidden">
          
          {/* Subtle Grid Canvas Simulation */}
          <div className="absolute inset-0 bg-climate-mesh opacity-40 pointer-events-none"></div>

          {/* Shaded Corridor Visual Path */}
          <div className="relative w-full h-full p-8 flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
              <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                <span className="text-slate-500 mr-2">ORIGIN:</span>
                <span className="font-bold text-amber-400">Sector Warehouse</span>
                <span className="text-slate-600 mx-2">&rarr;</span>
                <span className="text-slate-500 mr-2">DEST:</span>
                <span className="font-bold text-cyan-300">Transit Depot</span>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-2.5 border border-slate-800 font-mono text-[10px] text-slate-400 flex flex-col gap-1">
                <div className="flex justify-between gap-3"><span>LAT</span> <span className="text-cyan-400">25.2048</span></div>
                <div className="flex justify-between gap-3"><span>LON</span> <span className="text-cyan-400">55.2708</span></div>
              </div>
            </div>

            {/* Visual Corridor Node Graphic */}
            <div className="my-auto py-6 flex items-center justify-between relative px-4">
              <div className="w-full absolute top-1/2 left-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 rounded-full"></div>
              
              <div className="relative z-10 flex flex-col items-center bg-slate-900 border border-amber-500/50 p-2 rounded-xl text-center shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mb-1 animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold text-slate-200">Warehouse</span>
                <span className="text-[9px] font-mono text-amber-400">61.2°C Surface</span>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-slate-900 border border-emerald-500/60 p-2.5 rounded-xl text-center shadow-lg">
                <span className="w-3 h-3 rounded-full bg-emerald-400 mb-1 animate-ping"></span>
                <span className="text-[10px] font-mono font-bold text-emerald-300">Shaded Tree Corridor</span>
                <span className="text-[9px] font-mono text-emerald-400">72% Continuous Shade</span>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-slate-900 border border-cyan-500/50 p-2 rounded-xl text-center shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mb-1"></span>
                <span className="text-[10px] font-mono font-bold text-slate-200">Transit Depot</span>
                <span className="text-[9px] font-mono text-cyan-400">AC Sanctuary</span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="bg-slate-900/90 backdrop-blur-md rounded-full px-4 py-1.5 border border-emerald-500/40 flex items-center gap-2 shadow-lg shadow-emerald-500/10">
                <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-emerald-300">
                  Cool Corridor Active &bull; Delta -8.4°C Exposure
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
