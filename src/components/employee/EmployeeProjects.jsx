import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import { FolderGit2, ListTodo, FileDown, CheckCircle2, HelpCircle, ChevronRight, Loader2, AlertCircle, Sparkles, Search, Filter, ArrowUpDown, User, Calendar, Tag, AlertTriangle, Play, Check, Clock, Plus, MessageSquare, ArrowRight, ShieldAlert, FileText, Paperclip, CheckSquare, XCircle, Info, ChevronDown } from "lucide-react";
import { deriveEmployeeProjectKpis, filterEmployeeProjects, formatTaskNote, parseTaskNote } from "./employeeProjectsModel";
export default function EmployeeProjects({
  token,
  employeeEmail,
  user
}) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState("All");
  const [projectSort, setProjectSort] = useState("name");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskTab, setTaskTab] = useState("my");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");
  const [reqTab, setReqTab] = useState("project");
  const [statusUpdatingId, setStatusUpdatingId] = useState("");
  const [noteUpdatingId, setNoteUpdatingId] = useState("");
  const [taskNotice, setTaskNotice] = useState(null);
  const [activeLogEdits, setActiveLogEdits] = useState({});
  const [isEditingDeployUrl, setIsEditingDeployUrl] = useState(false);
  const [deployUrlInput, setDeployUrlInput] = useState("");
  const [savingDeployUrl, setSavingDeployUrl] = useState(false);
  const handleSaveDeployUrl = async e => {
    e.preventDefault();
    if (!selectedProject) return;
    setSavingDeployUrl(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/projects/${selectedProject._id || selectedProject.id}/deploy`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          deployedUrl: deployUrlInput.trim()
        })
      });
      const data = await response.json();
      if (data.success) {
        const updatedProjects = projects.map(p => {
          if (p._id === selectedProject._id || p.id === selectedProject.id) {
            return {
              ...p,
              deployedUrl: deployUrlInput.trim()
            };
          }
          return p;
        });
        setProjects(updatedProjects);
        setSelectedProject(prev => ({
          ...prev,
          deployedUrl: deployUrlInput.trim()
        }));
        setIsEditingDeployUrl(false);
      } else {
        alert(data.message || "Failed to update deployment URL.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend server.");
    } finally {
      setSavingDeployUrl(false);
    }
  };
  const isMyTask = task => {
    const taskEmail = task.assigneeEmail?.trim().toLowerCase();
    const currentEmail = (employeeEmail || user?.email || localStorage.getItem("employeeEmail"))?.trim().toLowerCase();
    return Boolean(taskEmail && currentEmail && taskEmail === currentEmail);
  };
  const getEditState = task => {
    if (activeLogEdits[task.id || task._id]) {
      return activeLogEdits[task.id || task._id];
    }
    return parseTaskNote(task.note);
  };
  const handleEditFieldChange = (taskId, field, value) => {
    setActiveLogEdits(prev => ({
      ...prev,
      [taskId]: {
        ...getEditState({
          id: taskId
        }),
        [field]: value
      }
    }));
  };
  const fetchMyProjects = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/projects`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
        if (data.data.length > 0) {
          const selectedId = selectedProject?._id || selectedProject?.id;
          const updatedSelection = selectedId
            ? data.data.find(p => (p._id || p.id) === selectedId)
            : null;
          setSelectedProject(updatedSelection || data.data[0]);
        }
      } else {
        setError(data.message || "Failed to load projects.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server.");
    } finally {
      if (!silent) setLoading(false);
    }
  };
  useEffect(() => {
    fetchMyProjects();
    const interval = setInterval(() => {
      fetchMyProjects(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [token]);
  const handleTaskStatusChange = async (projectId, taskId, newStatus) => {
    setStatusUpdatingId(taskId);
    setTaskNotice(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/tasks/${projectId}/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      const data = await response.json();
      if (data.success) {
        const updatedProjects = projects.map(p => {
          if (p._id === projectId || p.id === projectId) {
            const updatedTasks = p.tasks.map(t => {
              if ((t.id || t._id) === taskId) {
                return {
                  ...t,
                  status: newStatus
                };
              }
              return t;
            });
            const updatedProj = {
              ...p,
              tasks: updatedTasks
            };
            if (selectedProject && (selectedProject._id === projectId || selectedProject.id === projectId)) {
              setSelectedProject(updatedProj);
            }
            return updatedProj;
          }
          return p;
        });
        setProjects(updatedProjects);
        setTaskNotice({ type: "success", message: "Task updated successfully." });
        await fetchMyProjects(true);
      } else {
        setTaskNotice({ type: "error", message: data.message || "Failed to update task status." });
      }
    } catch (err) {
      console.error(err);
      setTaskNotice({ type: "error", message: "Error connecting to the backend server." });
    } finally {
      setStatusUpdatingId("");
    }
  };
  const handleSaveTaskNote = async (projectId, taskId, newNote) => {
    setNoteUpdatingId(taskId);
    setTaskNotice(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/tasks/${projectId}/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          note: newNote
        })
      });
      const data = await response.json();
      if (data.success) {
        const updatedProjects = projects.map(p => {
          if (p._id === projectId || p.id === projectId) {
            const updatedTasks = p.tasks.map(t => {
              if ((t.id || t._id) === taskId) {
                return {
                  ...t,
                  note: newNote
                };
              }
              return t;
            });
            const updatedProj = {
              ...p,
              tasks: updatedTasks
            };
            if (selectedProject && (selectedProject._id === projectId || selectedProject.id === projectId)) {
              setSelectedProject(updatedProj);
            }
            return updatedProj;
          }
          return p;
        });
        setProjects(updatedProjects);
        setTaskNotice({ type: "success", message: "Task updated successfully." });
        await fetchMyProjects(true);
      } else {
        setTaskNotice({ type: "error", message: data.message || "Failed to save note." });
      }
    } catch (err) {
      console.error(err);
      setTaskNotice({ type: "error", message: "Error connecting to the backend server." });
    } finally {
      setNoteUpdatingId("");
    }
  };
  const handleSaveRichLog = async (projectId, taskId) => {
    const editState = getEditState({
      id: taskId
    });
    const noteText = formatTaskNote(editState.log, editState.hours, editState.progress, editState.blockers, editState.needSupport);
    await handleSaveTaskNote(projectId, taskId, noteText);
  };
  const handleEscalateAction = async (projectId, taskId, type) => {
    const editState = getEditState({
      id: taskId
    });
    const updateLog = `[${type.toUpperCase()} REQUESTED] ` + (editState.log || "Task flagged.");
    const noteText = formatTaskNote(updateLog, editState.hours, editState.progress, type === "blocker" ? "Blocked" : type, true);
    await handleSaveTaskNote(projectId, taskId, noteText);
    setActiveLogEdits(prev => {
      const copy = {
        ...prev
      };
      delete copy[taskId];
      return copy;
    });
  };
  const kpis = deriveEmployeeProjectKpis(selectedProject, isMyTask);
  const filteredProjects = filterEmployeeProjects(projects, projectSearch, projectStatusFilter, projectSort);
  if (loading) {
    return <div className="flex flex-col items-center justify-center py-20 space-y-4"> <Loader2 size={36} className="text-indigo-500 animate-spin" /> <p className="text-xs text-slate-400 font-semibold">Syncing project workspace...</p> </div>;
  }
  return <div className="employee-projects-workspace text-left text-slate-100 font-sans space-y-6"> {} <div className="flex items-center justify-between flex-wrap gap-4"> <div className="flex items-center space-x-2.5"> <span className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl shadow-inner"> <FolderGit2 size={22} /> </span> <div> <h2 className="text-xl font-bold text-white tracking-tight font-sans">Project Workspace</h2> <p className="text-xs text-slate-400">Collaborative timeline workspace to check sprints, documents, and submit task logs.</p> </div> </div> </div> {taskNotice && <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center space-x-2 ${taskNotice.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-red-500/10 border-red-500/20 text-red-300"}`}> {taskNotice.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} <span>{taskNotice.message}</span> </div>} {projects.length === 0 ? <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-10 text-center space-y-4"> <span className="inline-flex p-4 bg-slate-700/20 border border-slate-755 rounded-full text-slate-400"> <HelpCircle size={30} /> </span> <div className="max-w-xs mx-auto space-y-1"> <h3 className="text-sm font-bold text-slate-200">No Projects Assigned</h3> <p className="text-[11px] text-slate-450 leading-relaxed font-semibold"> You aren't registered under any project staff lists. Please contact your company lead. </p> </div> </div> : <div className="space-y-6"> {} {selectedProject && <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"> {[{
          label: "Assigned Tasks",
          val: kpis.total,
          color: "text-indigo-400",
          bg: "bg-indigo-500/5"
        }, {
          label: "In Progress",
          val: kpis.progress,
          color: "text-blue-400",
          bg: "bg-blue-500/5"
        }, {
          label: "Pending Review",
          val: kpis.review,
          color: "text-amber-400",
          bg: "bg-amber-500/5"
        }, {
          label: "Completed Tasks",
          val: kpis.completed,
          color: "text-emerald-450",
          bg: "bg-emerald-500/5"
        }, {
          label: "Attention Req.",
          val: kpis.overdue,
          color: "text-red-400",
          bg: "bg-red-500/5"
        }, {
          label: "Hours Logged",
          val: `${kpis.hours} hrs`,
          color: "text-indigo-400",
          bg: "bg-indigo-500/5"
        }].map((k, i) => <div key={i} className={`p-4 rounded-2xl border border-slate-800/80 ${k.bg} flex flex-col justify-between space-y-1`}> <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{k.label}</span> <span className={`text-base font-black ${k.color}`}>{k.val}</span> </div>)} </div>} <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"> {} <div className="lg:col-span-4 space-y-4 bg-slate-900/20 border border-slate-850 p-4 rounded-3xl"> <div className="space-y-2.5"> <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block px-1"> Active Projects ({filteredProjects.length}) </span> {} <div className="space-y-2"> <div className="relative"> <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"> <Search size={13} /> </span> <input type="text" placeholder="Search workspace..." value={projectSearch} onChange={e => setProjectSearch(e.target.value)} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none" /> </div> <div className="grid grid-cols-2 gap-2"> <select value={projectStatusFilter} onChange={e => setProjectStatusFilter(e.target.value)} className="bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-350 focus:outline-none"> <option value="All">All Statuses</option> <option value="Active">Active</option> <option value="On Hold">On Hold</option> <option value="Completed">Completed</option> </select> <select value={projectSort} onChange={e => setProjectSort(e.target.value)} className="bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-350 focus:outline-none"> <option value="name">Sort: Name</option> <option value="status">Sort: Status</option> </select> </div> </div> </div> {} <div className="space-y-2 max-h-[380px] lg:max-h-[500px] overflow-y-auto pr-1"> {filteredProjects.map(p => {
              const isSelected = selectedProject && (selectedProject._id === p._id || selectedProject.id === p.id);
              const total = p.tasks?.length || 0;
              const myPending = p.tasks?.filter(t => isMyTask(t) && t.status !== "Done").length || 0;
              const done = p.tasks?.filter(t => t.status === "Done").length || 0;
              const progress = total > 0 ? Math.round(done / total * 100) : 0;
              const deadline = p.deadline || "Dec 15, 2026";
              return <button key={p._id || p.id} onClick={() => setSelectedProject(p)} className={`w-full p-4 border rounded-2xl flex flex-col text-left space-y-3.5 cursor-pointer transition-all hover:bg-slate-805/30 ${isSelected ? "bg-slate-800/85 border-indigo-500/40 text-white shadow-md shadow-indigo-950/10" : "bg-slate-900/30 border-slate-800/80 text-slate-450 hover:text-slate-200"}`}> <div className="w-full flex items-start justify-between"> <div className="space-y-1"> <span className="text-xs font-bold block">{p.name}</span> <span className="text-[9px] text-slate-500 font-bold block">Deadline: {deadline}</span> </div> <span className={`px-2 py-0.5 border text-[8px] font-black rounded-lg uppercase tracking-wider ${p.status === "Completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-450" : p.status === "On Hold" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"}`}> {p.status || "Active"} </span> </div> {} <div className="w-full space-y-1.5"> <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-500"> <span>Progress: {progress}%</span> {myPending > 0 && <span className="text-amber-500 bg-amber-500/5 px-1 rounded border border-amber-500/10"> {myPending} pending tasks </span>} </div> <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden"> <div className="h-full bg-indigo-550 rounded-full transition-all" style={{
                      width: `${progress}%`
                    }}></div> </div> </div> </button>;
            })} </div> </div> {} {selectedProject && <div className="lg:col-span-8 space-y-6"> {} <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/60 border border-slate-800 rounded-3xl p-6 space-y-4 relative overflow-hidden"> <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none"></div> <div className="flex items-center justify-between"> <h3 className="text-base font-extrabold text-white">{selectedProject.name}</h3> <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 text-[9px] font-bold rounded-lg uppercase tracking-wider"> Sprint active </span> </div> <p className="text-xs text-slate-400 leading-relaxed font-semibold"> {selectedProject.desc || "Comprehensive sprint pipeline to deliver client portal updates and API validations."} </p> {} <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3.5 border-t border-slate-800/80 text-[11px] font-bold text-slate-400"> <div> <span className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-550">Project Lead</span> <span className="text-slate-200 mt-0.5 block">{selectedProject.manager || "Marcus Vance"}</span> </div> <div> <span className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-550">Client contact</span> <span className="text-slate-205 mt-0.5 block truncate" title={selectedProject.clientEmail}>{selectedProject.clientEmail}</span> </div> <div> <span className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-550">Sprint Phase</span> <span className="text-slate-200 mt-0.5 block">{selectedProject.sprint || "Sprint 3 - Core APIs"}</span> </div> <div> <span className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-550">Priority</span> <span className="text-red-400 mt-0.5 block">High Priority</span> </div> </div> <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"> <div className="space-y-0.5 text-left"> <span className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-550">Live Application Deployment</span> {selectedProject.deployedUrl ? <a href={selectedProject.deployedUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-400 hover:text-indigo-350 hover:underline flex items-center gap-1.5 cursor-pointer"> <span>{selectedProject.deployedUrl}</span> <ArrowRight size={12} className="animate-pulse text-indigo-405" /> </a> : <span className="text-xs text-slate-500 italic block mt-0.5">No active deployment node configured</span>} </div> {isEditingDeployUrl ? <form onSubmit={handleSaveDeployUrl} className="flex gap-2 w-full sm:w-auto mt-1 sm:mt-0"> <input type="url" placeholder="https://example.com" value={deployUrlInput} onChange={e => setDeployUrlInput(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-48 font-semibold" required /> <button type="submit" disabled={savingDeployUrl} className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-[10px] rounded-xl cursor-pointer transition-all shrink-0 flex items-center space-x-1"> {savingDeployUrl ? <Loader2 size={11} className="animate-spin" /> : <>Save</>} </button> <button type="button" onClick={() => setIsEditingDeployUrl(false)} className="px-2.5 py-1.5 border border-slate-800 hover:bg-slate-800 text-slate-450 text-[10px] font-bold rounded-xl cursor-pointer"> Cancel </button> </form> : <button onClick={() => {
                setDeployUrlInput(selectedProject.deployedUrl || "");
                setIsEditingDeployUrl(true);
              }} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/50 hover:border-slate-600 text-[10px] font-extrabold rounded-xl cursor-pointer transition-all"> {selectedProject.deployedUrl ? "Update Deployment" : "Deploy Project Link"} </button>} </div> </div> {} <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {} <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 space-y-4 flex flex-col justify-between min-h-[300px]"> <div className="space-y-3.5"> <div className="flex items-center justify-between border-b border-slate-800 pb-2.5"> <div className="flex items-center space-x-2"> <ListTodo size={15} className="text-indigo-400" /> <h4 className="text-xs font-extrabold text-slate-350 uppercase tracking-widest">Requirements Checklist</h4> </div> </div> {} <div className="flex space-x-1.5 p-1 bg-slate-950/45 rounded-xl border border-slate-850"> {["project", "my", "clarifications"].map(t => <button key={t} onClick={() => setReqTab(t)} className={`flex-1 py-1 text-[9px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${reqTab === t ? "bg-indigo-650/20 text-indigo-400 shadow" : "text-slate-500 hover:text-slate-300"}`}> {t === "project" ? "Project" : t === "my" ? "My Scope" : "Clarify"} </button>)} </div> {} {reqTab === "project" ? selectedProject.requirements && selectedProject.requirements.length > 0 ? <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1"> {selectedProject.requirements.map((req, i) => <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-400 font-semibold leading-snug"> <CheckCircle2 size={13} className="text-indigo-500 flex-shrink-0 mt-0.5" /> <span className="break-words">{req}</span> </div>)} </div> : <div className="py-12 text-center text-slate-550 text-[10px] font-bold uppercase tracking-wider">No project requirements checklist loaded.</div> : reqTab === "my" ? <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1 text-xs text-slate-400 font-semibold"> <div className="flex items-center justify-between p-2 bg-indigo-950/10 border border-indigo-950 rounded-xl"> <span>Implement PDF reporting exports</span> <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1 border border-indigo-500/20 rounded">In Progress</span> </div> <div className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-950 rounded-xl"> <span>Verify database connections</span> <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 border border-emerald-500/20 rounded">Done</span> </div> </div> : <div className="space-y-2 text-xs text-slate-400 font-semibold max-h-[170px] overflow-y-auto pr-1"> <div className="p-3 bg-slate-950/20 border border-slate-850 rounded-2xl space-y-2"> <p className="text-[10px] text-slate-500 font-extrabold uppercase">Clarification Request #1</p> <p className="text-slate-300">Are design files for client messenger available in Figma?</p> <span className="text-[8.5px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-550/20 text-amber-400 rounded-md">Pending Response</span> </div> </div>} </div> </div> {} <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 space-y-4 flex flex-col justify-between min-h-[300px]"> <div className="space-y-3.5"> <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5"> <FileDown size={15} className="text-indigo-450" /> <h4 className="text-xs font-extrabold text-slate-350 uppercase tracking-widest">Resource Documents</h4> </div> {selectedProject.documents && selectedProject.documents.length > 0 ? <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1"> {selectedProject.documents.map((doc, i) => <div key={i} className="flex items-center justify-between p-3 bg-slate-950/30 border border-slate-850 rounded-2xl group hover:border-slate-800 transition-all"> <div className="flex items-center space-x-2.5 min-w-0"> <span className="p-2 bg-indigo-500/5 text-indigo-400 rounded-xl"> <FileText size={15} /> </span> <div className="text-left min-w-0"> <span className="text-xs font-bold text-slate-300 block truncate max-w-[120px]">{doc.name}</span> <span className="text-[8.5px] text-slate-550 font-bold block">1.8 MB | PM Upload</span> </div> </div> <a href={doc.url || "#"} download={doc.name} className="text-[9.5px] font-black text-slate-400 hover:text-white flex-shrink-0 cursor-pointer transition-colors"> Download </a> </div>)} </div> : <div className="py-12 text-center text-slate-550 text-[10px] font-bold uppercase tracking-wider">No documents uploaded for this sprint.</div>} </div> </div> </div> {} <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 space-y-4"> {} <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3"> <div className="flex items-center space-x-2"> <Sparkles size={15} className="text-indigo-455" /> <h4 className="text-xs font-extrabold text-slate-350 uppercase tracking-widest">Sprint Task board</h4> </div> <div className="flex items-center flex-wrap gap-2"> <div className="relative"> <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500"> <Search size={11} /> </span> <input type="text" placeholder="Find task..." value={taskSearch} onChange={e => setTaskSearch(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl pl-7.5 pr-2 py-1 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-28 placeholder-slate-600 font-bold" /> </div> <select value={taskPriorityFilter} onChange={e => setTaskPriorityFilter(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-400 focus:outline-none"> <option value="all">All Priorities</option> <option value="high">High</option> <option value="medium">Medium</option> </select> </div> </div> {} <div className="flex space-x-1 p-1 bg-slate-950/45 border border-slate-850 rounded-xl"> {[{
                id: "my",
                label: "My Tasks"
              }, {
                id: "progress",
                label: "In Dev"
              }, {
                id: "review",
                label: "QA / Review"
              }, {
                id: "completed",
                label: "Completed"
              }, {
                id: "blocked",
                label: "Blocked"
              }].map(tab => <button key={tab.id} onClick={() => setTaskTab(tab.id)} className={`flex-1 py-1 text-[9px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${taskTab === tab.id ? "bg-indigo-650/20 text-indigo-400 border border-indigo-500/10" : "text-slate-500 hover:text-slate-350"}`}> {tab.label} </button>)} </div> {} {(() => {
              const filtered = selectedProject.tasks?.filter(task => {
                const isMine = isMyTask(task);
                let matchesTab = true;
                if (taskTab === "my") {
                  matchesTab = isMine;
                } else if (taskTab === "progress") {
                  matchesTab = task.status === "Dev" || task.status === "In Progress";
                } else if (taskTab === "review") {
                  matchesTab = task.status === "QA" || task.status === "Review";
                } else if (taskTab === "completed") {
                  matchesTab = task.status === "Done";
                } else if (taskTab === "blocked") {
                  matchesTab = task.note?.includes("[BLOCKED]") || task.status === "Planning";
                }
                const matchesSearch = task.title.toLowerCase().includes(taskSearch.toLowerCase());
                const priority = task.priority || (task.title.toLowerCase().includes("pdf") || task.title.toLowerCase().includes("cron") ? "High" : "Medium");
                const matchesPriority = taskPriorityFilter === "all" || priority.toLowerCase() === taskPriorityFilter.toLowerCase();
                return matchesTab && matchesSearch && matchesPriority;
              }) || [];
              if (filtered.length === 0) {
                return <div className="py-12 text-center text-slate-550 text-[10px] font-bold uppercase tracking-wider"> No tasks match the active filters or tab categories. </div>;
              }
              return <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1"> {filtered.map(task => {
                  const isAssigned = isMyTask(task);
                  const editState = getEditState(task);
                  const priority = task.priority || (task.title.toLowerCase().includes("pdf") || task.title.toLowerCase().includes("cron") ? "High" : "Medium");
                  const isBlocked = task.note?.includes("[BLOCKED]") || editState.blockers.toLowerCase().includes("block");
                  return <div key={task.id || task._id} className={`p-4.5 border rounded-2xl flex flex-col gap-4 text-left transition-all ${isAssigned ? "bg-indigo-950/10 border-indigo-500/20 shadow-lg shadow-indigo-950/5" : "bg-slate-900/30 border-slate-800/80"}`}> <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"> <div className="space-y-1.5 flex-1 min-w-0"> <div className="flex items-center flex-wrap gap-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500"> <span>#{task.id || "TSK-100"}</span> <span className="text-slate-700">•</span> {} <span className={`px-1.5 py-0.2 border rounded ${priority === "High" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}> {priority} Priority </span> {} {isBlocked && <span className="px-1.5 py-0.2 bg-red-950/40 border border-red-900/30 text-red-300 rounded flex items-center space-x-1"> <AlertTriangle size={10} className="text-red-450 animate-pulse" /> <span>Blocked</span> </span>} </div> <h4 className="text-xs font-bold text-slate-200 leading-snug break-words"> {task.title} </h4> <p className="text-[10px] text-slate-450 font-semibold leading-relaxed"> Assignee: {task.assigneeName || "Sprint Team"} | due on Friday </p> </div> {} <div className="flex items-center space-x-2 flex-shrink-0"> {isAssigned ? <div className="relative flex items-center"> {statusUpdatingId === (task.id || task._id) && <Loader2 size={12} className="text-indigo-400 animate-spin mr-2" />} <select value={task.status} onChange={e => handleTaskStatusChange(selectedProject._id || selectedProject.id, task.id || task._id, e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-black text-slate-350 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors uppercase tracking-wider"> <option value="Planning">Planning</option> <option value="Dev">Development</option> <option value="QA">QA / Review</option> <option value="Done">Completed</option> </select> </div> : <span className={`px-2 py-0.5 text-[9px] font-black border rounded-lg uppercase tracking-wider ${task.status === "Done" ? "bg-emerald-500/10 border-emerald-500/10 text-emerald-400" : task.status === "QA" ? "bg-amber-500/10 border-amber-500/10 text-amber-400" : task.status === "Dev" ? "bg-indigo-500/10 border-indigo-500/10 text-indigo-455" : "bg-slate-800 border-slate-700/60 text-slate-500"}`}> {task.status} </span>} </div> </div> {} {isAssigned ? <div className="pt-3 border-t border-slate-800/80 space-y-3.5 text-xs font-semibold text-slate-350"> <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"> {} <div className="sm:col-span-2 text-left"> <label className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-500 mb-1"> Work log (What did you do today?) </label> <input type="text" placeholder="Brief details of current implementations..." value={editState.log} onChange={e => handleEditFieldChange(task.id || task._id, "log", e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" /> </div> {} <div className="text-left"> <label className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-500 mb-1"> Hours spent </label> <input type="number" min="0" max="24" placeholder="e.g. 4" value={editState.hours} onChange={e => handleEditFieldChange(task.id || task._id, "hours", e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" /> </div> </div> <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {} <div className="text-left space-y-1"> <div className="flex justify-between text-[8.5px] uppercase font-extrabold tracking-widest text-slate-500"> <span>Progress Percentage</span> <span className="text-indigo-400">{editState.progress}%</span> </div> <input type="range" min="0" max="100" step="10" value={editState.progress} onChange={e => handleEditFieldChange(task.id || task._id, "progress", e.target.value)} className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-550" /> </div> {} <div className="text-left"> <label className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-500 mb-1"> Active Blockers / Support </label> <input type="text" placeholder="Leave empty if none" value={editState.blockers} onChange={e => handleEditFieldChange(task.id || task._id, "blockers", e.target.value)} className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none" /> </div> </div> {} <div className="flex items-center justify-between flex-wrap gap-2.5 pt-2 border-t border-slate-850"> <div className="flex items-center space-x-2"> <label className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-450 cursor-pointer"> <input type="checkbox" checked={editState.needSupport} onChange={e => handleEditFieldChange(task.id || task._id, "needSupport", e.target.checked)} className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer" /> <span>Flag Support Needed</span> </label> </div> {} <div className="flex items-center space-x-2"> <button type="button" onClick={() => handleEscalateAction(selectedProject._id || selectedProject.id, task.id || task._id, "blocker")} disabled={noteUpdatingId === (task.id || task._id)} className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 text-red-400 text-[10px] font-bold rounded-lg cursor-pointer transition-all"> Mark Blocked </button> <button type="button" onClick={() => handleEscalateAction(selectedProject._id || selectedProject.id, task.id || task._id, "escalated")} disabled={noteUpdatingId === (task.id || task._id)} className="px-2.5 py-1.5 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-900/20 text-amber-400 text-[10px] font-bold rounded-lg cursor-pointer transition-all"> Escalate to PM </button> <button onClick={() => handleSaveRichLog(selectedProject._id || selectedProject.id, task.id || task._id)} disabled={noteUpdatingId === (task.id || task._id)} className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-all flex items-center space-x-1 shadow"> {noteUpdatingId === (task.id || task._id) ? <Loader2 size={11} className="animate-spin" /> : <> <Check size={11} /> <span>Save Task Log</span> </>} </button> </div> </div> </div> : task.note && <div className="pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-450 leading-relaxed font-semibold italic flex items-start space-x-1.5"> <span className="text-[9px] uppercase font-bold text-slate-550 tracking-wider flex-shrink-0 mt-0.5">Note:</span> <span className="break-words">{task.note}</span> </div>} </div>;
                })} </div>;
            })()} </div> {} <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 space-y-4"> <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5"> <Clock size={15} className="text-indigo-455" /> <h4 className="text-xs font-extrabold text-slate-350 uppercase tracking-widest font-sans">Recent Sprint Activity</h4> </div> <div className="space-y-4 text-xs font-semibold"> {[{
                user: "Marcus Vance",
                action: "changed task status",
                target: "Set up cron jobs in backend to QA",
                time: "2 hours ago"
              }, {
                user: "Bill Lumbergh",
                action: "uploaded document",
                target: "Y2K Compliance Audit spec sheet",
                time: "1 day ago"
              }, {
                user: "System Sync",
                action: "registered check-in",
                target: "Clock-in log recorded at 08:58 AM",
                time: "2 days ago"
              }].map((act, idx) => <div key={idx} className="flex items-start space-x-3 text-slate-400"> <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div> <div className="text-left min-w-0"> <p className="leading-snug"> <strong className="text-slate-200">{act.user}</strong> {act.action} <span className="text-slate-300 italic">"{act.target}"</span> </p> <span className="text-[9px] text-slate-550 block mt-0.5">{act.time}</span> </div> </div>)} </div> </div> </div>} </div> </div>} </div>;
}
