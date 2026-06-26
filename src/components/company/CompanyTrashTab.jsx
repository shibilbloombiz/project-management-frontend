import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Briefcase, Users } from 'lucide-react';

export default function CompanyTrashTab({ deletedProjects, deletedClients, onRestoreProject, onPurgeProject, onRestoreClient, onPurgeClient, org }) {
  const [subTab, setSubTab] = useState('projects'); // 'projects' | 'clients'

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Tab Selection Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm gap-4">
        <div>
          <h3 className="text-md font-extrabold font-display text-slate-850 dark:text-white flex items-center">
            <Trash2 size={18} className="text-red-500 mr-2" />
            Trash Registry Console
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Restore items back to active registers or purge them permanently from this node.
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
            <span>Projects ({deletedProjects.length})</span>
          </button>
          <button
            onClick={() => setSubTab('clients')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'clients'
                ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800/80'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users size={12} />
            <span>Clients ({deletedClients.length})</span>
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {subTab === 'projects' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-850/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Project Name & Scope</th>
                  <th className="py-4 px-6">Client Email</th>
                  <th className="py-4 px-6">Last Known Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-350">
                {deletedProjects.map((proj) => (
                  <tr key={proj._id || proj.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-slate-800 dark:text-white line-through block">{proj.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block max-w-md mt-0.5 leading-normal">{proj.desc}</span>
                    </td>
                    <td className="py-4 px-6 text-xs font-mono font-medium text-slate-500 dark:text-slate-400">{proj.clientEmail}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                        {proj.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onRestoreProject(proj._id || proj.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold border bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-900/30 transition-colors cursor-pointer flex items-center space-x-1"
                          title="Restore Project"
                        >
                          <RotateCcw size={12} />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => onPurgeProject(proj._id || proj.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold border bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400 dark:border-red-900/30 transition-colors cursor-pointer flex items-center space-x-1"
                          title="Permanently Delete Project"
                        >
                          <Trash2 size={12} />
                          <span>Purge</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {deletedProjects.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                      <div className="flex flex-col items-center justify-center space-y-2 py-6">
                        <AlertTriangle size={32} className="text-slate-300 dark:text-slate-700" />
                        <span className="text-slate-500 dark:text-slate-405 font-bold">Project Trash is Empty</span>
                        <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">Deleted projects will appear here for restoration or permanent purge.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {subTab === 'clients' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-850/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Client Name Details</th>
                  <th className="py-4 px-6">Client Email</th>
                  <th className="py-4 px-6">Status Registry</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-350">
                {deletedClients.map((cli) => (
                  <tr key={cli._id || cli.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-slate-800 dark:text-white line-through block">{cli.name}</span>
                    </td>
                    <td className="py-4 px-6 text-xs font-mono font-medium text-slate-500 dark:text-slate-400">{cli.email}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                        {cli.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onRestoreClient(cli._id || cli.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold border bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-900/30 transition-colors cursor-pointer flex items-center space-x-1"
                          title="Restore Client"
                        >
                          <RotateCcw size={12} />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => onPurgeClient(cli._id || cli.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold border bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400 dark:border-red-900/30 transition-colors cursor-pointer flex items-center space-x-1"
                          title="Permanently Delete Client"
                        >
                          <Trash2 size={12} />
                          <span>Purge</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {deletedClients.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                      <div className="flex flex-col items-center justify-center space-y-2 py-6">
                        <AlertTriangle size={32} className="text-slate-300 dark:text-slate-700" />
                        <span className="text-slate-500 dark:text-slate-405 font-bold">Client Trash is Empty</span>
                        <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">Deleted clients will appear here for restoration or permanent purge.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
