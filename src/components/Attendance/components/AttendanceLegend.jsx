import React from 'react';

const LEGENDS = [
  { label: 'Present', color: 'bg-emerald-500' },
  { label: 'Absent', color: 'bg-rose-500' },
  { label: 'Half Day', color: 'bg-amber-500' },
  { label: 'Leave', color: 'bg-blue-500' },
  { label: 'Holiday', color: 'bg-slate-400' },
  { label: 'Late', color: 'bg-purple-500 ring-2 ring-white dark:ring-slate-900' }
];

export default function AttendanceLegend() {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center py-3 px-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl">
      {LEGENDS.map((leg) => (
        <div key={leg.label} className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${leg.color}`} />
          <span>{leg.label}</span>
        </div>
      ))}
    </div>
  );
}
