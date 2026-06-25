import { Layers, Printer } from 'lucide-react';

export default function CompanyInvoiceModal({
  invoice,
  companyDetails,
  org,
  userEmail,
  onClose,
}) {
  if (!invoice) return null;

  const amount = invoice.amount || 0;
  const subtotal = amount / 1.18;
  const tax = subtotal * 0.09;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print-overlay">
      <div id="printable-invoice" className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-8 relative flex flex-col space-y-6 text-left">
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-5 no-print-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-650">
              {companyDetails?.logo ? <img src={companyDetails.logo} alt="Company Logo" className="w-full h-full object-contain p-1" /> : <Layers size={20} />}
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white font-display uppercase tracking-wider">{org}</h3>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tax Invoice Statement</span>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-wider">
              Paid
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-extrabold mt-1.5 font-mono">
              INV-2026-{invoice.paymentId || invoice._id || invoice.id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-xs font-semibold text-slate-700 dark:text-slate-355">
          <AddressBlock
            title="Billed To:"
            lines={[
              companyDetails?.billingName || org,
              companyDetails?.billingEmail || userEmail,
              companyDetails?.billingPhone || 'N/A',
              companyDetails?.billingAddress || 'N/A',
            ]}
          />
          <AddressBlock
            title="Billed From:"
            lines={[
              'Syncra SaaS Systems Pvt Ltd',
              'billing@syncra.io',
              '+91 80 4040 1010',
              '100 Innovation Way, Tech Park, Bangalore, KA, 560001, India',
            ]}
          />
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Syncra SaaS platform subscription - {companyDetails?.plan || 'Free'} Plan
                  </div>
                  <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">
                    Roster capacity limit configured at {companyDetails?.users || 5} active employee seats.
                  </div>
                </td>
                <td className="py-3 px-4 text-center">1</td>
                <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                  ₹{amount.toLocaleString()} INR
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-xs font-semibold text-slate-555 dark:text-slate-400">
            <SummaryLine label="Subtotal" value={`₹${subtotal.toFixed(2)} INR`} />
            <SummaryLine label="CGST (9%)" value={`₹${tax.toFixed(2)} INR`} />
            <SummaryLine label="SGST (9%)" value={`₹${tax.toFixed(2)} INR`} />
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5 text-sm font-black text-slate-950 dark:text-white">
              <span>Grand Total Paid</span>
              <span className="font-black text-indigo-650 dark:text-indigo-400">₹{amount.toFixed(2)} INR</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-855 pt-5 flex items-center justify-between gap-4">
          <div className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-normal max-w-xs">
            {companyDetails?.autopay !== false ? (
              <span className="text-emerald-600 dark:text-emerald-450 font-bold block">Recurring Autopay Renewal Enabled</span>
            ) : (
              <span className="block">Autopay renewal is disabled. Manually complete renewals before expiry to avoid downtime.</span>
            )}
            Transaction ID: {invoice.paymentId || 'N/A'}.
          </div>
          <div className="flex items-center space-x-2 no-print">
            <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5">
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-slate-150 dark:bg-slate-800 hover:bg-slate-205 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-xl cursor-pointer transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressBlock({ title, lines }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block font-display">{title}</span>
      {lines.map((line, index) => (
        <p key={line} className={index === 0 ? 'font-extrabold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-455 font-medium leading-relaxed'}>
          {line}
        </p>
      ))}
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-extrabold text-slate-800 dark:text-slate-250">{value}</span>
    </div>
  );
}
