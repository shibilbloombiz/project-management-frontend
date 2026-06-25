import React from 'react';
import { FileText, Download, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { clientPortalHelpers } from '../../utils/clientPortalHelpers';

export default function ClientInvoiceTable({ invoices }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-slate-400 font-semibold py-12">
        <FileText size={24} className="mx-auto text-slate-300 mb-2" />
        <p>No billing invoices generated yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
        <FileText size={14} className="mr-1.5 text-indigo-500" />
        Billing History & Invoices
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-semibold text-slate-650 min-w-[500px]">
          <thead>
            <tr className="text-[9px] uppercase font-extrabold tracking-wider border-b border-slate-100 text-slate-400">
              <th className="py-2.5 text-left">Invoice Ref</th>
              <th className="py-2.5 text-left">Date</th>
              <th className="py-2.5 text-left">Description</th>
              <th className="py-2.5 text-left">Amount</th>
              <th className="py-2.5 text-left">Status</th>
              <th className="py-2.5 text-left">Due Date</th>
              <th className="py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {invoices.map((inv, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 font-bold text-slate-800">{inv.invoiceId}</td>
                <td className="py-3 text-slate-500">{clientPortalHelpers.formatDate(inv.date)}</td>
                <td className="py-3 max-w-[150px] truncate" title={inv.desc}>{inv.desc || 'General Billing'}</td>
                <td className="py-3 font-extrabold text-slate-800">{clientPortalHelpers.formatCurrency(inv.amount)}</td>
                <td className="py-3">
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 border text-[9px] font-black rounded-lg uppercase tracking-wider ${
                    inv.status === 'Paid'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : inv.status === 'Overdue'
                        ? 'bg-red-50 border-red-100 text-red-650'
                        : 'bg-amber-50 border-amber-100 text-amber-650'
                  }`}>
                    {inv.status === 'Paid' && <CheckCircle2 size={10} className="mr-0.5" />}
                    {inv.status === 'Pending' && <Clock size={10} className="mr-0.5" />}
                    {inv.status === 'Overdue' && <AlertTriangle size={10} className="mr-0.5 text-red-500 animate-pulse" />}
                    <span>{inv.status}</span>
                  </span>
                </td>
                <td className="py-3 text-slate-500">{clientPortalHelpers.formatDate(inv.dueDate)}</td>
                <td className="py-3 text-right">
                  <button 
                    onClick={() => alert(`Downloading receipt invoice ${inv.invoiceId}...`)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg cursor-pointer transition-colors"
                    title="Download Receipt"
                  >
                    <Download size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
