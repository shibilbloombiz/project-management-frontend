import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import { Layers, Briefcase, CheckSquare, Users, Clock, BarChart3, Bell, ShieldCheck, Play, ArrowLeft, Plus, Check, X, Edit } from "lucide-react";
import LeadSidebar from "./LeadSidebar";
import NotificationsDropdown from "../NotificationsDropdown";
import FloatingChat from "../FloatingChat";
import ThemeToggle from "../ThemeToggle";
export default function LeadDashboard({
  userEmail,
  companyId,
  initialOrg,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState("projects");
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(initialOrg || "Initech Systems");
  const [leadName, setLeadName] = useState("Project Lead");
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const list = localStorage.getItem("dismissed_notifications");
      return list ? JSON.parse(list) : [];
    } catch (e) {
      return [];
    }
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const saveDismissed = newIds => {
    setDismissedIds(newIds);
    localStorage.setItem("dismissed_notifications", JSON.stringify(newIds));
  };
  const handleDismiss = id => saveDismissed([...dismissedIds, id]);
  const handleDismissAll = () => {
    const currentIds = activeNotifications.map(n => n.id);
    saveDismissed([...dismissedIds, ...currentIds]);
  };
  const handleNotificationNavigate = n => {
    if (n.tab) setActiveTab(n.tab);
    if (n.project) setSelectedProject(n.project);
    setIsNotificationsOpen(false);
  };
  const [users, setUsers] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    activeProjectsCount: 0,
    overdueTasksCount: 0,
    teamWorkload: []
  });
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [progressReport, setProgressReport] = useState([]);
  const [budgetReport, setBudgetReport] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskProjectId, setTaskProjectId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssigneeEmail, setTaskAssigneeEmail] = useState("");
  const [taskAssigneeName, setTaskAssigneeName] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskProjectId, setEditTaskProjectId] = useState("");
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskStatus, setEditTaskStatus] = useState("");
  const [editTaskNote, setEditTaskNote] = useState("");
  const [editTaskAssigneeEmail, setEditTaskAssigneeEmail] = useState("");
  const [editTaskAssigneeName, setEditTaskAssigneeName] = useState("");
  useEffect(() => {
    setLoading(true);
    const token = sessionStorage.getItem("syncra_token");
    fetch(`${API_BASE_URL}/api/users`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then(res => res.json()).then(res => {
      if (res.success) {
        setUsers(res.data);
        const matched = res.data.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
        if (matched) {
          setOrg(matched.org || initialOrg);
          setLeadName(matched.name);
        }
      }
    }).catch(err => console.error("Failed to load project lead details:", err)).finally(() => setLoading(false));
  }, [userEmail, initialOrg]);
  const loadLeadData = () => {
    const token = sessionStorage.getItem("syncra_token");
    const headers = {
      "Authorization": `Bearer ${token}`
    };
    const q = userEmail ? `?leadEmail=${encodeURIComponent(userEmail)}` : "";
    fetch(`${API_BASE_URL}/api/lead/dashboard${q}`, {
      headers
    }).then(r => r.json()).then(r => {
      if (r.success) setDashboardMetrics(r.data);
    }).catch(console.error);
    fetch(`${API_BASE_URL}/api/lead/projects${q}`, {
      headers
    }).then(r => r.json()).then(r => {
      if (r.success) setProjects(r.data);
    }).catch(console.error);
    fetch(`${API_BASE_URL}/api/lead/team${q}`, {
      headers
    }).then(r => r.json()).then(r => {
      if (r.success) setTeamMembers(r.data);
    }).catch(console.error);
    fetch(`${API_BASE_URL}/api/lead/timesheets${q}`, {
      headers
    }).then(r => r.json()).then(r => {
      if (r.success) setTimesheets(r.data);
    }).catch(console.error);
    fetch(`${API_BASE_URL}/api/lead/reports/progress${q}`, {
      headers
    }).then(r => r.json()).then(r => {
      if (r.success) setProgressReport(r.data);
    }).catch(console.error);
    fetch(`${API_BASE_URL}/api/lead/reports/budget${q}`, {
      headers
    }).then(r => r.json()).then(r => {
      if (r.success) setBudgetReport(r.data);
    }).catch(console.error);
  };
  useEffect(() => {
    loadLeadData();
    const interval = setInterval(loadLeadData, 10000);
    return () => clearInterval(interval);
  }, [org]);
  const handleCreateTask = e => {
    e.preventDefault();
    if (!taskProjectId || !taskTitle) {
      alert("Project and Task Title are required.");
      return;
    }
    const token = sessionStorage.getItem("syncra_token");
    const q = userEmail ? `?leadEmail=${encodeURIComponent(userEmail)}` : "";
    fetch(`${API_BASE_URL}/api/lead/projects/${taskProjectId}/tasks${q}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title: taskTitle,
        assigneeEmail: taskAssigneeEmail,
        assigneeName: taskAssigneeName
      })
    }).then(r => r.json()).then(r => {
      if (r.success) {
        setShowAddTask(false);
        setTaskTitle("");
        setTaskAssigneeEmail("");
        setTaskAssigneeName("");
        loadLeadData();
        if (selectedProject && (selectedProject._id || selectedProject.id) === taskProjectId) {
          handleViewProjectDetail(selectedProject);
        }
      } else {
        alert(r.message || "Failed to create task.");
      }
    }).catch(console.error);
  };
  const handleUpdateTask = e => {
    e.preventDefault();
    if (!editingTask) return;
    const token = sessionStorage.getItem("syncra_token");
    const q = userEmail ? `?leadEmail=${encodeURIComponent(userEmail)}` : "";
    fetch(`${API_BASE_URL}/api/lead/tasks/${editingTask.id || editingTask._id}${q}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        projectId: editTaskProjectId,
        title: editTaskTitle,
        status: editTaskStatus,
        note: editTaskNote,
        assigneeEmail: editTaskAssigneeEmail,
        assigneeName: editTaskAssigneeName
      })
    }).then(r => r.json()).then(r => {
      if (r.success) {
        setEditingTask(null);
        loadLeadData();
        if (selectedProject && (selectedProject._id || selectedProject.id) === editTaskProjectId) {
          handleViewProjectDetail(selectedProject);
        }
      } else {
        alert(r.message || "Failed to update task.");
      }
    }).catch(console.error);
  };
  const handleApproveTimesheet = (id, approveStatus) => {
    const token = sessionStorage.getItem("syncra_token");
    const q = userEmail ? `?leadEmail=${encodeURIComponent(userEmail)}` : "";
    fetch(`${API_BASE_URL}/api/lead/timesheets/${id}/approve${q}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        status: approveStatus
      })
    }).then(r => r.json()).then(r => {
      if (r.success) {
        setTimesheets(prev => prev.map(t => (t._id || t.id) === id ? {
          ...t,
          status: approveStatus,
          approvedBy: userEmail
        } : t));
        loadLeadData();
      } else {
        alert(r.message || "Failed to process timesheet.");
      }
    }).catch(console.error);
  };
  const handleViewProjectDetail = proj => {
    const token = sessionStorage.getItem("syncra_token");
    const id = proj._id || proj.id;
    const q = userEmail ? `?leadEmail=${encodeURIComponent(userEmail)}` : "";
    fetch(`${API_BASE_URL}/api/lead/projects/${id}${q}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then(r => r.json()).then(r => {
      if (r.success) setSelectedProject(r.data);
    }).catch(console.error);
  };
  const startEditTask = (proj, task) => {
    setEditingTask(task);
    setEditTaskProjectId(proj._id || proj.id);
    setEditTaskTitle(task.title);
    setEditTaskStatus(task.status);
    setEditTaskNote(task.note || "");
    setEditTaskAssigneeEmail(task.assigneeEmail || "");
    setEditTaskAssigneeName(task.assigneeName || "");
  };
  const companyAdmin = users.find(u => u.role === "Company Admin");
  const companyLeadEmail = companyAdmin?.email || '';
  const companyLeadName = companyAdmin?.name || '';

  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks ? p.tasks.length : 0), 0);
  const pendingTimesheets = timesheets.filter(t => t.status === "Pending").length;
  const counts = {
    projects: projects.length,
    tasks: totalTasks,
    team: teamMembers.length,
    timesheets: pendingTimesheets
  };
  const rawNotifications = [];
  timesheets.filter(t => t.status === "Pending").forEach(t => {
    rawNotifications.push({
      id: `timesheet_${t._id || t.id}`,
      type: "timesheet_approval",
      title: "Timesheet Pending Approval",
      desc: `${t.employeeName || t.employeeEmail} submitted ${t.hours} hours for "${t.taskTitle}"`,
      tab: "timetracking"
    });
  });
  projects.forEach(p => {
    (p.clientRequirements || []).filter(r => r.status === "Pending Review").forEach(r => {
      rawNotifications.push({
        id: `scope_${r.id || r._id}`,
        type: "client_scope",
        title: `Scope Proposed: ${p.name}`,
        desc: `Proposed: "${r.title}" - ${r.description}`,
        tab: "projects",
        project: p
      });
    });
  });
  const activeNotifications = rawNotifications.filter(n => !dismissedIds.includes(n.id));
  return <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200"> {} <nav className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-sm px-6 py-3 flex items-center justify-between"> <div className="flex items-center space-x-3"> <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg text-white"> <Layers size={18} /> </div> <div> <span className="text-md font-bold font-display text-slate-900 dark:text-white leading-none block">Syncra Workspace</span> <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide">Project Lead Console</span> </div> <div className="hidden lg:flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 px-3 py-1 rounded-full text-[11px] font-bold text-indigo-700 dark:text-indigo-350 ml-4"> <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 animate-pulse"></span> <span>Org: {org}</span> </div> <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-0.5 ml-2.5 shadow-sm"> <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Page:</span> <select value={activeTab} onChange={e => { setSelectedProject(null); setActiveTab(e.target.value); }} className="bg-transparent text-slate-700 dark:text-slate-200 text-[10px] font-extrabold focus:outline-none cursor-pointer py-1 pr-1 border-none focus:ring-0"> <option value="projects" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">my project</option> <option value="tasks" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">task manager</option> <option value="team" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">team workload</option> <option value="timetracking" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">time sheet approvals</option> <option value="reports" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">analytics</option> </select> </div> </div> <div className="hidden md:flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500"> <ShieldCheck size={14} className="text-emerald-500 mr-1.5" /> <span>Project assignment node active with Lead privileges</span> </div> <div className="flex items-center space-x-4"> <div className="relative"> <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 relative cursor-pointer" aria-label="Notifications"> <Bell size={18} /> {activeNotifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>} </button> <NotificationsDropdown notifications={activeNotifications} onDismiss={handleDismiss} onDismissAll={handleDismissAll} onNavigate={handleNotificationNavigate} isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} /> </div> <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 gap-3"> <div className="text-right"> <span className="text-xs font-extrabold text-slate-900 dark:text-slate-200 block font-display leading-tight">{leadName}</span> <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">Project Lead</span> </div> <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md border border-white dark:border-slate-800"> {leadName.split(" ").map(n => n[0]).join("")} </div> </div> </div> </nav> {} <div className="flex-1 flex flex-col md:flex-row"> <LeadSidebar activeTab={activeTab} setActiveTab={tab => {
        setSelectedProject(null);
        setActiveTab(tab);
      }} org={org} leadName={leadName} onLogout={onLogout} counts={counts} /> <main className="flex-grow p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-62px)] text-left font-sans"> <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> <div> <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">Lead Console operation page</h4> <p className="text-[11px] text-slate-400 dark:text-slate-505 font-medium">Quickly swap operation views using the operation selection dropdown.</p> </div> <div className="flex items-center space-x-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300"> <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Select Operation:</span> <select value={activeTab} onChange={e => { setSelectedProject(null); setActiveTab(e.target.value); }} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm min-w-[200px] hover:border-slate-350 dark:hover:border-slate-600 transition-colors"> <option value="projects" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">my project</option> <option value="tasks" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">task manager</option> <option value="team" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">team workload</option> <option value="timetracking" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">time sheet approvals</option> <option value="reports" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">analytics</option> </select> </div> </div> {loading ? <div className="p-8 text-center text-slate-400 font-semibold text-xs flex items-center justify-center space-x-2"> <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div> <span>Configuring lead workspace console context...</span> </div> : selectedProject ? <div className="space-y-6"> <button onClick={() => setSelectedProject(null)} className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 rounded-xl cursor-pointer flex items-center space-x-1 font-bold text-xs shadow-sm bg-white dark:bg-slate-900"> <ArrowLeft size={14} /> <span>Back to Pipeline</span> </button> <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"> <div className="flex justify-between items-start"> <div> <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedProject.name}</h2> <p className="text-xs text-slate-400 font-semibold mt-1">Project Details &amp; Delivery Checklist</p> </div> <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProject.status === "Active" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}> {selectedProject.status} </span> </div> <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-semibold text-slate-600"> <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"> <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Target Client</span> <span className="text-slate-800 dark:text-slate-200 font-extrabold block mt-1">{selectedProject.clientEmail || "No Linked Client"}</span> </div> <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"> <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Allocated Budget</span> <span className="text-slate-800 dark:text-slate-200 font-extrabold block mt-1">${(selectedProject.budget || 0).toLocaleString()}</span> </div> <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"> <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Timeline Schedule</span> <span className="text-slate-800 dark:text-slate-200 font-extrabold block mt-1"> {selectedProject.startDate || "N/A"} — {selectedProject.endDate || "N/A"} </span> </div> </div> {selectedProject.clientDetails && <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 mt-2 text-xs"> <span className="font-extrabold text-indigo-800 dark:text-indigo-300 block mb-1">Client Profile Contact:</span> <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 font-semibold mt-1.5"> <div>Name: <span className="text-slate-800 dark:text-slate-200">{selectedProject.clientDetails.name}</span></div> <div>Email: <span className="text-slate-800 dark:text-slate-200">{selectedProject.clientDetails.email}</span></div> <div>Phone: <span className="text-slate-800 dark:text-slate-200">{selectedProject.clientDetails.phone || "N/A"}</span></div> <div>Company: <span className="text-slate-800 dark:text-slate-200">{selectedProject.clientDetails.companyName || "N/A"}</span></div> </div> </div>} </div> {} <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"> <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center"> <h3 className="text-md font-extrabold font-display text-slate-800 dark:text-white flex items-center"> <CheckSquare size={16} className="text-indigo-600 mr-2" /> Project Tasks </h3> <button onClick={() => {
                setTaskProjectId(selectedProject._id || selectedProject.id);
                setShowAddTask(true);
              }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"> <Plus size={13} /> <span>Add Task</span> </button> </div> <div className="overflow-x-auto"> <table className="w-full text-left border-collapse"> <thead> <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"> <th className="py-3 px-6">Task Title</th> <th className="py-3 px-6">Assignee</th> <th className="py-3 px-6">Status</th> <th className="py-3 px-6">Notes / Feedback</th> <th className="py-3 px-6 text-right">Actions</th> </tr> </thead> <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"> {(selectedProject.tasks || []).map(task => <tr key={task.id || task._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"> <td className="py-3.5 px-6 font-extrabold text-slate-800 dark:text-white">{task.title}</td> <td className="py-3.5 px-6"> {task.assigneeName ? <div> <div className="text-slate-800 dark:text-slate-200">{task.assigneeName}</div> <div className="text-[9px] text-slate-400 dark:text-slate-500">{task.assigneeEmail}</div> </div> : <span className="text-slate-400 font-medium">Unassigned</span>} </td> <td className="py-3.5 px-6"> <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${task.status === "Done" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30" : task.status === "Review" ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30" : task.status === "In Progress" ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}> {task.status} </span> </td> <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 font-medium italic">{task.note || "No notes added"}</td> <td className="py-3.5 px-6 text-right"> <button onClick={() => startEditTask(selectedProject, task)} className="p-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer" title="Edit Task"> <Edit size={12} /> </button> </td> </tr>)} {(!selectedProject.tasks || selectedProject.tasks.length === 0) && <tr> <td colSpan="5" className="text-center py-8 text-slate-400 dark:text-slate-500 font-bold">No tasks registered for this project.</td> </tr>} </tbody> </table> </div> </div> </div> : <> {} {activeTab === "dashboard" && <div className="space-y-6"> <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {} <div onClick={() => setActiveTab("projects")} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all group"> <div className="flex justify-between items-start"> <div> <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-display block">My Projects Led</span> <span className="text-2xl font-extrabold text-slate-800 dark:text-white font-display mt-1 block"> {dashboardMetrics.activeProjectsCount} <span className="text-xs text-slate-400 dark:text-slate-500">active</span> </span> </div> <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"><Briefcase size={16} /></span> </div> </div> {} <div onClick={() => setActiveTab("tasks")} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all group"> <div className="flex justify-between items-start"> <div> <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-display block">Overdue Tasks Queue</span> <span className="text-2xl font-extrabold text-slate-800 dark:text-white font-display mt-1 block"> {dashboardMetrics.overdueTasksCount} <span className="text-xs text-slate-400 dark:text-slate-500">tasks pending</span> </span> </div> <span className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-lg text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"><CheckSquare size={16} /></span> </div> </div> {} <div onClick={() => setActiveTab("timetracking")} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all group"> <div className="flex justify-between items-start"> <div> <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-display block">Timesheet Approvals Pending</span> <span className="text-2xl font-extrabold text-slate-800 dark:text-white font-display mt-1 block"> {pendingTimesheets} <span className="text-xs text-slate-400 dark:text-slate-500">entries</span> </span> </div> <span className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-lg text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform"><Clock size={16} /></span> </div> </div> </div> {} <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"> <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center mb-4"> <Users size={16} className="text-indigo-600 mr-2" /> Team Deliverable Workload </h3> <div className="space-y-4"> {dashboardMetrics.teamWorkload && dashboardMetrics.teamWorkload.map((member, idx) => <div key={idx} className="space-y-1 text-xs"> <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300"> <span>{member.name}</span> <span>{member.activeTasks} active tasks</span> </div> <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700"> <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{
                      width: `${Math.min(member.activeTasks / 8 * 100, 100)}%`
                    }}></div> </div> </div>)} {(!dashboardMetrics.teamWorkload || dashboardMetrics.teamWorkload.length === 0) && <p className="text-xs text-slate-400 dark:text-slate-500 font-bold text-center py-4">No active workload records found.</p>} </div> </div> </div>} {} {activeTab === "projects" && <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"> <div className="p-5 border-b border-slate-100 dark:border-slate-800"> <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Projects Managed By Me</h3> <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Click a project to drill into tasks and client contact profiles.</p> </div> <div className="overflow-x-auto"> <table className="w-full text-left border-collapse"> <thead> <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"> <th className="py-4 px-6">Project Name</th> <th className="py-4 px-6">Client Email</th> <th className="py-4 px-6">Timeline</th> <th className="py-4 px-6">Budget</th> <th className="py-4 px-6">Status</th> <th className="py-4 px-6 text-right">Action</th> </tr> </thead> <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"> {projects.map(proj => <tr key={proj._id || proj.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"> <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-white"> <span onClick={() => handleViewProjectDetail(proj)} className="cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline"> {proj.name} </span> </td> <td className="py-4 px-6 font-mono text-[11px] text-slate-500 dark:text-slate-400">{proj.clientEmail || "N/A"}</td> <td className="py-4 px-6 font-medium text-slate-400 dark:text-slate-500">{proj.startDate ? `${proj.startDate} to ${proj.endDate}` : "N/A"}</td> <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">${(proj.budget || 0).toLocaleString()}</td> <td className="py-4 px-6"> <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${proj.status === "Active" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}> {proj.status} </span> </td> <td className="py-4 px-6 text-right"> <button onClick={() => handleViewProjectDetail(proj)} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center justify-end ml-auto"> <Play size={10} className="mr-1" /> View Details </button> </td> </tr>)} {projects.length === 0 && <tr> <td colSpan="6" className="text-center py-8 text-slate-400 dark:text-slate-500 font-bold">No assigned projects led by you.</td> </tr>} </tbody> </table> </div> </div>} {} {activeTab === "tasks" && <div className="space-y-6"> <div className="flex justify-between items-center"> <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Tasks Overload Checklist</h3> <button onClick={() => {
                if (projects.length > 0) {
                  setTaskProjectId(projects[0]._id || projects[0].id);
                  setShowAddTask(true);
                } else {
                  alert("You have no active projects to add a task to.");
                }
              }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-sm transition-colors"> <Plus size={13} /> <span>Add New Task</span> </button> </div> <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"> <div className="overflow-x-auto"> <table className="w-full text-left border-collapse"> <thead> <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"> <th className="py-4 px-6">Project</th> <th className="py-4 px-6">Task Title</th> <th className="py-4 px-6">Assignee</th> <th className="py-4 px-6">Status</th> <th className="py-4 px-6 text-right">Actions</th> </tr> </thead> <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"> {projects.map(proj => (proj.tasks || []).map(task => <tr key={task.id || task._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"> <td className="py-4 px-6 font-extrabold text-slate-500 dark:text-slate-400">{proj.name}</td> <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-white">{task.title}</td> <td className="py-4 px-6"> {task.assigneeName ? <div> <div className="text-slate-800 dark:text-slate-200">{task.assigneeName}</div> <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">{task.assigneeEmail}</div> </div> : <span className="text-slate-400 font-medium">Unassigned</span>} </td> <td className="py-4 px-6"> <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${task.status === "Done" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30" : task.status === "Review" ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30" : task.status === "In Progress" ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}>{task.status}</span> </td> <td className="py-4 px-6 text-right"> <button onClick={() => startEditTask(proj, task)} className="p-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"> <Edit size={12} /> </button> </td> </tr>))} {totalTasks === 0 && <tr><td colSpan="5" className="text-center py-8 text-slate-400 dark:text-slate-500 font-bold">No active tasks exist across projects.</td></tr>} </tbody> </table> </div> </div> </div>} {} {activeTab === "team" && <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"> <div className="p-5 border-b border-slate-100 dark:border-slate-800"> <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Team Workspace Workload</h3> <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Summary of engineers and their active tasks on your projects.</p> </div> <div className="overflow-x-auto"> <table className="w-full text-left border-collapse"> <thead> <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"> <th className="py-4 px-6">Name</th> <th className="py-4 px-6">Email</th> <th className="py-4 px-6">Role Domain</th> <th className="py-4 px-6">Active Tasks</th> </tr> </thead> <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"> {teamMembers.map(emp => <tr key={emp.id || emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"> <td className="py-4 px-6 flex items-center space-x-3"> <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center justify-center"> {emp.name.split(" ").map(n => n[0]).join("")} </div> <span className="font-extrabold text-slate-800 dark:text-white">{emp.name}</span> </td> <td className="py-4 px-6 font-mono text-[11px] text-slate-500 dark:text-slate-400">{emp.email}</td> <td className="py-4 px-6"> <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"> {emp.domain || "Engineering"} </span> </td> <td className="py-4 px-6"> <span className={`font-extrabold text-xs ${emp.activeTasks > 4 ? "text-amber-600" : "text-slate-800 dark:text-white"}`}> {emp.activeTasks} tasks </span> </td> </tr>)} {teamMembers.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500 font-bold">No workspace staff records found.</td></tr>} </tbody> </table> </div> </div>} {} {activeTab === "timetracking" && <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"> <div className="p-5 border-b border-slate-100 dark:border-slate-800"> <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Timesheet Approval Registry</h3> <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Review, approve, or reject employee timesheets logged for your projects.</p> </div> <div className="overflow-x-auto"> <table className="w-full text-left border-collapse"> <thead> <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"> <th className="py-4 px-6">Employee</th> <th className="py-4 px-6">Project</th> <th className="py-4 px-6">Hours</th> <th className="py-4 px-6">Billing Type</th> <th className="py-4 px-6">Status</th> <th className="py-4 px-6 text-right">Actions</th> </tr> </thead> <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"> {timesheets.map(t => <tr key={t._id || t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"> <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-white">{t.userName}</td> <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-extrabold">{t.projectName}</td> <td className="py-4 px-6 font-mono font-bold text-slate-700 dark:text-slate-300">{t.hours} hrs</td> <td className="py-4 px-6"> <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${t.billable ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}`}> {t.billable ? "Billable" : "Non-Billable"} </span> </td> <td className="py-4 px-6"> <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full border ${t.status === "Approved" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30" : t.status === "Rejected" ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30" : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 animate-pulse"}`}>{t.status}</span> </td> <td className="py-4 px-6 text-right"> {t.status === "Pending" ? <div className="flex items-center gap-1.5 justify-end"> <button onClick={() => handleApproveTimesheet(t._id || t.id, "Approved")} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-200 dark:border-emerald-900/30 rounded-lg cursor-pointer flex items-center space-x-0.5"> <Check size={10} /><span>Approve</span> </button> <button onClick={() => handleApproveTimesheet(t._id || t.id, "Rejected")} className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-400 font-extrabold text-[10px] border border-red-200 dark:border-red-900/30 rounded-lg cursor-pointer flex items-center space-x-0.5"> <X size={10} /><span>Reject</span> </button> </div> : <span className="text-[10px] text-slate-400 font-bold">Processed by: {t.approvedBy || "Admin"}</span>} </td> </tr>)} {timesheets.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-slate-400 dark:text-slate-500 font-bold">No timesheets logged for your projects.</td></tr>} </tbody> </table> </div> </div>} {} {activeTab === "reports" && <div className="space-y-8"> <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6"> <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center mb-4"> <BarChart3 size={16} className="text-indigo-600 mr-2" /> Project Delivery Progress Report </h3> <div className="overflow-x-auto"> <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600 dark:text-slate-400"> <thead> <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"> <th className="py-3 px-4">Project Name</th> <th className="py-3 px-4">Completed Tasks</th> <th className="py-3 px-4">Milestones</th> <th className="py-3 px-4">Completion %</th> </tr> </thead> <tbody className="divide-y divide-slate-100 dark:divide-slate-800"> {progressReport.map(r => <tr key={r.projectId}> <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">{r.projectName}</td> <td className="py-3.5 px-4">{r.completedTasks} / {r.totalTasks} tasks</td> <td className="py-3.5 px-4">{r.completedMilestones} / {r.totalMilestones} milestones</td> <td className="py-3.5 px-4"> <div className="flex items-center space-x-2"> <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700"> <div className="bg-emerald-500 h-full" style={{
                              width: `${r.completionPct}%`
                            }}></div> </div> <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{r.completionPct}%</span> </div> </td> </tr>)} {progressReport.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-slate-400 dark:text-slate-500 font-bold">No progress reports available.</td></tr>} </tbody> </table> </div> </div> <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6"> <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center mb-4"> <BarChart3 size={16} className="text-indigo-600 mr-2" /> Budget Burn &amp; Ledger Report </h3> <div className="overflow-x-auto"> <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600 dark:text-slate-400"> <thead> <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"> <th className="py-3 px-4">Project Name</th> <th className="py-3 px-4">Total Budget</th> <th className="py-3 px-4">Paid</th> <th className="py-3 px-4">Outstanding</th> </tr> </thead> <tbody className="divide-y divide-slate-100 dark:divide-slate-800"> {budgetReport.map(r => <tr key={r.projectId}> <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">{r.projectName}</td> <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">${r.budget.toLocaleString()}</td> <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">${r.paid.toLocaleString()}</td> <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400 font-bold">${r.outstanding.toLocaleString()}</td> </tr>)} {budgetReport.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-slate-400 dark:text-slate-500 font-bold">No budget reports available.</td></tr>} </tbody> </table> </div> </div> </div>} </>} </main> </div> {} {showAddTask && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"> <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative"> <button onClick={() => setShowAddTask(false)} className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"> <X size={18} /> </button> <div className="border-b border-slate-100 dark:border-slate-800 pb-3"> <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Add Task Assignment</h3> <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Provision a new deliverable task to an employee in this workspace.</p> </div> <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300"> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Select Target Project</label> <select value={taskProjectId} onChange={e => setTaskProjectId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"> {projects.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>)} </select> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Task Title</label> <input type="text" required placeholder="e.g. Implement OAuth flow" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" /> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Assignee</label> <select value={taskAssigneeEmail} onChange={(e) => { const email = e.target.value; setTaskAssigneeEmail(email); const matched = email === companyLeadEmail ? { name: companyLeadName } : teamMembers.find(t => t.email === email); setTaskAssigneeName(matched ? matched.name : ''); }} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"> <option value="">Select Assignee</option> {companyLeadEmail && ( <option value={companyLeadEmail}>{companyLeadName} (Company Lead)</option> )} {teamMembers.map((emp) => ( <option key={emp.email} value={emp.email}>{emp.name} ({emp.email})</option> ))} </select> </div> <div className="flex space-x-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800"> <button type="button" onClick={() => setShowAddTask(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer">Cancel</button> <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-colors">Create Task</button> </div> </form> </div> </div>} {} {editingTask && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"> <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative"> <button onClick={() => setEditingTask(null)} className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"> <X size={18} /> </button> <div className="border-b border-slate-100 dark:border-slate-800 pb-3"> <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Edit Task Assignment</h3> <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Modify task configuration, assignee, status, and feedback logs.</p> </div> <form onSubmit={handleUpdateTask} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300"> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Task Title</label> <input type="text" required value={editTaskTitle} onChange={e => setEditTaskTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" /> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Task Status</label> <select value={editTaskStatus} onChange={e => setEditTaskStatus(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"> <option value="Planning">Planning</option> <option value="In Progress">In Progress</option> <option value="Review">Review</option> <option value="Done">Done</option> </select> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Assignee</label> <select value={editTaskAssigneeEmail} onChange={(e) => { const email = e.target.value; setEditTaskAssigneeEmail(email); const matched = email === companyLeadEmail ? { name: companyLeadName } : teamMembers.find(t => t.email === email); setEditTaskAssigneeName(matched ? matched.name : ''); }} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"> <option value="">Select Assignee</option> {companyLeadEmail && ( <option value={companyLeadEmail}>{companyLeadName} (Company Lead)</option> )} {teamMembers.map((emp) => ( <option key={emp.email} value={emp.email}>{emp.name} ({emp.email})</option> ))} </select> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Notes / Feedback</label> <textarea value={editTaskNote} onChange={e => setEditTaskNote(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px]" placeholder="Leave feedback on task progress..." /> </div> <div className="flex space-x-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800"> <button type="button" onClick={() => setEditingTask(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer">Cancel</button> <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-colors">Update Task</button> </div> </form> </div> </div>} {} <FloatingChat token={sessionStorage.getItem("syncra_token")} user={{
      email: userEmail,
      name: leadName
    }} userRole="Project Lead" /> </div>;
}
