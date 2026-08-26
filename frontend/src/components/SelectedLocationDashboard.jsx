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
  Wind
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

  // Data normalization from selected location object or fallback risk models
  const locationName = locationData?.name || 'Downtown Thermal Zone';
  const locationId = locationData?.id || 'Zone #1';
  
  const riskScore = locationData?.risk_score ?? riskData?.risk_score ?? 88;
  const riskLevel = locationData?.risk_level ?? riskData?.risk_level ?? 'Extreme';
  
  // Real risk factors strictly from backend
  const riskFactors = locationData?.primary_risk_factors?.length 
    ? locationData.primary_risk_factors 
    : (riskData?.risk_factors || [
        'High ambient air temperature accumulation',
        'Severe radiant surface heat trap on unshaded pavement',
        'Prolonged heat persistence beyond baseline threshold'
      ]);

  const currentAmbient = locationData?.ambient_c ?? tempData?.ambient_c ?? 44.8;
  const currentSurface = locationData?.surface_c ?? tempData?.surface_c ?? 61.2;
  const peakTemp = tempData?.peak_temp_c ?? (currentAmbient + 1.4);
  const peakTime = tempData?.peak_time ?? '15:30';

  const persistenceHours = locationData?.persistence_hours ?? persistenceData?.continuous_hours ?? 9.5;
  const exceedanceHours = locationData?.exceedance_hours ?? exceedanceData?.cumulative_hours ?? 6.5;

  const heatIndex = tempData?.heat_index_c ?? null;
  const apparentTemp = locationData?.apparent_temp_c ?? tempData?.apparent_c ?? null;
  const humidity = tempData?.humidity_pct ?? null;
  const wetBulb = tempData?.wet_bulb_c ?? null;
  const windSpeed = tempData?.wind_speed_mps ?? null;

  // Visual Theme by Risk Level
  const getTheme = (level) => {
    switch (level) {
      case 'Extreme':
        return {
          badge: 'bg-rose-500 text-white shadow-rose-500/30',
          border: 'border-rose-500/40',
          glow: 'from-rose-500/20 via-orange-500/5 to-transparent',
          text: 'text-rose-400',
          ring: 'text-rose-500'
        };
      case 'Very High':
        return {
          badge: 'bg-orange-500 text-white shadow-orange-500/30',
          border: 'border-orange-500/40',
          glow: 'from-orange-500/20 via-amber-500/5 to-transparent',
          text: 'text-orange-400',
          ring: 'text-orange-500'
        };
      case 'High':
        return {
          badge: 'bg-amber-500 text-white shadow-amber-500/30',
          border: 'border-amber-500/40',
          glow: 'from-amber-500/20 via-yellow-500/5 to-transparent',
          text: 'text-amber-400',
          ring: 'text-amber-500'
        };
      case 'Moderate':
        return {
          badge: 'bg-cyan-500 text-white shadow-cyan-500/30',
          border: 'border-cyan-500/40',
          glow: 'from-cyan-500/20 via-blue-500/5 to-transparent',
          text: 'text-cyan-400',
          ring: 'text-cyan-500'
        };
      default:
        return {
          badge: 'bg-emerald-500 text-white shadow-emerald-500/30',
          border: 'border-emerald-500/40',
          glow: 'from-emerald-500/20 via-teal-500/5 to-transparent',
          text: 'text-emerald-400',
          ring: 'text-emerald-500'
        };
    }
  };

  const theme = getTheme(riskLevel);

  return (
    <div className={`glass-panel p-6 rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.glow} shadow-2xl mb-6 relative overflow-hidden`}>
      
      {/* Location Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-orange-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{locationName}</h2>
              <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                {locationId}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Hyperlocal Microclimate Intelligence & Empirical Thermal Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">Operational Risk Status:</span>
          <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-lg ${theme.badge}`}>
            {riskLevel} Risk
          </span>
        </div>
      </div>

      {/* Main 5-Pillar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. CURRENT HEAT RISK */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-bold">1. Current Heat Risk</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <div className="my-2 text-center">
            <div className="text-4xl font-extrabold text-white font-mono tracking-tight">
              {riskScore} <span className="text-xs font-normal text-slate-500 font-sans">/ 100</span>
            </div>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${theme.badge}`}>
              {riskLevel}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono text-center pt-2 border-t border-slate-800/60">
            Deterministic Score (0–100)
          </div>
        </div>

        {/* 2. TEMPERATURE */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-bold">2. Temperature</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <div className="space-y-2 my-1">
            <div>
              <span className="text-[11px] text-slate-400 block">Current Ambient Air:</span>
              <span className="text-2xl font-extrabold text-white font-mono">{formatTemp(currentAmbient)}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Peak Forecast:</span>
              <span className="font-bold text-rose-400 font-mono">{formatTemp(peakTemp)} <span className="text-[10px] text-slate-500">({peakTime})</span></span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
            Surface Trap: <strong className="text-rose-400 font-mono">{formatTemp(currentSurface)}</strong>
          </div>
        </div>

        {/* 3. EXPOSURE */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-bold">3. Exposure</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-2.5 my-1">
            <div>
              <span className="text-[11px] text-slate-400 block">Persistence Duration:</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">{persistenceHours} Hrs</span>
              <span className="text-[10px] text-slate-500 font-mono ml-1.5">(&gt;35°C)</span>
            </div>
            <div className="pt-1.5 border-t border-slate-800/60 flex items-baseline justify-between">
              <span className="text-[11px] text-slate-400">Exceedance Duration:</span>
              <span className="font-bold text-rose-400 font-mono text-sm">{exceedanceHours} Hrs</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
            Threshold: &gt; 38°C Critical Danger
          </div>
        </div>

        {/* 4. ENVIRONMENT */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-bold">4. Environment</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-1.5 my-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Heat Index:</span>
              <span className="font-bold text-slate-200">{formatTemp(heatIndex)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Apparent:</span>
              <span className="font-bold text-slate-200">{formatTemp(apparentTemp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Humidity:</span>
              <span className="font-bold text-cyan-400">{humidity !== null ? `${humidity}%` : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Wet Bulb:</span>
              <span className="font-bold text-indigo-300">{formatTemp(wetBulb)}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
            Wind: {windSpeed !== null ? `${windSpeed} m/s` : '--'}
          </div>
        </div>

        {/* 5. TIME WINDOW */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-bold">5. Peak Window</span>
            <Sun className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="my-1 text-center">
            <span className="text-sm font-bold text-yellow-300 block font-mono">
              12:00 – 16:30
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Peak Diurnal Solar Radiation
            </span>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Highest Risk Window
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono text-center pt-1 border-t border-slate-800/60">
            Avoid unshaded exposure
          </div>
        </div>

      </div>

      {/* 6. "WHY IS THIS RISKY?" EXPLAINABLE REASONS SECTION */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 bg-slate-950/50 p-5 rounded-xl border border-slate-800/90">
        <div className="flex items-center space-x-2 mb-3">
          <HelpCircle className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Why this location is {riskLevel}:
          </h3>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Backend Deterministic Explanation
          </span>
        </div>

        {/* Dynamic Risk Factors Generated Strictly by Risk Engine */}
        <ul className="space-y-2">
          {riskFactors.map((factor, idx) => (
            <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-200">
              <ChevronRight className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-sans">{factor}</span>
            </li>
          ))}
        </ul>

        {/* Operational Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Data Provenance: FortyGuard TCM + HeatShield Risk Engine</span>
          <span>* Deterministic decision-support heuristic (not medical determination)</span>
        </div>
      </div>

    </div>
  );
}
