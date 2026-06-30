import React, { useState, useEffect } from 'react';
import { Layers, Search, Sparkles, Bell, Menu } from 'lucide-react';
import NotificationsDropdown from '../NotificationsDropdown';
import ThemeToggle from '../ThemeToggle';

export default function AdminHeader({ 
  searchTerm, 
  setSearchTerm, 
  onOpenAi,
  activeNotifications = [],
  isNotificationsOpen = false,
  onToggleNotifications,
  onCloseNotifications,
  onDismiss,
  onDismissAll,
  onNavigate,
  onClickProfile,
  userEmail = 'sarah.jenkins@example.com',
  isSidebarOpen,
  onToggleSidebar
}) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [adminName, setAdminName] = useState('Sarah Jenkins');

  const loadProfileDetails = () => {
    const avatarKey = `syncra_avatar_${userEmail.toLowerCase()}`;
    const nameKey = `syncra_profile_name_${userEmail.toLowerCase()}`;
    
    setAvatarUrl(localStorage.getItem(avatarKey));
    setAdminName(localStorage.getItem(nameKey) || 'Sarah Jenkins');
  };

  useEffect(() => {
    loadProfileDetails();
    window.addEventListener('storage', loadProfileDetails);
    return () => window.removeEventListener('storage', loadProfileDetails);
  }, [userEmail]);

  return (
    <nav className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
      
      {/* Left Branding */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 text-slate-500 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer mr-1"
          aria-label="Toggle Sidebar Menu"
        >
          <Menu size={18} className={`transform transition-transform duration-300 ${isSidebarOpen ? 'rotate-90' : ''}`} />
        </button>
        <div className="p-2 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-lg text-white">
          <Layers size={18} />
        </div>
        <div className="text-left">
          <span className="text-md font-bold font-display text-slate-900 dark:text-white leading-none block">
            Syncra <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-350 font-extrabold px-1.5 py-0.5 rounded ml-1 border border-indigo-100 dark:border-indigo-900/40 uppercase tracking-widest">ENTERPRISE</span>
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide">Platform Management System</span>
        </div>
        
        <div className="hidden lg:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 ml-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
          <span>Tenant: System Admin Node</span>
        </div>
      </div>

      {/* Right Action Icons & User Dropdown */}
      <div className="flex items-center space-x-4">
        <ThemeToggle compact />

        <div className="relative">
          <button 
            onClick={onToggleNotifications}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 relative cursor-pointer" 
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

        {/* User profile dropdown box */}
        <div 
          onClick={onClickProfile}
          className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 gap-3 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block font-display leading-tight">{adminName}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">Super Administrator</span>
          </div>
          <img 
            src={avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
            alt="Profile" 
            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
          />
        </div>
      </div>
    </nav>
  );
}
