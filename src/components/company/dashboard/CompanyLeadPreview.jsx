import LeadDashboard from '../../lead/LeadDashboard';

export default function CompanyLeadPreview({ lead, companyId, org, onExit }) {
  return (
    <div className="flex-grow flex flex-col min-h-screen">
      <div className="flex items-center justify-between px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm text-left animate-fade-in">
        <div className="flex items-center space-x-3">
          <button
            onClick={onExit}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-750 shadow-sm"
          >
            &larr; Exit Preview Mode
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden md:inline">
            | Previewing Project Lead: <strong className="text-indigo-650 dark:text-indigo-400 font-extrabold">{lead.name}</strong> ({lead.email})
          </span>
        </div>
        <div className="text-[10px] uppercase font-black tracking-widest text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
          Lead Dashboard View
        </div>
      </div>
      <div className="flex-grow">
        <LeadDashboard userEmail={lead.email} companyId={companyId} initialOrg={org} onLogout={onExit} />
      </div>
    </div>
  );
}
