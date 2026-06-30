import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Percent, 
  Sparkles, 
  UserMinus 
} from 'lucide-react';

export default function AttendanceSummary({ summary }) {
  const present = summary?.present ?? 0;
  const absent = summary?.absent ?? 0;
  const halfDay = summary?.halfDay ?? 0;
  const leave = summary?.leave ?? 0;
  const late = summary?.late ?? 0;
  const holiday = summary?.holiday ?? 0;
  const attendancePct = summary?.attendancePct ?? 100;

  const cardConfig = [
    {
      label: 'Present',
      value: present,
      desc: 'Days worked fully',
      icon: <CheckCircle2 size={16} />,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/50'
    },
    {
      label: 'Absent',
      value: absent,
      desc: 'Unexcused absences',
      icon: <XCircle size={16} />,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-950/50'
    },
    {
      label: 'Half Day',
      value: halfDay,
      desc: 'Partial day shifts',
      icon: <Clock size={16} />,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-950/50'
    },
    {
      label: 'Leave',
      value: leave,
      desc: 'Approved leaves',
      icon: <UserMinus size={16} />,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100 dark:border-blue-950/50'
    },
    {
      label: 'Late Check-in',
      value: late,
      desc: 'Clocked after start',
      icon: <Clock size={16} className="rotate-180" />,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400 border-purple-100 dark:border-purple-950/50'
    },
    {
      label: 'Holiday',
      value: holiday,
      desc: 'Holidays & weekends',
      icon: <Sparkles size={16} />,
      color: 'text-slate-600 bg-slate-50 dark:bg-slate-800/40 dark:text-slate-400 border-slate-100 dark:border-slate-800/50'
    },
    {
      label: 'Attendance Rate',
      value: `${attendancePct}%`,
      desc: 'Total score rating',
      icon: <Percent size={16} />,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-950/50'
    }
  ];

  return (
    <div className="w-full text-left space-y-4">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-500">Summary Statistics</h3>
      
      {/* Summary grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {cardConfig.map((card, i) => (
          <div 
            key={i} 
            className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                {card.label}
              </span>
              <span className={`p-1.5 rounded-lg border ${card.color}`}>
                {card.icon}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xl font-black text-slate-800 dark:text-white">
                {card.value}
              </span>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5 truncate">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
