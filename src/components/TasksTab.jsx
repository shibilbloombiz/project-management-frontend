import React, { useState, useEffect, useMemo } from 'react';
import { CheckSquare, Plus, RefreshCw, List, Grid, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

// Import Modular Sub-Components
import { parseTaskNote, formatTaskNote } from './tasks/taskUtils';
import SummaryCards from './tasks/SummaryCards';
import FilterBar from './tasks/FilterBar';
import TaskListView from './tasks/TaskListView';
import TaskKanbanView from './tasks/TaskKanbanView';
import TaskDetailsDrawer from './tasks/TaskDetailsDrawer';
import AddTaskModal from './tasks/AddTaskModal';

export default function TasksTab({
  role = 'Company Admin',
  token,
  userEmail,
  adminName = 'Admin',
  onRefresh
}) {
  const activeToken = token || sessionStorage.getItem('syncra_token') || localStorage.getItem('employeeToken');
  const activeEmail = userEmail || sessionStorage.getItem('syncra_email') || localStorage.getItem('employeeEmail');

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'overdue'
  const [sortKey, setSortKey] = useState('newest'); // 'newest' | 'oldest' | 'due' | 'priority' | 'status'

  // Dynamic filter state for Summary Card clicks
  const [activeSummaryCard, setActiveSummaryCard] = useState(null);

  // Drawer / Selection state
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);

  // Modal / Form state (Admin / Lead Only)
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTaskTitle, setAddTaskTitle] = useState('');
  const [addTaskProject, setAddTaskProject] = useState('');
  const [addTaskAssignee, setAddTaskAssignee] = useState('');
  const [addTaskAssigneeName, setAddTaskAssigneeName] = useState('');
  const [addTaskDeadline, setAddTaskDeadline] = useState('');
  const [addTaskPriority, setAddTaskPriority] = useState('Medium');
  const [addTaskNote, setAddTaskNote] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  // Inline edit state
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskAssignee, setEditTaskAssignee] = useState('');
  const [editTaskStatus, setEditTaskStatus] = useState('Planning');
  const [editTaskDeadline, setEditTaskDeadline] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState('Medium');
  const [editTaskNote, setEditTaskNote] = useState('');

  // Employee update sub-state (used inside drawer)
  const [empStatus, setEmpStatus] = useState('Planning');
  const [empWorkLog, setEmpWorkLog] = useState('');
  const [empHours, setEmpHours] = useState('');
  const [empProgress, setEmpProgress] = useState('0');
  const [empBlockers, setEmpBlockers] = useState('');
  const [empNeedSupport, setEmpNeedSupport] = useState(false);
  const [updatingTaskState, setUpdatingTaskState] = useState(false);

  // Load project and employee dataset
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${activeToken}` };

      // 1. Fetch Projects
      let projUrl = `${API_BASE_URL}/api/projects`;
      if (role === 'Employee') {
        projUrl = `${API_BASE_URL}/api/employee-portal/projects`;
      } else if (role === 'Project Lead') {
        const leadQ = activeEmail ? `?leadEmail=${encodeURIComponent(activeEmail)}` : '';
        projUrl = `${API_BASE_URL}/api/lead/projects${leadQ}`;
      }

      const projRes = await fetch(projUrl, { headers });
      const projData = await projRes.json();

      if (projData.success) {
        setProjects(projData.data || []);
      } else {
        setError(projData.message || 'Failed to fetch project timeline.');
      }

      // 2. Fetch Employees (For Admin & Lead only)
      if (role !== 'Employee') {
        let empUrl = `${API_BASE_URL}/api/employees`;
        if (role === 'Project Lead') {
          const leadQ = activeEmail ? `?leadEmail=${encodeURIComponent(activeEmail)}` : '';
          empUrl = `${API_BASE_URL}/api/lead/team${leadQ}`;
        }
        const empRes = await fetch(empUrl, { headers });
        const empData = await empRes.json();
        if (empData.success) {
          setEmployees(empData.data || []);
        }
      }
    } catch (err) {
      console.error('Error loading TasksTab data:', err);
      setError('Connection issue: Failed to reach server nodes.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, [role, activeToken, activeEmail]);

  // Sync drawer editing state with newly selected task
  useEffect(() => {
    if (selectedTask) {
      setEditTaskTitle(selectedTask.title || '');
      setEditTaskAssignee(selectedTask.assigneeEmail || '');
      setEditTaskStatus(selectedTask.status || 'Planning');
      setEditTaskDeadline(selectedTask.deadline || '');
      setEditTaskPriority(selectedTask.priority || 'Medium');
      setEditTaskNote(selectedTask.note || '');

      // Sync employee form state
      const parsedNote = parseTaskNote(selectedTask.note);
      setEmpStatus(selectedTask.status || 'Planning');
      setEmpWorkLog(parsedNote.log || '');
      setEmpHours(parsedNote.hours || '');
      setEmpProgress(parsedNote.progress || '0');
      setEmpBlockers(parsedNote.blockers || '');
      setEmpNeedSupport(parsedNote.needSupport || false);
    }
  }, [selectedTask]);

  // Flatten tasks from all projects
  const allTasks = useMemo(() => {
    const list = [];
    projects.forEach((proj) => {
      if (proj.tasks && Array.isArray(proj.tasks)) {
        proj.tasks.forEach((t) => {
          list.push({
            ...t,
            projectId: proj._id || proj.id,
            projectName: proj.name,
            projectDeadline: proj.endDate,
            manager: proj.manager || 'Marcus Vance',
            clientEmail: proj.clientEmail || '',
          });
        });
      }
    });
    return list;
  }, [projects]);

  // Filter tasks based on role
  const roleFilteredTasks = useMemo(() => {
    if (role === 'Employee') {
      const emailLower = activeEmail?.trim().toLowerCase();
      return allTasks.filter((t) => t.assigneeEmail?.trim().toLowerCase() === emailLower);
    }
    return allTasks;
  }, [allTasks, role, activeEmail]);

  // Calculate task KPI metrics for Summary Cards
  const kpis = useMemo(() => {
    const list = roleFilteredTasks;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const checkOverdue = (task) => {
      if (!task.deadline || task.status === 'Done' || task.status === 'Completed') return false;
      const d = new Date(task.deadline);
      return d < now;
    };

    return {
      total: list.length,
      pending: list.filter(t => t.status === 'Planning').length,
      inProgress: list.filter(t => t.status === 'In Progress' || t.status === 'Dev').length,
      review: list.filter(t => t.status === 'QA' || t.status === 'Review').length,
      completed: list.filter(t => t.status === 'Done' || t.status === 'Completed').length,
      overdue: list.filter(checkOverdue).length,
    };
  }, [roleFilteredTasks]);

  // Handle Summary Card filter clicks
  const handleSummaryCardClick = (cardName) => {
    if (activeSummaryCard === cardName) {
      setActiveSummaryCard(null);
      setSelectedStatus('all');
      setSelectedDateFilter('all');
    } else {
      setActiveSummaryCard(cardName);
      setSelectedDateFilter('all');
      if (cardName === 'total') {
        setSelectedStatus('all');
      } else if (cardName === 'pending') {
        setSelectedStatus('Planning');
      } else if (cardName === 'inProgress') {
        setSelectedStatus('In Progress');
      } else if (cardName === 'review') {
        setSelectedStatus('QA');
      } else if (cardName === 'completed') {
        setSelectedStatus('Done');
      } else if (cardName === 'overdue') {
        setSelectedStatus('all');
        setSelectedDateFilter('overdue');
      }
    }
  };

  // Perform search, filter, and sort pipeline
  const filteredTasks = useMemo(() => {
    let result = [...roleFilteredTasks];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q) ||
          t.assigneeName?.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q) ||
          (t.priority && t.priority.toLowerCase().includes(q))
      );
    }

    if (selectedStatus !== 'all') {
      const statusLower = selectedStatus.toLowerCase();
      result = result.filter((t) => {
        const s = t.status.toLowerCase();
        if (statusLower === 'planning') return s === 'planning';
        if (statusLower === 'in progress' || statusLower === 'dev') return s === 'in progress' || s === 'dev';
        if (statusLower === 'qa' || statusLower === 'review') return s === 'qa' || s === 'review';
        if (statusLower === 'done' || statusLower === 'completed') return s === 'done' || s === 'completed';
        return s === statusLower;
      });
    }

    if (selectedPriority !== 'all') {
      result = result.filter((t) => String(t.priority || 'Medium').toLowerCase() === selectedPriority.toLowerCase());
    }

    if (selectedProject !== 'all') {
      result = result.filter((t) => t.projectId === selectedProject);
    }

    if (selectedEmployee !== 'all') {
      result = result.filter((t) => t.assigneeEmail === selectedEmployee);
    }

    if (selectedDateFilter !== 'all') {
      if (selectedDateFilter === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        result = result.filter((t) => t.deadline === todayStr);
      } else if (selectedDateFilter === 'week') {
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        result = result.filter((t) => {
          if (!t.deadline) return false;
          const d = new Date(t.deadline);
          return d >= now && d <= nextWeek;
        });
      } else if (selectedDateFilter === 'overdue') {
        result = result.filter((t) => {
          if (!t.deadline || t.status === 'Done' || t.status === 'Completed') return false;
          const d = new Date(t.deadline);
          return d < now;
        });
      }
    }

    result.sort((a, b) => {
      if (sortKey === 'newest') return (b._id || b.id || '').localeCompare(a._id || a.id || '');
      if (sortKey === 'oldest') return (a._id || a.id || '').localeCompare(b._id || b.id || '');
      if (sortKey === 'due') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortKey === 'priority') {
        const weight = { High: 3, Medium: 2, Low: 1 };
        const wA = weight[a.priority || 'Medium'] || 2;
        const wB = weight[b.priority || 'Medium'] || 2;
        return wB - wA;
      }
      if (sortKey === 'status') return (a.status || '').localeCompare(b.status || '');
      if (sortKey === 'project') return (a.projectName || '').localeCompare(b.projectName || '');
      return 0;
    });

    return result;
  }, [roleFilteredTasks, searchQuery, selectedStatus, selectedPriority, selectedProject, selectedEmployee, selectedDateFilter, sortKey]);

  // Handle Add Task Submission (Admin & Lead only)
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!addTaskTitle.trim() || !addTaskProject) return;
    setSubmittingTask(true);

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`
      };

      let url = `${API_BASE_URL}/api/projects/${addTaskProject}/tasks`;
      let payload = {
        title: addTaskTitle.trim(),
        assigneeEmail: addTaskAssignee,
        deadline: addTaskDeadline,
        priority: addTaskPriority,
        note: addTaskNote || 'Initial specifications.'
      };

      if (role === 'Project Lead') {
        const leadQ = activeEmail ? `?leadEmail=${encodeURIComponent(activeEmail)}` : '';
        url = `${API_BASE_URL}/api/lead/projects/${addTaskProject}/tasks${leadQ}`;
        const matchEmp = employees.find(emp => emp.email === addTaskAssignee);
        payload = {
          title: addTaskTitle.trim(),
          assigneeEmail: addTaskAssignee,
          assigneeName: matchEmp ? matchEmp.name : '',
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setShowAddModal(false);
        setAddTaskTitle('');
        setAddTaskAssignee('');
        setAddTaskDeadline('');
        setAddTaskPriority('Medium');
        setAddTaskNote('');
        await loadData(true);
      } else {
        alert(data.message || 'Failed to create task.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating task.');
    } finally {
      setSubmittingTask(false);
    }
  };

  // Core task updater
  const handleUpdateTask = async (task, customFields = null) => {
    setUpdatingTaskState(true);
    const projId = task.projectId;
    const tId = task.id || task._id;

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`
      };

      let url = `${API_BASE_URL}/api/projects/${projId}/tasks/${tId}`;
      let bodyData = {};

      if (role === 'Employee') {
        url = `${API_BASE_URL}/api/employee-portal/tasks/${projId}/${tId}`;
        bodyData = customFields || {
          status: empStatus,
          note: formatTaskNote(empWorkLog, empHours, empProgress, empBlockers, empNeedSupport)
        };
      } else if (role === 'Project Lead') {
        const leadQ = activeEmail ? `?leadEmail=${encodeURIComponent(activeEmail)}` : '';
        url = `${API_BASE_URL}/api/lead/tasks/${tId}${leadQ}`;
        const matchEmp = employees.find(emp => emp.email === editTaskAssignee);
        bodyData = {
          projectId: projId,
          title: editTaskTitle.trim(),
          status: editTaskStatus,
          note: editTaskNote,
          assigneeEmail: editTaskAssignee,
          assigneeName: matchEmp ? matchEmp.name : '',
        };
      } else {
        // Company Admin
        const matchEmp = employees.find(emp => emp.email === editTaskAssignee);
        bodyData = {
          title: editTaskTitle.trim(),
          assigneeEmail: editTaskAssignee,
          assigneeName: matchEmp ? matchEmp.name : (editTaskAssignee === activeEmail ? adminName : ''),
          status: editTaskStatus,
          deadline: editTaskDeadline,
          priority: editTaskPriority,
          note: editTaskNote,
        };
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bodyData)
      });
      const resData = await res.json();

      if (resData.success) {
        setIsEditingTask(false);
        // Refresh selected task info in drawer
        const updatedProj = resData.data;
        if (updatedProj && updatedProj.tasks) {
          const freshTask = updatedProj.tasks.find(t => (t.id || t._id) === tId);
          if (freshTask) {
            setSelectedTask({
              ...freshTask,
              projectId: projId,
              projectName: task.projectName,
              projectDeadline: task.projectDeadline,
              manager: task.manager,
              clientEmail: task.clientEmail,
            });
          }
        } else if (role === 'Employee' && resData.data) {
          setSelectedTask({
            ...task,
            status: resData.data.status || task.status,
            note: resData.data.note || task.note,
          });
        }
        await loadData(true);
      } else {
        alert(resData.message || 'Failed to update task.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating task.');
    } finally {
      setUpdatingTaskState(false);
    }
  };

  const handleUpdateTaskFormSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedTask) return;
    await handleUpdateTask(selectedTask);
  };

  const handleToggleTaskStatus = async (task) => {
    const isDone = task.status === 'Done' || task.status === 'Completed';
    const nextStatus = isDone ? 'In Progress' : 'Done';
    const parsedNote = parseTaskNote(task.note);
    const updatedNote = formatTaskNote(
      parsedNote.log || 'Status changed',
      parsedNote.hours || '0',
      isDone ? '50' : '100',
      parsedNote.blockers || '',
      parsedNote.needSupport || false
    );

    await handleUpdateTask(task, {
      status: nextStatus,
      note: updatedNote
    });
  };

  // Handle Task Deletion (Admin only)
  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) return;
    const projId = task.projectId;
    const tId = task.id || task._id;

    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projId}/tasks/${tId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTask(null);
        await loadData(true);
      } else {
        alert(data.message || 'Failed to delete task.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting task.');
    }
  };

  const handleEditTaskClick = (task) => {
    setSelectedTask(task);
    setIsEditingTask(true);
  };

  return (
    <div className="space-y-6 text-left relative font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <CheckSquare size={20} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-none font-display">Tasks Workspace</h2>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Track deliverables, check due dates, and update work logs in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 transition cursor-pointer"
            title="Refresh Task Stream"
          >
            <RefreshCw size={15} />
          </button>
          
          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'}`}
              title="List View"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'}`}
              title="Kanban Board"
            >
              <Grid size={14} />
            </button>
          </div>

          {/* New Task Button (Admin / Lead only) */}
          {role !== 'Employee' && (
            <button
              onClick={() => {
                if (projects.length === 0) {
                  alert('Create a project first to assign tasks.');
                  return;
                }
                setAddTaskProject(projects[0]._id || projects[0].id);
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>

      {/* ERROR MESSAGE NOTIFICATION */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 rounded-2xl text-xs text-red-650 font-semibold flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => loadData()} className="underline hover:no-underline font-extrabold cursor-pointer">
            Retry Connection
          </button>
        </div>
      )}

      {/* SUMMARY METRIC CARDS */}
      <SummaryCards
        kpis={kpis}
        activeCard={activeSummaryCard}
        onCardClick={handleSummaryCardClick}
      />

      {/* FILTER & SEARCH BAR */}
      <FilterBar
        role={role}
        activeEmail={activeEmail}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        selectedDateFilter={selectedDateFilter}
        setSelectedDateFilter={setSelectedDateFilter}
        sortKey={sortKey}
        setSortKey={setSortKey}
        viewMode={viewMode}
        setViewMode={setViewMode}
        projects={projects}
        employees={employees}
        onRefresh={() => loadData(true)}
        clearSummaryCard={() => setActiveSummaryCard(null)}
      />

      {/* MAIN VIEW AREA */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 font-semibold text-xs flex items-center justify-center space-x-2">
          <Loader2 size={16} className="animate-spin text-indigo-600" />
          <span>Configuring project management task space context...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-slate-205 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm">
          <CheckSquare size={36} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">No tasks match your selections</h4>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or query options.</p>
        </div>
      ) : viewMode === 'list' ? (
        <TaskListView
          role={role}
          activeEmail={activeEmail}
          tasks={filteredTasks}
          onTaskClick={setSelectedTask}
          onUpdateTaskStatus={handleToggleTaskStatus}
          onDeleteTask={handleDeleteTask}
          onEditTaskClick={handleEditTaskClick}
        />
      ) : (
        <TaskKanbanView
          tasks={filteredTasks}
          onTaskClick={setSelectedTask}
        />
      )}

      {/* DETAILED SPECIFICATIONS DRAWER */}
      {selectedTask && (
        <TaskDetailsDrawer
          role={role}
          activeEmail={activeEmail}
          adminName={adminName}
          selectedTask={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            setIsEditingTask(false);
          }}
          onDelete={handleDeleteTask}
          isEditingTask={isEditingTask}
          setIsEditingTask={setIsEditingTask}
          updatingTaskState={updatingTaskState}
          handleUpdateTask={handleUpdateTaskFormSubmit}
          
          editTaskTitle={editTaskTitle}
          setEditTaskTitle={setEditTaskTitle}
          editTaskAssignee={editTaskAssignee}
          setEditTaskAssignee={setEditTaskAssignee}
          editTaskStatus={editTaskStatus}
          setEditTaskStatus={setEditTaskStatus}
          editTaskDeadline={editTaskDeadline}
          setEditTaskDeadline={setEditTaskDeadline}
          editTaskPriority={editTaskPriority}
          setEditTaskPriority={setEditTaskPriority}
          editTaskNote={editTaskNote}
          setEditTaskNote={setEditTaskNote}
          
          empStatus={empStatus}
          setEmpStatus={setEmpStatus}
          empWorkLog={empWorkLog}
          setEmpWorkLog={setEmpWorkLog}
          empHours={empHours}
          setEmpHours={setEmpHours}
          empProgress={empProgress}
          setEmpProgress={setEmpProgress}
          empBlockers={empBlockers}
          setEmpBlockers={setEmpBlockers}
          empNeedSupport={empNeedSupport}
          setEmpNeedSupport={setEmpNeedSupport}
          
          employees={employees}
        />
      )}

      {/* CREATE NEW TASK DIALOG (Admin & Lead only) */}
      <AddTaskModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTask}
        loading={submittingTask}
        companyLeadEmail={role === 'Project Lead' ? activeEmail : ''}
        companyLeadName={role === 'Project Lead' ? adminName : ''}
        projects={projects}
        employees={employees}
        taskProjectId={addTaskProject}
        setTaskProjectId={setAddTaskProject}
        taskTitle={addTaskTitle}
        setTaskTitle={setAddTaskTitle}
        taskAssigneeEmail={addTaskAssignee}
        setTaskAssigneeEmail={setAddTaskAssignee}
        setTaskAssigneeName={setAddTaskAssigneeName}
        taskDeadline={addTaskDeadline}
        setTaskDeadline={setAddTaskDeadline}
        taskPriority={addTaskPriority}
        setTaskPriority={setAddTaskPriority}
        taskNote={addTaskNote}
        setTaskNote={setAddTaskNote}
      />
    </div>
  );
}
