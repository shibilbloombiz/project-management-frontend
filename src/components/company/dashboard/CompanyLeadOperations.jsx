import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';
import { Briefcase, CheckSquare, Clock, BarChart3, Users, Play, ArrowLeft, Plus, Check, X, Edit, ShieldAlert } from 'lucide-react';

export default function CompanyLeadOperations({ activeTab, companyId, org, userEmail, adminName }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [progressReport, setProgressReport] = useState([]);
  const [budgetReport, setBudgetReport] = useState([]);

  const [showAddTask, setShowAddTask] = useState(false);
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssigneeEmail, setTaskAssigneeEmail] = useState('');
  const [taskAssigneeName, setTaskAssigneeName] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskProjectId, setEditTaskProjectId] = useState('');
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskStatus, setEditTaskStatus] = useState('');
  const [editTaskNote, setEditTaskNote] = useState('');
  const [editTaskAssigneeEmail, setEditTaskAssigneeEmail] = useState('');
  const [editTaskAssigneeName, setEditTaskAssigneeName] = useState('');

  const token = sessionStorage.getItem('syncra_token');
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  const loadData = () => {
    const fetchJson = (url) => fetch(url, { headers }).then((res) => res.json());

    if (activeTab === 'tasks') {
      fetchJson(`${API_BASE_URL}/api/lead/projects`)
        .then((res) => {
          if (res.success) {
            setProjects(res.data);
            if (res.data.length > 0 && !taskProjectId) {
              setTaskProjectId(res.data[0]._id || res.data[0].id);
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      fetchJson(`${API_BASE_URL}/api/lead/team`)
        .then((res) => {
          if (res.success) setTeamMembers(res.data);
        })
        .catch(console.error);
    } else if (activeTab === 'team') {
      fetchJson(`${API_BASE_URL}/api/lead/team`)
        .then((res) => {
          if (res.success) setTeamMembers(res.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'timetracking') {
      fetchJson(`${API_BASE_URL}/api/lead/timesheets`)
        .then((res) => {
          if (res.success) setTimesheets(res.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'reports') {
      Promise.all([
        fetchJson(`${API_BASE_URL}/api/lead/reports/progress`),
        fetchJson(`${API_BASE_URL}/api/lead/reports/budget`)
      ])
        .then(([progressRes, budgetRes]) => {
          if (progressRes.success) setProgressReport(progressRes.data);
          if (budgetRes.success) setBudgetReport(budgetRes.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskProjectId || !taskTitle) {
      alert('Project and Task Title are required.');
      return;
    }
    fetch(`${API_BASE_URL}/api/lead/projects/${taskProjectId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: taskTitle,
        assigneeEmail: taskAssigneeEmail,
        assigneeName: taskAssigneeName
      })
    })
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          setShowAddTask(false);
          setTaskTitle('');
          setTaskAssigneeEmail('');
          setTaskAssigneeName('');
          loadData();
        } else {
          alert(r.message || 'Failed to create task.');
        }
      })
      .catch(console.error);
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();
    if (!editingTask) return;
    fetch(`${API_BASE_URL}/api/lead/tasks/${editingTask.id || editingTask._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        projectId: editTaskProjectId,
        title: editTaskTitle,
        status: editTaskStatus,
        note: editTaskNote,
        assigneeEmail: editTaskAssigneeEmail,
        assigneeName: editTaskAssigneeName
      })
    })
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          setEditingTask(null);
          loadData();
        } else {
          alert(r.message || 'Failed to update task.');
        }
      })
      .catch(console.error);
  };

  const handleApproveTimesheet = (id, approveStatus) => {
    fetch(`${API_BASE_URL}/api/lead/timesheets/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: approveStatus
      })
    })
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          setTimesheets((prev) =>
            prev.map((t) => ((t._id || t.id) === id ? { ...t, status: approveStatus, approvedBy: userEmail } : t))
          );
          loadData();
        } else {
          alert(r.message || 'Failed to process timesheet.');
        }
      })
      .catch(console.error);
  };

  const startEditTask = (proj, task) => {
    setEditingTask(task);
    setEditTaskProjectId(proj._id || proj.id);
    setEditTaskTitle(task.title);
    setEditTaskStatus(task.status);
    setEditTaskNote(task.note || '');
    setEditTaskAssigneeEmail(task.assigneeEmail || '');
    setEditTaskAssigneeName(task.assigneeName || '');
  };

  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks ? p.tasks.length : 0), 0);
  const pendingTimesheets = timesheets.filter((t) => t.status === 'Pending').length;
  const needsSupport = (task) => /Support:\s*Yes/i.test(task.note || '');

  if (loading && projects.length === 0 && teamMembers.length === 0 && timesheets.length === 0 && progressReport.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 font-semibold text-xs flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
        <span>Loading lead operations metrics context...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in font-sans">
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Tasks Overload Checklist</h3>
            <button
              onClick={() => {
                if (projects.length > 0) {
                  setTaskProjectId(projects[0]._id || projects[0].id);
                  setShowAddTask(true);
                } else {
                  alert('You have no active projects to add a task to.');
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Plus size={13} />
              <span>Add New Task</span>
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Project</th>
                    <th className="py-4 px-6">Task Title</th>
                    <th className="py-4 px-6">Assignee</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {projects.map((proj) =>
                    (proj.tasks || []).map((task) => (
                      <tr key={task.id || task._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-4 px-6 font-extrabold text-slate-500 dark:text-slate-400">{proj.name}</td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-extrabold text-slate-800 dark:text-white">{task.title}</span>
                            {needsSupport(task) && (
                              <span className="inline-flex w-fit items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                                <ShieldAlert size={10} />
                                Support Requested
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {task.assigneeName ? (
                            <div>
                              <div className="text-slate-800 dark:text-slate-200">{task.assigneeName}</div>
                              <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">{task.assigneeEmail}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                              task.status === 'Done'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                                : task.status === 'Review'
                                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30'
                                : task.status === 'In Progress'
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => startEditTask(proj, task)}
                            className="p-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <Edit size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {totalTasks === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400 dark:text-slate-500 font-bold">
                        No active tasks exist across projects.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Team Workspace Workload</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-505 font-semibold mt-0.5">
              Summary of engineers and their active tasks on your projects.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role Domain</th>
                  <th className="py-4 px-6">Active Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                {teamMembers.map((emp) => (
                  <tr key={emp.id || emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center justify-center">
                        {emp.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-extrabold text-slate-800 dark:text-white">{emp.name}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-500 dark:text-slate-400">{emp.email}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                        {emp.domain || 'Engineering'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-extrabold text-xs ${emp.activeTasks > 4 ? 'text-amber-600' : 'text-slate-800 dark:text-white'}`}>
                        {emp.activeTasks} tasks
                      </span>
                    </td>
                  </tr>
                ))}
                {teamMembers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-505 font-bold">
                      No workspace staff workload records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'timetracking' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Timesheet Approval Registry</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-505 font-semibold mt-0.5">
              Review, approve, or reject employee timesheets logged for your projects.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">Project</th>
                  <th className="py-4 px-6">Hours</th>
                  <th className="py-4 px-6">Billing Type</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                {timesheets.map((t) => (
                  <tr key={t._id || t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-white">{t.userName}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-extrabold">{t.projectName}</td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-700 dark:text-slate-300">{t.hours} hrs</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                          t.billable
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t.billable ? 'Billable' : 'Non-Billable'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full border ${
                          t.status === 'Approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                            : t.status === 'Rejected'
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 animate-pulse'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {t.status === 'Pending' ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleApproveTimesheet(t._id || t.id, 'Approved')}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-200 dark:border-emerald-900/30 rounded-lg cursor-pointer flex items-center space-x-0.5"
                          >
                            <Check size={10} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleApproveTimesheet(t._id || t.id, 'Rejected')}
                            className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-400 font-extrabold text-[10px] border border-red-200 dark:border-red-900/30 rounded-lg cursor-pointer flex items-center space-x-0.5"
                          >
                            <X size={10} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Processed by: {t.approvedBy || 'Admin'}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {timesheets.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400 dark:text-slate-500 font-bold">
                      No timesheets logged for your projects.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center mb-4">
              <BarChart3 size={16} className="text-indigo-600 mr-2" /> Project Delivery Progress Report
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600 dark:text-slate-400">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Project Name</th>
                    <th className="py-3 px-4">Completed Tasks</th>
                    <th className="py-3 px-4">Milestones</th>
                    <th className="py-3 px-4">Completion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {progressReport.map((r) => (
                    <tr key={r.projectId}>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">{r.projectName}</td>
                      <td className="py-3.5 px-4">
                        {r.completedTasks} / {r.totalTasks} tasks
                      </td>
                      <td className="py-3.5 px-4">
                        {r.completedMilestones} / {r.totalMilestones} milestones
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div className="bg-emerald-500 h-full" style={{ width: `${r.completionPct}%` }}></div>
                          </div>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{r.completionPct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {progressReport.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-400 dark:text-slate-500 font-bold">
                        No progress reports available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center mb-4">
              <BarChart3 size={16} className="text-indigo-600 mr-2" /> Budget Burn &amp; Ledger Report
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600 dark:text-slate-400">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Project Name</th>
                    <th className="py-3 px-4">Total Budget</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {budgetReport.map((r) => (
                    <tr key={r.projectId}>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">{r.projectName}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">${r.budget.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">${r.paid.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400 font-bold">${r.outstanding.toLocaleString()}</td>
                    </tr>
                  ))}
                  {budgetReport.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-400 dark:text-slate-505 font-bold">
                        No budget reports available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative text-left">
            <button
              onClick={() => setShowAddTask(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Add Task Assignment</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Provision a new deliverable task to an employee in this workspace.</p>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Select Target Project</label>
                <select
                  value={taskProjectId}
                  onChange={(e) => setTaskProjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {projects.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement OAuth flow"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Assignee</label>
                <select
                  value={taskAssigneeEmail}
                  onChange={(e) => {
                    const email = e.target.value;
                    setTaskAssigneeEmail(email);
                    const matched = email === userEmail ? { name: adminName } : teamMembers.find(t => t.email === email);
                    setTaskAssigneeName(matched ? matched.name : '');
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Assignee</option>
                  {userEmail && (
                    <option value={userEmail}>{adminName} (Company Lead)</option>
                  )}
                  {teamMembers.map((emp) => (
                    <option key={emp.email} value={emp.email}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative text-left">
            <button
              onClick={() => setEditingTask(null)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Edit Task Assignment</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Modify task configuration, assignee, status, and feedback logs.</p>
            </div>
            <form onSubmit={handleUpdateTask} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Task Status</label>
                <select
                  value={editTaskStatus}
                  onChange={(e) => setEditTaskStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Assignee</label>
                <select
                  value={editTaskAssigneeEmail}
                  onChange={(e) => {
                    const email = e.target.value;
                    setEditTaskAssigneeEmail(email);
                    const matched = email === userEmail ? { name: adminName } : teamMembers.find(t => t.email === email);
                    setEditTaskAssigneeName(matched ? matched.name : '');
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Assignee</option>
                  {userEmail && (
                    <option value={userEmail}>{adminName} (Company Lead)</option>
                  )}
                  {teamMembers.map((emp) => (
                    <option key={emp.email} value={emp.email}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Notes / Feedback</label>
                <textarea
                  value={editTaskNote}
                  onChange={(e) => setEditTaskNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px]"
                  placeholder="Leave feedback on task progress..."
                />
              </div>
              <div className="flex space-x-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-colors"
                >
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
