import React, { useState } from 'react';
import { Briefcase, CreditCard, LogOut, MessageSquare, Trash2, Users, ChevronDown, ChevronRight, User, CalendarClock, CheckSquare } from 'lucide-react';

const itemClass = (isActive) =>
  `w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
    isActive
      ? 'bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 shadow-sm border-l-4 border-indigo-600 pl-2'
      : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-855 hover:text-slate-850 dark:hover:text-slate-200'
  }`;

function SidebarItem({ tab, label, icon, count, activeTab, onSelect, danger }) {
  return (
    <button onClick={() => onSelect(tab)} className={itemClass(activeTab === tab)}>
      <span className={danger ? 'text-red-500' : ''}>{icon}</span>
      <span>{label}</span>
      {count !== undefined && (
        <span className="ml-auto bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

export default function CompanySidebar({ activeTab, onSelectTab, counts, org, onLogout, isOpen }) {
  const [leadsExpanded, setLeadsExpanded] = useState(false);

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-6 flex flex-col justify-between shrink-0 text-left transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 ease-in-out`}>
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-widest block mb-3 font-display px-2">
            Console Operations
          </span>
          <div className="space-y-1">
            <SidebarItem tab="employees" label="Staff & Attendance" icon={<Users size={16} />} count={counts.employees} activeTab={activeTab} onSelect={onSelectTab} />
            <SidebarItem tab="projects" label="My Projects" icon={<Briefcase size={16} />} activeTab={activeTab} onSelect={onSelectTab} />
            <SidebarItem tab="tasks" label="Task Manager" icon={<CheckSquare size={16} />} activeTab={activeTab} onSelect={onSelectTab} />
            <SidebarItem tab="company-leads" label="Company Leads" icon={<Users size={16} />} activeTab={activeTab} onSelect={onSelectTab} />
            <SidebarItem tab="clients" label="Clients & Ledger" icon={<CreditCard size={16} />} count={counts.clients} activeTab={activeTab} onSelect={onSelectTab} />
            <SidebarItem tab="billing" label="Subscription & Billing" icon={<CreditCard size={16} className="text-brand-purple" />} activeTab={activeTab} onSelect={onSelectTab} />
            <SidebarItem tab="profile" label="Configure Profile" icon={<User size={16} />} activeTab={activeTab} onSelect={onSelectTab} />
            <SidebarItem tab="trash" label="Workspace Trash" icon={<Trash2 size={16} />} count={counts.trash} activeTab={activeTab} onSelect={onSelectTab} danger={counts.trash > 0} />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 bg-gradient-to-tr from-slate-50 to-indigo-50/50 dark:from-slate-850 dark:to-indigo-950/20 rounded-xl border border-slate-200 dark:border-slate-800 text-left">
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Workspace Node</span>
          <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-250 font-display">{org}</span>
        </div>
        <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer">
          <LogOut size={16} />
          <span>Log out Workspace</span>
        </button>
      </div>
    </aside>
  );
}
