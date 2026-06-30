import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { User, Mail, ShieldAlert, Key, Phone, Briefcase, MapPin, X } from 'lucide-react';

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onAddSuccess,
  token,
  role = 'Employee',
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [domain, setDomain] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isOpen && !successData) return null;

  const isLead = role === 'Project Lead' || role === 'project_lead';
  const portalUrl = isLead
    ? window.location.origin
    : `${window.location.origin}/employee-portal`;

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setDomain('');
    setLocation('');
    setError('');
    setIsSendingEmail(false);
    setEmailStatus('');
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError('Name, email, and temporary password are required.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLead
        ? `${API_BASE_URL}/api/project-leads`
        : `${API_BASE_URL}/api/employees`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          domain,
          location,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            `Failed to add ${isLead ? 'project lead' : 'employee'}.`
        );
      }

      if (!isLead) {
        try {
          const companyId = sessionStorage.getItem('syncra_companyId') || 'default';
          const storageKey = `syncra_employee_leads_${companyId}`;
          const currentLeads = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const newLead = {
            id: Date.now().toString(),
            candidateName: name,
            email: email,
            phone: phone || '',
            position: domain || '',
            targetDate: '',
            status: 'Applied'
          };
          localStorage.setItem(storageKey, JSON.stringify([...currentLeads, newLead]));
        } catch (e) {
          console.error('Error auto-creating employee lead:', e);
        }
      }

      setSuccessData({ employee: data.data, emailSent: data.emailSent });
    } catch (err) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Hi ${name},

Please access the employee self-service portal to set up your profile:

Portal URL: ${portalUrl}
Email: ${email}
Temporary Password: ${password}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      text
    )}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = async () => {
    if (!name || !email || !password) return;

    setIsSendingEmail(true);
    setEmailStatus('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          name,
          role: isLead ? 'Project Lead' : 'Employee',
          portalUrl,
          tempPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEmailStatus('success');
        alert('Invitation email sent successfully!');
      } else {
        setEmailStatus('error');
      }
    } catch (err) {
      console.error(err);
      setEmailStatus('error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (successData) {
    const isSent = successData.emailSent;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-left">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
          {isSent ? (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Employee Created Successfully</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Employee account has been created.<br />
                Login credentials have been sent to<br />
                <strong className="text-slate-700">{email}</strong>
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-2xl font-bold">
                ⚠
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Employee Created</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Employee has been created successfully.<br />
                However, we could not send the email.<br />
                Please resend later.
              </p>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              onAddSuccess?.(successData.employee);
              setSuccessData(null);
              handleClose();
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-left">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold font-display text-slate-800 flex items-center">
            <User size={16} className="text-indigo-600 mr-2" />
            {isLead ? 'Add New Project Lead' : 'Add New Team Specialist'}
          </h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            {isLead
              ? 'Register project manager credentials and project assignment permissions.'
              : 'Register workspace credentials and stack role information.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-150 rounded-xl flex items-start space-x-2 text-red-600 text-xs font-semibold">
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 font-semibold text-xs text-slate-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Peter Gibbons"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. peter@initech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Temporary Password
              </label>
              <div className="relative">
                <Key size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. +1 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                {isLead ? 'Department / Domain' : 'Domain Stack / Role'}
              </label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    isLead
                      ? 'e.g. Product Management'
                      : 'e.g. Frontend Engineer'
                  }
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Bangalore / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-250 rounded-2xl p-4 space-y-3">
            <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
              Pre-Creation Share Portal Link
            </span>

            <p className="text-[10px] text-slate-505 font-medium">
              Share the portal URL and credentials via email or WhatsApp before
              provisioning.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                disabled={!name || !email || !password}
                onClick={handleShareWhatsApp}
                className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-[10px] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
              >
                Share via WhatsApp
              </button>

              <button
                type="button"
                disabled={!name || !email || !password || isSendingEmail}
                onClick={handleShareEmail}
                className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-[10px] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
              >
                {isSendingEmail ? 'Sending...' : 'Share via Email'}
              </button>
            </div>

            {emailStatus === 'success' && (
              <p className="text-[10px] text-emerald-600 font-bold mt-1 text-center">
                ✓ Invite email sent successfully!
              </p>
            )}

            {emailStatus === 'error' && (
              <p className="text-[10px] text-red-600 font-bold mt-1 text-center">
                Email dispatch failed.
              </p>
            )}
          </div>

          <div className="flex space-x-2 pt-3 justify-end border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-605 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-colors flex items-center space-x-1.5"
            >
              <span>
                {isLoading
                  ? 'Adding...'
                  : isLead
                  ? 'Provision Project Lead'
                  : 'Provision Specialist'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}