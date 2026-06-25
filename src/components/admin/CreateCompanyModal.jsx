import React, { useState, useEffect } from 'react';
import { Building } from 'lucide-react';

export default function CreateCompanyModal({ plans, onClose, onSubmit, error }) {
  const [form, setForm] = useState({
    name: '',
    admin: '',
    plan: '',
    users: 10,
    billing: 0,
    desc: ''
  });

  const sortedPlans = (plans && plans.length > 0) ? [...plans].sort((a, b) => a.price - b.price) : [];

  useEffect(() => {
    if (sortedPlans.length > 0) {
      setForm(prev => ({
        ...prev,
        plan: sortedPlans[0].name,
        billing: sortedPlans[0].price
      }));
    }
  }, [plans]);

  const handlePlanSelect = (selectedPlan) => {
    setForm(prev => ({
      ...prev,
      plan: selectedPlan.name,
      billing: selectedPlan.price
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 text-left"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-tenant-title"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h3 id="create-tenant-title" className="text-md font-extrabold font-display text-slate-800 flex items-center">
            <Building size={16} className="text-indigo-600 mr-2" /> Provision SaaS Workspace Node
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label htmlFor="comp-name" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-display">
                Company Name
              </label>
              <input
                id="comp-name"
                type="text"
                required
                placeholder="e.g. Stark Industries"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            {/* Admin Email */}
            <div>
              <label htmlFor="comp-admin" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-display">
                Admin Email Address
              </label>
              <input
                id="comp-admin"
                type="email"
                required
                placeholder="e.g. tony@stark.com"
                value={form.admin}
                onChange={e => setForm(prev => ({ ...prev, admin: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
          </div>

          {/* Package Plan Selection - Dynamically mapped from DB plans */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-display">
              Subscription Package Tier
            </label>
            <div className="grid grid-cols-3 gap-2 font-semibold">
              {sortedPlans.map(p => (
                <button
                  key={p._id || p.id}
                  type="button"
                  onClick={() => handlePlanSelect(p)}
                  className={`py-2 px-3 border rounded-xl text-center cursor-pointer transition-all ${
                    form.plan === p.name
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700 font-extrabold shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold'
                  }`}
                >
                  <div className="text-[11px] truncate">{p.name}</div>
                  <div className="text-[9px] mt-0.5 opacity-80">${p.price.toLocaleString()}/mo</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Users limit */}
            <div>
              <label htmlFor="comp-users" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-display">
                Initial Seats / Users
              </label>
              <input
                id="comp-users"
                type="number"
                min="1"
                required
                value={form.users}
                onChange={e => setForm(prev => ({ ...prev, users: Number(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            {/* Monthly Billing */}
            <div>
              <label htmlFor="comp-billing" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-display">
                Monthly Billing (₹)
              </label>
              <input
                id="comp-billing"
                type="number"
                min="0"
                required
                value={form.billing}
                onChange={e => setForm(prev => ({ ...prev, billing: Number(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="comp-desc" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-display">
              Workspace Description / Node Activity
            </label>
            <textarea
              id="comp-desc"
              rows="2"
              placeholder="Describe company operations, workspace rules or specific project bounds..."
              value={form.desc}
              onChange={e => setForm(prev => ({ ...prev, desc: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-3 justify-end border-t border-slate-200">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-colors"
            >
              Provision Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
