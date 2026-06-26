import React, { useState } from 'react';
import { DollarSign, Plus, Trash2 } from 'lucide-react';

export default function InvoiceManager({ budget, invoices = [], onAddInvoice, onDeleteInvoice, onUpdateInvoiceStatus }) {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [newInvoiceDesc, setNewInvoiceDesc] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [newInvoiceStatus, setNewInvoiceStatus] = useState('Pending');
  const [newInvoiceDueDate, setNewInvoiceDueDate] = useState('');
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);

  const totalAmount = invoices.length > 0
    ? invoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
    : (budget || 0);

  const paidAmount = invoices.length > 0
    ? invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
    : 0;

  const outstandingAmount = totalAmount - paidAmount;
  const paymentPercentage = totalAmount > 0 ? Math.min(100, Math.round(paidAmount / totalAmount * 100)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newInvoiceAmount) return;
    setIsAddingInvoice(true);
    try {
      const invoiceData = {
        invoiceId: `INV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
        date: new Date().toISOString().split('T')[0],
        desc: newInvoiceDesc.trim() || 'Billing Milestone',
        amount: Number(newInvoiceAmount) || 0,
        status: newInvoiceStatus,
        dueDate: newInvoiceDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paidDate: newInvoiceStatus === 'Paid' ? new Date().toISOString().split('T')[0] : '',
      };
      await onAddInvoice(invoiceData);
      setNewInvoiceDesc('');
      setNewInvoiceAmount('');
      setNewInvoiceStatus('Pending');
      setNewInvoiceDueDate('');
      setShowInvoiceForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingInvoice(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign size={15} className="text-indigo-500" />
          Project Budget & Payment Metrics
        </h3>
        <button
          onClick={() => setShowInvoiceForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
        >
          <Plus size={12} />
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Metrics summary */}
        <div className="space-y-4 md:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-left">
              <span className="text-[10px] text-slate-405 dark:text-slate-500 font-extrabold uppercase tracking-wider block">Contract Value</span>
              <span className="text-base font-extrabold text-slate-800 dark:text-white block mt-1">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-left">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-extrabold uppercase tracking-wider block">Total Paid</span>
              <span className="text-base font-extrabold text-emerald-705 dark:text-emerald-350 block mt-1">₹{paidAmount.toLocaleString()}</span>
            </div>
            <div className="p-4 bg-amber-50/50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-left">
              <span className="text-[10px] text-amber-600 dark:text-amber-450 font-extrabold uppercase tracking-wider block">Outstanding</span>
              <span className="text-base font-extrabold text-amber-705 dark:text-amber-350 block mt-1">₹{outstandingAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Milestone Payment Status:</span>
            <span className="text-indigo-605 dark:text-indigo-400 font-extrabold">{paymentPercentage}% Cleared</span>
          </div>
        </div>

        {/* Liquid progress indicator */}
        <div className="flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/30">
          <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 shadow-lg shadow-indigo-100/50 dark:shadow-none liquid-container flex items-center justify-center relative">
            <div className="liquid-wave-back" style={{ bottom: `calc(${paymentPercentage}% - 100%)` }} />
            <div className="liquid-wave" style={{ bottom: `calc(${paymentPercentage}% - 100%)` }} />
            <div className="z-10 text-center font-extrabold text-slate-800 dark:text-slate-100 mix-blend-difference select-none text-sm">
              <span className="text-white text-base block font-display">{paymentPercentage}%</span>
              <span className="text-white text-[9px] uppercase tracking-wider block opacity-80 font-bold">Paid</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Creation Form */}
      {showInvoiceForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-left">
          <div className="border-b border-slate-200 dark:border-slate-850 pb-2">
            <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Generate Project Invoice</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Description / Milestone</label>
              <input
                type="text"
                required
                placeholder="e.g. Design Approved"
                value={newInvoiceDesc}
                onChange={e => setNewInvoiceDesc(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                placeholder="Amount"
                value={newInvoiceAmount}
                onChange={e => setNewInvoiceAmount(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
              <input
                type="date"
                value={newInvoiceDueDate}
                onChange={e => setNewInvoiceDueDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Initial Status</label>
              <select
                value={newInvoiceStatus}
                onChange={e => setNewInvoiceStatus(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer text-slate-800 dark:text-white"
              >
                <option value="Pending">Pending / Unpaid</option>
                <option value="Paid">Paid / Cleared</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              disabled={isAddingInvoice}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 cursor-pointer shadow"
            >
              {isAddingInvoice ? 'Creating...' : 'Save Invoice'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInvoiceForm(false);
                setNewInvoiceDueDate('');
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Invoices List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-250 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Invoice ID</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4">Milestone Description</th>
              <th className="py-3 px-4">Billing Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-semibold text-slate-600 dark:text-slate-350">
            {invoices.map((inv) => (
              <tr key={inv.invoiceId || inv._id || inv.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-indigo-650 dark:text-indigo-400">{inv.invoiceId}</td>
                <td className="py-3 px-4 text-slate-450 dark:text-slate-500 font-medium">{inv.date}</td>
                <td className="py-3 px-4 truncate max-w-[140px] text-slate-700 dark:text-slate-350">{inv.desc || '—'}</td>
                <td className="py-3 px-4 font-extrabold text-slate-800 dark:text-white">₹{(inv.amount || 0).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <select
                    value={inv.status}
                    onChange={e => onUpdateInvoiceStatus(inv.invoiceId || inv._id || inv.id, e.target.value)}
                    className={`text-[9px] font-black px-2 py-0.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase tracking-wider ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                        : inv.status === 'Overdue'
                          ? 'bg-red-50 border-red-100 text-red-655 dark:bg-red-950/20 dark:border-red-900/30'
                          : 'bg-amber-50 border-amber-100 text-amber-655 dark:bg-amber-955/20 dark:border-amber-900/30'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-slate-450 dark:text-slate-500 font-medium">{inv.dueDate || '—'}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onDeleteInvoice(inv.invoiceId || inv._id || inv.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer transition-colors"
                    title="Delete Invoice"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-slate-400 dark:text-slate-500 font-bold italic">
                  No project invoices generated yet. Click "Create Invoice" above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
