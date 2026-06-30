import React from 'react';

export default function AttendanceSkeleton() {
  return (
    <div className="space-y-8 animate-pulse text-left">
      {/* Calendar Skeleton */}
      <div className="bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-3xl p-6 space-y-4">
        {/* Header line */}
        <div className="flex justify-between items-center pb-2">
          <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>
        
        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-50 dark:bg-slate-850 rounded-md" />
          ))}
        </div>
        
        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="aspect-square min-h-[50px] bg-slate-50 dark:bg-slate-850 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-2xl p-4" />
        ))}
      </div>
    </div>
  );
}
