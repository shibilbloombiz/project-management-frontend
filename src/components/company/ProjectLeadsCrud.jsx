import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, X, AlertCircle, Loader2,
  CheckCircle2, Briefcase, User, Mail, Phone, DollarSign,
  Calendar, Activity, ExternalLink
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const PHASES = [
  'Client Gave Idea',
  'Collecting Requirements',
  'Creating Feature List',
  'Creating Timeline',
  'Assigning Tasks',
  'Development Started',
  'Tracking Progress',
  'Solving Blockers',
  'Client Update Sent',
  'QA Testing',
  'Bug Fixing',
  'Client Review',
  'Deployed',
  'Final Handover',
  'Maintenance',
];

const PHASE_COLOR = (phase) => {
  const idx = PHASES.indexOf(phase);
  if (idx < 0)   return 'bg-slate-100 text-slate-600 border-slate-200';
  if (idx < 4)   return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/40';
  if (idx < 8)   return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/40';
  if (idx < 12)  return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40';
};

const STATUS_OPTIONS = ['Prospect', 'Contacted', 'Negotiation', 'Closed', 'Lost'];
const STATUS_COLOR = {
  Prospect:    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  Contacted:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40',
  Negotiation: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
  Closed:      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40',
  Lost:        'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40',
};

const inputCls = 'w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors';
const labelCls = 'block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5';

