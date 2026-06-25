import { AlertTriangle, Briefcase, CreditCard, Users } from 'lucide-react';

function KpiCard({ tone, label, value, suffix, icon, onClick, caption, path }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden cursor-pointer hover:border-${tone}-400 dark:hover:border-${tone}-500 hover:shadow-md transition-all group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-display block">{label}</span>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-1 block">
            {value} {suffix && <span className="text-xs text-slate-400 dark:text-slate-550 font-medium">{suffix}</span>}
          </span>
        </div>
        {icon}
      </div>
      <div className={`flex items-center text-xs font-semibold text-${tone}-600 dark:text-${tone}-400`}>
        <span>{caption}</span>
        <svg className="h-6 w-16 ml-auto" viewBox="0 0 100 30">
          <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

export default function CompanyKpiGrid({
  activeProjectsCount,
  projectsCount,
  employeeCount,
  pendingLeavesCount,
  totalBillings,
  onSelectTab,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left animate-fade-in">
      <KpiCard
        tone="indigo"
        label="Active Projects"
        value={activeProjectsCount}
        suffix={`/ ${projectsCount}`}
        icon={<span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"><Briefcase size={16} /></span>}
        caption="Scoped deliverables"
        path="M0,25 Q15,10 30,22 T60,5 T90,20"
        onClick={() => onSelectTab('projects')}
      />
      <KpiCard
        tone="purple"
        label="Workspace Headcount"
        value={employeeCount}
        suffix="staff"
        icon={<span className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-lg text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"><Users size={16} /></span>}
        caption="Registered roster"
        path="M0,28 Q15,20 30,12 T60,25 T90,8"
        onClick={() => onSelectTab('employees')}
      />
      <KpiCard
        tone="amber"
        label="Pending Leaves"
        value={pendingLeavesCount}
        suffix="letters"
        icon={<span className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-lg text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform"><AlertTriangle size={16} /></span>}
        caption={pendingLeavesCount > 0 ? 'Action requested' : 'Roster complete'}
        path="M0,15 Q15,10 30,22 T60,5 T90,8"
        onClick={() => onSelectTab('employees')}
      />
      <KpiCard
        tone="emerald"
        label="Total Billing Receipts"
        value={`₹${totalBillings.toLocaleString()}`}
        icon={<span className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform"><CreditCard size={16} /></span>}
        caption="Realized payments"
        path="M0,25 Q15,22 30,12 T60,18 T90,2"
        onClick={() => onSelectTab('billing')}
      />
    </div>
  );
}
