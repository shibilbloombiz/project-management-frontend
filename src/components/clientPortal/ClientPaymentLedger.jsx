import React from 'react';
import { DollarSign, Percent, Info } from 'lucide-react';
import { clientPortalHelpers } from '../../utils/clientPortalHelpers';

export default function ClientPaymentLedger({ ledger }) {
  const { total, paid, outstanding, approvedExtraCharges } = ledger;
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
        <DollarSign size={14} className="mr-1.5 text-indigo-500" />
        Payment Ledger Summary
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-semibold text-left">
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
          <span className="text-[9px] text-slate-450 uppercase block font-extrabold tracking-wider">Total Contract</span>
          <span className="text-base font-black text-slate-800 block mt-1">
            {clientPortalHelpers.formatCurrency(total)}
          </span>
        </div>

        <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <span className="text-[9px] text-emerald-600 uppercase block font-extrabold tracking-wider">Total Settled</span>
          <span className="text-base font-black text-emerald-700 block mt-1">
            {clientPortalHelpers.formatCurrency(paid)}
          </span>
        </div>

        <div className="p-3.5 bg-purple-50 border border-purple-100 rounded-2xl">
          <span className="text-[9px] text-purple-600 uppercase block font-extrabold tracking-wider">Scope Changes</span>
          <span className="text-base font-black text-purple-700 block mt-1">
            {clientPortalHelpers.formatCurrency(approvedExtraCharges)}
          </span>
        </div>

        <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl">
          <span className="text-[9px] text-amber-600 uppercase block font-extrabold tracking-wider">Outstanding</span>
          <span className="text-base font-black text-amber-700 block mt-1">
            {clientPortalHelpers.formatCurrency(outstanding)}
          </span>
        </div>
      </div>

      {/* Progress towards contract settlement */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-450 uppercase tracking-widest">
          <span>Settlement Progress</span>
          <span className="text-emerald-650">{paidPct}% Settled</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${paidPct}%` }}></div>
        </div>
      </div>
    </div>
  );
}
