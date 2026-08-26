import React from 'react';
import { ShieldCheck, Database, Layers } from 'lucide-react';

export default function DataSourceBadge({ source, size = 'sm' }) {
  const isLive = source?.includes('LIVE') || source?.includes('FortyGuard');
  const isDemo = source?.includes('DEMO') || source?.includes('Simulation');
  const isExternal = source?.includes('EXTERNAL') || source?.includes('Sentinel') || source?.includes('MUNICIPAL');

  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (isLive && !isDemo) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        LIVE • FortyGuard API
      </span>
    );
  }

  if (isExternal) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 ${sizeClasses}`}>
        <Layers className="w-3.5 h-3.5 text-cyan-400" />
        {source}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses}`}>
      <Database className="w-3.5 h-3.5 text-amber-400" />
      DEMO • HeatShield Simulation
    </span>
  );
}
