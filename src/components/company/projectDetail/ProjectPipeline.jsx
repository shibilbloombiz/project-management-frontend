import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ProjectPipeline({ projectStatus }) {
  const getActivePipelineStageIndex = () => {
    const statusMap = {
      "Planning": 0,
      "Pending": 0,
      "Dev": 1,
      "In Progress": 1,
      "Active": 1,
      "QA": 2,
      "Review": 2,
      "Quality Assurance": 3,
      "Completed": 4
    };
    if (projectStatus === "On Hold" || projectStatus === "Cancelled") return 0;
    return statusMap[projectStatus] !== undefined ? statusMap[projectStatus] : 1;
  };

  const activeStageIndex = getActivePipelineStageIndex();
  const stages = ["Planning", "Development", "Review", "Quality Assurance", "Deployment"];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 border border-slate-205 dark:border-slate-805 rounded-2xl shadow-sm space-y-4">
      <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
        Live Development Pipeline
      </h3>
      <div className="relative w-full overflow-x-auto pb-2">
        <div className="min-w-[700px] h-32 flex items-center justify-between px-10 relative">
          <svg className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-4" pointerEvents="none">
            <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" className="stroke-slate-200 dark:stroke-slate-800" />
            <line x1="5%" y1="50%" x2={`${5 + activeStageIndex * 22.5}%`} y2="50%" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" className="transition-all duration-500" />
          </svg>
          {stages.map((stage, idx) => {
            const isPast = idx < activeStageIndex;
            const isActive = idx === activeStageIndex;
            return (
              <div key={stage} className="flex flex-col items-center z-10 w-24 text-center">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? "bg-indigo-600 border-indigo-600 text-white pulse-effect shadow-lg shadow-indigo-100" : isPast ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-600 dark:text-indigo-400" : "bg-white dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"}`}>
                    {isPast ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold mt-3 block tracking-wide ${isActive ? "text-indigo-600" : isPast ? "text-slate-805 dark:text-slate-300" : "text-slate-400 dark:text-slate-550"}`}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
