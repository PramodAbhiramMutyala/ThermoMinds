import React, { useState } from 'react';
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
  Navigation,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';
import CitizenView from './CitizenView';
import WorkerView from './WorkerView';
import AuthorityView from './AuthorityView';

export default function PersonaRecommendationView({
  selectedLocation,
  cityData,
  selectedCity,
  tempUnit = 'C'
}) {
  const [activePersona, setActivePersona] = useState('worker'); // 'citizen' | 'worker' | 'authority'

  const personas = [
    {
      id: 'citizen',
      label: 'Pedestrian',
      fullTitle: 'Pedestrian & Commuter Guidance',
      icon: User,
      desc: 'Shaded cool corridor navigation, heat vulnerability heuristics, cooling shelters'
    },
    {
      id: 'worker',
      label: 'Site Manager',
      fullTitle: 'Occupational Safety & Site Management',
      icon: HardHat,
      desc: 'Mandated ISO 7243 work-rest cycles, WBGT thermal flags, hydration protocols'
    },
    {
      id: 'authority',
      label: 'City Planner',
      fullTitle: 'Municipal Mitigation & Urban Planning',
      icon: Building2,
      desc: 'Hotspot mitigation simulation, tree canopy ROI, municipal heat action plans'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header & Persona Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display">
            Operational Safety & Action Hubs
          </h1>
          <p className="font-mono text-xs text-slate-400 uppercase tracking-widest mt-0.5">
            OSHA / ISO 7243 Guidance & Municipal Directives Active &bull; {selectedCity?.name || 'Phoenix'}
          </p>
        </div>

        {/* Persona Switcher Pill Group */}
        <div className="flex p-1 bg-slate-950/90 rounded-full border border-slate-800 shadow-inner">
          {personas.map((p) => {
            const Icon = p.icon;
            const isActive = activePersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePersona(p.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Persona Hub View */}
      {activePersona === 'worker' && (
        <WorkerView
          city={selectedCity?.name || 'Phoenix'}
          activeZone={selectedLocation || cityData?.location}
          tempUnit={tempUnit}
        />
      )}

      {activePersona === 'citizen' && (
        <CitizenView
          city={selectedCity?.name || 'Phoenix'}
          baseScore={selectedLocation?.risk_score || cityData?.risk?.risk_score || 84}
          tempUnit={tempUnit}
        />
      )}

      {activePersona === 'authority' && (
        <AuthorityView
          city={selectedCity?.name || 'Phoenix'}
          hotspots={cityData?.hotspots || []}
          selectedZone={selectedLocation || cityData?.location}
        />
      )}

    </div>
  );
}
