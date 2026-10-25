import React from 'react';
import { Loader2 } from 'lucide-react';

export const ModuleSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-28 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 flex items-center justify-between">
        <div className="space-y-3 w-2/3">
          <div className="h-6 bg-slate-800 rounded-md w-1/3"></div>
          <div className="h-4 bg-slate-800/60 rounded-md w-1/2"></div>
        </div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">Memuat modul...</span>
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-900/40 rounded-xl border border-slate-800/80 p-4 space-y-2">
            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            <div className="h-7 bg-slate-800/70 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Main Table / Form Skeleton */}
      <div className="h-96 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-6 space-y-4">
        <div className="h-8 bg-slate-800 rounded w-1/4"></div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-10 bg-slate-800/50 rounded-lg w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
