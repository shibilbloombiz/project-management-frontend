import React from 'react';
import { Clock } from 'lucide-react';
import { getPriorityColor, parseTaskNote } from './taskUtils';

export default function TaskKanbanView({ tasks, onTaskClick }) {
  const columns = [
    { id: 'Planning', label: 'To Do / Planning', color: 'border-t-slate-400 bg-slate-50/20 dark:bg-slate-900/10' },
    { id: 'In Progress', label: 'Development / In Progress', color: 'border-t-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/5' },
    { id: 'Review', label: 'QA / Review', color: 'border-t-purple-500 bg-purple-50/10 dark:bg-purple-950/5' },
    { id: 'Done', label: 'Done / Completed', color: 'border-t-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/5' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start animate-fade-in">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => {
          const s = t.status.toLowerCase();
          if (column.id === 'Planning') return s === 'planning';
          if (column.id === 'In Progress') return s === 'in progress' || s === 'dev';
          if (column.id === 'Review') return s === 'qa' || s === 'review';
          if (column.id === 'Done') return s === 'done' || s === 'completed';
          return false;
        });

        return (
          <div key={column.id} className={`flex flex-col min-h-[450px] border border-slate-200 dark:border-slate-800 border-t-4 rounded-2xl ${column.color} p-4 shadow-sm space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-slate-850 dark:text-white uppercase tracking-wider text-[11px] font-display">
                {column.label}
              </h4>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-550 dark:text-slate-400 font-extrabold rounded-full">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
              {columnTasks.map((task) => {
                const priorityColor = getPriorityColor(task.priority);
                const isOverdue =
                  task.deadline &&
                  task.status !== 'Done' &&
                  task.status !== 'Completed' &&
                  new Date(task.deadline) < new Date().setHours(0, 0, 0, 0);
                const parsedNote = parseTaskNote(task.note);

                return (
                  <div
                    key={task.id || task._id}
                    onClick={() => onTaskClick(task)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer space-y-3 text-left group"
                  >
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.2 border text-[8px] font-extrabold rounded-md uppercase tracking-wider ${priorityColor}`}>
                        {task.priority || 'Medium'}
                      </span>
                      {isOverdue && (
                        <span className="px-1.5 py-0.2 bg-red-50 text-red-700 border border-red-200 dark:bg-red-955/40 dark:text-red-400 dark:border-red-900/30 text-[8.5px] font-bold rounded flex items-center gap-0.5 animate-pulse">
                          <Clock size={10} /> Overdue
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">#{task.id?.slice(-5) || 'TASK'}</span>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                        {task.title}
                      </h5>
                    </div>

                    {parsedNote.log && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-450 italic line-clamp-2 border-l-2 border-slate-200 dark:border-slate-700 pl-2">
                        {parsedNote.log}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-500">
                      <span>{task.projectName}</span>
                      {task.assigneeName ? (
                        <div className="w-5.5 h-5.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[9px] text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30" title={task.assigneeName}>
                          {task.assigneeName.split(' ').map((n) => n[0]).join('')}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {columnTasks.length === 0 && (
                <div className="py-8 text-center text-slate-400 dark:text-slate-650 text-[10px] font-bold border border-dashed border-slate-250 dark:border-slate-800 rounded-xl uppercase tracking-wider">
                  Empty Lane
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
