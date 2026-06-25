import React from 'react';
import { Calendar, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { clientPortalHelpers } from '../../utils/clientPortalHelpers';

export default function ClientMilestonesTimeline({ milestones }) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-slate-400 font-semibold py-12">
        <Calendar size={24} className="mx-auto text-slate-300 mb-2" />
        <p>No project milestones drafted yet.</p>
      </div>
    );
  }

  const getMilestoneIcon = (status) => {
    switch (status) {
      case 'Completed': return { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' };
      case 'In Progress': return { icon: PlayCircle, color: 'text-indigo-500 bg-indigo-50 border-indigo-200 animate-pulse' };
      default: return { icon: Clock, color: 'text-slate-400 bg-slate-50 border-slate-200' }; // Not Started / Delayed
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
        <Calendar size={14} className="mr-1.5 text-indigo-500" />
        Project Roadmap & Milestones
      </h3>

      <div className="relative pl-6 border-l border-slate-150 space-y-5 ml-3.5 py-1">
        {milestones.map((ms, idx) => {
          const { icon: Icon, color: colorClasses } = getMilestoneIcon(ms.status);
          const isDone = ms.status === 'Completed';

          return (
            <div key={idx} className="relative text-xs font-semibold text-slate-500 space-y-1">
              {/* Timeline circle overlay */}
              <span className={`absolute -left-[35px] top-0.5 p-1 rounded-full border-2 ${colorClasses}`}>
                <Icon size={12} className="shrink-0 font-bold" />
              </span>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
                <span className="font-extrabold text-slate-800 block text-xs">{ms.title}</span>
                <span className={`px-2 py-0.5 border text-[8.5px] font-black rounded-lg uppercase tracking-wider ${
                  isDone 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : ms.status === 'In Progress' 
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-700' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  {ms.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-450 leading-relaxed max-w-xl font-medium">
                {ms.description || 'Sprint validation deliverables.'}
              </p>
              
              <div className="text-[9.5px] font-bold text-slate-400 flex items-center space-x-2">
                <span>Target: {clientPortalHelpers.formatDate(ms.dueDate)}</span>
                {isDone && ms.completionDate && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-600">Finished on: {clientPortalHelpers.formatDate(ms.completionDate)}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
