import React, { useState, useEffect } from 'react';
import { Users, FileDown, CalendarClock, Clock, Check, X, ShieldAlert, Plus, Share2, MapPin } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';
import { API_BASE_URL } from '../../config';

export default function EmployeesTab({ employees, attendance = [], leaves = [], onApproveLeave, onDeclineLeave, org, onRefreshEmployees, token, onViewEmployee, companyDetails }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState('today');
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
    if (dateStr.includes('-')) {
      return new Date(dateStr);
    }
    const parts = dateStr.trim().split(/\s+/);
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

  const filteredAttendance = attendance.filter(log => {
    if (filterType === 'all') return true;
    
    if (filterType === 'today') {
      const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      return log.date.toLowerCase() === todayStr.toLowerCase();
    }
    
    if (filterType === 'date') {
      if (!filterDate) return true;
      const parts = filterDate.split('-');
      if (parts.length !== 3) return true;
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      return log.date.toLowerCase() === formatted.toLowerCase();
    }
    
    if (filterType === 'month') {
      if (!filterMonth) return true;
      const parts = filterMonth.split('-');
      if (parts.length !== 2) return true;
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 2);
      const monthLabel = d.toLocaleDateString('en-GB', { month: 'short' });
      const yearLabel = d.toLocaleDateString('en-GB', { year: 'numeric' });
      const matchSuffix = `${monthLabel} ${yearLabel}`;
      return log.date.toLowerCase().endsWith(matchSuffix.toLowerCase());
    }
    
    return true;
  });

  const handleCopyPortalLink = (emp) => {
    const text = `Hi ${emp.name},\n\nPlease access the employee self-service portal to set up your profile:\nPortal URL: ${window.location.origin}/employee-portal\nEmail: ${emp.email}\nTemporary Password: (use the one provided by your administrator)`;
    navigator.clipboard.writeText(text);
    alert(`Portal access invite for ${emp.name} copied to clipboard!`);
  };

  // Compiles and exports attendance data as CSV
  const handleDownloadCSV = () => {
    if (filteredAttendance.length === 0) {
      alert('No attendance data available to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Employee Name,Email Address,Check In Time,Check Out Time,Shift Duration\n';
    
    filteredAttendance.forEach(log => {
      const duration = log.duration || '-';
      const checkOut = log.checkOut || '-';
      csvContent += `"${log.date}","${log.name}","${log.email}","${log.checkIn}","${checkOut}","${duration}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_report_${org.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-md shadow-indigo-100 dark:shadow-none"
          >
            <Plus size={13} />
            <span>Add Employee</span>
          </button>
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
                      className="font-extrabold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer"
                    >{emp.name}</span>
                  </td>
                  <td className="py-4 px-6 text-xs font-mono font-medium text-slate-550 dark:text-slate-450">{emp.email}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-400 dark:text-slate-500 font-medium">{emp.date || 'N/A'}</td>
                  <td className="py-4 px-6">
                    <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-450">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleCopyPortalLink(emp)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-455 hover:text-indigo-800 dark:hover:text-indigo-350 hover:underline flex items-center justify-end cursor-pointer ml-auto"
                    >
                      <Share2 size={11} className="mr-1" />
                      <span>Invite</span>
                    </button>
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

      {/* GPS Geofencing Settings Panel */}
      <GPSGeofencingSettings 
        companyDetails={companyDetails} 
        token={token} 
        onRefresh={onRefreshEmployees} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2. Shift Attendance Register */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-md font-extrabold font-display text-slate-800 dark:text-white flex items-center">
                  <CalendarClock size={16} className="text-indigo-600 dark:text-indigo-400 mr-2" /> Shift Attendance Registers
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Real-time daily employee check-in logs.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (onRefreshEmployees) onRefreshEmployees();
                  }}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl cursor-pointer transition-colors text-xs font-bold shadow-sm"
                  title="Refresh Register"
                >
                  Refresh
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-405 hover:text-slate-800 dark:hover:text-white rounded-xl cursor-pointer transition-colors flex items-center space-x-1.5 font-bold text-xs shrink-0 shadow-sm"
                >
                  <FileDown size={14} />
                  <span>Export CSV</span>
                </button>
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

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs font-semibold text-slate-700 dark:text-slate-350">
        <div>
          <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-display">Office Latitude</label>
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
          <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-display">Office Longitude</label>
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
          <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-display">Allowed Radius (meters)</label>
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
        <div className="flex space-x-2">
          <button 
            type="button" 
            onClick={handleDetectLocation}
            disabled={detecting}
            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 rounded-xl cursor-pointer text-center font-extrabold hover:text-slate-850 dark:hover:text-white border border-slate-250 dark:border-slate-700 disabled:opacity-60 transition-colors"
          >
            {detecting ? 'Detecting...' : 'Detect Coordinates'}
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer text-center font-extrabold shadow-md shadow-indigo-950 disabled:bg-slate-800/60 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
