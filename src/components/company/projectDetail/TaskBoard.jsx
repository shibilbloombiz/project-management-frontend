import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Plus, Clock, Edit2, Trash2, X } from 'lucide-react';

const STATUS_COLORS = {
  Done: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30",
  QA: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
  Review: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
  "QA / Review": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
  Dev: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/40 dark:text-amber-400 dark:border-amber-900/30",
  "In Dev": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/40 dark:text-amber-400 dark:border-amber-900/30",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/40 dark:text-amber-400 dark:border-amber-900/30",
  Planning: "bg-slate-100 text-slate-605 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
};

export default function TaskBoard({ tasks = [], employees = [], userEmail, adminName, onAddTask, onSelectTask, onUpdateTask, onDeleteTask }) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  // Edit Task States
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editStatus, setEditStatus] = useState("Planning");
  const [editDeadline, setEditDeadline] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (editingTask) {
      setEditTitle(editingTask.title || "");
      setEditAssignee(editingTask.assigneeEmail || "");
      setEditStatus(editingTask.status || "Planning");
      setEditDeadline(editingTask.deadline || "");
      setNotice(null);
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    try {
      await onAddTask({
        title: newTaskTitle.trim(),
        assigneeEmail: newTaskAssignee.trim(),
        deadline: newTaskDeadline
      });
      setNewTaskTitle("");
      setNewTaskAssignee("");
      setNewTaskDeadline("");
      setShowTaskForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingTask(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || isSavingEdit) return;
    setIsSavingEdit(true);
    setNotice(null);
    try {
      await onUpdateTask(editingTask.id || editingTask._id, {
        title: editTitle.trim(),
        assigneeEmail: editAssignee.trim(),
        status: editStatus,
        deadline: editDeadline
      });
      setNotice({ type: 'success', message: 'Task updated successfully.' });
      setEditingTask(null);
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to update task. Please try again.' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteClick = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDeleteTask(taskId);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider flex items-center">
          <CheckCircle2 size={14} className="mr-2 text-indigo-500" /> Tasks
        </h3>
        <button
          onClick={() => setShowTaskForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
        >
          <Plus size={12} /> Add Task
        </button>
      </div>

      {notice && !editingTask && (
        <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
          notice.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30'
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30'
        }`}>
          {notice.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{notice.message}</span>
        </div>
      )}

      {showTaskForm && (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white"
              required
            />
            <select
              value={newTaskAssignee}
              onChange={e => setNewTaskAssignee(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-805 dark:text-white cursor-pointer"
            >
              <option value="">Select Assignee (optional)</option>
              {userEmail && (
                <option value={userEmail}>{adminName} (Company Lead)</option>
              )}
              {employees.map((emp) => (
                <option key={emp.email || emp._id} value={emp.email}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newTaskDeadline}
              onChange={e => setNewTaskDeadline(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white cursor-pointer"
              title="Task deadline"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addingTask || !newTaskTitle.trim()}
                className="flex-grow px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-40 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
              >
                {addingTask ? "Adding..." : "Save Task"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTaskForm(false);
                  setNewTaskDeadline('');
                }}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-bold rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {tasks.length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 col-span-2 text-center py-6">No tasks yet.</p>
        )}
        {tasks.map((t, i) => (
          <div
            key={t.id || t._id || i}
            className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl transition-colors duration-200 text-left"
          >
            <div onClick={() => onSelectTask(t)} className="flex-grow cursor-pointer min-w-0 pr-2">
              <p className="text-xs font-extrabold text-slate-808 dark:text-white truncate">{t.title}</p>
              {t.assigneeEmail && (
                <p className="text-[10px] text-slate-405 dark:text-slate-500 font-mono truncate">
                  {t.assigneeName || t.assigneeEmail}
                </p>
              )}
              {t.deadline && (
                <p className="text-[9px] text-amber-500 font-bold flex items-center gap-0.5">
                  <Clock size={9} /> Due {t.deadline}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold ${STATUS_COLORS[t.status] || STATUS_COLORS.Planning}`}>
                {t.status}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setEditingTask(t); }}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded cursor-pointer transition-colors"
                title="Edit Task"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteClick(t.id || t._id); }}
                className="p-1 text-slate-400 hover:text-red-655 dark:hover:text-red-400 rounded cursor-pointer transition-colors"
                title="Delete Task"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Task Modal Dialog */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Edit Task Assignment</h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                disabled={isSavingEdit}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1 rounded-xl cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            {notice && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                notice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30'
                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30'
              }`}>
                {notice.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{notice.message}</span>
              </div>
            )}
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  disabled={isSavingEdit}
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Assignee</label>
                <select
                  value={editAssignee}
                  onChange={e => setEditAssignee(e.target.value)}
                  disabled={isSavingEdit}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Select Assignee (optional)</option>
                  {userEmail && (
                    <option value={userEmail}>{adminName} (Company Lead)</option>
                  )}
                  {employees.map((emp) => (
                    <option key={emp.email || emp._id} value={emp.email}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Task Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  disabled={isSavingEdit}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Planning">Planning</option>
                  <option value="Dev">Development (Dev)</option>
                  <option value="QA">QA / Review</option>
                  <option value="Done">Completed (Done)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Deadline</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={e => setEditDeadline(e.target.value)}
                  disabled={isSavingEdit}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              <div className="flex space-x-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || !editTitle.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer shadow-md transition-colors flex items-center gap-2"
                >
                  {isSavingEdit && <Loader2 size={13} className="animate-spin" />}
                  <span>{isSavingEdit ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
