import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Sun, Moon, Sparkles, Flame } from 'lucide-react';

export default function DiurnalScrubber({ currentHour, onHourChange }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onHourChange((prev) => {
          if (prev >= 22) return 6;
          return prev + 1;
        });
      }, 1400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, onHourChange]);

  const hours = [6, 8, 10, 12, 14, 16, 18, 20, 22];

  const formatHour = (h) => {
    return `${h.toString().padStart(2, '0')}:00`;
  };

  const isPeakWindow = currentHour >= 12 && currentHour <= 17;

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl mb-6 scanline-effect relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Diurnal Simulation Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all duration-300 shadow-lg ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 animate-pulse'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE SIMULATION' : 'SIMULATE DIURNAL CYCLE'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onHourChange(14);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs font-mono"
            title="Reset to Peak Hour (14:00)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-400">Hour Offset:</span>
            <span className="text-white font-bold">{formatHour(currentHour)}</span>
          </div>
        </div>

        {/* Center/Right: Interactive Scrubber Slider */}
        <div className="flex-1 max-w-xl flex flex-col space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center space-x-1 text-slate-400">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>06:00 Dawn</span>
            </span>

            {isPeakWindow ? (
              <span className="flex items-center space-x-1 font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 animate-pulse">
                <Flame className="w-3 h-3" />
                <span>SOLAR PEAK HAZARD (12:00 - 17:00)</span>
              </span>
            ) : (
              <span className="text-slate-500">Normal Exposure Window</span>
            )}

            <span className="flex items-center space-x-1 text-slate-400">
              <Moon className="w-3 h-3 text-indigo-400" />
              <span>22:00 Dusk</span>
            </span>
          </div>

          {/* Range Slider */}
          <div className="relative flex items-center">
            <input
              type="range"
              min="6"
              max="22"
              step="1"
              value={currentHour}
              onChange={(e) => {
                setIsPlaying(false);
                onHourChange(parseInt(e.target.value, 10));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
            />
          </div>

          {/* Hour Tick Markers */}
          <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
            {hours.map((h) => (
              <button
                key={h}
                onClick={() => {
                  setIsPlaying(false);
                  onHourChange(h);
                }}
                className={`transition-colors ${currentHour === h ? 'text-orange-400 font-bold' : 'hover:text-slate-300'}`}
              >
                {h}:00
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
