import React, { useState } from 'react';
import { Users, CreditCard, Plus, Trash2, ChevronDown, ChevronRight, DollarSign, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function ClientsTab({ clients, payments, onCreateClient, onSoftDelete, org }) {
  const [showAddClient, setShowAddClient] = useState(false);
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [expandedClient, setExpandedClient] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    onCreateClient({ name, email });
    setName(''); setEmail('');
    setShowAddClient(false);
  };

  // Build per-client ledger from payments array
  const ledger = {};
  (payments || []).forEach(pay => {
    const key = pay.clientEmail || pay.clientName || 'Unknown';
    if (!ledger[key]) ledger[key] = { clientName: pay.clientName || key, clientEmail: pay.clientEmail || key, entries: [] };
    ledger[key].entries.push(pay);
  });

  const PAYMENT_STATUS = {
    Paid:    { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40', icon: <CheckCircle2 size={10} /> },
    Pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40', icon: <Clock size={10} /> },
    Overdue: { cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40', icon: <AlertTriangle size={10} /> },
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-md font-extrabold font-display text-slate-800 dark:text-white flex items-center gap-2">
            <Users size={16} className="text-indigo-500" /> Client Registries &amp; Ledger
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Manage customer billing accounts, payment history, and invoices.
          </p>
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-colors"
        >
          <Plus size={13} /><span>Add Client Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Client Directory */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-extrabold font-display text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <Users size={14} className="text-indigo-500" /> Company Client Directory
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                {(clients || []).map((cli) => (
                  <tr key={cli._id || cli.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">{cli.name}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500 dark:text-slate-450">{cli.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${
                        cli.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40'
                      }`}>{cli.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={() => onSoftDelete(cli._id || cli.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!clients || clients.length === 0) && (
                  <tr><td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500 font-bold">No clients registered yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Ledger */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-extrabold font-display text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <CreditCard size={14} className="text-indigo-500" /> Billing &amp; Payments Ledger
          </div>
          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 max-h-[360px] overflow-y-auto">
            {(payments || []).map((pay) => {
              const sc = PAYMENT_STATUS[pay.status] || PAYMENT_STATUS.Pending;
              return (
                <div key={pay._id || pay.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors space-y-2 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-white block">{pay.clientName}</span>
                      {pay.projectName && <span className="text-[10px] text-slate-400 font-medium">{pay.projectName}</span>}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 font-semibold flex-shrink-0">{pay.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold font-mono text-sm">
                      ₹{Number(pay.amount || 0).toLocaleString()}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${sc.cls}`}>
                      {sc.icon} {pay.status}
                    </span>
                  </div>
                </div>
              );
            })}
            {(!payments || payments.length === 0) && (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 font-bold text-xs">No payment records yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Per-Client Summary Accordion */}
      {Object.keys(ledger).length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <DollarSign size={14} className="text-indigo-500" />
            <span className="font-extrabold text-slate-800 dark:text-white text-sm">Client-wise Payment Summary</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Object.entries(ledger).map(([key, data]) => {
              const total       = data.entries.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
              const paid        = data.entries.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
              const outstanding = total - paid;
              const pct         = total > 0 ? Math.round((paid / total) * 100) : 0;
              const isExpanded  = expandedClient === key;

              return (
                <div key={key}>
                  <button
                    onClick={() => setExpandedClient(isExpanded ? null : key)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center justify-center text-sm flex-shrink-0">
                        {(data.clientName || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-white text-sm block">{data.clientName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{data.entries.length} payment record{data.entries.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block space-y-1">
                        <div className="flex gap-4 text-xs">
                          <div className="text-center">
                            <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Total</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">₹{total.toLocaleString()}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-[9px] font-extrabold text-emerald-500 uppercase tracking-wider">Paid</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{paid.toLocaleString()}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-[9px] font-extrabold text-red-500 uppercase tracking-wider">Due</span>
                            <span className="font-bold text-red-600 dark:text-red-400">₹{outstanding.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <th className="py-2.5 px-5 text-left">Project</th>
                            <th className="py-2.5 px-5 text-left">Date</th>
                            <th className="py-2.5 px-5 text-right">Amount</th>
                            <th className="py-2.5 px-5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                          {data.entries.map((entry, i) => {
                            const sc = PAYMENT_STATUS[entry.status] || PAYMENT_STATUS.Pending;
                            return (
                              <tr key={i} className="hover:bg-white dark:hover:bg-slate-800/60 transition-colors">
                                <td className="py-2.5 px-5 font-bold text-slate-800 dark:text-slate-200">{entry.projectName || '—'}</td>
                                <td className="py-2.5 px-5 text-slate-400 font-medium">{entry.date || '—'}</td>
                                <td className="py-2.5 px-5 text-right font-bold text-slate-800 dark:text-slate-200">₹{Number(entry.amount || 0).toLocaleString()}</td>
                                <td className="py-2.5 px-5 text-right">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${sc.cls}`}>
                                    {sc.icon} {entry.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Client Dialog */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddClient(false)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-extrabold font-display text-slate-800 dark:text-white flex items-center gap-2">
                <Users size={16} className="text-indigo-500" /> Add Client Profile
              </h4>
              <button onClick={() => setShowAddClient(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 font-semibold text-xs text-slate-700 dark:text-slate-300">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Client / Company Name</label>
                <input type="text" required placeholder="e.g. Acme Corp" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Client Email</label>
                <input type="email" required placeholder="billing@acme.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddClient(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-colors">Create Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
