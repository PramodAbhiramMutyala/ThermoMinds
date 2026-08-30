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
  TrendingUp,
  Info,
  Timer,
  ShieldCheck
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
  
  const riskScore = locationData?.risk_score ?? riskData?.risk_score ?? 84;
  const riskLevel = locationData?.risk_level ?? riskData?.risk_level ?? 'Extreme';
  
  const currentAmbient = locationData?.ambient_c ?? tempData?.ambient_c ?? 44.8;
  const currentSurface = locationData?.surface_c ?? tempData?.surface_c ?? 61.2;
  const delta = currentSurface - currentAmbient;
  const peakTemp = tempData?.peak_temp_c ?? (currentAmbient + 1.4);
  const peakTime = tempData?.peak_time ?? '15:30';

  const persistenceHours = locationData?.persistence_hours ?? persistenceData?.continuous_hours ?? 6.5;
  const exceedanceHours = locationData?.exceedance_hours ?? exceedanceData?.cumulative_hours ?? 2.1;

  const apparentTemp = locationData?.apparent_temp_c ?? tempData?.apparent_c ?? 42.0;
  const humidity = tempData?.humidity_pct ?? 38;
  const windSpeed = tempData?.wind_speed_mps ?? 3.3; // 12 km/h approx

  // Sub-scores derived deterministically
  const tempScore = Math.min(35, Math.round((currentAmbient / 50) * 35));
  const persistScore = Math.min(25, Math.round((persistenceHours / 10) * 25));
  const exceedScore = Math.min(20, Math.round((exceedanceHours / 8) * 20));
  const envScore = Math.max(8, 100 - tempScore - persistScore - exceedScore > 0 ? Math.min(20, Math.round((riskScore - tempScore - persistScore - exceedScore) + 12)) : 12);

  const getScoreTheme = (score) => {
    if (score >= 80) {
      return {
        label: 'VERY HIGH RISK',
        flag: 'Rose Flag',
        stroke: '#f43f5e',
        glowClass: 'drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]',
        badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400',
        flagBadge: 'bg-rose-500 text-white shadow-lg shadow-rose-500/40',
        textColor: 'text-rose-500 dark:text-rose-400'
      };
    }
    if (score >= 60) {
      return {
        label: 'HIGH RISK',
        flag: 'Orange Flag',
        stroke: '#f97316',
        glowClass: 'drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]',
        badgeBg: 'bg-orange-500/10 border-orange-500/30 text-orange-500 dark:text-orange-400',
        flagBadge: 'bg-orange-500 text-white dark:text-slate-950 shadow-lg shadow-orange-500/40',
        textColor: 'text-orange-500 dark:text-orange-400'
      };
    }
    if (score >= 40) {
      return {
        label: 'MODERATE RISK',
        flag: 'Yellow Flag',
        stroke: '#f59e0b',
        glowClass: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]',
        badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
        flagBadge: 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/40',
        textColor: 'text-amber-600 dark:text-amber-400'
      };
    }
    return {
      label: 'LOW RISK',
      flag: 'Green Flag',
      stroke: '#10b981',
      glowClass: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      flagBadge: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40',
      textColor: 'text-emerald-600 dark:text-emerald-400'
    };
  };

  const theme = getScoreTheme(riskScore);

  return (
    <div className="space-y-6">
      
      {/* Top Mission Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-mono text-xs text-rose-500 dark:text-rose-400 tracking-widest uppercase font-bold">
              Live Telemetry &bull; {locationName}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-display">
            Mission Control Command Center
          </h2>
        </div>
        <div className="font-mono text-xs text-slate-500 dark:text-slate-400 sm:text-right">
          <span className="block text-slate-700 dark:text-slate-300 font-bold">SECTOR: {locationId}</span>
          <span className="block text-slate-500">SYNC: REAL-TIME 40G TELEMETRY</span>
        </div>
      </div>

      {/* Bento Grid Layout (5 cols left, 7 cols right on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Unified HeatShield Score Ring (Spans 5 cols) */}
        <div className="glass-panel lg:col-span-5 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 shadow-2xl flex flex-col justify-between relative overflow-hidden backdrop-blur-2xl group">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-display">
              <ShieldAlert className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
              Unified HeatShield Score
            </h3>
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              0 - 100 HEURISTIC
            </span>
          </div>

          {/* SVG Circular Progress */}
          <div className="flex flex-col items-center justify-center my-4 relative z-10">
            <div className="relative w-48 sm:w-56 aspect-square flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background track */}
                <path
                  className="text-slate-200 dark:text-slate-800/80 stroke-current"
                  strokeWidth="2.8"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Dynamic Value Track */}
                <path
                  stroke={theme.stroke}
                  strokeWidth="2.8"
                  strokeDasharray={`${riskScore}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  className={`${theme.glowClass} transition-all duration-1000 ease-out`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              {/* Center Score Value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-5xl sm:text-6xl font-black tracking-tight font-display ${theme.textColor}`}>
                  {riskScore}
                </span>
                <span className={`text-[10px] font-mono font-bold px-3 py-0.5 rounded-full mt-1.5 border ${theme.badgeBg}`}>
                  {theme.label}
                </span>
              </div>
            </div>
          </div>

          {/* Score Breakdown Pill Bar */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 w-full flex flex-wrap gap-2 justify-center relative z-10 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">TEMP</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">{tempScore}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">PERSIST</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{persistScore}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">EXCEED</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">{exceedScore}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">ENV</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{envScore}</span>
            </div>
          </div>

        </div>

        {/* Right Column: 4-Metric Grid (Spans 7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Card 1: Risk Matrix */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 shadow-xl flex flex-col justify-between hover:border-rose-500/40 transition-colors duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertTriangle className="w-16 h-16 text-rose-500" />
            </div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                Risk Matrix
              </span>
              <span className="text-[10px] font-mono text-slate-400">01</span>
            </div>
            <div className="mt-auto space-y-2">
              <div className="inline-block px-3 py-1 rounded-xl text-xs font-bold font-mono shadow-md uppercase tracking-wider bg-rose-500 text-white">
                {theme.flag}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Critical thermal accumulation detected across sector. Mandatory shaded rest protocols active.
              </p>
            </div>
          </div>

          {/* Card 2: Current Thermal Conditions */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 shadow-xl flex flex-col justify-between hover:border-cyan-500/40 transition-colors duration-300">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                Current Conditions
              </span>
              <span className="text-[10px] font-mono text-slate-400">02</span>
            </div>
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                <span className="text-slate-500 dark:text-slate-400">Apparent Temp</span>
                <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">{formatTemp(apparentTemp)}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                <span className="text-slate-500 dark:text-slate-400">Humidity</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{humidity}%</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 dark:text-slate-400">Wind Velocity</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">12 km/h</span>
              </div>
            </div>
          </div>

          {/* Card 3: Persistence */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition-colors duration-300">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Thermal Persistence
              </span>
              <span className="text-[10px] font-mono text-slate-400">03</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black font-display text-amber-500 dark:text-amber-400">
                  {persistenceHours}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">HRS &gt; 35°C</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Continuous unyielding daytime heat without thermal relaxation.
              </p>
              {/* Mini Bar Graph */}
              <div className="flex gap-1 mt-3 h-5 items-end">
                <div className="w-full bg-amber-500/20 h-2 rounded-t-sm"></div>
                <div className="w-full bg-amber-500/40 h-3 rounded-t-sm"></div>
                <div className="w-full bg-amber-500/60 h-4 rounded-t-sm"></div>
                <div className="w-full bg-amber-500/80 h-5 rounded-t-sm"></div>
                <div className="w-full bg-amber-400 h-5 rounded-t-sm shadow-sm shadow-amber-400"></div>
              </div>
            </div>
          </div>

          {/* Card 4: Exceedance */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 shadow-xl flex flex-col justify-between hover:border-rose-500/40 transition-colors duration-300">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                Critical Exceedance
              </span>
              <span className="text-[10px] font-mono text-slate-400">04</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black font-display text-rose-500 dark:text-rose-400">
                  {exceedanceHours}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">HRS &gt; 38°C</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Severe physiological heat debt exceeding safe human tolerance.
              </p>
              {/* Pulsing Blip Status */}
              <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-rose-500 dark:text-rose-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span>Peak Intensity Active</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
