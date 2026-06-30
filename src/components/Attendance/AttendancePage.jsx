import React, { useState, useEffect } from 'react';
import useAttendanceLog from './hooks/useAttendanceLog';
import AttendanceCalendar from './components/AttendanceCalendar';
import AttendanceSummary from './components/AttendanceSummary';
import AttendanceLegend from './components/AttendanceLegend';
import AttendanceFilters from './components/AttendanceFilters';
import AttendanceDetailsDrawer from './components/AttendanceDetailsDrawer';
import AttendanceEmpty from './components/AttendanceEmpty';
import AttendanceSkeleton from './components/AttendanceSkeleton';
import { MONTHS } from './utils/calendarUtils';
import { CalendarDays, Filter, ChevronLeft, ChevronRight, ArrowLeft, FileDown } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function AttendancePage({ 
  token, 
  employeeEmail = '', 
  employeeId = '', 
  onBack, 
  isAdminView = false 
}) {
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState(employeeEmail);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId);
  const [allEmployees, setAllEmployees] = useState([]);

  useEffect(() => {
    setSelectedEmployeeEmail(employeeEmail);
    setSelectedEmployeeId(employeeId);
  }, [employeeEmail, employeeId]);

  useEffect(() => {
    if (isAdminView && token) {
      fetch(`${API_BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setAllEmployees(res.data);
          // If no specific employeeEmail was passed down, select the first one
          if (!employeeEmail && res.data.length > 0) {
            setSelectedEmployeeEmail(res.data[0].email);
            setSelectedEmployeeId(res.data[0]._id || res.data[0].id);
          }
        }
      })
      .catch(err => console.error('Error fetching employees roster:', err));
    }
  }, [isAdminView, token, employeeEmail]);

  const {
    currentMonth,
    currentYear,
    calendar,
    attendance,
    summary,
    isLoading,
    error,
    dayDetail,
    isDrawerOpen,
    isDrawerLoading,
    drawerError,
    tempFilters,
    setTempFilters,
    handlePrevMonth,
    handleNextMonth,
    handleOpenDrawer,
    handleCloseDrawer,
    handleApplyFilters,
    handleResetFilters,
    retry
  } = useAttendanceLog(token, selectedEmployeeEmail, selectedEmployeeId);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDownloadPDF = async () => {
    try {
      const url = `${API_BASE_URL}/api/employees/${selectedEmployeeId}/attendance/report`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `attendance_report_${selectedEmployeeId}.pdf`;
      a.click();
    } catch (e) {
      console.error(e);
      alert('Failed to download PDF report.');
    }
  };

  return (
    <div className="space-y-6 text-left pb-8 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer text-slate-600 dark:text-slate-350"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarDays size={20} className="text-indigo-650 shrink-0" />
              Attendance Log {isAdminView ? '(Admin View)' : ''}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
              View your daily attendance history.
            </p>
          </div>
        </div>

        {/* Month Selector & Filter Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdminView && allEmployees.length > 0 && (
            <select
              value={selectedEmployeeEmail}
              onChange={(e) => {
                const selectedEmp = allEmployees.find(emp => emp.email === e.target.value);
                if (selectedEmp) {
                  setSelectedEmployeeEmail(selectedEmp.email);
                  setSelectedEmployeeId(selectedEmp._id || selectedEmp.id);
                }
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              {allEmployees.map(emp => (
                <option key={emp.email} value={emp.email}>{emp.name}</option>
              ))}
            </select>
          )}
          {/* Previous / Next Month Navigator */}
          <div className="inline-flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 px-3 min-w-[90px] text-center">
              {MONTHS[currentMonth - 1]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Filter button */}
          <button
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition shadow-sm cursor-pointer ${
              filtersOpen 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-850'
            }`}
          >
            <Filter size={14} className="shrink-0" />
            Filters
          </button>

          {/* Download PDF button */}
          {selectedEmployeeId && (
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 dark:border-rose-900/40 dark:bg-rose-955/20 dark:text-rose-400 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <FileDown size={14} className="shrink-0" />
              Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Filters Expanded Component */}
      <AttendanceFilters
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        tempFilters={tempFilters}
        onChange={handleFilterChange}
        onApply={(f) => {
          handleApplyFilters(f);
          setFiltersOpen(false);
        }}
        onReset={handleResetFilters}
      />

      {/* Main Board */}
      {isLoading ? (
        <AttendanceSkeleton />
      ) : error ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
          <p className="text-xs font-bold text-slate-850 dark:text-white">Connection Error</p>
          <p className="text-xs text-rose-500 font-semibold">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : calendar.length === 0 ? (
        <AttendanceEmpty onReset={handleResetFilters} />
      ) : (
        <div className="space-y-6">
          {/* Calendar Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col items-center">
            <div className="w-full max-w-md">
              <AttendanceCalendar
                month={currentMonth}
                year={currentYear}
                calendarData={calendar}
                onSelectDate={handleOpenDrawer}
              />
            </div>
            <AttendanceLegend />
          </div>

          {/* Summary Panels */}
          <AttendanceSummary summary={summary} />
        </div>
      )}

      {/* Detail drawer */}
      <AttendanceDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        isLoading={isDrawerLoading}
        error={drawerError}
        detail={dayDetail}
      />
    </div>
  );
}
