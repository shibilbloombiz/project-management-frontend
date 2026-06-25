import React from 'react';
import { Calendar, Clock, MessageSquare, AlertTriangle, X, ShieldAlert } from 'lucide-react';

export default function NotificationsDropdown({ notifications, onDismiss, onDismissAll, onNavigate, isOpen, onClose }) {
  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'leave_request':
        return <Calendar className="text-amber-500 shrink-0" size={14} />;
      case 'timesheet_approval':
        return <Clock className="text-indigo-500 shrink-0" size={14} />;
      case 'client_message':
        return <MessageSquare className="text-emerald-500 shrink-0" size={14} />;
      case 'client_scope':
        return <AlertTriangle className="text-purple-500 shrink-0" size={14} />;
      default:
        return <AlertTriangle className="text-slate-400 shrink-0" size={14} />;
    }
  };

  return (
    <>
      {/* Overlay to close on clicking outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-left animate-fade-in">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Workspace Alerts ({notifications.length})
          </span>
          {notifications.length > 0 && (
            <button
              onClick={() => { onDismissAll(); onClose(); }}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-xs text-slate-600 dark:text-slate-350">
          {notifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => { if (onNavigate) onNavigate(n); onClose(); }}
              className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start space-x-3 cursor-pointer group relative"
            >
              <div className="mt-0.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-slate-800 dark:text-slate-200 font-bold leading-snug">
                  {n.title}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 break-words">
                  {n.desc}
                </p>
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
                className="absolute right-2 top-3.5 p-1 text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500 font-medium flex flex-col items-center justify-center space-y-2">
              <ShieldAlert size={20} className="text-slate-300 dark:text-slate-700" />
              <span className="text-[11px]">No pending alerts or notifications.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
