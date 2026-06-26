import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function ClientLeadsCrud({ companyId, token }) {
  // State Management
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState(''); // e.g. Interested Services / Project Scope
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('New');
  const [error, setError] = useState('');

  // Load leads on mount/company change
  const fetchLeads = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/crm-leads/clients`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setLeads(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch client leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [companyId, token]);

  const handleOpenAdd = () => {
    setEditingLead(null);
    setClientName('');
    setEmail('');
    setPhone('');
    setPosition('');
    setTargetDate('');
    setStatus('New');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setEditingLead(lead);
    setClientName(lead.clientName || '');
    setEmail(lead.email || '');
    setPhone(lead.phone || '');
    setPosition(lead.position || '');
    setTargetDate(lead.targetDate || '');
    setStatus(lead.status || 'New');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !email.trim()) {
      setError('Client Name and Email are required.');
      return;
    }

    const payload = {
      clientName: clientName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      position: position.trim(),
      targetDate,
      status
    };

    try {
      const leadId = editingLead ? (editingLead._id || editingLead.id) : null;
      const url = editingLead
        ? `${API_BASE_URL}/api/crm-leads/clients/${leadId}`
        : `${API_BASE_URL}/api/crm-leads/clients`;

      const response = await fetch(url, {
        method: editingLead ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        fetchLeads();
        setIsModalOpen(false);
      } else {
        setError(data.message || 'Operation failed.');
      }
    } catch (err) {
      console.error('Error saving client lead:', err);
      setError('Network communication failed.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client lead?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/crm-leads/clients/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          fetchLeads();
        }
      } catch (err) {
        console.error('Error deleting client lead:', err);
      }
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'New': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'Contacted': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
      case 'Proposal Sent': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'Lost': return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400';
      case 'Active Client': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-150 dark:border-indigo-900/30';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div>
          <h4 className="text-sm font-extrabold text-slate-805 dark:text-white uppercase tracking-wider">Client Pipelines</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">CRUD console for monitoring prospective client leads and pipeline accounts.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
        >
          <Plus size={13} />
          <span>Add Client Lead</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 size={24} className="text-indigo-500 animate-spin" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing client pipeline...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-805/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider">
                  <th className="py-4 px-6">Client Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Interested In</th>
                  <th className="py-4 px-6">Target Onboard</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-350">
                {leads.map(lead => {
                  const leadId = lead._id || lead.id;
                  return (
                    <tr key={leadId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-white">{lead.clientName}</td>
                      <td className="py-4 px-6 font-mono font-medium text-slate-500 dark:text-slate-455">{lead.email}</td>
                      <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-455">{lead.phone || '-'}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-700 dark:text-slate-300">{lead.position || '-'}</td>
                      <td className="py-4 px-6 font-medium text-slate-400 dark:text-slate-505">{lead.targetDate || '-'}</td>
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
                          onClick={() => handleDelete(leadId)}
                          className="p-1 text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-slate-400 dark:text-slate-505 font-bold uppercase tracking-wider">No active client leads registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CRUD Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 relative text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-slate-405 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-extrabold font-display text-slate-808 dark:text-white">
                {editingLead ? 'Edit Client Candidate Lead' : 'Register Client Candidate Lead'}
              </h4>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-650 dark:text-red-400 text-xs font-semibold">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-705 dark:text-slate-300">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Client Name</label>
                <input
                  type="text" required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Peter Gibbons"
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. peter.candidate@company.com"
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Phone Number</label>
                  <input
                    type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 555-0199"
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Interested In</label>
                  <input
                    type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Software Development"
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Target Onboard Date</label>
                  <input
                    type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Status</label>
                  <select
                    value={status} onChange={e => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Active Client">Active Client</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-2 pt-3 justify-end border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 font-bold rounded-xl cursor-pointer"
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
