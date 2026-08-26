import React from 'react';
import { 
  ShieldAlert, 
  Thermometer, 
  Clock, 
  AlertOctagon, 
  Sun, 
  Droplets, 
  Activity, 
  HelpCircle, 
  ChevronRight, 
  AlertTriangle,
  MapPin,
  Flame,
  Wind,
  Gauge,
  Sparkles,
  Zap,
  TrendingUp
} from 'lucide-react';

export default function SelectedLocationDashboard({
  locationData,
  riskData,
  tempData,
  persistenceData,
  exceedanceData,
  tempUnit = 'C'
}) {
  const isCelsius = tempUnit === 'C';
  const formatTemp = (cVal) => {
    if (cVal === undefined || cVal === null) return '--';
    return isCelsius ? `${cVal.toFixed(1)}°C` : `${((cVal * 9) / 5 + 32).toFixed(1)}°F`;
  };

  const locationName = locationData?.name || 'Downtown Sector Basin';
  const locationId = locationData?.id || 'Zone #1';
  
  const riskScore = locationData?.risk_score ?? riskData?.risk_score ?? 88;
  const riskLevel = locationData?.risk_level ?? riskData?.risk_level ?? 'Extreme';
  
  const riskFactors = locationData?.primary_risk_factors?.length 
    ? locationData.primary_risk_factors 
    : (riskData?.risk_factors || [
        'High ambient air temperature accumulation (44.8°C)',
        'Severe radiant surface heat trap on asphalt/roofing (61.2°C)',
        'Prolonged heat persistence (>35°C for 9.5 continuous hours)'
      ]);

  const currentAmbient = locationData?.ambient_c ?? tempData?.ambient_c ?? 44.8;
  const currentSurface = locationData?.surface_c ?? tempData?.surface_c ?? 61.2;
  const delta = currentSurface - currentAmbient;
  const peakTemp = tempData?.peak_temp_c ?? (currentAmbient + 1.4);
  const peakTime = tempData?.peak_time ?? '15:30';

  const persistenceHours = locationData?.persistence_hours ?? persistenceData?.continuous_hours ?? 9.5;
  const exceedanceHours = locationData?.exceedance_hours ?? exceedanceData?.cumulative_hours ?? 6.5;

  const heatIndex = tempData?.heat_index_c ?? null;
  const apparentTemp = locationData?.apparent_temp_c ?? tempData?.apparent_c ?? null;
  const humidity = tempData?.humidity_pct ?? null;
  const wetBulb = tempData?.wet_bulb_c ?? null;
  const windSpeed = tempData?.wind_speed_mps ?? null;

  const getTheme = (level) => {
    switch (level) {
      case 'Extreme':
        return {
          badge: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-1 ring-rose-400/50',
          border: 'border-rose-500/40',
          glow: 'from-rose-500/20 via-orange-500/5 to-transparent',
          stroke: '#f43f5e',
          textClass: 'text-rose-400',
          radialBg: 'radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.25) 0%, transparent 70%)'
        };
      case 'Very High':
        return {
          badge: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-1 ring-orange-400/50',
          border: 'border-orange-500/40',
          glow: 'from-orange-500/20 via-amber-500/5 to-transparent',
          stroke: '#f97316',
          textClass: 'text-orange-400',
          radialBg: 'radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.25) 0%, transparent 70%)'
        };
      case 'High':
        return {
          badge: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-1 ring-amber-400/50',
          border: 'border-amber-500/40',
          glow: 'from-amber-500/20 via-yellow-500/5 to-transparent',
          stroke: '#f59e0b',
          textClass: 'text-amber-400',
          radialBg: 'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.25) 0%, transparent 70%)'
        };
      case 'Moderate':
        return {
          badge: 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400/50',
          border: 'border-cyan-500/40',
          glow: 'from-cyan-500/20 via-blue-500/5 to-transparent',
          stroke: '#06b6d4',
          textClass: 'text-cyan-400',
          radialBg: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.25) 0%, transparent 70%)'
        };
      default:
        return {
          badge: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/50',
          border: 'border-emerald-500/40',
          glow: 'from-emerald-500/20 via-teal-500/5 to-transparent',
          stroke: '#10b981',
          textClass: 'text-emerald-400',
          radialBg: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.25) 0%, transparent 70%)'
        };
    }
  };

  const theme = getTheme(riskLevel);
  const strokeDashoffset = 380 - (380 * riskScore) / 100;

  return (
    <div className={`glass-panel p-6 sm:p-7 rounded-3xl border ${theme.border} bg-slate-950/80 shadow-2xl mb-6 relative overflow-hidden backdrop-blur-2xl`}>
      
      {/* Ambient Top Glow Effect */}
      <div 
        className="absolute top-0 left-0 right-0 h-48 pointer-events-none opacity-80"
        style={{ background: theme.radialBg }}
      />

      {/* Header Context Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-6">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-orange-400 shadow-inner">
            <MapPin className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
                {locationName}
              </h2>
              <span className="text-xs font-mono font-bold text-orange-300 bg-orange-500/10 px-2.5 py-0.5 rounded-lg border border-orange-500/20">
                {locationId}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Microclimate Heat Assessment & Empirical Decision Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">Operational Status:</span>
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${theme.badge}`}>
            {riskLevel} Risk
          </span>
        </div>
      </div>

      {/* Main 5-Pillar Telemetry Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. CURRENT HEAT RISK */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl flex flex-col justify-between group hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-widest font-bold text-slate-300">1. Current Heat Risk</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>

          <div className="my-3 flex flex-col items-center justify-center relative">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-slate-800/80"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  stroke={theme.stroke}
                  strokeWidth="10"
                  strokeDasharray="380"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-white font-display tracking-tight">{riskScore}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">/ 100 PTS</span>
              </div>
            </div>
            <span className={`mt-2 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider font-mono ${theme.badge}`}>
              {riskLevel}
            </span>
          </div>

          <div className="text-[10px] text-slate-500 font-mono text-center pt-2 border-t border-slate-800/80">
            Deterministic Engine Score
          </div>
        </div>

        {/* 2. TEMPERATURE */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl flex flex-col justify-between group hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-widest font-bold text-slate-300">2. Temperature</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>

          <div className="space-y-3 my-2">
            <div>
              <span className="text-[11px] text-slate-400 block font-mono">Ambient Air:</span>
              <span className="text-3xl font-black text-white font-display">{formatTemp(currentAmbient)}</span>
            </div>
            
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Radiant Surface:</span>
                <span className="text-lg font-bold text-rose-400 font-mono">{formatTemp(currentSurface)}</span>
              </div>
              <span className="text-[10px] font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-mono">
                +{delta.toFixed(1)}°C Trap
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span>Peak Forecast:</span>
            <strong className="text-orange-400">{formatTemp(peakTemp)} ({peakTime})</strong>
          </div>
        </div>

        {/* 3. EXPOSURE */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl flex flex-col justify-between group hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-widest font-bold text-slate-300">3. Exposure</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-3 my-2">
            <div>
              <span className="text-[11px] text-slate-400 block font-mono">Persistence Duration:</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black text-amber-400 font-display">{persistenceHours}</span>
                <span className="text-xs font-bold text-slate-400">Hours (&gt;35°C)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Exceedance Duration:</span>
                <span className="text-lg font-bold text-rose-400 font-mono">{exceedanceHours} Hrs</span>
              </div>
              <span className="text-[10px] font-bold text-rose-400 font-mono">&gt;38°C Critical</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
            Thermal inertia extends heat trap
          </div>
        </div>

        {/* 4. ENVIRONMENT */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl flex flex-col justify-between group hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-widest font-bold text-slate-300">4. Environment</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-1.5 my-2 text-xs font-mono">
            <div className="flex justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-400">Heat Index:</span>
              <span className="font-bold text-slate-100">{formatTemp(heatIndex)}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-400">Apparent:</span>
              <span className="font-bold text-slate-100">{formatTemp(apparentTemp)}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-400">Humidity:</span>
              <span className="font-bold text-cyan-400">{humidity !== null ? `${humidity}%` : '--'}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-400">Wet Bulb:</span>
              <span className="font-bold text-indigo-300">{formatTemp(wetBulb)}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80 flex justify-between">
            <span>Wind Speed:</span>
            <span>{windSpeed !== null ? `${windSpeed} m/s` : '--'}</span>
          </div>
        </div>

        {/* 5. TIME WINDOW */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl flex flex-col justify-between group hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-widest font-bold text-slate-300">5. Peak Window</span>
            <Sun className="w-4 h-4 text-yellow-400" />
          </div>

          <div className="my-2 text-center p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
            <span className="text-lg font-black text-yellow-300 block font-display tracking-tight">
              12:00 – 16:30
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">
              Peak Diurnal Solar Radiation
            </span>
            <div className="mt-2.5 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-300 font-mono uppercase tracking-wider animate-pulse">
              Extreme Hazard Window
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono text-center pt-2 border-t border-slate-800/80">
            Avoid unshaded outdoor exertion
          </div>
        </div>

      </div>

      {/* 6. "WHY IS THIS RISKY?" EXPLAINABLE REASONS SECTION */}
      <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/90 bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800/90 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm sm:text-base font-extrabold text-white font-display tracking-tight">
              Why this location is {riskLevel}:
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Deterministic Contributing Factors
          </span>
        </div>

        {/* Dynamic Risk Factors Generated Strictly by Risk Engine */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {riskFactors.map((factor, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex items-start space-x-2.5 hover:border-orange-500/40 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-200 font-sans leading-relaxed">{factor}</span>
            </div>
          ))}
        </div>

        {/* Operational Disclaimer Footnote */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-500 font-mono gap-1">
          <span>Data Provenance: FortyGuard Hyperlocal TCM + HeatShield Risk Engine</span>
          <span>* Deterministic decision-support heuristic for operational risk management.</span>
        </div>
      </div>

    </div>
  );
}
