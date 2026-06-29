import React from 'react';
import { Search, List, Grid, RefreshCw, ArrowUpDown } from 'lucide-react';

export default function FilterBar({
  role,
  activeEmail,
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  selectedProject,
  setSelectedProject,
  selectedEmployee,
  setSelectedEmployee,
  selectedDateFilter,
  setSelectedDateFilter,
  sortKey,
  setSortKey,
  viewMode,
  setViewMode,
  projects,
  employees,
  onRefresh,
  clearSummaryCard,
  openAddModal
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder="Search tasks by name, assignee, status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-850 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Filter and Sort options */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
        {/* Status */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-405">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              clearSummaryCard();
            }}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm text-xs font-medium"
          >
            <option value="all">All</option>
            <option value="planning">Pending / Planning</option>
            <option value="in progress">In Progress</option>
            <option value="qa">In Review / QA</option>
            <option value="done">Completed</option>
          </select>
        </div>

        {/* Priority */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-405">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm text-xs font-medium"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Project */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-405">Project:</span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm text-xs font-medium max-w-[150px]"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Employee Assignee Filter (Admin/Lead only) */}
        {role !== 'Employee' && (
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-405">Assignee:</span>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm text-xs font-medium max-w-[150px]"
            >
              <option value="all">All Staff</option>
              {activeEmail && (
                <option value={activeEmail}>Me (Lead)</option>
              )}
              {employees.map((emp) => (
                <option key={emp.email} value={emp.email}>{emp.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date / Timeline */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-405">Timeline:</span>
          <select
            value={selectedDateFilter}
            onChange={(e) => {
              setSelectedDateFilter(e.target.value);
              clearSummaryCard();
            }}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm text-xs font-medium"
          >
            <option value="all">All Dates</option>
            <option value="today">Due Today</option>
            <option value="week">Due This Week</option>
            <option value="overdue">Overdue Sprints</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
          <ArrowUpDown size={12} className="text-slate-400" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm text-xs font-medium"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="due">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="status">Sort: Status</option>
            <option value="project">Sort: Project</option>
          </select>
        </div>
      </div>
    </div>
  );
}
