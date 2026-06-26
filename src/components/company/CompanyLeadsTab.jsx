import React, { useState } from 'react';
import ProjectLeadsCrud from './ProjectLeadsCrud';
import ClientLeadsCrud from './ClientLeadsCrud';
import { Briefcase, Users, LayoutDashboard } from 'lucide-react';

export default function CompanyLeadsTab({ companyId, token, onRefresh }) {
  const [subTab, setSubTab] = useState('projects'); // 'projects' | 'clients'

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Premium Dashboard Header & View Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm gap-4">
        <div>
          <h3 className="text-md font-extrabold font-display text-slate-850 dark:text-white flex items-center">
            <LayoutDashboard size={18} className="text-indigo-600 dark:text-indigo-400 mr-2" />
            CRM Lead Management
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Track and manage prospective project requests and client pipeline accounts.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-850 p-1 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-inner">
          <button
            onClick={() => setSubTab('projects')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'projects'
                ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800/80'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Briefcase size={13} />
            <span>Project Leads</span>
          </button>
          <button
            onClick={() => setSubTab('clients')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'clients'
                ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800/80'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users size={13} />
            <span>Client Leads</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-transition">
        {subTab === 'projects' ? (
          <ProjectLeadsCrud companyId={companyId} token={token} onRefresh={onRefresh} />
        ) : (
          <ClientLeadsCrud companyId={companyId} token={token} />
        )}
      </div>
    </div>
  );
}
