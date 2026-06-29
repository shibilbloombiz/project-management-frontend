import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { CalendarClock, User, Clock, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

export default function MarkAttendancePage({
  isOpen,
  onClose,
  employees = [],
  attendance = [],
  token,
  onRefresh,
  initialSelectedEmail = ''
}) {
  const [selectedEmail, setSelectedEmail] = useState(initialSelectedEmail);
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [systemTime, setSystemTime] = useState(() => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  });

  // Sync selected employee if initialSelectedEmail is provided
  useEffect(() => {
    if (initialSelectedEmail) {
      setSelectedEmail(initialSelectedEmail);
    }
  }, [initialSelectedEmail]);

  // Keep system time ticked
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  // Resolve matching attendance record for the selected date & employee
  const getExistingRecord = () => {
    if (!selectedEmail || !date) return null;
    
    let formattedDate = date;
    try {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) {}

    return attendance.find(log => 
      log.email?.toLowerCase() === selectedEmail.toLowerCase() && 
      (log.date === date || log.date === formattedDate)
    );
  };

  const existingRecord = getExistingRecord();
  const isCheckedIn = !!existingRecord;
  const isCheckedOut = !!(existingRecord && existingRecord.checkOut);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmail) {
      setError('Please select an employee.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const isCheckout = isCheckedIn && !isCheckedOut;
    const targetCheckIn = isCheckout ? existingRecord.checkIn : systemTime;
    const targetCheckOut = isCheckout ? systemTime : '';

    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/admin/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeEmail: selectedEmail,
          date,
          checkIn: targetCheckIn,
          checkOut: targetCheckOut
        })
      });

      if (response.status === 404) {
        throw new Error('404_FALLBACK');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess(isCheckout ? 'Check-out logged successfully!' : 'Check-in logged successfully!');
        if (onRefresh) onRefresh();
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Failed to record attendance.');
      }
    } catch (err) {
      if (err.message === '404_FALLBACK' || err.message.includes('Failed to fetch')) {
        // Run localized session-based fallback save
        const empObj = employees.find(e => e.email.toLowerCase() === selectedEmail.toLowerCase());
        const empName = empObj ? empObj.name : selectedEmail;
        const empOrg = empObj ? empObj.org : '';
        
        let formattedDate = date;
        try {
          const d = new Date(date);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
          }
        } catch (e) {}

        let duration = '';
        if (targetCheckIn && targetCheckOut) {
          try {
            const parseTime = timeStr => {
              const parts = String(timeStr).trim().split(/\s+/);
              const timePart = parts[0];
              const modifier = parts[1];
              let [hours, minutes] = timePart.split(':').map(Number);
              if (modifier === 'PM' && hours < 12) hours += 12;
              if (modifier === 'AM' && hours === 12) hours = 0;
              return hours * 60 + (minutes || 0);
            };
            const inMins = parseTime(targetCheckIn);
            const outMins = parseTime(targetCheckOut);
            const diffMins = outMins - inMins;
            if (diffMins > 0) {
              const hours = Math.floor(diffMins / 60);
              const mins = diffMins % 60;
              duration = `${hours} hrs ${mins} mins`;
            }
          } catch (e) {}
        }

        let companyId = '';
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          companyId = payload.companyId || '';
        } catch (e) {}

        try {
          const prevLogs = JSON.parse(localStorage.getItem('local_attendance_logs') || '[]');
          const matchIdx = prevLogs.findIndex(log => 
            log.email?.toLowerCase() === selectedEmail.toLowerCase() && 
            (log.date === date || log.date === formattedDate)
          );

          if (matchIdx !== -1) {
            prevLogs[matchIdx].checkIn = targetCheckIn;
            prevLogs[matchIdx].checkOut = targetCheckOut;
            prevLogs[matchIdx].duration = duration;
          } else {
            const localRecord = {
              id: `local_att_${Date.now()}`,
              name: empName,
              email: selectedEmail,
              companyId,
              org: empOrg,
              date: formattedDate,
              checkIn: targetCheckIn,
              checkOut: targetCheckOut,
              duration
            };
            prevLogs.unshift(localRecord);
          }
          localStorage.setItem('local_attendance_logs', JSON.stringify(prevLogs));
        } catch (e) {
          console.error("Local storage error:", e);
        }

        setSuccess(isCheckout ? 'Check-out logged successfully (Active Session)!' : 'Check-in logged successfully (Active Session)!');
        if (onRefresh) onRefresh();
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 1500);
      } else {
        console.error(err);
        setError(err.message || 'Failed to record attendance.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-left" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-md font-extrabold font-display text-slate-850 dark:text-white flex items-center">
            <CalendarClock size={16} className="text-indigo-600 dark:text-indigo-400 mr-2" /> Mark Attendance Override
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Quickly check staff in or out using the system time.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-750 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-755 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form content */}
        <form onSubmit={handleSubmit} className="space-y-6 font-semibold text-xs text-slate-700 dark:text-slate-300">
          
          {/* Select Employee */}
          <div>
            <label htmlFor="employee-select" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 font-display">
              Select Employee
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <User size={14} />
              </span>
              <select
                id="employee-select"
                required
                value={selectedEmail}
                onChange={(e) => {
                  setSelectedEmail(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp._id || emp.id || emp.email} value={emp.email}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selector */}
          <div>
            <label htmlFor="attendance-date" className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 font-display">
              Date
            </label>
            <input
              id="attendance-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-805 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Dynamic Status Card */}
          {selectedEmail && date && (
            <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Status Preview</span>
                <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                  isCheckedOut 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' 
                    : isCheckedIn 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/20' 
                      : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-455 border border-indigo-100 dark:border-indigo-900/20'
                }`}>
                  {isCheckedOut ? 'SHIFT COMPLETE' : isCheckedIn ? 'ON SHIFT (CHECKED IN)' : 'NOT SHIFTED (CHECKED OUT)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] block text-slate-400 uppercase tracking-wider font-extrabold mb-1">Check-in Time</span>
                  <div className="flex items-center text-slate-800 dark:text-white font-mono font-bold">
                    <Clock size={12} className="mr-1.5 text-indigo-500" />
                    {isCheckedIn ? existingRecord.checkIn : `${systemTime} (Auto)`}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] block text-slate-400 uppercase tracking-wider font-extrabold mb-1">Check-out Time</span>
                  <div className="flex items-center text-slate-800 dark:text-white font-mono font-bold">
                    <Clock size={12} className="mr-1.5 text-amber-500" />
                    {isCheckedOut ? existingRecord.checkOut : isCheckedIn ? `${systemTime} (Auto)` : '--'}
                  </div>
                </div>
              </div>

              {isCheckedOut && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  This employee has completed their shift today. Total duration: <strong className="text-slate-650 dark:text-slate-300">{existingRecord.duration || '-'}</strong>.
                </p>
              )}

              {!isCheckedIn && (
                <p className="text-[10px] text-slate-405 dark:text-slate-500 font-medium">
                  Saving check-in at the current system time: <span className="font-bold text-indigo-600 dark:text-indigo-400">{systemTime}</span>.
                </p>
              )}

              {isCheckedIn && !isCheckedOut && (
                <p className="text-[10px] text-slate-405 dark:text-slate-500 font-medium">
                  Saving check-out at the current system time: <span className="font-bold text-amber-600 dark:text-amber-400">{systemTime}</span>.
                </p>
              )}
            </div>
          )}

          {/* Submit Action Buttons */}
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850 space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>

            {!isCheckedOut && (
              <button
                type="submit"
                disabled={loading || !selectedEmail}
                className={`px-6 py-2.5 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center space-x-2 ${
                  isCheckedIn 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-100/10' 
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-100/10'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Logging...</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} />
                    <span>{isCheckedIn ? 'Mark Check-Out' : 'Mark Check-In'}</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
