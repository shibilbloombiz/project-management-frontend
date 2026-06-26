import React, { useState } from 'react';
import { Users, Plus, Share2 } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';

export default function ProjectLeadsTab({ projectLeads, org, onRefreshLeads, token }) {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCopyPortalLink = (lead) => {
    const text = `Hi ${lead.name},\n\nPlease access the workspace portal to configure your Project Lead dashboard:\nPortal URL: ${window.location.origin}\nEmail: ${lead.email}\nTemporary Password: (use the one provided by your administrator)`;
    navigator.clipboard.writeText(text);
    alert(`Portal access invite for Project Lead ${lead.name} copied to clipboard!`);
  };

  return (
    <div className="space-y-8 text-left">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-md font-extrabold font-display text-slate-800 dark:text-white flex items-center">
              <Users size={16} className="text-indigo-600 mr-2" /> Project Leads Directory
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Workspace project leads, domains, and access credentials registered on this tenant workspace node.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-md shadow-indigo-100 dark:shadow-none"
          >
            <Plus size={13} />
            <span>Add Project Lead</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-850/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Name Details</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Department / Domain</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-350">
              {projectLeads.map((lead) => (
                <tr key={lead._id || lead.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 flex items-center space-x-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-extrabold flex items-center justify-center text-xs shrink-0">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-extrabold text-slate-800 dark:text-white animate-fade-in">
                      {lead.name}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs font-mono font-medium text-slate-500 dark:text-slate-400">{lead.email}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                      {lead.domain || 'Project Management'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-450">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                      {lead.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-3.5">
                      <button
                        onClick={() => handleCopyPortalLink(lead)}
                        className="text-[10px] font-bold text-slate-500 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-350 hover:underline flex items-center cursor-pointer"
                      >
                        <Share2 size={11} className="mr-1" />
                        <span>Invite</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projectLeads.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-bold">
                    No project leads registered yet. Click "Add Project Lead" to register one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddSuccess={onRefreshLeads}
        token={token}
        role="Project Lead"
      />
    </div>
  );
}
