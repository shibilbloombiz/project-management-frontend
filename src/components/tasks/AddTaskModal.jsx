import React from 'react';
import { X, Loader2 } from 'lucide-react';

export default function AddTaskModal({
  show,
  onClose,
  onSubmit,
  loading,
  companyLeadEmail,
  companyLeadName,
  projects,
  employees,

  // Add task state variables
  taskProjectId,
  setTaskProjectId,
  taskTitle,
  setTaskTitle,
  taskAssigneeEmail,
  setTaskAssigneeEmail,
  setTaskAssigneeName,
  taskDeadline,
  setTaskDeadline,
  taskPriority,
  setTaskPriority,
  taskNote,
  setTaskNote
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-black text-slate-800 dark:text-white">Add Task Assignment</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            Provision a new deliverable task to an employee in this workspace.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div>
            <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
              Select Target Project
            </label>
            <select
              value={taskProjectId}
              onChange={(e) => setTaskProjectId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 text-xs"
            >
              {projects.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-505 uppercase tracking-widest mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Auth Route validation"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-white rounded-xl px-2.5 py-2 focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                Deadline Date
              </label>
              <input
                type="date"
                required
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-white rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
              Assignee
            </label>
            <select
              value={taskAssigneeEmail}
              onChange={(e) => {
                const email = e.target.value;
                setTaskAssigneeEmail(email);
                const matched =
                  email === companyLeadEmail
                    ? { name: companyLeadName }
                    : employees.find((t) => t.email === email);
                setTaskAssigneeName(matched ? matched.name : '');
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 text-xs"
            >
              <option value="">Select Assignee</option>
              {companyLeadEmail && (
                <option value={companyLeadEmail}>{companyLeadName} (Company Lead)</option>
              )}
              {employees.map((emp) => (
                <option key={emp.email} value={emp.email}>{emp.name} ({emp.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
              Task Notes / Feedback
            </label>
            <textarea
              value={taskNote}
              onChange={(e) => setTaskNote(e.target.value)}
              placeholder="Initial details, constraints, specifications..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-705 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 text-xs resize-none min-h-[60px]"
            />
          </div>

          <div className="flex space-x-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-150 transition flex items-center gap-1.5"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
