import React from 'react';
import { Trash2 } from 'lucide-react';
import Tooltip from '../Tooltip';

export default function CompaniesTab({ companies, onSelectCompany, onToggleStatus, onSoftDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/70 dark:bg-slate-850/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            <th className="py-4 px-6">Company Architecture</th>
            <th className="py-4 px-6">Administrator Email</th>
            <th className="py-4 px-6">Subscription Plan</th>
            <th className="py-4 px-6">Active Users</th>
            <th className="py-4 px-6">Monthly Billing</th>
            <th className="py-4 px-6">Status Registry</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-350">
          {companies.map(comp => (
            <tr key={comp._id || comp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="py-4 px-6">
                <button 
                  onClick={() => onSelectCompany(comp)}
                  className="font-extrabold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block text-left font-display cursor-pointer"
                >
                  {comp.name}
                </button>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block max-w-sm mt-0.5 leading-normal">{comp.desc}</span>
              </td>
              <td className="py-4 px-6 text-xs font-medium font-mono text-slate-500 dark:text-slate-400">{comp.admin}</td>
              <td className="py-4 px-6">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border bg-slate-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30">
                  {comp.plan}
                </span>
              </td>
              <td className="py-4 px-6 text-slate-800 dark:text-slate-200 font-bold">{comp.users} Members</td>
              <td className="py-4 px-6 text-slate-800 dark:text-slate-200 font-bold">${comp.billing.toLocaleString()}</td>
              <td className="py-4 px-6">
                <span className={`flex items-center text-[10px] font-bold ${
                  comp.status === 'Active' ? 'text-emerald-600' : 'text-amber-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    comp.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}></span>
                  {comp.status}
                </span>
              </td>
              <td className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onToggleStatus(comp._id || comp.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      comp.status === 'Active'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 dark:text-amber-400 dark:border-amber-900/30'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-900/30'
                    }`}
                  >
                    {comp.status === 'Active' ? 'Suspend' : 'Activate'}
                  </button>
                  <Tooltip text="Move to Trash">
                    <button
                      onClick={() => onSoftDelete(comp._id || comp.id)}
                      className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 border border-transparent hover:border-red-200 dark:hover:border-red-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
          {companies.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-semibold">No companies match search filter query.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
