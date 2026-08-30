import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Clock, Sun, TrendingUp } from 'lucide-react';

export default function HeatRiskTimeline({ timelineData, tempUnit = 'C' }) {
  const isCelsius = tempUnit === 'C';
  const formatTemp = (val) => {
    if (!val) return 0;
    return isCelsius ? val : Math.round((val * 9) / 5 + 32);
  };

  const chartData = (timelineData || []).map((item) => ({
    hour: item.hour,
    ambient: formatTemp(item.ambient),
    surface: formatTemp(item.surface),
    risk_score: item.risk_score,
    is_peak_window: item.is_peak_window
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-950/95 text-xs shadow-2xl font-mono">
          <p className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>Hour: {label}</span>
          </p>
          <div className="space-y-1">
            <p className="text-orange-500 dark:text-orange-400">
              Ambient Temp: <span className="text-slate-900 dark:text-white font-bold">{payload[0]?.value}°{tempUnit}</span>
            </p>
            <p className="text-rose-500 dark:text-rose-400">
              Surface Temp: <span className="text-slate-900 dark:text-white font-bold">{payload[1]?.value}°{tempUnit}</span>
            </p>
            <p className="text-amber-500 dark:text-amber-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              HeatShield Risk: <span className="text-slate-900 dark:text-white font-bold">{payload[2]?.value} / 100</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xl mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Diurnal Heat-Risk Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Ambient vs Radiant Surface Thermal Profile (24h Progression)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-600 dark:text-slate-300">Ambient Air (°{tempUnit})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-600 dark:text-slate-300">Radiant Surface (°{tempUnit})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-600 dark:text-slate-300">Risk Score (0-100)</span>
          </div>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sun className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase">Peak Window (12:00 - 16:30)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmbient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSurface" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              stroke="#94a3b8"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="ambient"
              stroke="#f97316"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorAmbient)"
            />
            <Area
              type="monotone"
              dataKey="surface"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorSurface)"
            />
            <Area
              type="monotone"
              dataKey="risk_score"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorRisk)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
