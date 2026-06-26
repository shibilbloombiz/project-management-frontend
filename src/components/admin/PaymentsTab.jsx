import React from 'react';
import { CreditCard } from 'lucide-react';

export default function PaymentsTab({ payments, companies }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/70 dark:bg-slate-850/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            <th className="py-4 px-6">Company & Profile Details</th>
            <th className="py-4 px-6">Billing Admin</th>
            <th className="py-4 px-6">Client Client Name</th>
            <th className="py-4 px-6">Transaction Date</th>
            <th className="py-4 px-6">Amount USD</th>
            <th className="py-4 px-6">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-350">
          {payments.map((pay) => {
            const relativeCompany = companies.find(c => (c._id && c._id === pay.companyId) || (c.id && c.id === pay.companyId) || c.name === pay.org);
            return (
              <tr key={pay._id || pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-extrabold text-slate-800 dark:text-white block">{pay.org}</span>
                  {relativeCompany ? (
                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold block mt-0.5 uppercase tracking-wide">
                      Plan: {relativeCompany.plan} • Seats: {relativeCompany.users}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">SaaS Custom Invoice Link</span>
                  )}
                </td>
                <td className="py-4 px-6 text-xs font-medium font-mono text-slate-500 dark:text-slate-400">
                  {relativeCompany ? relativeCompany.admin : 'billing@company.com'}
                </td>
                <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{pay.clientName}</td>
                <td className="py-4 px-6 text-xs text-slate-400 dark:text-slate-500 font-medium">{pay.date}</td>
                <td className="py-4 px-6 text-slate-900 dark:text-slate-200 font-extrabold">${pay.amount.toLocaleString()}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                    pay.status === 'Paid' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30'
                      : pay.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-955/40 dark:text-amber-450 dark:border-amber-900/30'
                        : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30'
                  }`}>
                    {pay.status}
                  </span>
                </td>
              </tr>
            );
          })}
          {payments.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                <div className="flex flex-col items-center justify-center space-y-2 py-6">
                  <CreditCard size={32} className="text-slate-300 dark:text-slate-700" />
                  <span className="text-slate-500 dark:text-slate-405 font-bold">No Payments Recorded</span>
                  <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">Transactional statements will appear here.</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
