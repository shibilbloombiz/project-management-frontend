import React from 'react';
import { DollarSign, CheckCircle2, FileText, ClipboardList, Info } from 'lucide-react';
import { clientPortalHelpers } from '../../utils/clientPortalHelpers';

export default function ClientProjectKpiCards({ kpis }) {
  const { completionPct, pendingRequirements, pendingInvoices, totalPaid, pendingExtraCharges, sharedFilesCount } = kpis;

  const cards = [
    { label: 'Work Completed', val: `${completionPct}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/40 border-emerald-100' },
    { label: 'Total Capital Paid', val: clientPortalHelpers.formatCurrency(totalPaid), icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50/40 border-indigo-100' },
    { label: 'Pending Invoices', val: pendingInvoices, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50/40 border-amber-100' },
    { label: 'Change Proposals', val: pendingRequirements, icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-slate-50 border-slate-200' },
    { label: 'Proposed Costs', val: clientPortalHelpers.formatCurrency(pendingExtraCharges), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50/40 border-purple-100' },
    { label: 'Shared Files', val: sharedFilesCount, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className={`p-4 border rounded-2xl flex flex-col justify-between space-y-1 ${c.bg}`}>
            <div className="flex items-center justify-between text-slate-500 font-extrabold uppercase tracking-wider text-[9px] text-left">
              <span>{c.label}</span>
              <Icon size={12} className={c.color} />
            </div>
            <span className="text-sm font-black text-slate-800 block text-left mt-1">{c.val}</span>
          </div>
        );
      })}
    </div>
  );
}
