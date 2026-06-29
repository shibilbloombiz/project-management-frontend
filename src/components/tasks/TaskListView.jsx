import React from 'react';
import { Calendar, Check, Edit2, Trash2 } from 'lucide-react';
import { getPriorityColor, getStatusColor, parseTaskNote } from './taskUtils';

export default function TaskListView({
  role,
  activeEmail,
  tasks,
  onTaskClick,
  onUpdateTaskStatus,
  onDeleteTask,
  onEditTaskClick
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-150 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center"></th>
              <th className="py-3 px-4">Task Name</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Work Update</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-605 dark:text-slate-400">
            {tasks.map((task) => {
              const priorityColor = getPriorityColor(task.priority);
              const statusColor = getStatusColor(task.status);
              const parsedNote = parseTaskNote(task.note);
              const isOverdue =
                task.deadline &&
                task.status !== 'Done' &&
                task.status !== 'Completed' &&
                new Date(task.deadline) < new Date().setHours(0, 0, 0, 0);

              return (
                <tr
                  key={task.id || task._id}
                  onClick={() => onTaskClick(task)}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer group transition-colors"
                >
                  <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onUpdateTaskStatus(task)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        task.status === 'Done' || task.status === 'Completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20'
                      }`}
                    >
                      {(task.status === 'Done' || task.status === 'Completed') && <Check size={12} strokeWidth={3} />}
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`font-bold block text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                        task.status === 'Done' || task.status === 'Completed' ? 'line-through text-slate-400 dark:text-slate-550' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                    {task.projectName}
                  </td>
                  <td className="py-4 px-4">
                    {task.deadline ? (
                      <span className={`inline-flex items-center gap-1 font-mono text-[11px] ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                        <Calendar size={12} />
                        {task.deadline}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-lg uppercase tracking-wider ${priorityColor}`}>
                      {task.priority || 'Medium'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-full uppercase tracking-wider ${statusColor}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {task.assigneeName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-350 font-black flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {task.assigneeName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <span className="text-slate-800 dark:text-slate-200 block leading-tight">{task.assigneeName}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-550 block font-mono leading-none mt-0.5">{task.assigneeEmail}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-4 max-w-[150px] truncate text-slate-400 italic text-[11px]">
                    {parsedNote.log || 'No logs registered.'}
                  </td>
                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTaskClick(task)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-slate-500 cursor-pointer"
                        title="Modify configuration"
                      >
                        <Edit2 size={12} />
                      </button>
                      {role === 'Company Admin' && (
                        <button
                          onClick={() => onDeleteTask(task)}
                          className="p-1.5 border border-slate-200 dark:border-slate-805 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded-lg text-slate-500 cursor-pointer"
                          title="Purge Task Node"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
