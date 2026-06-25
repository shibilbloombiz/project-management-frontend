import React from 'react';
import { AlertCircle, CheckCircle2, DollarSign, ClipboardCheck } from 'lucide-react';

export default function ClientPendingActionsCard({ actions }) {
  if (!actions || actions.length === 0) {
    return (
      <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-3xl flex items-center gap-3 text-left">
        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
        <div className="text-xs font-semibold text-emerald-805">
          <strong className="block text-emerald-900 font-extrabold text-[11px] uppercase tracking-wider mb-0.5">Workspace Clear</strong>
          All caught up! No pending sign-offs, unpaid invoices, or reviews need your attention.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
        <AlertCircle size={14} className="mr-1.5 text-amber-500 animate-pulse" />
        Required Actions ({actions.length})
      </h3>

      <div className="space-y-2.5">
        {actions.map((act) => {
          const isInvoice = act.type === 'unpaid_invoice';
          const Icon = isInvoice ? DollarSign : ClipboardCheck;

          return (
            <div 
              key={act.id} 
              className={`p-3 border rounded-2xl flex items-start gap-3 transition-all ${
                isInvoice 
                  ? 'bg-amber-50/30 border-amber-100 text-amber-900' 
                  : 'bg-indigo-50/30 border-indigo-100 text-indigo-900'
              }`}
            >
              <span className={`p-1.5 rounded-xl border shrink-0 mt-0.5 ${
                isInvoice ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
              }`}>
                <Icon size={12} />
              </span>
              <div className="text-xs font-semibold">
                <span className="font-extrabold block text-slate-900 text-[11px]">{act.title}</span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{act.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
