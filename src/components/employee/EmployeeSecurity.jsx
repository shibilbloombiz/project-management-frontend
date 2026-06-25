import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { ShieldCheck, Lock, KeyRound, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EmployeeSecurity({ token, user, onRefreshProfile }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [pin, setPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setPasswordSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error(err);
      setPasswordError('Failed to connect to the server.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePinChange = async (e) => {
    e.preventDefault();
    if (!pin || pin.length < 4 || pin.length > 6 || isNaN(Number(pin))) {
      setPinError('Security PIN must be between 4 and 6 digits.');
      return;
    }

    setPinError('');
    setPinSuccess('');
    setPinLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/security/pin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pin }),
      });
      const data = await response.json();
      if (data.success) {
        setPinSuccess('Security PIN configured successfully!');
        setPin('');
        if (onRefreshProfile) onRefreshProfile();
      } else {
        setPinError(data.message || 'Failed to update PIN.');
      }
    } catch (err) {
      console.error(err);
      setPinError('Failed to connect to the server.');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left text-slate-100 font-sans">
      <div className="flex items-center space-x-2.5 mb-6">
        <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <ShieldCheck size={24} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-white">Security Settings</h2>
          <p className="text-xs text-slate-400">Manage your passwords, security credentials, and attendance pins.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Passcode Security PIN Card */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <KeyRound size={18} />
            </span>
            <h3 className="text-sm font-bold text-white">Attendance Security PIN</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your 4 to 6-digit Security PIN is used to authorize clock-in and clock-out actions at the biometric/PIN attendance terminal. 
            Default is <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-emerald-300">123456</code>.
          </p>

          {pinError && (
            <div className="flex items-start space-x-2 p-3 bg-red-950/40 border border-red-800/50 text-red-300 text-xs font-semibold rounded-xl">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-red-400" />
              <span>{pinError}</span>
            </div>
          )}

          {pinSuccess && (
            <div className="flex items-start space-x-2 p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-semibold rounded-xl">
              <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5 text-emerald-400" />
              <span>{pinSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePinChange} className="space-y-4 font-semibold text-xs text-slate-300">
            <div>
              <label htmlFor="new-pin" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                Set New PIN
              </label>
              <input
                id="new-pin"
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={6}
                placeholder="e.g. 987654"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={pinLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center space-x-2 shadow-md shadow-emerald-900/10"
            >
              {pinLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving PIN...</span>
                </>
              ) : (
                <span>Update Security PIN</span>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Lock size={18} />
            </span>
            <h3 className="text-sm font-bold text-white">Change Portal Password</h3>
          </div>

          {passwordError && (
            <div className="flex items-start space-x-2 p-3 bg-red-950/40 border border-red-800/50 text-red-300 text-xs font-semibold rounded-xl">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-red-400" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="flex items-start space-x-2 p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-semibold rounded-xl">
              <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5 text-emerald-400" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 font-semibold text-xs text-slate-300">
            <div>
              <label htmlFor="old-pw" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Current Password
              </label>
              <input
                id="old-pw"
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="new-pw" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                New Password
              </label>
              <input
                id="new-pw"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirm-pw" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirm-pw"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center space-x-2 shadow-md shadow-indigo-900/10 pt-2"
            >
              {passwordLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
