import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeftFromLine,
  ArrowRightToLine,
  CheckCircle2,
  Clock3,
  Info,
  Loader2,
  TimerReset,
  X,
  CalendarDays,
  Calendar,
} from "lucide-react";
import { API_BASE_URL } from "../../config";
import AttendancePage from "../Attendance/AttendancePage";
import AttendanceLogButton from "../Attendance/components/AttendanceLogButton";

export default function EmployeeAttendance({ token, onAttendanceChange, onNavigateTab }) {
  const [viewMode, setViewMode] = useState('check'); // 'check' | 'log'
  const [todayRecord, setTodayRecord] = useState(null);
  const [attendancePortal, setAttendancePortal] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [activeAction, setActiveAction] = useState(null);
  const [attendanceModal, setAttendanceModal] = useState({
    show: false,
    status: 'idle', // 'idle' | 'gps' | 'api' | 'success' | 'error'
    message: '',
    action: ''
  });

  const hasCheckedIn = Boolean(todayRecord?.checkIn);
  const hasCheckedOut = Boolean(todayRecord?.checkOut);
  const isActiveSession = hasCheckedIn && !hasCheckedOut;
  const isPortalOpen = attendancePortal?.isOpen !== false;

  const fetchTodayAttendance = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/attendance/today`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setTodayRecord(data.data);
        setAttendancePortal(data.attendancePortal || null);
        onAttendanceChange?.(Boolean(data.data?.checkIn && !data.data?.checkOut));
      }
    } catch {
      setError("Unable to load today's attendance.");
    } finally {
      setInitialLoading(false);
    }
  }, [onAttendanceChange, token]);

  useEffect(() => {
    if (token) fetchTodayAttendance();
  }, [fetchTodayAttendance, token]);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) return null;

    try {
      return await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) =>
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          () => resolve(null),
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
        );
      });
    } catch {
      return null;
    }
  };

  const markAttendance = async (action) => {
    if (!action) return;

    const actionLabel = action === "checkIn" ? "Check In" : "Check Out";
    setActiveAction(action);
    setSubmitting(true);
    setError("");
    setAttendanceModal({
      show: true,
      status: 'gps',
      message: 'Fetching GPS coordinates to verify office geofence...',
      action: actionLabel
    });

    const coords = await getCurrentLocation();

    setAttendanceModal({
      show: true,
      status: 'api',
      message: `Syncing check-in metadata with Syncra logs...`,
      action: actionLabel
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await response.json();

      if (!data.success) {
        if (data.attendancePortal) setAttendancePortal(data.attendancePortal);
        const errMsg = data.message || "Failed to record attendance.";
        setError(errMsg);
        setAttendanceModal({
          show: true,
          status: 'error',
          message: errMsg,
          action: actionLabel
        });
        return;
      }

      setTodayRecord(data.data);
      if (data.attendancePortal) setAttendancePortal(data.attendancePortal);
      onAttendanceChange?.(Boolean(data.data?.checkIn && !data.data?.checkOut));
      
      const successMessage = action === "checkIn" ? "Checked in successfully." : "Checked out successfully.";
      setToast(successMessage);
      window.setTimeout(() => setToast(""), 3200);
      
      setAttendanceModal({
        show: true,
        status: 'success',
        message: successMessage,
        action: actionLabel
      });
    } catch {
      const errMsg = "Failed to communicate with attendance API node.";
      setError(errMsg);
      setAttendanceModal({
        show: true,
        status: 'error',
        message: errMsg,
        action: actionLabel
      });
    } finally {
      setSubmitting(false);
      setActiveAction(null);
    }
  };

  if (viewMode === 'log') {
    return (
      <AttendancePage 
        token={token} 
        onBack={() => setViewMode('check')} 
      />
    );
  }

  return (
    <div className="relative space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            My Attendance
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Track your daily attendance and shift status.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/80 sm:p-7">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-inner dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-350">
              <Clock3 size={28} />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Attendance Overview</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Real-time tracking for today's shift.
              </p>
            </div>
          </div>

          <StatusBadge isActiveSession={isActiveSession} hasCheckedIn={hasCheckedIn} />
        </div>

        {attendancePortal && (
          <div
            className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
              isPortalOpen
                ? "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
                : "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
            }`}
          >
            <Info size={18} className="mt-0.5 shrink-0" />
            <span>{attendancePortal.message}</span>
          </div>
        )}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="border-b border-slate-200 py-6 dark:border-slate-800">
          <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400">Today's Status</p>
          <div className="mt-4">
            <StatusBadge isActiveSession={isActiveSession} hasCheckedIn={hasCheckedIn} large />
          </div>
        </div>

        <div className="py-7 flex flex-col items-center justify-center gap-3 sm:flex-row border-b border-slate-200 dark:border-slate-800">
          <AttendanceButton
            action="checkIn"
            disabled={!isPortalOpen || hasCheckedIn || initialLoading || submitting}
            loading={submitting && activeAction === "checkIn"}
            onClick={() => markAttendance("checkIn")}
          />
          <AttendanceButton
            action="checkOut"
            disabled={!isActiveSession || initialLoading || submitting}
            loading={submitting && activeAction === "checkOut"}
            onClick={() => markAttendance("checkOut")}
          />
        </div>

        <div className="py-7">
          {initialLoading ? (
            <div className="flex min-h-36 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2 size={18} className="animate-spin text-indigo-500" />
              Loading attendance...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto grid max-w-2xl grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/30 sm:grid-cols-2">
                <TimeTile
                  icon={<ArrowRightToLine size={20} />}
                  label="Check In"
                  time={todayRecord?.checkIn || "--"}
                  caption={todayRecord?.date || "Not checked in yet"}
                  tone="emerald"
                />
                <TimeTile
                  icon={<ArrowLeftFromLine size={20} />}
                  label="Check Out"
                  time={todayRecord?.checkOut || "--"}
                  caption={todayRecord?.checkOut ? todayRecord?.date : "Not checked out yet"}
                  tone="indigo"
                  divided
                />
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setViewMode('log')}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-slate-350 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
                >
                  <CalendarDays size={14} className="text-blue-500 shrink-0" />
                  Attendance Log
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('leaves')}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-slate-350 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
                >
                  <Calendar size={14} className="text-indigo-500 shrink-0" />
                  Leave Request
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-7 flex items-center gap-3 rounded-xl bg-indigo-50/70 px-4 py-3 text-sm font-medium text-slate-600 dark:bg-indigo-950/20 dark:text-slate-300">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-350">
            <Info size={17} />
          </span>
          <p>Make sure to check in at the start of your shift and check out when you're done.</p>
        </div>
      </section>

      {toast && (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-xl shadow-slate-900/10 dark:border-emerald-900/40 dark:bg-slate-900 dark:text-emerald-300">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast("")}
            className="rounded-lg p-1 text-emerald-700/70 transition hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/30"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Geofencing Status Popup Modal */}
      {attendanceModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in text-left">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative animate-scale-in">
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-405 dark:text-slate-500">
                {attendanceModal.action} Status
              </span>
              {(attendanceModal.status === 'success' || attendanceModal.status === 'error') && (
                <button
                  onClick={() => setAttendanceModal(prev => ({ ...prev, show: false }))}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Icon & Message Body */}
            <div className="py-4 space-y-4 flex flex-col items-center">
              {(attendanceModal.status === 'gps' || attendanceModal.status === 'api') && (
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
                    <Loader2 size={32} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="absolute w-20 h-20 border border-indigo-200/50 dark:border-indigo-800/30 rounded-full animate-ping pointer-events-none"></div>
                </div>
              )}

              {attendanceModal.status === 'success' && (
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30 animate-bounce">
                  <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-450" />
                </div>
              )}

              {attendanceModal.status === 'error' && (
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-955/40 flex items-center justify-center border border-red-100 dark:border-red-900/30">
                  <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
                </div>
              )}

              <div className="space-y-1.5 px-2">
                <p className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug">
                  {attendanceModal.status === 'gps' && 'Acquiring GPS Signal'}
                  {attendanceModal.status === 'api' && 'Communicating with Gateway'}
                  {attendanceModal.status === 'success' && 'Operation Complete'}
                  {attendanceModal.status === 'error' && 'Verification Failed'}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-normal">
                  {attendanceModal.message}
                </p>
              </div>

              {(attendanceModal.status === 'gps' || attendanceModal.status === 'api') && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">
                  This may take a moment to ensure geofencing accuracy.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {(attendanceModal.status === 'success' || attendanceModal.status === 'error') && (
              <button
                onClick={() => setAttendanceModal(prev => ({ ...prev, show: false }))}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition cursor-pointer text-white ${
                  attendanceModal.status === 'success' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ isActiveSession, hasCheckedIn, large = false }) {
  const isComplete = hasCheckedIn && !isActiveSession;
  const label = isActiveSession ? "Currently Clocked In" : isComplete ? "Shift Completed" : "Not Checked In";
  const classes = isActiveSession
    ? "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300";

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border font-extrabold ${classes} ${
        large ? "px-4 py-2 text-sm" : "px-4 py-2 text-xs"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isActiveSession ? "bg-emerald-500" : isComplete ? "bg-indigo-500" : "bg-slate-400"
        }`}
      />
      {label}
    </span>
  );
}

function TimeTile({ icon, label, time, caption, tone, divided = false }) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300"
      : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-300";

  return (
    <div
      className={`flex items-center gap-4 p-6 ${
        divided ? "border-t border-slate-200 dark:border-slate-800 sm:border-l sm:border-t-0" : ""
      }`}
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${toneClass}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-slate-600 dark:text-slate-300">{label}</p>
        <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">{time}</p>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{caption}</p>
      </div>
    </div>
  );
}

function AttendanceButton({ action, disabled, onClick, loading }) {
  const isCheckIn = action === "checkIn";
  const Icon = loading ? Loader2 : (isCheckIn ? ArrowRightToLine : ArrowLeftFromLine);
  const label = isCheckIn ? "Check In" : "Check Out";
  const enabledClass = isCheckIn
    ? "border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-emerald-900/10 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-950/20"
    : "border-indigo-200 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-indigo-900/10 dark:border-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-950/20";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-40 items-center justify-center gap-2 rounded-full border bg-white text-sm font-extrabold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none dark:bg-slate-900 dark:disabled:border-slate-800 dark:disabled:bg-slate-950/30 ${enabledClass}`}
    >
      <Icon size={18} className={loading ? "animate-spin text-indigo-650 dark:text-indigo-400" : ""} />
      {loading ? "Processing..." : label}
    </button>
  );
}
