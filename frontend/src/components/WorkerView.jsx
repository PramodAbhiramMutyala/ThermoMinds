import React, { useState, useEffect } from 'react';
import { HardHat, AlertTriangle, Droplets, Clock, ShieldCheck, Info, Sparkles, Activity } from 'lucide-react';
import { fetchWbgtGuidance } from '../services/api';

export default function WorkerView({ city, activeZone }) {
  const [wbgtData, setWbgtData] = useState(null);
  const [loading, setLoading] = useState(false);

  const ambient = activeZone?.ambient_temp_c || 43.5;
  const rh = activeZone?.relative_humidity_pct || 22.0;
  const wind = activeZone?.wind_speed_mps || 1.5;
  const solar = activeZone?.solar_radiation_wm2 || 880.0;

  useEffect(() => {
    loadWbgt();
  }, [activeZone]);

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

  const getFlagDetails = (flag) => {
    switch (flag?.toLowerCase()) {
      case 'black':
        return {
          bg: 'bg-red-950/80',
          border: 'border-red-500/60',
          badge: 'bg-red-600 text-white',
          text: 'text-red-400',
          title: 'BLACK FLAG — EXTREME THERMAL HAZARD'
        };
      case 'red':
        return {
          bg: 'bg-red-900/50',
          border: 'border-red-500/40',
          badge: 'bg-red-500 text-white',
          text: 'text-red-400',
          title: 'RED FLAG — HIGH HEAT HAZARD'
        };
      case 'orange':
        return {
          bg: 'bg-orange-950/60',
          border: 'border-orange-500/40',
          badge: 'bg-orange-500 text-dark-900',
          text: 'text-orange-400',
          title: 'ORANGE FLAG — MODERATE OCCUPATIONAL STRESS'
        };
      case 'yellow':
        return {
          bg: 'bg-amber-950/50',
          border: 'border-amber-500/40',
          badge: 'bg-amber-400 text-dark-900',
          text: 'text-amber-300',
          title: 'YELLOW FLAG — ELEVATED HEAT CAUTION'
        };
      default:
        return {
          bg: 'bg-emerald-950/50',
          border: 'border-emerald-500/40',
          badge: 'bg-emerald-500 text-white',
          text: 'text-emerald-400',
          title: 'GREEN FLAG — STANDARD MONITORING'
        };
    }
  };

  const flagInfo = getFlagDetails(wbgtData?.thermal_flag);

  return (
    <div className="space-y-4">
      {/* 1. WBGT Thermal Flag & Work/Rest Protocol Card */}
      <div className={`glass-panel p-5 rounded-2xl border ${flagInfo.border} ${flagInfo.bg} shadow-xl relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <HardHat className="w-6 h-6 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-100">
                  Occupational Heat Guidance
                </h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${flagInfo.badge}`}>
                  {wbgtData?.thermal_flag || 'High'} Flag
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Site: {activeZone?.name || `${city} Construction Core`}
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 bg-dark-900/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400">Calculated WBGT:</span>
            <span className="font-mono font-black text-xl text-red-400">
              {wbgtData?.wbgt_c || 32.4}°C
            </span>
          </div>
        </div>

        {wbgtData && (
          <div className="space-y-4">
            {/* Work-Rest and Hydration Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-dark-900/70 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Work-Rest Cycle Recommendation
                </span>
                <p className="text-sm font-semibold text-slate-100 leading-snug">
                  {wbgtData.work_rest_recommendation}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-900/70 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  Mandatory Hydration Schedule
                </span>
                <p className="text-sm font-semibold text-slate-100 leading-snug">
                  {wbgtData.hydration_recommendation}
                </p>
              </div>
            </div>

            {/* Scientific Inputs & Assumptions Transparency Box */}
            <div className="p-3.5 rounded-xl bg-dark-900/50 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  Calculation Methodology & Assumptions
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Confidence: {wbgtData.confidence}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                <div>Ambient: <span className="font-bold text-slate-100">{ambient}°C</span></div>
                <div>Relative Humidity: <span className="font-bold text-slate-100">{rh}%</span></div>
                <div>Wind Speed: <span className="font-bold text-slate-100">{wind} m/s</span></div>
                <div>Solar Flux: <span className="font-bold text-slate-100">{solar} W/m²</span></div>
              </div>

              <ul className="text-[10px] text-slate-400 space-y-0.5 pt-1">
                {wbgtData.assumptions.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>

            {/* Explicit Disclaimer */}
            <div className="text-[10px] text-slate-500 italic flex items-center gap-1.5">
              <Info className="w-3 h-3 flex-shrink-0" />
              <span>{wbgtData.disclaimer}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Shift Rescheduling & Heavy Exertion Advisory */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-dark-850/80">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Recommended Shift Re-allocation
          </h4>
          <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Thermal Optimization
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Early Shift (Optimal)</span>
            <div className="font-extrabold text-sm text-slate-100">05:30 – 10:30 AM</div>
            <p className="text-[11px] text-slate-400">Perform heavy concrete, steel rigging, and unshaded roofing.</p>
          </div>

          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1">
            <span className="text-[10px] font-bold text-red-400 uppercase">Hazard Window (Stand Down)</span>
            <div className="font-extrabold text-sm text-red-300">12:00 – 16:30 PM</div>
            <p className="text-[11px] text-slate-400">Halt high-exertion outdoor tasks; rotate into cooled trailers.</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Evening Shift (Managed)</span>
            <div className="font-extrabold text-sm text-slate-100">17:00 – 21:00 PM</div>
            <p className="text-[11px] text-slate-400">Moderate workload with mandatory hydration intervals.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
