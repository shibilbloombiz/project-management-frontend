import React, { useState } from 'react';
import { Users, CreditCard, Plus, Trash2, Mail } from 'lucide-react';

export default function ClientsTab({ clients, payments, onCreateClient, onSoftDelete, org }) {
  const [showAddClient, setShowAddClient] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    onCreateClient({ name, email });
    setName('');
    setEmail('');
    setShowAddClient(false);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Tab Header with Actions */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-md font-extrabold font-display text-slate-800 dark:text-white">Client Registries</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Manage customer billing accounts, payments history, and invoices tracking.</p>
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-colors"
        >
          <Plus size={13} />
          <span>Add Client Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Client Directory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-extrabold font-display text-slate-800 dark:text-white text-sm">
            Company Client directory
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-805/40 border-b border-slate-200 dark:border-slate-800 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Client details</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-350">
                {clients.map((cli) => (
                  <tr key={cli._id || cli.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-805/30 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">{cli.name}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500 dark:text-slate-450">{cli.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${
                        cli.status === 'Active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                          : 'bg-amber-50 dark:bg-amber-955/45 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                      }`}>
                        {cli.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSoftDelete(cli._id || cli.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 border border-transparent hover:border-red-200 dark:hover:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Move to Trash"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-bold">No clients registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Payments Register */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-extrabold font-display text-slate-800 dark:text-white text-sm flex items-center">
              <CreditCard size={15} className="mr-1.5 text-indigo-600 dark:text-indigo-400" /> Billing & Payments Ledger
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
              {payments.map((pay) => (
                <div key={pay._id || pay.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-805/30 transition-colors space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 dark:text-white text-sm">{pay.clientName}</span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{pay.date}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold font-mono text-sm">${pay.amount.toLocaleString()}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${
                      pay.status === 'Paid'
                        ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                        : pay.status === 'Overdue'
                          ? 'bg-red-50 dark:bg-red-950/45 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30'
                          : 'bg-amber-50 dark:bg-amber-955/45 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                    }`}>
                      {pay.status}
                    </span>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <div className="text-center py-10 text-slate-400 dark:text-slate-505 font-bold">No payments ledger history.</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Add Client Dialog Overlay */}
      {showAddClient && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setShowAddClient(false)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-client-title"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 id="add-client-title" className="text-sm font-extrabold font-display text-slate-800 dark:text-white flex items-center">
                <Users size={16} className="text-indigo-600 dark:text-indigo-400 mr-2" /> Add Company Client Profile
              </h4>
              <button 
                onClick={() => setShowAddClient(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-semibold text-xs text-slate-705 dark:text-slate-300">
              <div>
                <label htmlFor="cli-name" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Client / Company Name
                </label>
                <input
                  id="cli-name"
                  type="text"
                  required
                  placeholder="e.g. Stark Industries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="cli-email" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Client Primary Email
                </label>
                <input
                  id="cli-email"
                  type="email"
                  required
                  placeholder="e.g. billing@stark.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex space-x-2 pt-3 justify-end border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-colors"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
