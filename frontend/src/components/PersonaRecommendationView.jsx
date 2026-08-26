import React, { useState, useEffect } from 'react';
import { 
  User, 
  HardHat, 
  Building2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Droplets, 
  Sun, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  Umbrella,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';
import { fetchPersonaRecommendations } from '../services/api';

export default function PersonaRecommendationView({
  selectedLocation,
  cityData,
  selectedCity
}) {
  const [activePersona, setActivePersona] = useState('worker'); // 'citizen' | 'worker' | 'authority'
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const personas = [
    {
      id: 'citizen',
      label: 'Citizen & Commuter',
      shortLabel: 'Citizen',
      icon: User,
      desc: 'Safer activity windows, hydration reminders, shaded transit corridors'
    },
    {
      id: 'worker',
      label: 'Outdoor Worker / Construction',
      shortLabel: 'Outdoor Worker',
      icon: HardHat,
      desc: 'Mandated work-rest cycles, stand-down hours, AC trailer respite'
    },
    {
      id: 'authority',
      label: 'City Authority & Planner',
      shortLabel: 'City Authority',
      icon: Building2,
      desc: 'Hotspot prioritization, cooling center expansion, shade infrastructure'
    }
  ];

  const riskScore = selectedLocation?.risk_score ?? cityData?.risk?.risk_score ?? 88;
  const riskLevel = selectedLocation?.risk_level ?? cityData?.risk?.risk_level ?? 'Extreme';
  const ambientTemp = selectedLocation?.ambient_c ?? cityData?.temperature?.ambient_c ?? 44.8;
  const surfaceTemp = selectedLocation?.surface_c ?? cityData?.temperature?.surface_c ?? 61.2;
  const persistence = selectedLocation?.persistence_hours ?? cityData?.persistence?.continuous_hours ?? 9.5;
  const exceedance = selectedLocation?.exceedance_hours ?? cityData?.exceedance?.cumulative_hours ?? 6.5;
  const locName = selectedLocation?.name || cityData?.location?.name || `${selectedCity?.name} Sector`;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function getRecs() {
      const data = await fetchPersonaRecommendations({
        persona: activePersona,
        city: selectedCity?.name || 'Phoenix',
        risk_score: riskScore,
        risk_level: riskLevel,
        ambient_temp_c: ambientTemp,
        surface_temp_c: surfaceTemp,
        persistence_hours: persistence,
        exceedance_hours: exceedance,
        location_name: locName
      });

      if (isMounted) {
        setRecommendationsData(data);
        setIsLoading(false);
      }
    }

    getRecs();
    return () => { isMounted = false; };
  }, [activePersona, riskScore, riskLevel, ambientTemp, surfaceTemp, persistence, exceedance, locName, selectedCity]);

  const getPriorityBadge = (p) => {
    switch (p?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-1 ring-rose-400';
      case 'high':
        return 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-1 ring-orange-400';
      case 'medium':
        return 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-1 ring-amber-400';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/90 bg-slate-950/70 shadow-2xl mb-6 backdrop-blur-2xl">
      
      {/* Header & Persona Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white font-display tracking-tight">
              Targeted Action Priorities by User Mode
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
              Deterministic
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Same FortyGuard heat intelligence generates differentiated operational directives per role
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = activePersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePersona(p.id)}
                className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-sans">{p.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Persona Banner & Operational Windows */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 mb-5 shadow-inner">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30">
            {activePersona === 'worker' ? <HardHat className="w-5 h-5" /> : activePersona === 'authority' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display">
              {personas.find((p) => p.id === activePersona)?.label} Mode Active
            </h4>
            <p className="text-xs text-slate-400">
              {personas.find((p) => p.id === activePersona)?.desc}
            </p>
          </div>
        </div>

        {/* Operational Windows */}
        {recommendationsData && (
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 shadow-sm">
              <span className="text-[10px] text-slate-400 block font-normal">Recommended Window:</span>
              <strong className="text-emerald-400">{recommendationsData.recommended_activity_window}</strong>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 shadow-sm">
              <span className="text-[10px] text-slate-400 block font-normal">High Hazard Stand-Down:</span>
              <strong className="text-rose-400">{recommendationsData.high_risk_avoidance_window}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Structured Action Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(recommendationsData?.recommendations || []).map((rec, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase font-mono tracking-widest ${getPriorityBadge(rec.priority)}`}>
                  {rec.priority} Priority #{rec.priority_order}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center space-x-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>{rec.time_window}</span>
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-white my-2 leading-snug font-display group-hover:text-orange-200 transition-colors">
                {rec.action}
              </h4>

              <div className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 mt-2.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1 font-mono tracking-wider">
                  Data-Driven Reason:
                </span>
                <p className="leading-relaxed font-sans text-slate-300">{rec.reason}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="uppercase">Category: <strong className="text-slate-400">{rec.category}</strong></span>
              <span className="text-emerald-400 flex items-center space-x-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Deterministic</span>
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
