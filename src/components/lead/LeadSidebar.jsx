import React from 'react';
import { 
  Layers, Briefcase, CheckSquare, Users, Clock, BarChart3, LogOut 
} from 'lucide-react';

export default function LeadSidebar({ activeTab, setActiveTab, org, leadName, onLogout, counts }) {
  const menuItems = [
    { id: 'projects', label: 'My Project', icon: Briefcase, count: counts.projects },
    { id: 'tasks', label: 'Task Manager', icon: CheckSquare, count: counts.tasks },
    { id: 'team', label: 'Team Workload', icon: Users, count: counts.team },
    { id: 'timetracking', label: 'Time Sheet Approvals', icon: Clock, count: counts.timesheets },
    { id: 'reports', label: 'Analytics', icon: BarChart3, count: null },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-6 flex flex-col justify-between shrink-0 text-left">
      <div className="space-y-6">
        {/* Console Header */}
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3 font-display px-2">
            Lead Console Operations
          </span>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50/60 text-indigo-600 shadow-sm border-l-4 border-indigo-600 pl-2'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.count !== null && item.count !== undefined && (
                    <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Area with Identity and Logout */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <div className="p-3 bg-gradient-to-tr from-slate-50 to-indigo-50/55 rounded-xl border border-slate-200 text-left">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Logged In Company</span>
          <span className="text-[11px] font-extrabold text-slate-800 font-display truncate block">{org}</span>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Log out Workspace</span>
        </button>
      </div>
    </aside>
  );
}
