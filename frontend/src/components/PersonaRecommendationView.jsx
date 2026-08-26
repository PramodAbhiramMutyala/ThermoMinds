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
  Activity
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
      label: 'Outdoor Worker / Construction Manager',
      shortLabel: 'Outdoor Worker',
      icon: HardHat,
      desc: 'Mandated work-rest cycles, stand-down hours, AC trailer respite'
    },
    {
      id: 'authority',
      label: 'City Authority & Urban Planner',
      shortLabel: 'City Authority',
      icon: Building2,
      desc: 'Hotspot prioritization, cooling center expansion, shade infrastructure'
    }
  ];

  // Dynamic values
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
        return 'bg-rose-500 text-white shadow-md shadow-rose-500/20';
      case 'high':
        return 'bg-orange-500 text-white shadow-md shadow-orange-500/20';
      case 'medium':
        return 'bg-amber-500 text-white shadow-md shadow-amber-500/20';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl mb-6">
      
      {/* Header & Persona Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Targeted Action Priorities by User Mode
            </h3>
            <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Deterministic Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Same FortyGuard heat intelligence generates differentiated operational directives per role
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = activePersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePersona(p.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Persona Description Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            {activePersona === 'worker' ? <HardHat className="w-4 h-4" /> : activePersona === 'authority' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              {personas.find((p) => p.id === activePersona)?.label} Mode
            </h4>
            <p className="text-[11px] text-slate-400">
              {personas.find((p) => p.id === activePersona)?.desc}
            </p>
          </div>
        </div>

        {/* Operational Windows */}
        {recommendationsData && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
              <span className="text-[10px] text-slate-400 block">Recommended Window:</span>
              <strong>{recommendationsData.recommended_activity_window}</strong>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
              <span className="text-[10px] text-slate-400 block">High Hazard Stand-Down:</span>
              <strong>{recommendationsData.high_risk_avoidance_window}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Structured Action Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(recommendationsData?.recommendations || []).map((rec, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-orange-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityBadge(rec.priority)}`}>
                  {rec.priority} Priority #{rec.priority_order}
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span>{rec.time_window}</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-100 my-1.5 leading-snug">
                {rec.action}
              </h4>

              <div className="text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 mt-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5 font-mono">
                  Data-Driven Reason:
                </span>
                <p className="leading-relaxed font-sans">{rec.reason}</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Category: {rec.category}</span>
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Deterministic</span>
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
