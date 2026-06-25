import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../config";
import { ArrowLeft, User, FileText, CheckCircle2, DollarSign, Users, Briefcase, RefreshCw, Plus, MessageSquare, Upload } from "lucide-react";
import ProjectMessagePortal from "./ProjectMessagePortal";

const STATUS_COLORS = {
  Done: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30",
  QA: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
  Dev: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/40 dark:text-amber-400 dark:border-amber-900/30",
  Planning: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
};

const BASE = API_BASE_URL;

const safeFetch = async (url, options = {}) => {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    let errorText = "";
    try {
      errorText = await response.text();
    } catch (_) {}
    throw new Error(`API ${url} failed with status ${response.status}: ${errorText.slice(0, 200)}`);
  }
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(`Expected JSON from ${url}, got: ${text.slice(0, 200)}`);
  }
  return await response.json();
};

export default function ProjectDetailPage({
  project: initialProject,
  onBack,
  token,
  userEmail,
  adminName,
  employees = []
}) {
  const [project, setProject] = useState(initialProject);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const pollDetails = async () => {
      if (!isMounted) return;
      await fetchProjectDetails(isMounted);
    };
    pollDetails();
    const interval = setInterval(pollDetails, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [initialProject._id, initialProject.id]);

  const fetchProjectDetails = async (isMounted = true) => {
    const projId = initialProject._id || initialProject.id;
    if (!projId) return;
    if (isMounted && !project) setIsLoading(true);
    try {
      const result = await safeFetch(`${BASE}/api/projects`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (isMounted && result.success && Array.isArray(result.data)) {
        const updated = result.data.find(p => (p._id || p.id) === projId);
        if (updated) {
          setProject(updated);
          setError(null);
        } else {
          setError("Project not found in organization database.");
        }
      }
    } catch (err) {
      if (isMounted) {
        console.error("Failed to fetch real-time project details:", err.message);
        setError("Connection issues: Failed to sync project details.");
      }
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const projId = project?._id || project?.id;
    if (!projId) return;

    try {
      const response = await fetch(`${BASE}/api/projects/${projId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success && data.data) {
        setProject(prev => ({ ...prev, status: newStatus }));
        setError(null);
      } else {
        setError(data.message || "Failed to update project status.");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Connection issue: Failed to update status.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const projId = project?._id || project?.id;
    if (!projId) {
      setError("Invalid project ID. Cannot upload document.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileData = event.target.result;
        const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
        
        const response = await fetch(`${BASE}/api/projects/${projId}/documents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            name: file.name,
            fileData,
            size: sizeStr,
            category: "General"
          })
        });

        const data = await response.json();
        if (data.success && data.data) {
          setProject(data.data);
          setError(null);
        } else {
          setError(data.message || "Failed to upload document.");
        }
      } catch (err) {
        console.error("Failed to upload document:", err);
        setError("Connection issue: Failed to upload file.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getActivePipelineStageIndex = () => {
    const statusMap = {
      "Planning": 0,
      "Pending": 0,
      "Dev": 1,
      "In Progress": 1,
      "Active": 1,
      "QA": 2,
      "Review": 2,
      "Quality Assurance": 3,
      "Completed": 4
    };
    if (project.status === "On Hold" || project.status === "Cancelled") return 0;
    return statusMap[project.status] !== undefined ? statusMap[project.status] : 1;
  };

  const activeStageIndex = getActivePipelineStageIndex();
  const stages = ["Planning", "Development", "Review", "Quality Assurance", "Deployment"];
  const totalAmount = project.paymentDetails?.total || 10000;
  const paidAmount = project.paymentDetails?.paid || 0;
  const outstandingAmount = project.paymentDetails?.outstanding || totalAmount - paidAmount;
  const paymentPercentage = totalAmount > 0 ? Math.min(100, Math.round(paidAmount / totalAmount * 100)) : 0;

  if (isLoading && !project) {
    return <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center dark:text-slate-300"> <RefreshCw className="animate-spin text-indigo-650" size={32} /> <p className="text-sm font-semibold text-slate-500">Loading project details...</p> </div>;
  }
  if (!project) {
    return <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto mt-10"> <p className="text-sm font-bold text-red-750 dark:text-red-400">{error || "Project not found."}</p> <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-700 transition"> Go Back </button> </div>;
  }
  return <div className="space-y-6 text-left pb-12 animate-transition"> {error && <div className="p-4 bg-amber-50 dark:bg-amber-955/40 border border-amber-205 dark:border-amber-900/30 rounded-2xl text-xs font-semibold text-amber-800 dark:text-amber-400 flex justify-between items-center shadow-sm"> <span>{error}</span> <button onClick={() => fetchProjectDetails(true)} className="text-indigo-650 dark:text-indigo-400 hover:underline font-bold cursor-pointer"> Retry Sync </button> </div>} {} <style>{` @keyframes wave-animation { 0% { transform: translateX(0) translateZ(0) scaleY(1); } 50% { transform: translateX(-25%) translateZ(0) scaleY(0.85); } 100% { transform: translateX(-50%) translateZ(0) scaleY(1); } } .liquid-container { position: relative; overflow: hidden; background: #f1f5f9; } .dark .liquid-container { background: #0f172a; } .liquid-wave { position: absolute; left: 0; width: 200%; height: 100%; background: linear-gradient(180deg, rgba(99, 102, 241, 0.6) 0%, rgba(79, 70, 229, 0.9) 100%); animation: wave-animation 6s linear infinite; transform-origin: center bottom; } .liquid-wave-back { position: absolute; left: 0; width: 200%; height: 100%; background: linear-gradient(180deg, rgba(167, 139, 250, 0.4) 0%, rgba(124, 58, 237, 0.6) 100%); animation: wave-animation 10s linear infinite; transform-origin: center bottom; opacity: 0.7; } @keyframes dash { to { stroke-dashoffset: -40; } } .animate-flow-line { stroke-dasharray: 8, 4; animation: dash 2s linear infinite; } @keyframes pulse-ring { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.3); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } } .pulse-effect { position: relative; } .pulse-effect::after { content: ''; position: absolute; inset: -4px; border: 2px solid #6366f1; border-radius: 9999px; animation: pulse-ring 2s cubic-bezier(0.24, 0, 0.38, 1) infinite; } `}</style> {} <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-805 rounded-2xl shadow-sm gap-4"> <div className="flex items-center space-x-4"> <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"> <ArrowLeft size={16} /> </button> <div> <div className="flex items-center space-x-2.5"> <h2 className="text-lg font-extrabold font-display text-slate-800 dark:text-white">{project.name}</h2> <select value={project.status} onChange={(e) => handleStatusChange(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-0.5 text-[10px] font-extrabold text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500" > <option value="Planning">Planning</option> <option value="Active">Active / In Progress</option> <option value="Dev">Development (Dev)</option> <option value="QA">QA / Review</option> <option value="Quality Assurance">Quality Assurance</option> <option value="Completed">Completed / Closed</option> <option value="On Hold">On Hold / Paused</option> <option value="Cancelled">Cancelled</option> </select> </div> <p className="text-xs text-slate-400 dark:text-slate-550 font-medium mt-0.5">Project Scope detailed dashboard & pipeline monitoring.</p> </div> </div> <button onClick={() => fetchProjectDetails(true)} className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-405 cursor-pointer"> <RefreshCw size={12} className="animate-spin-hover" /> <span>Refresh Data</span> </button> </div> {} <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-805 rounded-2xl shadow-sm space-y-4"> <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Live Development Pipeline</h3> <div className="relative w-full overflow-x-auto pb-2"> <div className="min-w-[700px] h-32 flex items-center justify-between px-10 relative"> {} <svg className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-4" pointerEvents="none"> <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" className="stroke-slate-200 dark:stroke-slate-800" /> <line x1="5%" y1="50%" x2={`${5 + activeStageIndex * 22.5}%`} y2="50%" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" className="transition-all duration-500" /> </svg> {} {stages.map((stage, idx) => {
              const isPast = idx < activeStageIndex;
              const isActive = idx === activeStageIndex;
              const isFuture = idx > activeStageIndex;
              return <div key={stage} className="flex flex-col items-center z-10 w-24 text-center"> <div className="relative"> <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? "bg-indigo-600 border-indigo-600 text-white pulse-effect shadow-lg shadow-indigo-100" : isPast ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-600 dark:text-indigo-400" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-505"}`}> {isPast ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>} </div> </div> <span className={`text-[10px] font-extrabold mt-3 block tracking-wide ${isActive ? "text-indigo-600" : isPast ? "text-slate-805 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}`}> {stage} </span> </div>;
            })} </div> </div> </div> {} <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {} <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4"> <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"> <h3 className="text-xs font-extrabold text-slate-805 dark:text-white uppercase tracking-wider flex items-center"> <User size={14} className="mr-2 text-indigo-500" /> Client Profile </h3> </div> <div className="flex items-center space-x-4"> <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center font-extrabold text-indigo-605 dark:text-indigo-400 text-lg"> {project.clientEmail ? project.clientEmail[0].toUpperCase() : "C"} </div> <div> <span className="font-extrabold text-slate-800 dark:text-white text-sm block">Direct Project Sponsor</span> <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block mt-0.5">{project.clientEmail}</span> </div> </div> <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-xl text-xs space-y-2"> <div className="flex justify-between"> <span className="text-slate-400 dark:text-slate-550 font-medium">Access Key Token:</span> <span className="font-mono text-slate-600 dark:text-slate-350 font-bold">{project.clientAccessKey || "N/A"}</span> </div> <div className="flex justify-between"> <span className="text-slate-400 dark:text-slate-500 font-medium">Communication Channel:</span> <span className="text-slate-600 dark:text-slate-300 font-bold">Email + Direct Gateway</span> </div> </div> </div> {} <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4"> <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"> <h3 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider flex items-center"> <Users size={14} className="mr-2 text-indigo-500" /> Assigned Specialists </h3> <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-505 dark:text-slate-400 font-bold"> {project.assignedStaff?.length || 0} Members </span> </div> <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1"> {project.assignedStaff && project.assignedStaff.map(email => <div key={email} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-855 rounded-xl transition-colors"> <div className="flex items-center space-x-2.5"> <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-slate-600 dark:text-slate-405"> {email[0].toUpperCase()} </div> <span className="text-xs font-bold text-slate-705 dark:text-slate-300">{email}</span> </div> <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 px-2 py-0.5 rounded-full font-bold">Specialist</span> </div>)} {(!project.assignedStaff || project.assignedStaff.length === 0) && <p className="text-xs text-slate-400 dark:text-slate-550 font-medium text-center py-4">No staff explicitly assigned to this node.</p>} </div> </div> {} <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4"> <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"> <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center"> <Briefcase size={14} className="mr-2 text-indigo-500" /> Technical Requirements </h3> </div> <ul className="space-y-2.5 text-xs text-slate-605 dark:text-slate-400 font-medium max-h-[160px] overflow-y-auto pr-1"> {project.requirements && project.requirements.map((req, i) => <li key={i} className="flex items-start space-x-2.5 bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-150 dark:border-slate-850 rounded-xl"> <span className="w-5 h-5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-lg text-[10px] font-extrabold shrink-0 mt-0.5">{i + 1}</span> <span className="leading-relaxed text-slate-700 dark:text-slate-300 font-bold">{req}</span> </li>)} {(!project.requirements || project.requirements.length === 0) && <li className="text-center py-6 text-slate-400 dark:text-slate-550 font-medium">No special requirements specifications stored.</li>} </ul> </div> {} <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3"> <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center"> <FileText size={14} className="mr-2 text-indigo-500" />Requirements & Documents </h3> <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed"> {project.description || "No requirements specified for this project."} </p> <div className="pt-2"> <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" /> <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[11px] font-bold rounded-xl cursor-pointer shadow-sm transition-colors disabled:opacity-50" > <Upload size={12} /> {isUploading ? "Uploading..." : "Upload Document"} </button> </div> </div> </div> {} <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-805 rounded-2xl shadow-sm space-y-4"> <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"> <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center"> <FileText size={14} className="mr-2 text-indigo-500" /> Project Assets & Docs </h3> </div> <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1"> {project.documents && project.documents.map((doc, idx) => <a href={doc.url} key={idx} download={doc.name} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-indigo-300 dark:hover:border-indigo-550 rounded-xl transition-all cursor-pointer text-slate-605 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs"> <div className="flex items-center space-x-2.5"> <FileText size={14} className="text-indigo-500 shrink-0" /> <span className="truncate max-w-[200px]">{doc.name}</span> </div> <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Download</span> </a>)} {(!project.documents || project.documents.length === 0) && <p className="text-xs text-slate-400 dark:text-slate-550 font-medium text-center py-6">No assets uploaded yet.</p>} </div> </div> {} <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4"> <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"> <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center"> <CheckCircle2 size={14} className="mr-2 text-indigo-500" />Tasks </h3> <button onClick={() => setShowTaskForm(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl cursor-pointer shadow-sm transition-colors" > <Plus size={12} /> Add Task </button> </div> {showTaskForm && <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl"> <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task title..." className="flex-1 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white" /> <select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white cursor-pointer" > <option value="">Select Assignee (optional)</option> {userEmail && ( <option value={userEmail}>{adminName} (Company Lead)</option> )} {(employees || []).map((emp) => ( <option key={emp.email || emp._id} value={emp.email}> {emp.name} ({emp.email}) </option> ))} </select> <button disabled={addingTask || !newTaskTitle.trim()} onClick={async () => {
          const projId = project?._id || project?.id;
          if (!projId) {
            setError("Invalid project ID. Cannot add task.");
            return;
          }
          if (!newTaskTitle.trim()) return;
          setAddingTask(true);
          try {
            const data = await safeFetch(`${BASE}/api/projects/${projId}/tasks`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                title: newTaskTitle.trim(),
                assigneeEmail: newTaskAssignee.trim()
              })
            });
            if (data.success && data.data) {
              setProject(prev => ({
                ...prev,
                tasks: [...(prev.tasks || []), data.data]
              }));
              setNewTaskTitle("");
              setNewTaskAssignee("");
              setShowTaskForm(false);
              setError(null);
            }
          } catch (e) {
            console.error("Failed to add task:", e.message);
            setError("Failed to add task. Please check server connection.");
          } finally {
            setAddingTask(false);
          }
        }} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-[11px] font-bold rounded-lg cursor-pointer" > {addingTask ? "Adding..." : "Save"} </button> </div>} <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1"> {(project.tasks || []).length === 0 && <p className="text-xs text-slate-400 dark:text-slate-550 col-span-2 text-center py-6">No tasks yet.</p>} {(project.tasks || []).map((t, i) => <div key={t.id || i} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl"> <div> <p className="text-xs font-extrabold text-slate-805 dark:text-white">{t.title}</p> {t.assigneeEmail && <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{t.assigneeEmail}</p>} </div> <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold ${STATUS_COLORS[t.status] || STATUS_COLORS.Planning}`}>{t.status}</span> </div>)} </div> </div> {} <div className="bg-white dark:bg-slate-900 p-6 border border-slate-205 dark:border-slate-800 rounded-2xl shadow-sm space-y-4"> <div className="flex justify-between items-center"> <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Project Team Planning Flow Registry</h3> <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 border border-emerald-100 dark:border-emerald-900/30 rounded-full font-bold animate-pulse">Auto-updating Live Feed</span> </div> <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Real-time status mappings of assigned tasks and employee sprint flows.</p> <div className="relative border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden p-4 bg-slate-50/50 dark:bg-slate-950/40"> {} <div className="w-full min-w-[650px] overflow-x-auto"> <svg viewBox="0 0 800 320" className="w-full h-80 font-semibold" style={{
            minWidth: "750px"
          }}> {} <defs> <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"> <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" /> </marker> <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"> <feGaussianBlur stdDeviation="3" result="blur" /> <feComposite in="SourceGraphic" in2="blur" operator="over" /> </filter> </defs> {} {project.tasks && project.tasks.map((task, index) => {
              const yStaff = 60 + index % 3 * 80;
              const yTask = 50 + index * 60;
              let yTarget = 70;
              let pathColor = "#818cf8";
              if (task.status === "Dev") {
                yTarget = 140;
                pathColor = "#fbbf24";
              }
              if (task.status === "QA") {
                yTarget = 210;
                pathColor = "#3b82f6";
              }
              if (task.status === "Done") {
                yTarget = 280;
                pathColor = "#10b981";
              }
              return <g key={task.id || index}> {} <path d={`M 180 ${yStaff} C 280 ${yStaff}, 280 ${yTask}, 320 ${yTask}`} fill="none" stroke={pathColor} strokeWidth="2" strokeOpacity="0.55" className="animate-flow-line" /> {} <path d={`M 480 ${yTask} C 580 ${yTask}, 580 ${yTarget}, 650 ${yTarget}`} fill="none" stroke={pathColor} strokeWidth="2.5" strokeOpacity="0.7" className="animate-flow-line" markerEnd="url(#arrow)" /> </g>;
            })} {} {} <text x="100" y="30" fill="#94a3b8" fontSize="10" fontWeight="800" textAnchor="middle">SPECIALISTS</text> {Array.from(new Set(project.tasks?.map(t => t.assigneeName) || [])).slice(0, 3).map((name, idx) => {
              const y = 60 + idx * 80;
              return <g key={name || idx}> <rect x="20" y={y - 20} width="160" height="40" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" /> <circle cx="45" cy={y} r="12" fill="#6366f1" /> <text cx="45" cy={y} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" y={y + 3} x="45"> {name ? name[0] : "S"} </text> <text x="68" y={y + 4} fill="#1e293b" fontSize="10" fontWeight="bold" className="fill-slate-800 dark:fill-slate-200" > {name || "Unassigned"} </text> </g>;
            })} {} <text x="400" y="30" fill="#94a3b8" fontSize="10" fontWeight="800" textAnchor="middle">SPRINT TASK SHEET</text> {project.tasks && project.tasks.map((task, idx) => {
              const y = 50 + idx * 60;
              return <g key={task.id || idx}> <rect x="320" y={y - 18} width="160" height="36" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" /> <circle cx="338" cy={y} r="6" fill={task.status === "Done" ? "#10b981" : task.status === "QA" ? "#3b82f6" : task.status === "Dev" ? "#f59e0b" : "#6366f1"} /> <text x="352" y={y + 3} fill="#334155" fontSize="9" fontWeight="bold" className="fill-slate-700 dark:fill-slate-300" > {task.title.length > 22 ? `${task.title.substring(0, 20)}...` : task.title} </text> </g>;
            })} {} <text x="700" y="30" fill="#94a3b8" fontSize="10" fontWeight="800" textAnchor="middle">LIVE SPRINT PIPELINE</text> {[{
              label: "Planning",
              y: 70,
              color: "#6366f1"
            }, {
              label: "In Dev",
              y: 140,
              color: "#f59e0b"
            }, {
              label: "QA / Review",
              y: 210,
              color: "#3b82f6"
            }, {
              label: "Completed",
              y: 280,
              color: "#10b981"
            }].map(node => <g key={node.label}> <rect x="650" y={node.y - 16} width="110" height="32" rx="8" fill="#ffffff" stroke={node.color} strokeWidth="2" className="fill-white dark:fill-slate-900" /> <text x="705" y={node.y + 4} fill={node.color} fontSize="9" fontWeight="extrabold" textAnchor="middle"> {node.label.toUpperCase()} </text> </g>)} </svg> </div> </div> </div> {} <div> <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center"> <MessageSquare size={13} className="mr-2 text-indigo-500" />Project Message Portal </h3> <ProjectMessagePortal token={token} userEmail={userEmail} senderName={adminName} /> </div> {} <div className="bg-white dark:bg-slate-900 p-6 border border-slate-202 dark:border-slate-800 rounded-2xl shadow-sm space-y-4"> <h3 className="text-xs font-extrabold text-slate-805 dark:text-white uppercase tracking-wider">Project Budget & Payment Metrics</h3> <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center"> {} <div className="space-y-4 md:col-span-2"> <div className="grid grid-cols-3 gap-3"> <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-left"> <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">Contract Value</span> <span className="text-base font-extrabold text-slate-800 dark:text-white block mt-1">${totalAmount.toLocaleString()}</span> </div> <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-left"> <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider block">Total Paid</span> <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-350 block mt-1">${paidAmount.toLocaleString()}</span> </div> <div className="p-4 bg-amber-50/50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-left"> <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider block">Outstanding</span> <span className="text-base font-extrabold text-amber-700 dark:text-amber-350 block mt-1">${outstandingAmount.toLocaleString()}</span> </div> </div> <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400"> <span>Milestone Payment Status:</span> <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{paymentPercentage}% Cleared</span> </div> </div> {} <div className="flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/30"> <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 shadow-lg shadow-indigo-100/50 dark:shadow-none liquid-container flex items-center justify-center relative"> {} <div className="liquid-wave-back" style={{
              bottom: `calc(${paymentPercentage}% - 100%)`
            }} /> {} <div className="liquid-wave" style={{
              bottom: `calc(${paymentPercentage}% - 100%)`
            }} /> {} <div className="z-10 text-center font-extrabold text-slate-800 dark:text-slate-100 mix-blend-difference select-none text-sm"> <span className="text-white text-base block font-display">{paymentPercentage}%</span> <span className="text-white text-[9px] uppercase tracking-wider block opacity-80">Paid</span> </div> </div> </div> </div> </div> </div>;
}
