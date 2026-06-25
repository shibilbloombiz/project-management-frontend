import React from 'react';
import { Activity, Clock, User } from 'lucide-react';

export default function ClientActivityFeed({ activity }) {
  if (!activity || activity.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-slate-400 font-semibold py-12">
        <Activity size={24} className="mx-auto text-slate-300 mb-2" />
        <p>No recent activity logs recorded.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
        <Activity size={14} className="mr-1.5 text-indigo-500" />
        Recent Workspace Activity
      </h3>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
        {activity.map((act, idx) => (
          <div key={act.id || idx} className="flex gap-3 text-xs font-semibold">
            <span className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-550 shrink-0 self-start">
              <User size={12} />
            </span>
            <div className="flex-grow space-y-1">
              <div className="text-slate-800 leading-normal">
                <span className="font-bold text-slate-900">{act.user}</span>{' '}
                <span className="text-slate-500">{act.action}</span>{' '}
                {act.target && <span className="font-bold text-slate-805">"{act.target}"</span>}
              </div>
              <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                <span>{act.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
