import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';

const STATUS_COLORS = {
  Done: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30",
  QA: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
  Review: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
  "QA / Review": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
  Dev: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/40 dark:text-amber-400 dark:border-amber-900/30",
  "In Dev": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/40 dark:text-amber-400 dark:border-amber-900/30",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/40 dark:text-amber-400 dark:border-amber-900/30",
  Planning: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
};

const parseTaskNote = (noteText) => {
  if (!noteText) {
    return {
      log: '',
      hours: '',
      progress: '0',
      blockers: '',
      needSupport: false,
    };
  }
  const logMatch = noteText.match(/\[Log\]\s*(.*?)(?=\. Spent:|$)/);
  const hoursMatch = noteText.match(/Spent:\s*(\d+)h/);
  const progressMatch = noteText.match(/Progress:\s*(\d+)%/);
  const blockersMatch = noteText.match(/Blockers:\s*(.*?)(?=\. Support:|$)/);
  const supportMatch = noteText.match(/Support:\s*(Yes|No)/);
  return {
    log: logMatch ? logMatch[1] : noteText,
    hours: hoursMatch ? hoursMatch[1] : '',
    progress: progressMatch ? progressMatch[1] : '0',
    blockers: blockersMatch ? blockersMatch[1] : '',
    needSupport: supportMatch ? supportMatch[1] === 'Yes' : false,
  };
};

export default function TaskSpecsModal({ task, onClose }) {
  if (!task) return null;
  const parsed = parseTaskNote(task.note);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-800 dark:text-slate-100 text-left animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-1 text-left">
            <h4 className="text-sm font-extrabold font-display text-slate-800 dark:text-white flex items-center">
              <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400 mr-2" /> Task Specifications
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: {task.id || task._id || "N/A"}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-350 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 text-xs font-semibold">
          <div className="text-left">
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Title</span>
            <p className="text-xs font-extrabold text-slate-800 dark:text-white leading-snug">{task.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-left">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Assignee</span>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                  {(task.assigneeName || task.assigneeEmail || "S")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{task.assigneeName || "Sprint Specialist"}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{task.assigneeEmail || "unassigned"}</p>
                </div>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Status</span>
              <div>
                <span className={`inline-block px-2.5 py-1 text-[10px] rounded-full border font-bold uppercase tracking-wider ${STATUS_COLORS[task.status] || STATUS_COLORS.Planning}`}>
                  {task.status}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 text-left">
            <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-500" /> Progress Status</span>
              <span className="text-indigo-600 dark:text-indigo-400">{parsed.progress || "0"}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${parsed.progress || 0}%` }}></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-bold">
              <span>Hours Spent: <strong className="text-slate-700 dark:text-slate-300">{parsed.hours || "0"} hrs</strong></span>
              <span>Support Needed: <strong className={parsed.needSupport ? "text-red-505" : "text-slate-500"}>{parsed.needSupport ? "Yes" : "No"}</strong></span>
            </div>
          </div>

          {/* Blockers */}
          {parsed.blockers && parsed.blockers.toLowerCase() !== "none" ? (
            <div className="p-3 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-800 dark:text-red-400 text-left">
              <AlertTriangle size={16} className="text-red-505 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest block mb-0.5">Active Blocker Alert</span>
                <p className="text-xs font-bold leading-normal">{parsed.blockers}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-semibold text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Blockers</span>
              <span>No active blockers reported by the specialist.</span>
            </div>
          )}

          {/* Log Note */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 text-left">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Specialist Activity Log</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed whitespace-pre-wrap">
              {parsed.log || "No work details logged yet."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-105 dark:text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
          >
            Close Specs
          </button>
        </div>
      </div>
    </div>
  );
}
