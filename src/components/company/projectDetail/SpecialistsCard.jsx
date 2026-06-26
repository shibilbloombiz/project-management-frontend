import React from 'react';
import { Users } from 'lucide-react';

export default function SpecialistsCard({ assignedStaff = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
          <Users size={14} className="mr-2 text-indigo-500" /> Assigned Specialists
        </h3>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400 font-bold">
          {assignedStaff.length} Members
        </span>
      </div>
      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
        {assignedStaff.map(email => (
          <div key={email} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-855 rounded-xl transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-slate-600 dark:text-slate-400">
                {email[0].toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{email}</span>
            </div>
            <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 px-2 py-0.5 rounded-full font-bold">Specialist</span>
          </div>
        ))}
        {assignedStaff.length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium text-center py-4">No staff explicitly assigned to this node.</p>
        )}
      </div>
    </div>
  );
}
