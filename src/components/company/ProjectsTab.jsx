import React, { useState } from 'react';
import { Briefcase, User, Calendar, Tag, ShieldAlert, Plus, Link, Trash2 } from 'lucide-react';

export default function ProjectsTab({ projects, projectLeads = [], onCreateProject, onSoftDelete, org, onViewProject, userEmail, adminName }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [status, setStatus] = useState('Active');
  const [leadId, setLeadId] = useState('');
  const [generatedLink, setGeneratedLink] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !clientEmail) return;
    onCreateProject({ name, desc, clientEmail, status, leadId });
    setName('');
    setDesc('');
    setClientEmail('');
    setStatus('Active');
    setLeadId('');
    setShowCreateModal(false);
  };

  const handleGenerateLink = (accessKey) => {
    // Generate simulated guest access gateway link
    const link = `${window.location.origin}/share/${accessKey}`;
    setGeneratedLink(link);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Tab Header with Actions */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-md font-extrabold font-display text-slate-800 dark:text-white">Project Architectures</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Manage deliverables, generate client guest keys, and track status registry.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-colors"
        >
          <Plus size={13} />
          <span>Create Project</span>
        </button>
      </div>

      {/* Sharing link popup overlay */}
      {generatedLink && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-transition">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center">
              <Link size={13} className="mr-1.5" /> Client Access Gateway Link Generated
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-450 font-medium">Clients can use this direct tokenized URL to inspect project status without credentials.</p>
            <input 
              type="text" 
              readOnly 
              value={generatedLink} 
              className="bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900/30 rounded px-2 py-1 text-xs font-mono w-full select-all font-semibold text-emerald-800 dark:text-emerald-450 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                alert('Copied to clipboard!');
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors w-full sm:w-auto text-center"
            >
              Copy Link
            </button>
            <button
              onClick={() => setGeneratedLink(null)}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-colors w-full sm:w-auto text-center"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Projects list registry */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-805/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Project Title & Description</th>
                <th className="py-4 px-6">Client Email Address</th>
                <th className="py-4 px-6">Current Status</th>
                <th className="py-4 px-6">Access Tokens</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {projects.map((proj) => (
                <tr key={proj._id || proj.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <span 
                      onClick={() => onViewProject && onViewProject(proj)} 
                      className="font-extrabold text-slate-800 dark:text-white block hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {proj.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block max-w-md mt-0.5 leading-normal">{proj.desc}</span>
                    {proj.leadId ? (
                      <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold block mt-1">
                        Lead: {proj.leadId}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1 italic">
                        No Lead Assigned
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-xs font-mono font-medium text-slate-500 dark:text-slate-400">{proj.clientEmail}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                      proj.status === 'Completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                        : proj.status === 'On Hold'
                          ? 'bg-amber-50 dark:bg-amber-950/45 text-amber-700 dark:text-amber-450 border-amber-100 dark:border-amber-900/30'
                          : 'bg-indigo-50 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                    }`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleGenerateLink(proj.clientAccessKey)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-450 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline flex items-center cursor-pointer text-left"
                      >
                        <Link size={12} className="mr-1" />
                        <span>Generate Access Link</span>
                      </button>
                      <button
                        onClick={() => onViewProject && onViewProject(proj)}
                        className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center cursor-pointer text-left"
                      >
                        <Briefcase size={12} className="mr-1 text-slate-400 dark:text-slate-500" />
                        <span>Inspect Detailed Space</span>
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onSoftDelete(proj._id || proj.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 border border-transparent hover:border-red-200 dark:hover:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                      title="Move to Trash"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-bold">No projects registered under {org}.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Project Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 id="create-project-title" className="text-sm font-extrabold font-display text-slate-800 dark:text-white flex items-center">
                <Briefcase size={16} className="text-indigo-600 dark:text-indigo-400 mr-2" /> Register New Project Node
              </h4>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-semibold text-xs text-slate-700 dark:text-slate-300">
              <div>
                <label htmlFor="proj-name" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Project Title
                </label>
                <input
                  id="proj-name"
                  type="text"
                  required
                  placeholder="e.g. TPS Reporting Pipeline"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="proj-client" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Client Email Address
                </label>
                <input
                  id="proj-client"
                  type="email"
                  required
                  placeholder="e.g. lumbergh@initech.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="proj-status" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Current Pipeline Status
                </label>
                <select
                  id="proj-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active / In Progress</option>
                  <option value="On Hold">On Hold / Paused</option>
                  <option value="Completed">Completed / Closed</option>
                </select>
              </div>

              <div>
                <label htmlFor="proj-lead" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Company Lead
                </label>
                <select
                  id="proj-lead"
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No Lead Assigned</option>
                  {userEmail && (
                    <option value={userEmail}>{adminName} (Company Lead)</option>
                  )}
                  {projectLeads.map((lead) => (
                    <option key={lead._id || lead.email} value={lead.email}>
                      {lead.name} ({lead.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="proj-desc" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Deliverable Summary & Scope
                </label>
                <textarea
                  id="proj-desc"
                  rows="3"
                  placeholder="Summarize code milestones, deliverables, requirements..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-3 justify-end border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-colors"
                >
                  Provision Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
