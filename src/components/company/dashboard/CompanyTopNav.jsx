import React, { useState, useEffect } from 'react';
import { Bell, Layers, ShieldCheck } from 'lucide-react';
import NotificationsDropdown from '../../NotificationsDropdown';
import ThemeToggle from '../../ThemeToggle';

export default function CompanyTopNav({
  org,
  adminName,
  activeNotifications,
  isNotificationsOpen,
  onToggleNotifications,
  onCloseNotifications,
  onDismiss,
  onDismissAll,
  onNavigate,
  onClickProfile,
  userEmail = 'peter.gibbons@initech.com',
}) {
  const [avatarUrl, setAvatarUrl] = useState(null);

  const loadAvatar = () => {
    const key = `syncra_avatar_${userEmail.toLowerCase()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setAvatarUrl(saved);
    } else {
      setAvatarUrl(null);
    }
  };

  useEffect(() => {
    loadAvatar();
    window.addEventListener('storage', loadAvatar);
    return () => window.removeEventListener('storage', loadAvatar);
  }, [userEmail]);

  const initials = adminName
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0])
    .join('');

  return (
    <nav className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-sm px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-lg text-white">
          <Layers size={18} />
        </div>
        <div>
          <span className="text-md font-bold font-display text-slate-900 dark:text-white leading-none block">
            Syncra Workspace
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-505 font-bold tracking-wide">
            Company Console Mode
          </span>
        </div>
        <div className="hidden lg:flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 px-3 py-1 rounded-full text-[11px] font-bold text-indigo-700 dark:text-indigo-350 ml-4">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 animate-pulse"></span>
          <span>Org: {org}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center text-xs font-semibold text-slate-455 dark:text-slate-500">
        <ShieldCheck size={14} className="text-emerald-500 mr-1.5" />
        <span>Tenant workspace authenticated via OTP security protocol</span>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle compact />

        <div className="relative">
          <button
            onClick={onToggleNotifications}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {activeNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
          <NotificationsDropdown
            notifications={activeNotifications}
            onDismiss={onDismiss}
            onDismissAll={onDismissAll}
            onNavigate={onNavigate}
            isOpen={isNotificationsOpen}
            onClose={onCloseNotifications}
          />
        </div>

        <div 
          onClick={onClickProfile}
          className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 gap-3 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="text-right">
            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-200 block font-display leading-tight">
              {adminName}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-505 font-bold block">
              Company Administrator
            </span>
          </div>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-white dark:border-slate-800 shadow-md" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-indigo-100 border border-white dark:border-slate-800">
              {initials}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
