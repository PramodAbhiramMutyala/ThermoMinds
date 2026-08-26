import React, { useState, useEffect } from 'react';
import { Navigation, Shield, UserCheck, ArrowRight, Sun, Trees, Droplets, MapPin, HeartPulse } from 'lucide-react';
import { fetchCoolRoute, fetchCoolingCenters, fetchVulnerability } from '../services/api';
import DataSourceBadge from './DataSourceBadge';

export default function CitizenView({ city, baseScore, onShowRouteOnMap }) {
  const [routeComparison, setRouteComparison] = useState(null);
  const [coolingCenters, setCoolingCenters] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('Senior (65+)');
  const [vulnerabilityResult, setVulnerabilityResult] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    loadCoolRoute();
    loadCoolingCenters();
  }, [city]);

  useEffect(() => {
    loadVulnerability();
  }, [selectedProfile, baseScore]);

  const loadCoolRoute = async () => {
    try {
      setLoadingRoute(true);
      const res = await fetchCoolRoute(city);
      setRouteComparison(res);
      if (onShowRouteOnMap) onShowRouteOnMap(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoute(false);
    }
  };

  const loadCoolingCenters = async () => {
    try {
      const res = await fetchCoolingCenters(city);
      setCoolingCenters(res.cooling_centers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVulnerability = async () => {
    try {
      const res = await fetchVulnerability(selectedProfile, baseScore || 78);
      setVulnerabilityResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const profiles = [
    'General',
    'Senior (65+)',
    'Child / Infant',
    'Outdoor Worker',
    'Cardiovascular Condition',
    'Athlete'
  ];

  return (
    <div className="space-y-4">
      {/* 1. Marquee Feature: Cool Route vs Direct Route Comparison */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-dark-850/80 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-base text-slate-100">
                Cool Corridor Navigation
              </h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Thermal Routing
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Optimizes pedestrian transit to maximize continuous tree shade and avoid unshaded thermal traps.
            </p>
          </div>

          <button
            onClick={loadCoolRoute}
            disabled={loadingRoute}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-dark-900 transition-all font-bold self-start sm:self-auto shadow-md shadow-cyan-500/20"
          >
            {loadingRoute ? 'Recalculating...' : 'Recalculate Route'}
          </button>
        </div>

        {routeComparison && (
          <div className="space-y-4">
            {/* Origin -> Destination Banner */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-dark-900/60 p-2.5 rounded-xl border border-slate-800">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Origin:</span>
              <span className="font-bold text-slate-100">{routeComparison.origin_name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-400">Destination:</span>
              <span className="font-bold text-cyan-300">{routeComparison.destination_name}</span>
            </div>

            {/* Direct vs Cool Route Side-by-Side Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Direct Route Card */}
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-red-400" />
                    Direct Arterial Path
                  </span>
                  <span className="text-[10px] font-bold text-red-300 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/40">
                    High Heat Exposure
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Distance & Time:</span>
                    <div className="font-bold text-slate-200">
                      {routeComparison.direct_route.distance_km} km ({routeComparison.direct_route.duration_minutes} min)
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Shade Coverage:</span>
                    <div className="font-bold text-red-400">
                      {routeComparison.direct_route.shade_coverage_pct}% (Scorching)
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Avg Surface Heat:</span>
                    <div className="font-bold text-red-400">
                      {routeComparison.direct_route.avg_surface_temp_c}°C
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Avg Ambient:</span>
                    <div className="font-bold text-amber-300">
                      {routeComparison.direct_route.avg_ambient_temp_c}°C
                    </div>
                  </div>
                </div>

                <ul className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-red-500/20">
                  {routeComparison.direct_route.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-red-400"></span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cool Route Card (RECOMMENDED) */}
              <div className="p-4 rounded-xl border border-cyan-500/50 bg-cyan-500/10 space-y-3 relative shadow-lg shadow-cyan-500/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Trees className="w-4 h-4 text-emerald-400" />
                    Cool Shaded Corridor
                  </span>
                  <span className="text-[10px] font-extrabold text-dark-900 bg-cyan-400 px-2 py-0.5 rounded shadow-sm">
                    RECOMMENDED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Distance & Time:</span>
                    <div className="font-bold text-slate-100">
                      {routeComparison.cool_route.distance_km} km ({routeComparison.cool_route.duration_minutes} min)
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Shade Coverage:</span>
                    <div className="font-bold text-emerald-400">
                      {routeComparison.cool_route.shade_coverage_pct}% (High Shade)
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Avg Surface Heat:</span>
                    <div className="font-bold text-cyan-300">
                      {routeComparison.cool_route.avg_surface_temp_c}°C (-{routeComparison.thermal_reduction_pct}%)
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Avg Ambient:</span>
                    <div className="font-bold text-emerald-300">
                      {routeComparison.cool_route.avg_ambient_temp_c}°C
                    </div>
                  </div>
                </div>

                <ul className="text-[11px] text-slate-300 space-y-1 pt-2 border-t border-cyan-500/30">
                  {routeComparison.cool_route.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-emerald-300">
                      <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendation Takeaway Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
              <span className="font-bold text-sm">💡</span>
              <p className="leading-relaxed">
                <span className="font-bold">Agent Decision: </span>
                {routeComparison.reasoning}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Personalized Exposure Vulnerability Profile Heuristic */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-dark-850/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-red-400" />
            <h3 className="font-extrabold text-base text-slate-100">
              Personalized Exposure Vulnerability Profile
            </h3>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {profiles.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedProfile(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedProfile === p
                    ? 'bg-amber-500 text-dark-900 font-bold shadow-sm'
                    : 'bg-dark-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {vulnerabilityResult && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-dark-900/80 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Personalized Risk Level:</span>
                <div className="font-bold text-amber-400 text-sm">{vulnerabilityResult.risk_level}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Adjusted Score:</span>
                <div className="font-mono font-black text-lg text-red-400">
                  {vulnerabilityResult.personalized_risk_score} / 100
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-dark-900/50 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-300 block mb-1.5">Primary Hazards:</span>
                <ul className="space-y-1 text-slate-400">
                  {vulnerabilityResult.primary_hazards.map((h, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-red-400"></span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-dark-900/50 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1.5">Recommended Actions:</span>
                <ul className="space-y-1 text-slate-300">
                  {vulnerabilityResult.recommended_actions.map((a, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 italic text-right">
              {vulnerabilityResult.disclaimer}
            </div>
          </div>
        )}
      </div>

      {/* 3. Verified Cooling Shelters & Respite Network */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-dark-850/80">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-base text-slate-100">
              Verified Public Cooling Shelters ({city})
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {coolingCenters.length} Active Centers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coolingCenters.map((cc) => (
            <div
              key={cc.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-dark-900/60 hover:border-cyan-500/40 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-100">{cc.name}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap">
                  AC {cc.indoor_temp_c}°C
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                {cc.address}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <span>{cc.hours}</span>
                <span className="text-cyan-400 font-medium">{cc.capacity_status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
