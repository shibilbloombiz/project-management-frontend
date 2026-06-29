import React, { useState, useEffect } from 'react';
import { Users, FileDown, CalendarClock, CalendarCheck, Clock, Check, X, ShieldAlert, Plus, Share2, MapPin, Mail, MessageCircle, RotateCw, Edit2, Trash2 } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import { API_BASE_URL } from '../../config';
import { downloadFormalReportPdf } from '../../utils/pdfExport';
import MarkAttendancePage from './MarkAttendancePage';
import Tooltip from '../Tooltip';
export default function EmployeesTab({
  employees,
  attendance = [],
  leaves = [],
  onApproveLeave,
  onDeclineLeave,
  org,
  onRefreshEmployees,
  token,
  onViewEmployee,
  companyDetails,
  onMarkAttendance,
  attendanceMarkEmail,
  setAttendanceMarkEmail
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [showSendLinkMenu, setShowSendLinkMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('today');

  useEffect(() => {
    if (attendanceMarkEmail) {
      setShowMarkAttendanceModal(true);
    }
  }, [attendanceMarkEmail]);

  const handleCloseMarkAttendance = () => {
    setShowMarkAttendanceModal(false);
    if (setAttendanceMarkEmail) {
      setAttendanceMarkEmail('');
    }
  };

  const isOnLeaveToday = (email) => {
    if (!leaves || !email) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return leaves.some(leave => {
      if (leave.email.toLowerCase() !== email.toLowerCase()) return false;
      if (leave.status !== 'Approved') return false;

      const start = new Date(leave.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(leave.endDate);
      end.setHours(0, 0, 0, 0);

      return today >= start && today <= end;
    });
  };
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [filterMonth, setFilterMonth] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });

  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const isoMatch = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    }
    const parts = String(dateStr).trim().split(/\s+/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const month = months[parts[1].toLowerCase().substring(0, 3)];
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return new Date(dateStr);
  };

  const checkLeaveOverlap = (cand) => {
    const candStart = parseDateStr(cand.startDate);
    const candEnd = parseDateStr(cand.endDate);
    if (!candStart || !candEnd) return null;

    return leaves.find(l => {
      if (l.status !== 'Approved') return false;
      if ((l._id || l.id) === (cand._id || cand.id)) return false;
      if (l.email === cand.email) return false;

      const approvedStart = parseDateStr(l.startDate);
      const approvedEnd = parseDateStr(l.endDate);
      if (!approvedStart || !approvedEnd) return false;

      return candStart <= approvedEnd && approvedStart <= candEnd;
    });
  };

  const toDateKey = (date) => {
    if (!date || Number.isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getLogDateKey = (dateStr) => toDateKey(parseDateStr(dateStr));

  const todayKey = toDateKey(new Date());
  const filteredAttendance = attendance.filter(log => {
    const logDateKey = getLogDateKey(log.date);
    if (filterType === 'all') return true;
    
    if (filterType === 'today') {
      return logDateKey === todayKey;
    }
    
    if (filterType === 'date') {
      if (!filterDate) return true;
      return logDateKey === filterDate;
    }
    
    if (filterType === 'month') {
      if (!filterMonth) return true;
      return logDateKey.startsWith(`${filterMonth}-`);
    }
    
    return true;
  });

  const getEmployeePortalInvite = () => {
    const portalUrl = `${window.location.origin}/employee-portal`;
    return `Hi,\n\nPlease use this employee portal link to access your workspace dashboard for ${org || 'our company'}:\n${portalUrl}\n\nIf this is your first login, use the email and temporary password shared by your administrator.`;
  };

  const handleSendViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(getEmployeePortalInvite())}`, '_blank', 'noopener,noreferrer');
    setShowSendLinkMenu(false);
  };

  const handleSendViaEmail = () => {
    const subject = `${org || 'Workspace'} employee portal link`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(getEmployeePortalInvite())}`;
    setShowSendLinkMenu(false);
  };

  const handleCopyPortalLink = (emp) => {
    const text = `Hi ${emp.name},\n\nPlease access the employee self-service portal to set up your profile:\nPortal URL: ${window.location.origin}/employee-portal\nEmail: ${emp.email}\nTemporary Password: (use the one provided by your administrator)`;
    navigator.clipboard.writeText(text);
    alert(`Portal access invite for ${emp.name} copied to clipboard!`);
  };

  const handleDeleteEmployee = async (emp) => {
    if (!window.confirm(`Are you sure you want to permanently delete employee ${emp.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${emp._id || emp.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Employee deleted successfully.');
        if (onRefreshEmployees) onRefreshEmployees();
      } else {
        alert(data.message || 'Failed to delete employee.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error during deletion.');
    }
  };

  // Compiles and exports attendance data as PDF
  const handleDownloadPDF = () => {
    if (filteredAttendance.length === 0) {
      alert('No attendance data available to export.');
      return;
    }

    const tableRows = filteredAttendance.map(log => {
      const duration = log.duration || '-';
      const checkOut = log.checkOut || '-';
      return [
        log.date || '-',
        log.name || '-',
        log.email || '-',
        log.checkIn || '-',
        checkOut,
        duration
      ];
    });

    downloadFormalReportPdf({
      title: 'Shift Attendance Register',
      subtitle: `${org} - Attendance Log Report`,
      meta: [
        ['Total Logged Days/Sessions', filteredAttendance.length.toString()],
        ['Report Generated', new Date().toLocaleDateString()]
      ],
      sections: [
        {
          heading: 'Check-In Records',
          table: {
            headers: ['Date', 'Employee Name', 'Email Address', 'Check-In', 'Check-Out', 'Duration'],
            widths: [75, 110, 130, 60, 60, 52],
            rows: tableRows
          }
        }
      ]
    }, `attendance_report_${org.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* 1. Employee Directory */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-md font-extrabold font-display text-slate-800 dark:text-white flex items-center">
              <Users size={16} className="text-indigo-600 dark:text-indigo-400 mr-2" /> Employee Workspace Directory
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Staff roster, roles, and status registries registered on this workspace node.</p>
          </div>
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setShowSendLinkMenu(value => !value)}
              className="bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-250 border border-slate-200 dark:border-slate-750 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Share2 size={13} />
              <span>Send Link</span>
            </button>
            {showSendLinkMenu && (
              <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={handleSendViaWhatsApp}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Link</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendViaEmail}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                >
                  <Mail size={14} />
                  <span>Email Link</span>
                </button>
              </div>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-md shadow-indigo-100 dark:shadow-none"
            >
              <Plus size={13} />
              <span>Add Employee</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-805/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Name Details</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Workspace Role</th>
                <th className="py-4 px-6">Onboarding Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-350">
              {employees.map((emp) => (
                <tr key={emp._id || emp.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center justify-center text-xs">
                      {emp.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <span
                      onClick={() => onViewEmployee && onViewEmployee(emp)}
                      className="font-extrabold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                    >{emp.name}</span>
                  </td>
                  <td className="py-4 px-6 text-xs font-mono font-medium text-slate-555 dark:text-slate-455">{emp.email}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-400 dark:text-slate-500 font-medium">{emp.date || 'N/A'}</td>
                  <td className="py-4 px-6">
                    {isOnLeaveToday(emp.email) ? (
                      <span className="flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-455">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                        On Leave
                      </span>
                    ) : (
                      <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-455">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                        {emp.status}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => {
                          if (setAttendanceMarkEmail) setAttendanceMarkEmail(emp.email);
                          setShowMarkAttendanceModal(true);
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center cursor-pointer transition-colors"
                      >
                        <CalendarClock size={11} className="mr-1 text-slate-400" />
                        <span>Mark Attendance</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingEmployee(emp);
                          setShowEditModal(true);
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center cursor-pointer transition-colors"
                      >
                        <Edit2 size={11} className="mr-1 text-slate-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteEmployee(emp)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center cursor-pointer transition-colors"
                      >
                        <Trash2 size={11} className="mr-1 text-red-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-bold">No active employees registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddSuccess={onRefreshEmployees}
        token={token}
      />

      <EditEmployeeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEmployee(null);
        }}
        onSaveSuccess={onRefreshEmployees}
        token={token}
        employee={editingEmployee}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPS Geofencing Settings Panel */}
        <GPSGeofencingSettings 
          companyDetails={companyDetails} 
          token={token} 
          onRefresh={onRefreshEmployees} 
        />
        {/* Attendance Portal Settings Panel */}
        <AttendancePortalSettings 
          companyDetails={companyDetails} 
          token={token} 
          onRefresh={onRefreshEmployees} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2. Shift Attendance Register */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-md font-extrabold font-display text-slate-800 dark:text-white flex items-center">
                  <CalendarCheck size={16} className="text-indigo-600 dark:text-indigo-400 mr-2" /> Shift Attendance Registers
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Real-time daily employee check-in logs.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Tooltip text="Mark Attendance">
                  <button
                    onClick={() => setShowMarkAttendanceModal(true)}
                    className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center shrink-0"
                  >
                    <CalendarCheck size={14} />
                  </button>
                </Tooltip>

                <Tooltip text="Refresh Register">
                  <button
                    onClick={() => {
                      setIsRefreshing(true);
                      if (onRefreshEmployees) onRefreshEmployees();
                      setTimeout(() => setIsRefreshing(false), 800);
                    }}
                    className="w-9 h-9 border border-slate-200 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-slate-650 hover:text-indigo-650 dark:border-slate-800 dark:hover:bg-slate-850 dark:text-slate-400 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0 bg-white dark:bg-slate-900"
                  >
                    <RotateCw size={14} className={isRefreshing ? "animate-spin text-indigo-500" : "text-slate-400 dark:text-slate-500"} />
                  </button>
                </Tooltip>

                <Tooltip text="Export PDF Report">
                  <button
                    onClick={handleDownloadPDF}
                    className="w-9 h-9 border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 hover:bg-rose-600 dark:hover:bg-rose-700 hover:border-rose-600 text-rose-600 dark:text-rose-455 hover:text-white rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0 shadow-sm"
                  >
                    <FileDown size={14} />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Filters toolbar */}
            <div className="p-5 pt-0 pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Filter:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-250 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="today">Today</option>
                  <option value="date">Given Date</option>
                  <option value="month">Monthly Report</option>
                  <option value="all">All Records</option>
                </select>
              </div>

              {filterType === 'date' && (
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none"
                />
              )}

              {filterType === 'month' && (
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none"
                />
              )}
            </div>

            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-805/40 border-b border-slate-200 dark:border-slate-800 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Check In</th>
                    <th className="py-3 px-4">Check Out</th>
                    <th className="py-3 px-4">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-350">
                  {filteredAttendance.map((log) => (
                    <tr key={log._id || log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-400 dark:text-slate-500">{log.date}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">{log.name}</td>
                      <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-450 font-mono font-bold flex items-center">
                        <Clock size={10} className="mr-1" /> {log.checkIn}
                      </td>
                      <td className="py-3.5 px-4 text-amber-600 dark:text-amber-450 font-mono font-bold">
                        {log.checkOut || <span className="text-[9px] bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded border border-amber-100 dark:border-amber-900/30 animate-pulse">ON-SHIFT</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-bold">{log.duration || '-'}</td>
                    </tr>
                  ))}
                  {filteredAttendance.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-bold">No attendance logs match the filter criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Leave Requests Inbox */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-md font-extrabold font-display text-slate-800 dark:text-white flex items-center">
              <CalendarClock size={16} className="text-indigo-600 dark:text-indigo-400 mr-2" /> Employee Leave Letters
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Inbox queue for sick leave or time-off approval requests.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[300px] p-5 space-y-4">
            {leaves.map((leave) => {
              const conflict = checkLeaveOverlap(leave);
              return (
                <div 
                  key={leave._id || leave.id} 
                  className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-855/40 flex flex-col justify-between gap-3 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-white text-sm block">{leave.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-mono">{leave.email}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full border ${
                      leave.status === 'Approved'
                        ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                        : leave.status === 'Declined'
                          ? 'bg-red-50 dark:bg-red-950/45 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30'
                          : 'bg-amber-50 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 animate-pulse'
                    }`}>
                      {leave.status}
                    </span>
                  </div>

                  {conflict && (
                    <div className="bg-amber-50 dark:bg-amber-955/40 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 p-2.5 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 shadow-sm">
                      <ShieldAlert size={14} className="shrink-0 text-amber-605" />
                      <span>⚠️ Schedule Conflict: {conflict.name} is already approved for leave ({conflict.startDate} to {conflict.endDate})</span>
                    </div>
                  )}

                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic bg-white dark:bg-slate-900 p-2.5 border border-slate-100 dark:border-slate-800 rounded-lg">
                    "{leave.reason}"
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                      Schedule: <strong className="text-slate-700 dark:text-slate-300 font-mono">{leave.startDate}</strong> to <strong className="text-slate-700 dark:text-slate-300 font-mono">{leave.endDate}</strong>
                    </div>
                    
                    {leave.status === 'Pending' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onApproveLeave(leave._id || leave.id)}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/45 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-extrabold text-[10px] border border-emerald-200 dark:border-emerald-900/30 rounded-lg cursor-pointer transition-colors flex items-center space-x-0.5"
                        >
                          <Check size={10} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => onDeclineLeave(leave._id || leave.id)}
                          className="px-2.5 py-1 bg-red-50 dark:bg-red-950/45 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 hover:text-red-805 font-extrabold text-[10px] border border-red-200 dark:border-red-900/30 rounded-lg cursor-pointer transition-colors flex items-center space-x-0.5"
                        >
                          <X size={10} />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {leaves.length === 0 && (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-bold flex flex-col items-center justify-center space-y-2">
                <ShieldAlert size={24} className="text-slate-300 dark:text-slate-750" />
                <span>No leave letters in pending queue.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      <MarkAttendancePage
        isOpen={showMarkAttendanceModal}
        onClose={handleCloseMarkAttendance}
        employees={employees}
        attendance={attendance}
        token={token}
        onRefresh={onRefreshEmployees}
        initialSelectedEmail={attendanceMarkEmail}
      />
    </div>
  );
}

function GPSGeofencingSettings({ companyDetails, token, onRefresh }) {
  const [gpsLat, setGpsLat] = useState(companyDetails?.gpsLatitude !== null && companyDetails?.gpsLatitude !== undefined ? companyDetails.gpsLatitude : '');
  const [gpsLng, setGpsLng] = useState(companyDetails?.gpsLongitude !== null && companyDetails?.gpsLongitude !== undefined ? companyDetails.gpsLongitude : '');
  const [gpsRad, setGpsRad] = useState(companyDetails?.gpsRadius !== null && companyDetails?.gpsRadius !== undefined ? companyDetails.gpsRadius : 200);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  // Sync state if companyDetails changes
  useEffect(() => {
    if (companyDetails) {
      setGpsLat(companyDetails.gpsLatitude !== null && companyDetails.gpsLatitude !== undefined ? companyDetails.gpsLatitude : '');
      setGpsLng(companyDetails.gpsLongitude !== null && companyDetails.gpsLongitude !== undefined ? companyDetails.gpsLongitude : '');
      setGpsRad(companyDetails.gpsRadius !== null && companyDetails.gpsRadius !== undefined ? companyDetails.gpsRadius : 200);
    }
  }, [companyDetails]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLat(position.coords.latitude.toFixed(6));
        setGpsLng(position.coords.longitude.toFixed(6));
        setDetecting(false);
      },
      (error) => {
        console.error(error);
        alert("Failed to retrieve your location. Please check browser GPS permissions.");
        setDetecting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!companyDetails) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyDetails.id || companyDetails._id || companyDetails.companyId}/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gpsLatitude: gpsLat !== '' ? parseFloat(gpsLat) : null,
          gpsLongitude: gpsLng !== '' ? parseFloat(gpsLng) : null,
          gpsRadius: gpsRad !== '' ? parseInt(gpsRad) : 200
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('GPS Geofencing Settings saved successfully!');
        if (onRefresh) onRefresh();
      } else {
        alert(data.message || 'Failed to save GPS settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error saving GPS configurations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 text-left space-y-4">
      <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/45 rounded-xl text-indigo-650 dark:text-indigo-400">
          <MapPin size={18} />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Workspace GPS Geofencing Settings</h3>
          <p className="text-[11px] text-slate-405 dark:text-slate-500 font-semibold mt-0.5">Restrict shift clock-ins to a specific physical location radius.</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-display font-bold">Office Latitude</label>
            <input 
              type="number" 
              step="0.000001"
              placeholder="e.g. 37.7749" 
              value={gpsLat} 
              onChange={(e) => setGpsLat(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-display font-bold">Office Longitude</label>
            <input 
              type="number" 
              step="0.000001"
              placeholder="e.g. -122.4194" 
              value={gpsLng} 
              onChange={(e) => setGpsLng(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-display font-bold">Allowed Radius (meters)</label>
            <input 
              type="number" 
              min="10"
              max="10000"
              placeholder="200" 
              value={gpsRad} 
              onChange={(e) => setGpsRad(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex space-x-2 pt-2 justify-end">
          <button 
            type="button" 
            onClick={handleDetectLocation}
            disabled={detecting}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 rounded-xl cursor-pointer text-center font-extrabold hover:text-slate-850 dark:hover:text-white border border-slate-250 dark:border-slate-700 disabled:opacity-60 transition-colors"
          >
            {detecting ? 'Detecting...' : 'Detect Coordinates'}
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer text-center font-extrabold shadow-md shadow-indigo-950 disabled:bg-slate-800/60 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

function AttendancePortalSettings({ companyDetails, token, onRefresh }) {
  const [enabled, setEnabled] = useState(companyDetails?.attendancePortalEnabled !== false);
  const [openTime, setOpenTime] = useState(companyDetails?.attendancePortalOpenTime || '09:00');
  const [closeTime, setCloseTime] = useState(companyDetails?.attendancePortalCloseTime || '18:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (companyDetails) {
      setEnabled(companyDetails.attendancePortalEnabled !== false);
      setOpenTime(companyDetails.attendancePortalOpenTime || '09:00');
      setCloseTime(companyDetails.attendancePortalCloseTime || '18:00');
    }
  }, [companyDetails]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!companyDetails) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyDetails.id || companyDetails._id || companyDetails.companyId}/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          attendancePortalEnabled: enabled,
          attendancePortalOpenTime: openTime,
          attendancePortalCloseTime: closeTime
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Attendance Portal Hours updated successfully!');
        if (onRefresh) onRefresh();
      } else {
        alert(data.message || 'Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error saving attendance portal configurations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 text-left space-y-4">
      <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/45 rounded-xl text-emerald-650 dark:text-emerald-450">
          <Clock size={18} />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Attendance Portal Hours Settings</h3>
          <p className="text-[11px] text-slate-405 dark:text-slate-500 font-semibold mt-0.5">Configure when employees can clock in or check out.</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
        <div>
          <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-display font-bold">Portal Open Time</label>
          <input 
            type="time" 
            value={openTime} 
            onChange={(e) => setOpenTime(e.target.value)} 
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            required
          />
        </div>
        <div>
          <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-display font-bold">Portal Close Time</label>
          <input 
            type="time" 
            value={closeTime} 
            onChange={(e) => setCloseTime(e.target.value)} 
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            required
          />
        </div>
        
        <div className="flex items-center gap-2 py-2">
          <input 
            type="checkbox" 
            id="portalEnabledTabChk"
            checked={enabled} 
            onChange={(e) => setEnabled(e.target.checked)} 
            className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
          />
          <label htmlFor="portalEnabledTabChk" className="text-xs font-extrabold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            Attendance Portal Enabled
          </label>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer text-center font-extrabold shadow-md shadow-indigo-950 disabled:bg-slate-800/60 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
