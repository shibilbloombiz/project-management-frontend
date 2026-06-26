import React from 'react';
import { User } from 'lucide-react';

export default function ClientProfileCard({ clientEmail, clientAccessKey }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
          <User size={14} className="mr-2 text-indigo-500" /> Client Profile
        </h3>
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center font-extrabold text-indigo-600 dark:text-indigo-400 text-lg">
          {clientEmail ? clientEmail[0].toUpperCase() : "C"}
        </div>
        <div>
          <span className="font-extrabold text-slate-800 dark:text-white text-sm block">Direct Project Sponsor</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block mt-0.5">{clientEmail}</span>
        </div>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Access Key Token:</span>
          <span className="font-mono text-slate-600 dark:text-slate-350 font-bold">{clientAccessKey || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Communication Channel:</span>
          <span className="text-slate-600 dark:text-slate-300 font-bold">Email + Direct Gateway</span>
        </div>
      </div>
    </div>
  );
}
