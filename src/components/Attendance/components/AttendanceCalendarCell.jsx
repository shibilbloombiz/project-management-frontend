import React from 'react';
import { getStatusConfig } from '../utils/attendanceHelpers';

export default function AttendanceCalendarCell({ day, isToday, onClick }) {
  if (!day) {
    // Empty cell for alignment padding
    return <div className="w-full aspect-square bg-slate-50/10 dark:bg-slate-900/5 rounded-lg" />;
  }

  const { status, date, dayNumber, isLate, checkIn, checkOut, duration } = day;
  const isFuture = status === 'Future';
  const config = getStatusConfig(status);

  const handleClick = () => {
    if (!isFuture && onClick) {
      onClick(date);
    }
  };

  const showTooltip = status === 'Present' || status === 'Half Day' || status === 'Late';

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col items-center justify-center p-1 rounded-lg border transition-all duration-200 w-full aspect-square text-center select-none ${
        isToday 
          ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-950 border-indigo-300' 
          : 'border-slate-200 dark:border-slate-800'
      } ${
        isFuture 
          ? 'bg-slate-50 text-slate-350 cursor-not-allowed border-slate-100/50 dark:bg-slate-900/10 dark:border-slate-850/20 dark:text-slate-650' 
          : `${config.bg} cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 ${config.hover}`
      }`}
    >
      {/* Date Number and Late dot overlay */}
      <div className="flex items-center justify-center relative w-full h-full">
        <span className={`text-xs sm:text-sm font-black ${isToday ? 'text-indigo-850 dark:text-indigo-300 underline underline-offset-2' : ''}`}>
          {dayNumber}
        </span>
        {isLate && (
          <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-purple-500 ring-[1px] ring-white dark:ring-slate-900 animate-pulse" title="Late Check-in" />
        )}
      </div>

      {/* Pure-CSS Tooltip Overlay */}
      {showTooltip && (
        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900/95 dark:bg-slate-800/95 text-white p-3 rounded-xl shadow-2xl text-left text-[11px] leading-relaxed font-semibold border border-slate-700/30 backdrop-blur-sm pointer-events-none">
          <div className="border-b border-slate-700/50 pb-1.5 mb-1.5 flex justify-between items-center">
            <span className="font-extrabold text-xs text-indigo-400">{status}</span>
            {isLate && <span className="text-[9px] bg-purple-500/25 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-500/30">Late</span>}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Check In:</span>
              <span className="text-slate-200">{checkIn || '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Check Out:</span>
              <span className="text-slate-200">{checkOut || '--'}</span>
            </div>
            <div className="flex justify-between font-extrabold border-t border-slate-750/30 pt-1 mt-1">
              <span className="text-slate-400">Work Hours:</span>
              <span className="text-emerald-400">{duration || '--'}</span>
            </div>
          </div>
          <svg className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-2 text-slate-900/95 dark:text-slate-800/95 fill-current" viewBox="0 0 12 8">
            <path d="M6 8L0 0H12L6 8Z" />
          </svg>
        </div>
      )}
    </div>
  );
}
