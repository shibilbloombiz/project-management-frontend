import React from 'react';
import { CreditCard } from 'lucide-react';

export default function PaymentsTab({ payments, companies }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            <th className="py-4 px-6">Company & Profile Details</th>
            <th className="py-4 px-6">Billing Admin</th>
            <th className="py-4 px-6">Client Client Name</th>
            <th className="py-4 px-6">Transaction Date</th>
            <th className="py-4 px-6">Amount USD</th>
            <th className="py-4 px-6">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
          {payments.map((pay) => {
            const relativeCompany = companies.find(c => (c._id && c._id === pay.companyId) || (c.id && c.id === pay.companyId) || c.name === pay.org);
            return (
              <tr key={pay._id || pay.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-extrabold text-slate-800 block">{pay.org}</span>
                  {relativeCompany ? (
                    <span className="text-[10px] text-indigo-500 font-bold block mt-0.5 uppercase tracking-wide">
                      Plan: {relativeCompany.plan} • Seats: {relativeCompany.users}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">SaaS Custom Invoice Link</span>
                  )}
                </td>
                <td className="py-4 px-6 text-xs font-medium font-mono text-slate-500">
                  {relativeCompany ? relativeCompany.admin : 'billing@company.com'}
                </td>
                <td className="py-4 px-6 text-slate-700">{pay.clientName}</td>
                <td className="py-4 px-6 text-xs text-slate-400 font-medium">{pay.date}</td>
                <td className="py-4 px-6 text-slate-900 font-extrabold">${pay.amount.toLocaleString()}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                    pay.status === 'Paid' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : pay.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {pay.status}
                  </span>
                </td>
              </tr>
            );
          })}
          {payments.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-12 text-slate-400 text-xs font-semibold">
                <div className="flex flex-col items-center justify-center space-y-2 py-6">
                  <CreditCard size={32} className="text-slate-300" />
                  <span className="text-slate-500 font-bold">No Payments Recorded</span>
                  <span className="text-slate-400 font-medium text-[11px]">Transactional statements will appear here.</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
