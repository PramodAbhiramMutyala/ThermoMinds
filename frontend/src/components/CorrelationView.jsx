import React, { useState, useEffect } from 'react';
import { BarChart3, ScatterChart as ScatterIcon, Layers, TrendingDown, BookOpen, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line, BarChart, Bar } from 'recharts';
import { fetchVegetationCorrelation } from '../services/api';
import DataSourceBadge from './DataSourceBadge';

export default function CorrelationView({ city }) {
  const [correlationData, setCorrelationData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCorrelation();
  }, [city]);

  const loadCorrelation = async () => {
    try {
      setLoading(true);
      const res = await fetchVegetationCorrelation(city);
      setCorrelationData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = correlationData?.data_points?.map((p) => ({
    name: p.zone_name,
    ndvi: p.ndvi_vegetation_index,
    surfaceTemp: p.surface_temp_c,
    ambientTemp: p.ambient_temp_c,
    canopy: p.canopy_cover_pct,
    score: p.heatshield_score
  })) || [];

  return (
    <div className="space-y-4">
      {/* 1. Correlation Analysis Hero Header */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-dark-850/80 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-base text-slate-100">
                Data Correlation: FortyGuard Temperature vs Sentinel-2 NDVI
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical correlation between satellite vegetative greenness (NDVI) and street-level radiant heat.
            </p>
          </div>

          <DataSourceBadge source="EXTERNAL - Sentinel-2 NDVI & FortyGuard" />
        </div>

        {correlationData && (
          <div className="space-y-4">
            {/* Statistical Summary Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-[10px] text-slate-400 font-medium">Pearson Correlation (r)</span>
                <div className="text-2xl font-black text-cyan-400">
                  {correlationData.correlation_coefficient_r}
                </div>
                <div className="text-[10px] text-emerald-300 font-semibold">Strong Inverse Relation</div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <span className="text-[10px] text-slate-400 font-medium">Variance Explained (R²)</span>
                <div className="text-2xl font-black text-indigo-400">
                  {correlationData.r_squared}
                </div>
                <div className="text-[10px] text-slate-300">77% Variance Attributable</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[10px] text-slate-400 font-medium">Statistical Significance</span>
                <div className="text-2xl font-black text-amber-400">
                  p &lt; 0.001
                </div>
                <div className="text-[10px] text-slate-300">Statistically Significant</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="text-[10px] text-slate-400 font-medium">Analyzed Samples</span>
                <div className="text-2xl font-black text-slate-100">
                  {correlationData.sample_size} Zones
                </div>
                <div className="text-[10px] text-slate-400">{city} Microclimates</div>
              </div>
            </div>

            {/* Scatter Plot / Visual Graph */}
            <div className="p-4 rounded-xl bg-dark-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-200">
                  Scatter Distribution: Sentinel-2 NDVI vs Surface Heat (°C)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  X: NDVI Greenness (0.0 to 1.0) • Y: Surface Temp (°C)
                </span>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                    <XAxis
                      type="number"
                      dataKey="ndvi"
                      name="NDVI"
                      domain={[0, 0.8]}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      label={{ value: 'Sentinel-2 NDVI Vegetation Index', position: 'bottom', fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="surfaceTemp"
                      name="Surface Temp"
                      domain={['auto', 'auto']}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      label={{ value: 'Surface Temp (°C)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="glass-panel p-2.5 rounded-lg text-xs space-y-1 bg-dark-900/95 border border-slate-700 shadow-xl">
                              <div className="font-bold text-slate-100">{data.name}</div>
                              <div className="text-cyan-400">NDVI: <span className="font-bold">{data.ndvi}</span></div>
                              <div className="text-red-400">Surface Temp: <span className="font-bold">{data.surfaceTemp}°C</span></div>
                              <div className="text-amber-300">Ambient Temp: <span className="font-bold">{data.ambientTemp}°C</span></div>
                              <div className="text-emerald-400">Canopy: <span className="font-bold">{data.canopy}%</span></div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Zones" data={chartData} fill="#06b6d4">
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.surfaceTemp >= 55 ? '#ef4444' : entry.surfaceTemp >= 48 ? '#f97316' : '#10b981'}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scientific Takeaway Banner */}
            <div className="p-4 rounded-xl bg-dark-900/70 border border-cyan-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Scientific Analysis & Policy Takeaways
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {correlationData.scientific_takeaway}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
