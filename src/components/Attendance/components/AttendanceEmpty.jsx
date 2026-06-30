import React from 'react';
import { CalendarX, RefreshCw } from 'lucide-react';

export default function AttendanceEmpty({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-slate-200 border-dashed rounded-3xl bg-white dark:bg-slate-900/50 dark:border-slate-800 space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
        <CalendarX size={32} />
      </div>
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">No attendance records found</h3>
        <p className="text-xs text-slate-400 font-medium mt-1">Try resetting the filters or modifying the date range.</p>
      </div>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer transition-colors"
        >
          <RefreshCw size={12} />
          Reset Filters
        </button>
      )}
    </div>
  );
}
