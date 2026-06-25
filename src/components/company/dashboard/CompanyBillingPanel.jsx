import { Camera, Layers, Printer } from 'lucide-react';

export default function CompanyBillingPanel({
  org,
  companyDetails,
  billingForm,
  setBillingForm,
  isEditingBilling,
  onToggleEditing,
  onSaveBillingDetails,
  onToggleAutopay,
  payments,
  onViewInvoice,
  plans = [],
}) {
  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/45 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              {companyDetails?.logo ? <img src={companyDetails.logo} alt="Company Logo" className="w-full h-full object-contain p-1 rounded-xl" /> : <Layers size={24} />}
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white">{org} Subscription</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage plan, billing information, and print invoices.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-indigo-550 text-white text-xs font-black rounded-full uppercase tracking-wider">{companyDetails?.plan || 'Free'} Plan</span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-855 text-slate-650 dark:text-slate-300 text-xs font-bold rounded-full">{companyDetails?.users || 5} Seats limit</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-display">Monthly Cost</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              {companyDetails?.billing === 0 ? 'Free Workspace' : `₹${companyDetails?.billing?.toLocaleString() || 0} INR`}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-display">Autopay Renewal Status</span>
            <div className="flex items-center space-x-2.5">
              <span className={`text-xs font-bold ${companyDetails?.autopay !== false ? 'text-emerald-600 dark:text-emerald-450' : 'text-slate-400'}`}>
                {companyDetails?.autopay !== false ? 'Enabled' : 'Disabled'}
              </span>
              <input type="checkbox" checked={companyDetails?.autopay !== false} onChange={() => onToggleAutopay(companyDetails?.autopay !== false)} />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button onClick={onToggleEditing} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-250 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700">
              {isEditingBilling ? 'Cancel Edit' : 'Edit Billing Details'}
            </button>
          </div>
        </div>
      </div>

      {isEditingBilling && (
        <form onSubmit={onSaveBillingDetails} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-slide-up text-xs font-semibold text-slate-700 dark:text-slate-350">
          <h4 className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-wider mb-2">Update Invoice Credentials & Subscription Plan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LogoField billingForm={billingForm} setBillingForm={setBillingForm} />
            <TextField label="Invoiced Name *" value={billingForm.billingName} onChange={(value) => setBillingForm((prev) => ({ ...prev, billingName: value }))} required />
            <TextField label="Billing Email *" type="email" value={billingForm.billingEmail} onChange={(value) => setBillingForm((prev) => ({ ...prev, billingEmail: value }))} required />
            <TextField label="Billing Phone *" value={billingForm.billingPhone} onChange={(value) => setBillingForm((prev) => ({ ...prev, billingPhone: value }))} required />
            
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Select Subscription Plan *
              </label>
              <select
                value={billingForm.plan || 'Free'}
                onChange={(e) => setBillingForm((prev) => ({ ...prev, plan: e.target.value }))}
                className="w-full bg-white dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                {plans && plans.length > 0 ? (
                  plans.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} (₹{p.price.toLocaleString()}/mo)
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Free">Free (₹0/mo)</option>
                    <option value="Starter Package">Starter Package (₹2,500/mo)</option>
                    <option value="Scale Package Tier">Scale Package Tier (₹8,900/mo)</option>
                    <option value="Enterprise SaaS Tier">Enterprise SaaS Tier (₹25,000/mo)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Workspace Seats Count *
              </label>
              <input
                type="number"
                min={1}
                required
                value={billingForm.users || 5}
                onChange={(e) => setBillingForm((prev) => ({ ...prev, users: Math.max(1, Number(e.target.value)) }))}
                className="w-full bg-white dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
              />
            </div>

            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest md:col-span-2">
              Billing Address *
              <textarea rows={2} required value={billingForm.billingAddress} onChange={(e) => setBillingForm((prev) => ({ ...prev, billingAddress: e.target.value }))} className="mt-1 w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none resize-none" />
            </label>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="submit" className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">Save Invoice & Plan Changes</button>
          </div>
        </form>
      )}

      <PaymentLedger payments={payments} onViewInvoice={onViewInvoice} />
    </div>
  );
}

function LogoField({ billingForm, setBillingForm }) {
  const updateLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBillingForm((prev) => ({ ...prev, logo: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Company logo image</label>
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
          {billingForm.logo ? <img src={billingForm.logo} alt="Preview" className="w-full h-full object-contain" /> : <Camera size={16} className="text-slate-400" />}
        </div>
        <label className="px-3 py-1.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg cursor-pointer border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          Choose File
          <input type="file" accept="image/*" className="hidden" onChange={updateLogo} />
        </label>
        {billingForm.logo && <button type="button" onClick={() => setBillingForm((prev) => ({ ...prev, logo: '' }))} className="text-[10px] font-bold text-red-500 hover:underline">Remove</button>}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, type = 'text', required }) {
  return (
    <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
      {label}
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none" />
    </label>
  );
}

function PaymentLedger({ payments, onViewInvoice }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transaction Ledger</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Record of subscription payment actions and professional PDF/Print statements.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-medium text-slate-700 dark:text-slate-350">
            {payments.length === 0 ? (
              <tr><td className="py-6 text-center text-slate-450 dark:text-slate-500">No payment invoices found in database registry.</td></tr>
            ) : payments.map((p) => (
              <tr key={p._id || p.id || p.paymentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-650 dark:text-indigo-400">{p.paymentId || 'N/A'}</td>
                <td className="py-3.5 px-4">{p.clientName}</td>
                <td className="py-3.5 px-4">{p.date || new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">₹{(p.amount || 0).toLocaleString()} INR</td>
                <td className="py-3.5 px-4 text-right">
                  <button onClick={() => onViewInvoice(p)} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-550 dark:hover:bg-indigo-955 text-slate-650 dark:text-slate-300 font-bold rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-750 flex items-center gap-1.5 ml-auto text-[10px]">
                    <Printer size={12} /><span>Print Receipt</span>
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
