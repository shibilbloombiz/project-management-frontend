import React from 'react';
import { X, Trash2, TrendingUp, Clock, Check, Loader2 } from 'lucide-react';
import { getPriorityColor, getStatusColor, parseTaskNote } from './taskUtils';

export default function TaskDetailsDrawer({
  role,
  activeEmail,
  adminName,
  selectedTask,
  onClose,
  onDelete,
  isEditingTask,
  setIsEditingTask,
  updatingTaskState,
  handleUpdateTask,

  // Admin Form edit state
  editTaskTitle,
  setEditTaskTitle,
  editTaskAssignee,
  setEditTaskAssignee,
  editTaskStatus,
  setEditTaskStatus,
  editTaskDeadline,
  setEditTaskDeadline,
  editTaskPriority,
  setEditTaskPriority,
  editTaskNote,
  setEditTaskNote,

  // Employee Form edit state
  empStatus,
  setEmpStatus,
  empWorkLog,
  setEmpWorkLog,
  empHours,
  setEmpHours,
  empProgress,
  setEmpProgress,
  empBlockers,
  setEmpBlockers,
  empNeedSupport,
  setEmpNeedSupport,

  employees
}) {
  const priorityColor = getPriorityColor(selectedTask.priority);
  const statusColor = getStatusColor(selectedTask.status);
  const parsedNote = parseTaskNote(selectedTask.note);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
              #{selectedTask.id || 'TASK-ID'}
            </span>
            <h3 className="text-sm font-black text-slate-808 dark:text-white mt-0.5">Task Specifications</h3>
          </div>
          <div className="flex items-center space-x-2">
            {role === 'Company Admin' && (
              <button
                onClick={() => onDelete(selectedTask)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-lg transition"
                title="Purge Task"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-semibold text-slate-605 dark:text-slate-400">
          {/* Main Specifications Form */}
          <div className="space-y-4">
            <div>
              <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest">Task Name</span>
              {isEditingTask && role !== 'Employee' ? (
                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 mt-1"
                />
              ) : (
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 break-words leading-snug">{selectedTask.title}</h4>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest block">Project Node</span>
                <span className="text-slate-850 dark:text-slate-200 mt-1 block font-bold">{selectedTask.projectName}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest block">Project Manager</span>
                <span className="text-slate-800 dark:text-slate-200 mt-1 block">{selectedTask.manager}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-405 tracking-widest block">Priority Badge</span>
                {isEditingTask && role !== 'Employee' ? (
                  <select
                    value={editTaskPriority}
                    onChange={(e) => setEditTaskPriority(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 mt-1 text-xs focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-2 py-0.5 border text-[9px] font-bold rounded-lg uppercase tracking-wider mt-1 ${priorityColor}`}>
                    {selectedTask.priority || 'Medium'}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-405 tracking-widest block">Workflow Status</span>
                {isEditingTask && role !== 'Employee' ? (
                  <select
                    value={editTaskStatus}
                    onChange={(e) => setEditTaskStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 mt-1 text-xs focus:outline-none"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="QA">QA / Review</option>
                    <option value="Done">Done / Completed</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-2 py-0.5 border text-[9px] font-bold rounded-full uppercase tracking-wider mt-1 ${statusColor}`}>
                    {selectedTask.status}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest block">Assigned Engineer</span>
                {isEditingTask && role !== 'Employee' ? (
                  <select
                    value={editTaskAssignee}
                    onChange={(e) => setEditTaskAssignee(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none text-xs mt-1 w-full"
                  >
                    <option value="">Select Assignee</option>
                    {activeEmail && (
                      <option value={activeEmail}>{adminName} (Lead)</option>
                    )}
                    {employees.map((emp) => (
                      <option key={emp.email} value={emp.email}>{emp.name} ({emp.email})</option>
                    ))}
                  </select>
                ) : selectedTask.assigneeName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-7 h-7 rounded-full bg-slate-105 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-extrabold flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {selectedTask.assigneeName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <span className="text-slate-850 dark:text-slate-200 block">{selectedTask.assigneeName}</span>
                      <span className="text-[9px] text-slate-450 block font-mono leading-none mt-0.5">{selectedTask.assigneeEmail}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 italic block mt-1">Unassigned</span>
                )}
              </div>
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest block">Deadline Schedule</span>
                {isEditingTask && role !== 'Employee' ? (
                  <input
                    type="date"
                    value={editTaskDeadline}
                    onChange={(e) => setEditTaskDeadline(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 mt-1 text-xs focus:outline-none w-full"
                  />
                ) : (
                  <span className="text-slate-800 dark:text-slate-200 mt-1 block font-mono">
                    {selectedTask.deadline || 'No target deadline configured.'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Updates / Custom Work logs */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} className="text-indigo-500" /> Work Progress log
              </h4>
              {role !== 'Employee' && !isEditingTask && (
                <button
                  onClick={() => setIsEditingTask(true)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 hover:text-indigo-700 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200 dark:border-indigo-900/30 rounded-xl transition cursor-pointer"
                >
                  Modify Task Configuration
                </button>
              )}
            </div>

            {role === 'Employee' ? (
              <form onSubmit={handleUpdateTask} className="space-y-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Change Status
                    </label>
                    <select
                      value={empStatus}
                      onChange={(e) => setEmpStatus(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none text-xs"
                    >
                      <option value="Planning">Planning</option>
                      <option value="Dev">Development (Dev)</option>
                      <option value="QA">QA / Review</option>
                      <option value="Done">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Hours Spent Today
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      placeholder="e.g. 4"
                      value={empHours}
                      onChange={(e) => setEmpHours(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none text-xs font-semibold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    <span>Completion Percentage</span>
                    <span className="text-indigo-650 dark:text-indigo-400 font-bold">{empProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={empProgress}
                    onChange={(e) => setEmpProgress(e.target.value)}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    Work Log (Details of update)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="What did you complete?"
                    value={empWorkLog}
                    onChange={(e) => setEmpWorkLog(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    Active Blockers / Support
                  </label>
                  <input
                    type="text"
                    placeholder="Details of blockers, if any"
                    value={empBlockers}
                    onChange={(e) => setEmpBlockers(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={empNeedSupport}
                      onChange={(e) => setEmpNeedSupport(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white text-indigo-650 focus:ring-0 cursor-pointer"
                    />
                    <span>Flag Support Needed</span>
                  </label>

                  <button
                    type="submit"
                    disabled={updatingTaskState}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-1 cursor-pointer shadow-sm shadow-indigo-150"
                  >
                    {updatingTaskState ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    <span>Save Update</span>
                  </button>
                </div>
              </form>
            ) : isEditingTask ? (
              <form onSubmit={handleUpdateTask} className="space-y-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl text-left">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    Feedback / Log update
                  </label>
                  <textarea
                    value={editTaskNote}
                    onChange={(e) => setEditTaskNote(e.target.value)}
                    placeholder="Provide project notes, feedback, or logs..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 min-h-[70px] resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingTask(false)}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-650 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingTaskState}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    {updatingTaskState ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    <span>Save Settings</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-850 rounded-2xl text-left space-y-2">
                <span className="text-[8.5px] uppercase font-extrabold tracking-widest text-slate-400 block">Note string data</span>
                <p className="text-slate-700 dark:text-slate-300 italic font-medium">
                  {selectedTask.note || 'No notes or work updates loaded.'}
                </p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-indigo-500" /> Activity Timeline
            </h4>

            <div className="space-y-4 relative pl-3 before:absolute before:inset-y-1 before:left-[5px] before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
              {selectedTask.note && (
                <div className="relative pl-4 text-left">
                  <span className="absolute left-[-11.5px] top-1.5 w-[7px] h-[7px] rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950 animate-pulse"></span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    Latest Work Update
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                    {parsedNote.log || selectedTask.note}
                  </p>
                  <div className="flex gap-2 flex-wrap text-[9px] mt-1.5 text-slate-400 font-mono">
                    {parsedNote.hours && (
                      <span className="px-1 bg-slate-105 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                        Spent: {parsedNote.hours}h
                      </span>
                    )}
                    <span className="px-1 bg-slate-105 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      Progress: {parsedNote.progress}%
                    </span>
                    {parsedNote.needSupport && (
                      <span className="px-1 bg-red-50 text-red-600 rounded border border-red-200 font-bold">
                        Support Flagged
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="relative pl-4 text-left">
                <span className="absolute left-[-11px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-350">
                  Yesterday
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  Completed routing setup, validated JWT context tokens.
                </p>
              </div>

              <div className="relative pl-4 text-left">
                <span className="absolute left-[-11px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-350">
                  Monday
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  Task initialized and assigned to team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
