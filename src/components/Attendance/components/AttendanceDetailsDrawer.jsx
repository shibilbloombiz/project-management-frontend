import React from 'react';
import { X, Calendar, Clock, MapPin, MessageSquare, AlertTriangle, Coffee } from 'lucide-react';
import { getStatusConfig } from '../utils/attendanceHelpers';

export default function AttendanceDetailsDrawer({
  isOpen,
  onClose,
  isLoading,
  error,
  detail
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 z-40 bg-slate-900/30 dark:bg-slate-950/40 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
      />

      {/* Drawer Panel */}
      <aside className="fixed right-0 top-0 z-50 h-full w-80 sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col animate-slide-left text-left font-sans select-text">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Attendance Log Detail
            </span>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 mt-0.5">
              <Calendar size={14} className="text-indigo-500" />
              {detail ? detail.date : 'Loading...'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Fetching clock parameters...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 p-4 text-center">
            <AlertTriangle size={32} className="text-rose-500" />
            <p className="text-xs font-bold text-slate-800 dark:text-white">Unable to load details</p>
            <p className="text-[11px] text-slate-400 font-medium">{error}</p>
          </div>
        ) : detail ? (
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Status Section */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Day Status</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-1">
                  {detail.status}
                </p>
              </div>
              <span className={`h-3 w-3 rounded-full ${getStatusConfig(detail.status).dot}`} />
            </div>

            {/* Metrics Checklist */}
            <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 border-b border-slate-50 dark:border-slate-850 pb-1">
                Shift Log
              </h4>

              {/* Check In / Out */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Check In</span>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Clock size={12} className="text-emerald-500" />
                    {detail.checkIn}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Check Out</span>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Clock size={12} className="text-indigo-500" />
                    {detail.checkOut}
                  </p>
                </div>
              </div>

              {/* Working Hours / Break / Overtime */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50/40 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-850 rounded-2xl p-3 text-center">
                <div>
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Working</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">{detail.workingHours}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Break</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">{detail.breakTime}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Overtime</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">{detail.overtime}</span>
                </div>
              </div>

              {/* Other details */}
              <div className="space-y-3.5 pt-2">
                {/* Location */}
                <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400" /> Location
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                    {detail.location}
                  </span>
                </div>

                {/* Late Minutes */}
                {detail.lateMinutes > 0 && (
                  <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <Clock size={12} className="text-purple-400" /> Late Minutes
                    </span>
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                      {detail.lateMinutes} mins
                    </span>
                  </div>
                )}

                {/* Leave Type */}
                {detail.leaveType && (
                  <div className="flex flex-col gap-1 border-b border-slate-50 dark:border-slate-850 pb-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Leave Reason / Reason
                    </span>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 italic">
                      "{detail.leaveType}"
                    </p>
                  </div>
                )}

                {/* Remarks */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-slate-400" /> Remarks
                  </span>
                  <p className="text-[11px] font-bold text-slate-650 dark:text-slate-300 bg-slate-50 dark:bg-slate-850/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {detail.remarks}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
