import React from 'react';
import { CalendarDays } from 'lucide-react';

export default function AttendanceLogButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-44 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-900/40 dark:hover:bg-blue-950/20 dark:hover:text-blue-400 cursor-pointer"
    >
      <CalendarDays size={18} className="text-blue-500 shrink-0" />
      Attendance Log
    </button>
  );
}
