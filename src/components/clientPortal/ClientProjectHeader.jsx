import React from 'react';
import { Briefcase, User, Calendar, Tag, ShieldCheck } from 'lucide-react';
import { clientPortalHelpers } from '../../utils/clientPortalHelpers';

export default function ClientProjectHeader({ overview }) {
  const { name, desc, status, manager, sprint, completionPct, org } = overview;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden space-y-4">
      <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] bg-indigo-50 text-indigo-750 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-widest">
              Live Workspace
            </span>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest flex items-center space-x-0.5">
              <ShieldCheck size={10} className="mr-0.5" />
              <span>Token Authenticated</span>
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center mt-1">
            <Briefcase size={20} className="text-indigo-650 mr-2 shrink-0" />
            {name}
          </h2>
        </div>

        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
          status === 'Completed'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
            : status === 'On Hold'
              ? 'bg-amber-55/10 text-amber-700 border-amber-100'
              : 'bg-indigo-50 text-indigo-700 border-indigo-100'
        }`}>
          {status || 'Active'}
        </span>
      </div>

      <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-2xl text-left">
        {desc || 'No custom description provided for this work directory.'}
      </p>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-[11px] font-bold text-slate-455">
        <div className="space-y-1">
          <span className="text-[8.5px] uppercase font-extrabold tracking-widest text-slate-400 block">Workspace Org</span>
          <span className="text-slate-800 flex items-center"><Tag size={12} className="text-slate-400 mr-1 shrink-0" /> {org || 'My Org'}</span>
        </div>
        <div className="space-y-1">
          <span className="text-[8.5px] uppercase font-extrabold tracking-widest text-slate-400 block">Lead POC</span>
          <span className="text-slate-800 flex items-center"><User size={12} className="text-slate-400 mr-1 shrink-0" /> {manager || 'Marcus Vance'}</span>
        </div>
        <div className="space-y-1">
          <span className="text-[8.5px] uppercase font-extrabold tracking-widest text-slate-400 block">Sprint Phase</span>
          <span className="text-slate-800 flex items-center"><Briefcase size={12} className="text-slate-400 mr-1 shrink-0" /> {sprint || 'Sprint 3 - Core APIs'}</span>
        </div>
        <div className="space-y-1">
          <span className="text-[8.5px] uppercase font-extrabold tracking-widest text-slate-400 block">Task Progress</span>
          <span className="text-indigo-600 block">{completionPct}% Completed</span>
        </div>
      </div>
    </div>
  );
}
