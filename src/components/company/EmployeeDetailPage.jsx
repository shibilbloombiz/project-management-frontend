import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { ArrowLeft, User, Briefcase, CheckCircle2, Clock, Calendar, Download, CalendarClock } from 'lucide-react';

const STATUS_COLORS = {
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  QA: 'bg-blue-50 text-blue-700 border-blue-200',
  Review: 'bg-blue-50 text-blue-700 border-blue-200',
  Dev: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Planning: 'bg-slate-100 text-slate-600 border-slate-200',
};

const BASE = API_BASE_URL;

const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const isEmailMatch = (left, right) => {
  const normalizedLeft = normalizeEmail(left);
  const normalizedRight = normalizeEmail(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
};

const getTaskBucket = (status) => {
  if (status === 'In Progress') return 'Dev';
  if (status === 'Review') return 'QA';
  return status;
};

export default function EmployeeDetailPage({ employee, token, onBack, attendance, leaves, onMarkAttendance }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!employee) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${BASE}/api/projects`, { headers })
      .then(r => r.json())
      .then(res => {
        if (!res.success) return;
        const empEmail = normalizeEmail(employee.email);
        const myProjects = res.data.filter(p =>
          (p.assignedStaff || []).some(s => isEmailMatch(s, empEmail)) ||
          (p.tasks || []).some(t => isEmailMatch(t.assigneeEmail, empEmail))
        );
        setProjects(myProjects);
        const myTasks = [];
        myProjects.forEach(p =>
          (p.tasks || []).forEach(t => {
            if (isEmailMatch(t.assigneeEmail, empEmail)) {
              myTasks.push({ ...t, projectName: p.name, projectId: p._id || p.id });
            }
          })
        );
        setTasks(myTasks);
      })
      .catch(err => console.error(err));
  }, [employee, token]);

  const empAttendance = attendance.filter(a => isEmailMatch(a.email, employee.email));
  const empLeaves = leaves.filter(l => isEmailMatch(l.email, employee.email));
  const doneTasks = tasks.filter(t => t.status === 'Done');
  const pendingTasks = tasks.filter(t => t.status !== 'Done');
  const progress = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  const downloadReport = async (url, filename) => {
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    } catch (e) { console.error(e); }
  };

  const empId = employee._id || employee.id;

  return (
    <div className="space-y-6 text-left pb-12">

      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer text-slate-600">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-white text-lg shadow"
              style={{ background: employee.avatarColor || '#6366f1' }}
            >
              {employee.name?.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">{employee.name}</h2>
              <p className="text-xs text-slate-400 font-medium">{employee.email}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onMarkAttendance && onMarkAttendance(employee.email)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors"
          >
            <CalendarClock size={13} className="text-indigo-500" /> Mark Attendance
          </button>
          <button
            onClick={() => downloadReport(`${BASE}/api/employees/${empId}/attendance/report`, 'attendance_report.pdf')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-100 cursor-pointer"
          >
            <Download size={13} /> Attendance Report
          </button>
          <button
            onClick={() => downloadReport(`${BASE}/api/employees/${empId}/payment/report`, 'payment_report.pdf')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-100 cursor-pointer"
          >
            <Download size={13} /> Payment Report
          </button>
        </div>
      </div>

      {/* Profile + Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center"><User size={13} className="mr-2 text-indigo-500" />Profile</h3>
          <div className="space-y-2 text-xs">
            {[
              ['Role', employee.role],
              ['Domain', employee.domain || '—'],
              ['Phone', employee.phone || '—'],
              ['Location', employee.location || '—'],
              ['Status', employee.status],
              ['Portal Setup', employee.portalSetup ? 'Yes' : 'No'],
              ['Joined', employee.date || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-semibold">{label}</span>
                <span className="text-slate-700 font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center"><CheckCircle2 size={13} className="mr-2 text-indigo-500" />Task Progress</h3>
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.2" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3.2"
                  strokeDasharray={`${progress} ${100 - progress}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-extrabold text-slate-800">{progress}%</span>
              </div>
            </div>
            <div className="text-center text-xs font-semibold text-slate-500">
              {doneTasks.length}/{tasks.length} tasks completed
            </div>
            <div className="w-full space-y-1">
              {['Planning', 'Dev', 'QA', 'Done'].map(s => {
                const count = tasks.filter(t => getTaskBucket(t.status) === s).length;
                return (
                  <div key={s} className="flex justify-between text-[11px]">
                    <span className={`px-2 py-0.5 rounded-full border font-bold ${STATUS_COLORS[s]}`}>
                      {s === 'Dev' ? 'Dev / In Progress' : s === 'QA' ? 'QA / Review' : s}
                    </span>
                    <span className="font-bold text-slate-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center"><Clock size={13} className="mr-2 text-indigo-500" />Attendance</h3>
          <div className="space-y-2 text-xs font-semibold max-h-48 overflow-y-auto pr-1">
            {empAttendance.length === 0 && <p className="text-slate-400 text-center py-6">No records</p>}
            {empAttendance.slice(0, 10).map((a, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-mono">{a.date}</span>
                <span className="text-emerald-600 font-bold">{a.checkIn} {a.checkOut ? `→ ${a.checkOut}` : <span className="text-amber-500 text-[10px]">ON-SHIFT</span>}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-bold border-t border-slate-100 pt-2">
            <span className="text-slate-400">Total Days</span>
            <span className="text-slate-700">{empAttendance.length}</span>
          </div>
        </div>
      </div>

      {/* Assigned Projects */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
          <Briefcase size={13} className="mr-2 text-indigo-500" />Assigned Projects
          <span className="ml-2 bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full border border-indigo-100 font-bold">{projects.length} total</span>
        </h3>
        {projects.length === 0 && <p className="text-xs text-slate-400 text-center py-6">No projects assigned.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map((p, i) => (
            <div key={p._id || p.id || i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <p className="text-xs font-extrabold text-slate-800">{p.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">{p.currentPhase || 'Planning'}</p>
              </div>
              <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold ${p.status === 'Completed' || p.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assigned Tasks */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
          <Briefcase size={13} className="mr-2 text-indigo-500" />Assigned Tasks
          <span className="ml-2 bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full border border-indigo-100 font-bold">{tasks.length} total</span>
        </h3>
        {tasks.length === 0 && <p className="text-xs text-slate-400 text-center py-6">No tasks assigned.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <p className="text-xs font-extrabold text-slate-800">{t.title}</p>
                <p className="text-[10px] text-slate-400 font-medium">{t.projectName}</p>
              </div>
              <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold ${STATUS_COLORS[t.status] || STATUS_COLORS.Planning}`}>{t.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-amber-700 uppercase tracking-wider flex items-center">
            <Clock size={13} className="mr-2" />Pending Tasks ({pendingTasks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingTasks.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white border border-amber-100 rounded-xl">
                <div>
                  <p className="text-xs font-extrabold text-slate-800">{t.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t.projectName}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold ${STATUS_COLORS[t.status] || STATUS_COLORS.Planning}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
          <Calendar size={13} className="mr-2 text-indigo-500" />Leave History
          <span className="ml-2 bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full border border-slate-200 font-bold">{empLeaves.length}</span>
        </h3>
        {empLeaves.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No leave requests.</p>}
        <div className="space-y-2">
          {empLeaves.map((l, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
              <div>
                <p className="font-bold text-slate-700">{l.startDate} → {l.endDate}</p>
                <p className="text-slate-400 font-medium italic">"{l.reason}"</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : l.status === 'Declined' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{l.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
