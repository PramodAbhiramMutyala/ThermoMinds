import React, { useEffect, useState } from 'react';
import { Play, Pause, Sun, Moon, AlertOctagon } from 'lucide-react';

export default function TimeSlider({ currentHour, onHourChange }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onHourChange((prev) => (prev + 1) % 24);
      }, 1400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, onHourChange]);

  const isPeak = currentHour >= 12 && currentHour <= 17;
  const isNight = currentHour >= 21 || currentHour <= 5;

  return (
    <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-dark-850/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        {/* Left: Play/Pause and Time Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-amber-500 text-dark-900 font-bold shadow-md shadow-amber-500/30'
                : 'bg-dark-700 text-slate-200 hover:bg-slate-700 border border-slate-600'
            }`}
            title={isPlaying ? 'Pause Diurnal Simulation' : 'Play Diurnal Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <div className="flex items-center gap-2">
            {isNight ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className={`w-4 h-4 ${isPeak ? 'text-red-400 animate-spin-slow' : 'text-amber-400'}`} />
            )}
            <span className="font-mono font-bold text-base text-slate-100">
              {String(currentHour).padStart(2, '0')}:00
            </span>
            <span className="text-xs text-slate-400">Diurnal Cycle</span>
          </div>
        </div>

        {/* Right: Peak Heat Window Pill */}
        <div className="flex items-center gap-2">
          {isPeak && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/30 animate-pulse">
              <AlertOctagon className="w-3 h-3" />
              Peak Thermal Hazard Window (12:00 – 17:00)
            </span>
          )}
          {isNight && (
            <span className="text-[11px] font-medium text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Nocturnal Heat Trap Monitoring
            </span>
          )}
        </div>
      </div>

      {/* Scrub Slider Bar */}
      <div className="relative pt-1 pb-1">
        <input
          type="range"
          min="0"
          max="23"
          value={currentHour}
          onChange={(e) => onHourChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
        />

        {/* Hour marks */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1 px-1">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span className="text-amber-400 font-bold">12:00</span>
          <span className="text-red-400 font-bold">16:00</span>
          <span>20:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>
  );
}
