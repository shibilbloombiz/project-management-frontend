import React from 'react';
import { Briefcase } from 'lucide-react';

export default function RequirementsCard({ requirements = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
          <Briefcase size={14} className="mr-2 text-indigo-500" /> Technical Requirements
        </h3>
      </div>
      <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium max-h-[160px] overflow-y-auto pr-1">
        {requirements.map((req, i) => (
          <li key={i} className="flex items-start space-x-2.5 bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-150 dark:border-slate-850 rounded-xl">
            <span className="w-5 h-5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-lg text-[10px] font-extrabold shrink-0 mt-0.5">{i + 1}</span>
            <span className="leading-relaxed text-slate-700 dark:text-slate-300 font-bold">{req}</span>
          </li>
        ))}
        {requirements.length === 0 && (
          <li className="text-center py-6 text-slate-450 dark:text-slate-500 font-medium">No special requirements specifications stored.</li>
        )}
      </ul>
    </div>
  );
}