export default function ProjectLeadsCrud({ companyId, token, onGoToProject, onRefresh }) {
  const [leads,        setLeads]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [editingLead,  setEditingLead]  = useState(null);
  const [toast,        setToast]        = useState(null);   // { type, msg }
  const [error,        setError]        = useState('');

  // form state
  const [projectName,  setProjectName]  = useState('');
  const [clientName,   setClientName]   = useState('');
  const [clientEmail,  setClientEmail]  = useState('');
  const [phone,        setPhone]        = useState('');
  const [budget,       setBudget]       = useState('');
  const [targetDate,   setTargetDate]   = useState('');
  const [status,       setStatus]       = useState('Prospect');
  const [currentPhase, setCurrentPhase] = useState(PHASES[0]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLeads = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/crm-leads/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setLeads(data.data || []);
    } catch (err) {
      console.error('Failed to fetch project leads:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchLeads(); }, [fetchLeads, companyId]);

  const resetForm = () => {
    setProjectName(''); setClientName(''); setClientEmail('');
    setPhone(''); setBudget(''); setTargetDate('');
    setStatus('Prospect'); setCurrentPhase(PHASES[0]);
    setError('');
  };

  const handleOpenAdd = () => {
    setEditingLead(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setEditingLead(lead);
    setProjectName(lead.projectName   || '');
    setClientName(lead.clientName     || '');
    setClientEmail(lead.clientEmail   || '');
    setPhone(lead.phone               || '');
    setBudget(lead.budget             || '');
    setTargetDate(lead.targetDate     || '');
    setStatus(lead.status             || 'Prospect');
    setCurrentPhase(lead.currentPhase || PHASES[0]);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim() || !clientEmail.trim()) {
      setError('Project Name and Client Email are required.');
      return;
    }
    const payload = {
      projectName: projectName.trim(),
      clientName:  clientName.trim(),
      clientEmail: clientEmail.trim(),
      phone:       phone.trim(),
      budget:      budget ? Number(budget) : 0,
      targetDate,
      status,
      currentPhase,
    };
    try {
      const leadId = editingLead ? (editingLead._id || editingLead.id) : null;
      const url    = leadId
        ? `${API_BASE_URL}/api/crm-leads/projects/${leadId}`
        : `${API_BASE_URL}/api/crm-leads/projects`;
      const res    = await fetch(url, {
        method:  leadId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const data   = await res.json();
      if (data.success) {
        fetchLeads();
        if (onRefresh) onRefresh();
        setIsModalOpen(false);
        if (!leadId) {
          showToast('success', `Lead created! Project "${projectName}" auto-added to My Projects & Client Leads.`);
        } else {
          showToast('info', 'Lead updated successfully.');
        }
      } else {
        setError(data.message || 'Operation failed.');
      }
    } catch (err) {
      console.error('Error saving project lead:', err);
      setError('Network error. Please try again.');
    }
  };

  const handlePhaseChange = async (lead, newPhase) => {
    const leadId = lead._id || lead.id;
    try {
      await fetch(`${API_BASE_URL}/api/crm-leads/projects/${leadId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ ...lead, currentPhase: newPhase }),
      });
      setLeads(prev => prev.map(l => (l._id || l.id) === leadId ? { ...l, currentPhase: newPhase } : l));
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project lead? The auto-created project will remain in My Projects.')) return;
    try {
      const res  = await fetch(`${API_BASE_URL}/api/crm-leads/projects/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
        if (onRefresh) onRefresh();
        showToast('info', 'Lead deleted.');
      }
    } catch (err) { console.error('Error deleting project lead:', err); }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-bold max-w-sm animate-fade-in
          ${toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
            : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-300'}`}
        >
          <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-current opacity-50 hover:opacity-100 cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Briefcase size={16} className="text-indigo-500" />
            Project Pipeline Leads
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Create a lead to auto-generate a project in My Projects and a client entry in Client Leads.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-md shadow-indigo-100 dark:shadow-none"
        >
          <Plus size={13} />
          <span>Add Project Lead</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-indigo-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading leads...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Project</th>
                  <th className="py-3.5 px-5">Client</th>
                  <th className="py-3.5 px-5">Contact</th>
                  <th className="py-3.5 px-5">Budget</th>
                  <th className="py-3.5 px-5">Target Date</th>
                  <th className="py-3.5 px-5">Current Phase</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                {leads.map(lead => {
                  const id = lead._id || lead.id;
                  return (
                    <tr key={id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Project Name */}
                      <td className="py-3.5 px-5">
                        <div className="font-extrabold text-slate-800 dark:text-white">{lead.projectName}</div>
                        {lead.projectId && (
                          <button
                            onClick={() => onGoToProject && onGoToProject(lead.projectId)}
                            className="flex items-center gap-1 text-[9px] text-indigo-500 hover:text-indigo-700 font-bold mt-0.5 cursor-pointer"
                          >
                            <ExternalLink size={9} /> View Project
                          </button>
                        )}
                      </td>
                      {/* Client */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <User size={11} className="text-slate-400 flex-shrink-0" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{lead.clientName || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Mail size={10} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
                          <span className="font-mono text-[10px] text-slate-400">{lead.clientEmail}</span>
                        </div>
                      </td>
                      {/* Phone */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <Phone size={11} className="text-slate-400 flex-shrink-0" />
                          <span>{lead.phone || '—'}</span>
                        </div>
                      </td>
                      {/* Budget */}
                      <td className="py-3.5 px-5 font-bold text-slate-800 dark:text-slate-200">
                        {lead.budget ? `₹${Number(lead.budget).toLocaleString()}` : '—'}
                      </td>
                      {/* Target Date */}
                      <td className="py-3.5 px-5 font-medium text-slate-400 dark:text-slate-500">
                        {lead.targetDate || '—'}
                      </td>
                      {/* Current Phase — inline dropdown */}
                      <td className="py-3.5 px-5">
                        <select
                          value={lead.currentPhase || PHASES[0]}
                          onChange={e => handlePhaseChange(lead, e.target.value)}
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${PHASE_COLOR(lead.currentPhase)}`}
                        >
                          {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${STATUS_COLOR[lead.status] || STATUS_COLOR.Prospect}`}>
                          {lead.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(lead)}
                            title="Edit"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-400 dark:text-slate-500 font-bold">
                      No project leads yet. Click "Add Project Lead" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 relative text-left max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Title */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Briefcase size={16} className="text-indigo-500" />
                {editingLead ? 'Edit Project Lead' : 'Register New Project Lead'}
              </h4>
              {!editingLead && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                  This will automatically create a Project in My Projects and a Client entry in Client Leads.
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-2 text-red-600 dark:text-red-400 text-xs font-semibold">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Project Name */}
              <div>
                <label className={labelCls}>
                  <Briefcase size={9} className="inline mr-1" /> Project Name *
                </label>
                <input type="text" required value={projectName} onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. Acme E-Commerce Platform" className={inputCls} />
              </div>

              {/* Row 2: Client Name + Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}><User size={9} className="inline mr-1" /> Client Name</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                    placeholder="e.g. John Smith" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}><Mail size={9} className="inline mr-1" /> Client Email *</label>
                  <input type="email" required value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                    placeholder="client@example.com" className={inputCls} />
                </div>
              </div>

              {/* Row 3: Phone + Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}><Phone size={9} className="inline mr-1" /> Phone</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}><DollarSign size={9} className="inline mr-1" /> Budget (₹)</label>
                  <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
                    placeholder="e.g. 150000" className={inputCls} />
                </div>
              </div>

              {/* Row 4: Target Date + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}><Calendar size={9} className="inline mr-1" /> Target Date</label>
                  <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Lead Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 5: Current Phase */}
              <div>
                <label className={labelCls}><Activity size={9} className="inline mr-1" /> Current Phase</label>
                <select value={currentPhase} onChange={e => setCurrentPhase(e.target.value)} className={inputCls}>
                  {PHASES.map((p, i) => <option key={p} value={p}>{i + 1}. {p}</option>)}
                </select>
              </div>

              {/* Submit */}
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer text-xs transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-100 text-xs transition-colors">
                  {editingLead ? 'Save Changes' : 'Create Lead & Auto-Generate Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
