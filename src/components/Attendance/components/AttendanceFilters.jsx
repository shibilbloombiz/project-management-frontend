import React from 'react';
import { MONTHS, getYearList } from '../utils/calendarUtils';
import { X, Calendar } from 'lucide-react';

export default function AttendanceFilters({
  isOpen,
  onClose,
  tempFilters,
  onChange,
  onApply,
  onReset
}) {
  if (!isOpen) return null;

  const years = getYearList();

  const handleApply = (e) => {
    e.preventDefault();
    onApply(tempFilters);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg relative text-left animate-slide-down">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        aria-label="Close filters"
      >
        <X size={16} />
      </button>

      <form onSubmit={handleApply} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center mb-1">
            Filter Attendance Logs
          </h4>
          <p className="text-[10px] text-slate-400 font-medium">Refine your calendar log data using queries.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Month */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Month</label>
            <select
              value={tempFilters.month || ''}
              onChange={(e) => onChange('month', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Current Month</option>
              {MONTHS.map((m, index) => (
                <option key={m} value={index + 1}>{m}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Year</label>
            <select
              value={tempFilters.year || ''}
              onChange={(e) => onChange('year', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Current Year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select
              value={tempFilters.status || ''}
              onChange={(e) => onChange('status', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
              <option value="Holiday">Holiday</option>
              <option value="Late">Late</option>
            </select>
          </div>

          {/* Custom Date Range: From */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">From Date</label>
            <input
              type="date"
              value={tempFilters.from || ''}
              onChange={(e) => onChange('from', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Custom Date Range: To */}
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">To Date</label>
            <input
              type="date"
              value={tempFilters.to || ''}
              onChange={(e) => onChange('to', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 font-bold rounded-xl cursor-pointer transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}
