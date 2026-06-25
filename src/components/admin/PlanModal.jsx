import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';

export default function PlanModal({ isEditingPlan, planForm, onClose, onSubmit, error }) {
  const [form, setForm] = useState({
    name: '',
    price: 2500,
    limit: '15 Users',
    maxUsers: 15,
    maxProjects: 10
  });

  useEffect(() => {
    if (planForm) {
      setForm({
        name: planForm.name || '',
        price: planForm.price !== undefined ? planForm.price : 2500,
        limit: planForm.limit || '15 Users',
        maxUsers: planForm.maxUsers !== undefined ? planForm.maxUsers : 15,
        maxProjects: planForm.maxProjects !== undefined ? planForm.maxProjects : 10
      });
    }
  }, [planForm]);

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
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 text-left"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h3 className="text-md font-extrabold font-display text-slate-800 flex items-center">
            <CreditCard size={16} className="text-indigo-600 mr-2" /> 
            <span>{isEditingPlan ? 'Update Subscription Package' : 'Create Subscription Package'}</span>
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

        {/* Plan Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          
          {/* Plan Name */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-display">
              Package Title / Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Enterprise SaaS Tier"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          {/* Plan Price */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-display">
              Monthly Pricing Rate (₹)
            </label>
            <input
              type="number"
              min="0"
              required
              placeholder="e.g. 8900"
              value={form.price}
              onChange={e => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          {/* Plan limit description */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-display">
              User Limit Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 50 Users or Unlimited Users"
              value={form.limit}
              onChange={e => setForm(prev => ({ ...prev, limit: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          {/* Strict seat and project limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-display">
                Max Employee Seats
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.maxUsers}
                onChange={e => setForm(prev => ({ ...prev, maxUsers: Number(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-display">
                Max Projects Limit
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.maxProjects}
                onChange={e => setForm(prev => ({ ...prev, maxProjects: Number(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
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
              {isEditingPlan ? 'Update Plan' : 'Add Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
