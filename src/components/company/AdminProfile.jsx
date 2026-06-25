import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Building, Camera, CheckCircle, ArrowLeft } from 'lucide-react';

export default function AdminProfile({ userEmail, adminName, org, onBack }) {
  const email = userEmail || sessionStorage.getItem('syncra_email') || 'peter.gibbons@initech.com';
  const company = org || sessionStorage.getItem('syncra_org') || 'Initech Systems';

  const avatarKey = `syncra_avatar_${email.toLowerCase()}`;
  const nameKey = `syncra_profile_name_${email.toLowerCase()}`;
  const phoneKey = `syncra_profile_phone_${email.toLowerCase()}`;
  const locationKey = `syncra_profile_location_${email.toLowerCase()}`;

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setAvatarUrl(localStorage.getItem(avatarKey));
    setName(localStorage.getItem(nameKey) || adminName || 'Peter Gibbons');
    setPhone(localStorage.getItem(phoneKey) || '555-0199');
    setLocation(localStorage.getItem(locationKey) || 'Austin, Texas');
  }, [email, adminName]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setAvatarUrl(base64);
      localStorage.setItem(avatarKey, base64);
      setSuccess('Profile image updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
      window.dispatchEvent(new Event('storage'));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarUrl(null);
    localStorage.removeItem(avatarKey);
    setSuccess('Profile image removed.');
    setTimeout(() => setSuccess(''), 3000);
    window.dispatchEvent(new Event('storage'));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem(nameKey, name);
    localStorage.setItem(phoneKey, phone);
    localStorage.setItem(locationKey, location);
    setSuccess('Profile settings updated successfully.');
    setTimeout(() => setSuccess(''), 3000);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-805 dark:text-slate-100 transition-colors duration-200 pb-12">
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6 text-left">
        
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity cursor-pointer mb-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Console Dashboard</span>
        </button>

        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-indigo-900 rounded-3xl p-6 md:p-8 shadow-md overflow-hidden text-white flex flex-col sm:flex-row items-center gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
          
          {/* Avatar Upload Container */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden bg-indigo-850 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                name.split(' ').filter(Boolean).map(n => n[0]).join('')
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full cursor-pointer shadow-md transition-colors border border-white/20">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div className="space-y-1 text-center sm:text-left flex-grow">
            <h2 className="text-xl font-extrabold font-display leading-tight">{name}</h2>
            <p className="text-xs text-indigo-200 font-semibold tracking-wide flex items-center justify-center sm:justify-start gap-1">
              <Shield size={12} className="text-indigo-300" />
              <span>Company Administrator</span>
            </p>
            <p className="text-[11px] text-indigo-300 font-medium">Tenant Node Workspace • {company}</p>
          </div>

          {avatarUrl && (
            <button
              onClick={handleRemoveImage}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg border border-white/10 transition-colors cursor-pointer shrink-0"
            >
              Remove Image
            </button>
          )}
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold animate-fade-in">
            <CheckCircle size={14} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider font-display">Configure Profile Parameters</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Customize your personal workspace credentials and contact details.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-widest mb-1.5 font-display">Full Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-widest mb-1.5 font-display">Email Address (Read-only)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-400 dark:text-slate-500 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-1.5 font-display">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-1.5 font-display">Office Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>

        {/* Security and privileges summary card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 text-xs font-semibold">
          <div>
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider font-display">System Privileges & Node Status</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Authorization details configured on current server registry.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Roster Role</span>
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full font-bold text-[10px]">
                Master Admin
              </span>
            </div>

            <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Connection Integrity</span>
              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full font-bold text-[10px]">
                Secured OTP
              </span>
            </div>

            <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Billing Account</span>
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-full font-bold text-[10px]">
                Active Tenant
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
