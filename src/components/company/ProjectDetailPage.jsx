import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import { ArrowLeft, DollarSign, RefreshCw, MessageSquare } from "lucide-react";
import ProjectMessagePortal from "./ProjectMessagePortal";
import ProjectPipeline from "./projectDetail/ProjectPipeline";
import ProjectDeploymentCard from "./projectDetail/ProjectDeploymentCard";
import ClientProfileCard from "./projectDetail/ClientProfileCard";
import SpecialistsCard from "./projectDetail/SpecialistsCard";
import RequirementsCard from "./projectDetail/RequirementsCard";
import ProjectAssetsCard from "./projectDetail/ProjectAssetsCard";
import TaskBoard from "./projectDetail/TaskBoard";
import TaskSpecsModal from "./projectDetail/TaskSpecsModal";
import InvoiceManager from "./projectDetail/InvoiceManager";

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
  const [selectedTask, setSelectedTask] = useState(null);

  // ── Edit Project Details state ─────────────────────────────────────────────
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editBudget,       setEditBudget]       = useState('');
  const [editStartDate,    setEditStartDate]    = useState('');
  const [editEndDate,      setEditEndDate]      = useState('');
  const [editCurrentPhase, setEditCurrentPhase] = useState('');
  const [editDesc,         setEditDesc]         = useState('');
  const [savingDetails,    setSavingDetails]    = useState(false);

  const PHASES = [
    'Client Gave Idea','Collecting Requirements','Creating Feature List','Creating Timeline',
    'Assigning Tasks','Development Started','Tracking Progress','Solving Blockers',
    'Client Update Sent','QA Testing','Bug Fixing','Client Review','Deployed','Final Handover','Maintenance',
  ];

  const handleOpenEditDetails = () => {
    setEditBudget(project.budget || '');
    setEditStartDate(project.startDate || '');
    setEditEndDate(project.endDate || '');
    setEditCurrentPhase(project.currentPhase || 'Client Gave Idea');
    setEditDesc(project.desc || '');
    setIsEditingDetails(true);
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    const projId = project?._id || project?.id;
    if (!projId) return;
    setSavingDetails(true);
    try {
      const res  = await fetch(`${BASE}/api/projects/${projId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          budget:       editBudget ? Number(editBudget) : 0,
          startDate:    editStartDate,
          endDate:      editEndDate,
          currentPhase: editCurrentPhase,
          desc:         editDesc,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProject(data.data);
        setIsEditingDetails(false);
        setError(null);
      } else {
        setError(data.message || 'Failed to save project details.');
      }
    } catch (err) {
      console.error('Save details failed:', err);
      setError('Network error. Could not save project details.');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSaveDeployUrl = async (deployedUrl) => {
    const projId = project?._id || project?.id;
    if (!projId) return;
    const response = await fetch(`${BASE}/api/projects/${projId}/deploy`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ deployedUrl })
    });
    const data = await response.json();
    if (data.success && data.data) {
      setProject(data.data);
      setError(null);
    } else {
      setError(data.message || "Failed to update project deployment link.");
      throw new Error(data.message || "Failed to update project deployment link.");
    }
  };

  const handleAddInvoiceDirect = async (invoiceData) => {
    const projId = project?._id || project?.id;
    if (!projId) return;

    const updatedInvoices = [...(project.invoices || []), invoiceData];
    const total = updatedInvoices.reduce((sum, i) => sum + i.amount, 0);
    const paid = updatedInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const outstanding = total - paid;

    const res = await fetch(`${BASE}/api/projects/${projId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        invoices: updatedInvoices,
        paymentDetails: { total, paid, outstanding }
      }),
    });
    const data = await res.json();
    if (data.success && data.data) {
      setProject(data.data);
      setError(null);
    } else {
      setError(data.message || 'Failed to add invoice.');
      throw new Error(data.message || 'Failed to add invoice.');
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    const projId = project?._id || project?.id;
    if (!projId) return;
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const updatedInvoices = (project.invoices || []).filter(i => i.invoiceId !== invoiceId && i._id !== invoiceId && i.id !== invoiceId);
      const total = updatedInvoices.reduce((sum, i) => sum + i.amount, 0);
      const paid = updatedInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
      const outstanding = total - paid;

      const res = await fetch(`${BASE}/api/projects/${projId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          invoices: updatedInvoices,
          paymentDetails: { total, paid, outstanding }
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProject(data.data);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete invoice.');
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId, newStatus) => {
    const projId = project?._id || project?.id;
    if (!projId) return;
    try {
      const updatedInvoices = (project.invoices || []).map(i => {
        if (i.invoiceId === invoiceId || i._id === invoiceId || i.id === invoiceId) {
          return {
            ...i,
            status: newStatus,
            paidDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : ''
          };
        }
        return i;
      });
      const total = updatedInvoices.reduce((sum, i) => sum + i.amount, 0);
      const paid = updatedInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
      const outstanding = total - paid;

      const res = await fetch(`${BASE}/api/projects/${projId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          invoices: updatedInvoices,
          paymentDetails: { total, paid, outstanding }
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProject(data.data);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update invoice status.');
    }
  };

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

  const handleFileUploadDirect = async (file) => {
    const projId = project?._id || project?.id;
    if (!projId) {
      setError("Invalid project ID. Cannot upload document.");
      return;
    }

    const reader = new FileReader();
    return new Promise((resolve, reject) => {
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
            resolve();
          } else {
            setError(data.message || "Failed to upload document.");
            reject(new Error(data.message || "Failed to upload document."));
          }
        } catch (err) {
          console.error("Failed to upload document:", err);
          setError("Connection issue: Failed to upload file.");
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleAddTask = async ({ title, assigneeEmail, deadline }) => {
    const projId = project?._id || project?.id;
    if (!projId) {
      setError("Invalid project ID. Cannot add task.");
      return;
    }
    const data = await safeFetch(`${BASE}/api/projects/${projId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, assigneeEmail, deadline })
    });
    if (data.success && data.data) {
      setProject(prev => ({ ...prev, tasks: [...(prev.tasks || []), data.data] }));
      setError(null);
    } else {
      throw new Error(data.message || "Failed to add task.");
    }
  };

  const handleUpdateTask = async (taskId, updatedFields) => {
    const projId = project?._id || project?.id;
    if (!projId) {
      setError("Invalid project ID. Cannot update task.");
      return;
    }
    const data = await safeFetch(`${BASE}/api/projects/${projId}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedFields)
    });
    if (data.success && data.data) {
      setProject(data.data);
      setError(null);
    } else {
      throw new Error(data.message || "Failed to update task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    const projId = project?._id || project?.id;
    if (!projId) {
      setError("Invalid project ID. Cannot delete task.");
      return;
    }
    try {
      const data = await safeFetch(`${BASE}/api/projects/${projId}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success && data.data) {
        setProject(prev => ({ ...prev, tasks: data.data }));
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete task.");
    }
  };

  if (isLoading && !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center dark:text-slate-300">
        <RefreshCw className="animate-spin text-indigo-650" size={32} />
        <p className="text-sm font-semibold text-slate-500">Loading project details...</p>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto mt-10">
        <p className="text-sm font-bold text-red-755 dark:text-red-400">{error || "Project not found."}</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-705 transition">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-12 animate-transition">
      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-955/40 border border-amber-205 dark:border-amber-900/30 rounded-2xl text-xs font-semibold text-amber-800 dark:text-amber-400 flex justify-between items-center shadow-sm">
          <span>{error}</span>
          <button onClick={() => fetchProjectDetails(true)} className="text-indigo-650 dark:text-indigo-400 hover:underline font-bold cursor-pointer">
            Retry Sync
          </button>
        </div>
      )}

      <style>{`
        @keyframes wave-animation {
          0% { transform: translateX(0) translateZ(0) scaleY(1); }
          50% { transform: translateX(-25%) translateZ(0) scaleY(0.85); }
          100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
        }
        .liquid-container {
          position: relative;
          overflow: hidden;
          background: #f1f5f9;
        }
        .dark .liquid-container {
          background: #0f172a;
        }
        .liquid-wave {
          position: absolute;
          left: 0;
          width: 200%;
          height: 100%;
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.6) 0%, rgba(79, 70, 229, 0.9) 100%);
          animation: wave-animation 6s linear infinite;
          transform-origin: center bottom;
        }
        .liquid-wave-back {
          position: absolute;
          left: 0;
          width: 200%;
          height: 100%;
          background: linear-gradient(180deg, rgba(167, 139, 250, 0.4) 0%, rgba(124, 58, 237, 0.6) 100%);
          animation: wave-animation 10s linear infinite;
          transform-origin: center bottom;
          opacity: 0.7;
        }
        @keyframes dash {
          to { stroke-dashoffset: -40; }
        }
        .animate-flow-line {
          stroke-dasharray: 8, 4;
          animation: dash 2s linear infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        .pulse-effect {
          position: relative;
        }
        .pulse-effect::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid #6366f1;
          border-radius: 9999px;
          animation: pulse-ring 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }
      `}</style>

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-805 rounded-2xl shadow-sm gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-xl border border-slate-202 dark:border-slate-800 transition-colors cursor-pointer text-slate-605 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg font-extrabold font-display text-slate-808 dark:text-white">{project.name}</h2>
              <select value={project.status} onChange={(e) => handleStatusChange(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-0.5 text-[10px] font-extrabold text-slate-707 dark:text-slate-305 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500" >
                <option value="Planning">Planning</option>
                <option value="Active">Active / In Progress</option>
                <option value="Dev">Development (Dev)</option>
                <option value="QA">QA / Review</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Completed">Completed / Closed</option>
                <option value="On Hold">On Hold / Paused</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-550 font-medium mt-0.5">Project Scope detailed dashboard & pipeline monitoring.</p>
          </div>
        </div>
        <button onClick={() => fetchProjectDetails(true)} className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-605 dark:text-slate-400 cursor-pointer">
          <RefreshCw size={12} className="animate-spin-hover" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Edit Project Details Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign size={14} className="text-indigo-500" /> Project Details
          </h3>
          {!isEditingDetails && (
            <button onClick={handleOpenEditDetails} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 text-indigo-707 dark:text-indigo-400 text-[11px] font-bold border border-indigo-200 dark:border-indigo-900/40 rounded-xl cursor-pointer transition-colors">
              Edit Details
            </button>
          )}
        </div>
        {isEditingDetails ? (
          <form onSubmit={handleSaveDetails} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-404 uppercase tracking-widest mb-1.5">Budget (₹)</label>
                <input type="number" value={editBudget} onChange={e => setEditBudget(e.target.value)} placeholder="e.g. 150000"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-808 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-404 uppercase tracking-widest mb-1.5">Current Phase</label>
                <select value={editCurrentPhase} onChange={e => setEditCurrentPhase(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-808 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                  {PHASES.map((p, i) => <option key={p} value={p}>{i + 1}. {p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-404 uppercase tracking-widest mb-1.5">Start Date</label>
                <input type="date" value={editStartDate} onChange={e => setEditStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-808 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-slate-404 uppercase tracking-widest mb-1.5">End / Deadline Date</label>
                <input type="date" value={editEndDate} onChange={e => setEditEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-808 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-404 uppercase tracking-widest mb-1.5">Project Description</label>
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2} placeholder="Brief project description..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-808 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setIsEditingDetails(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={savingDetails}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-colors">
                {savingDetails ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{label:'Budget', value: project.budget ? `₹${Number(project.budget).toLocaleString()}` : '—'},
              {label:'Current Phase', value: project.currentPhase || '—'},
              {label:'Start Date',    value: project.startDate    || '—'},
              {label:'End / Target',  value: project.endDate      || '—'},
            ].map(item => (
              <div key={item.label} className="space-y-0.5">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">{item.label}</span>
                <span className="text-xs font-bold text-slate-808 dark:text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Development Pipeline Component */}
      <ProjectPipeline projectStatus={project.status} />

      {/* Grid of details, deployment, specialists, assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectDeploymentCard deployedUrl={project.deployedUrl} onSave={handleSaveDeployUrl} />
        <ClientProfileCard clientEmail={project.clientEmail} clientAccessKey={project.clientAccessKey} />
        <SpecialistsCard assignedStaff={project.assignedStaff || []} />
        <RequirementsCard requirements={project.requirements || []} />
        <ProjectAssetsCard description={project.description} documents={project.documents || []} onUpload={handleFileUploadDirect} />
      </div>

      {/* Task Board Component */}
      <TaskBoard
        tasks={project.tasks || []}
        employees={employees}
        userEmail={userEmail}
        adminName={adminName}
        onAddTask={handleAddTask}
        onSelectTask={setSelectedTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Project Team Planning Flow Registry SVG Diagram */}
      <div className="bg-white dark:bg-slate-900 p-6 border border-slate-205 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Project Team Planning Flow Registry</h3>
          <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 border border-emerald-100 dark:border-emerald-900/30 rounded-full font-bold animate-pulse">Auto-updating Live Feed</span>
        </div>
        <p className="text-xs text-slate-405 dark:text-slate-500 font-semibold mt-0.5">Real-time status mappings of assigned tasks and employee sprint flows.</p>
        <div className="relative border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden p-4 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="w-full min-w-[650px] overflow-x-auto">
            <svg viewBox="0 0 800 320" className="w-full h-80 font-semibold" style={{ minWidth: "750px" }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
                </marker>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {project.tasks && project.tasks.map((task, index) => {
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
                return (
                  <g key={task.id || index}>
                    <path d={`M 180 ${yStaff} C 280 ${yStaff}, 280 ${yTask}, 320 ${yTask}`} fill="none" stroke={pathColor} strokeWidth="2" strokeOpacity="0.55" className="animate-flow-line" />
                    <path d={`M 480 ${yTask} C 580 ${yTask}, 580 ${yTarget}, 650 ${yTarget}`} fill="none" stroke={pathColor} strokeWidth="2.5" strokeOpacity="0.7" className="animate-flow-line" markerEnd="url(#arrow)" />
                  </g>
                );
              })}
              <text x="100" y="30" fill="#94a3b8" fontSize="10" fontWeight="800" textAnchor="middle">SPECIALISTS</text>
              {Array.from(new Set(project.tasks?.map(t => t.assigneeName) || [])).slice(0, 3).map((name, idx) => {
                const y = 60 + idx * 80;
                return (
                  <g key={name || idx}>
                    <rect x="20" y={y - 20} width="160" height="40" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" />
                    <circle cx="45" cy={y} r="12" fill="#6366f1" />
                    <text cx="45" cy={y} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" y={y + 3} x="45">
                      {name ? name[0] : "S"}
                    </text>
                    <text x="68" y={y + 4} fill="#1e293b" fontSize="10" fontWeight="bold" className="fill-slate-805 dark:fill-slate-202" >
                      {name || "Unassigned"}
                    </text>
                  </g>
                );
              })}
              <text x="400" y="30" fill="#94a3b8" fontSize="10" fontWeight="800" textAnchor="middle">SPRINT TASK SHEET</text>
              {project.tasks && project.tasks.map((task, idx) => {
                const y = 50 + idx * 60;
                return (
                  <g key={task.id || idx}>
                    <rect x="320" y={y - 18} width="160" height="36" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" />
                    <circle cx="338" cy={y} r="6" fill={task.status === "Done" ? "#10b981" : task.status === "QA" ? "#3b82f6" : task.status === "Dev" ? "#f59e0b" : "#6366f1"} />
                    <text x="352" y={y + 3} fill="#334155" fontSize="9" fontWeight="bold" className="fill-slate-700 dark:fill-slate-300" >
                      {task.title.length > 22 ? `${task.title.substring(0, 20)}...` : task.title}
                    </text>
                  </g>
                );
              })}
              <text x="700" y="30" fill="#94a3b8" fontSize="10" fontWeight="800" textAnchor="middle">LIVE SPRINT PIPELINE</text>
              {[{
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
              }].map(node => (
                <g key={node.label}>
                  <rect x="650" y={node.y - 16} width="110" height="32" rx="8" fill="#ffffff" stroke={node.color} strokeWidth="2" className="fill-white dark:fill-slate-900" />
                  <text x="705" y={node.y + 4} fill={node.color} fontSize="9" fontWeight="extrabold" textAnchor="middle">
                    {node.label.toUpperCase()}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Message Portal Component */}
      <div>
        <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center">
          <MessageSquare size={13} className="mr-2 text-indigo-500" />Project Message Portal
        </h3>
        <ProjectMessagePortal token={token} userEmail={userEmail} senderName={adminName} />
      </div>

      {/* Invoice Manager Component */}
      <InvoiceManager
        budget={project.budget}
        invoices={project.invoices || []}
        onAddInvoice={handleAddInvoiceDirect}
        onDeleteInvoice={handleDeleteInvoice}
        onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
      />

      {/* Task Specs Modal Component */}
      {selectedTask && (
        <TaskSpecsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
