import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function EmployeeLeadsCrud({ companyId }) {
  const storageKey = `syncra_employee_leads_${companyId || 'default'}`;

  // State Management
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // Form Fields
  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('Applied');
  const [error, setError] = useState('');

  // Load leads on mount/company change
  useEffect(() => {
    const data = localStorage.getItem(storageKey);
    if (data) {
      try {
        setLeads(JSON.parse(data));
      } catch (_) {
        setLeads([]);
      }
    } else {
      setLeads([]);
    }
  }, [companyId]);

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
    localStorage.setItem(storageKey, JSON.stringify(newLeads));
  };

  const handleOpenAdd = () => {
    setEditingLead(null);
    setCandidateName('');
    setEmail('');
    setPhone('');
    setPosition('');
    setTargetDate('');
    setStatus('Applied');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setEditingLead(lead);
    setCandidateName(lead.candidateName || '');
    setEmail(lead.email || '');
    setPhone(lead.phone || '');
    setPosition(lead.position || '');
    setTargetDate(lead.targetDate || '');
    setStatus(lead.status || 'Applied');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!candidateName.trim() || !email.trim()) {
      setError('Candidate Name and Email are required.');
      return;
    }

    const leadData = {
      id: editingLead ? editingLead.id : Date.now().toString(),
      candidateName: candidateName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      position: position.trim(),
      targetDate,
      status
    };

    if (editingLead) {
      saveLeads(leads.map(l => l.id === editingLead.id ? leadData : l));
    } else {
      saveLeads([...leads, leadData]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee lead?')) {
      saveLeads(leads.filter(l => l.id !== id));
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'Applied': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'Interviewing': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
      case 'Offer Extended': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'Rejected': return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div>
          <h4 className="text-sm font-extrabold text-slate-805 dark:text-white uppercase tracking-wider">Candidate Pipelines</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">CRUD console for monitoring prospective candidate leads.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
        >
          <Plus size={13} />
          <span>Add Employee Lead</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-805/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider">
                <th className="py-4 px-6">Candidate Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Position / Role</th>
                <th className="py-4 px-6">Target Onboard</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-350">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-white">{lead.candidateName}</td>
                  <td className="py-4 px-6 font-mono font-medium text-slate-550 dark:text-slate-450">{lead.email}</td>
                  <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-450">{lead.phone || '-'}</td>
                  <td className="py-4 px-6 font-extrabold text-slate-700 dark:text-slate-300">{lead.position || '-'}</td>
                  <td className="py-4 px-6 font-medium text-slate-400 dark:text-slate-500">{lead.targetDate || '-'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenEdit(lead)}
                      className="p-1 text-slate-405 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Edit Lead"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="p-1 text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors cursor-pointer"
                      title="Delete Lead"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400 dark:text-slate-500 font-bold">No active employee leads registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 relative text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-extrabold font-display text-slate-808 dark:text-white">
                {editingLead ? 'Edit Employee Candidate Lead' : 'Register Employee Candidate Lead'}
              </h4>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-655 dark:text-red-400 text-xs font-semibold">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-705 dark:text-slate-300">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Candidate Name</label>
                <input
                  type="text" required value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="e.g. Peter Gibbons"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. peter.candidate@company.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Phone Number</label>
                  <input
                    type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 555-0199"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Position / Role</label>
                  <input
                    type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Software Engineer"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Target Onboard Date</label>
                  <input
                    type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Status</label>
                  <select
                    value={status} onChange={e => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer Extended">Offer Extended</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-2 pt-3 justify-end border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-md transition-colors"
                >
                  {editingLead ? 'Save Changes' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
