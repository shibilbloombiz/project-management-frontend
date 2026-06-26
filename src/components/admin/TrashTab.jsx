import React from 'react';
import { RotateCcw, Trash2, AlertTriangle } from 'lucide-react';

export default function TrashTab({ trashCompanies, onRestore, onPermanentDelete }) {
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
            <th className="py-4 px-6">Deleted Status</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-350">
          {trashCompanies.map(comp => (
            <tr key={comp._id || comp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="py-4 px-6">
                <span className="font-extrabold text-slate-800 dark:text-white line-through block">{comp.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block max-w-sm mt-0.5 leading-normal">{comp.desc}</span>
              </td>
              <td className="py-4 px-6 text-xs font-medium font-mono text-slate-500 dark:text-slate-400">{comp.admin}</td>
              <td className="py-4 px-6">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                  {comp.plan}
                </span>
              </td>
              <td className="py-4 px-6 text-slate-400 dark:text-slate-500 font-bold">{comp.users} Members</td>
              <td className="py-4 px-6 text-slate-400 dark:text-slate-500 font-bold">${comp.billing.toLocaleString()}</td>
              <td className="py-4 px-6">
                <span className="flex items-center text-[10px] font-bold text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-red-500 animate-pulse"></span>
                  In Trash
                </span>
              </td>
              <td className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onRestore(comp._id || comp.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-900/30 transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <RotateCcw size={12} />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => onPermanentDelete(comp._id || comp.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400 dark:border-red-900/30 transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <Trash2 size={12} />
                    <span>Purge</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {trashCompanies.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                <div className="flex flex-col items-center justify-center space-y-2 py-6">
                  <AlertTriangle size={32} className="text-slate-300 dark:text-slate-700" />
                  <span className="text-slate-500 dark:text-slate-405 font-bold">Trash Registry is Empty</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
