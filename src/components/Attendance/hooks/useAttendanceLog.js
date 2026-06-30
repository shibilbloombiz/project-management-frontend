import { useState, useEffect, useCallback } from 'react';
import { fetchAttendanceLog, fetchAttendanceDetail } from '../services/attendanceLogService';

export default function useAttendanceLog(token, employeeEmail = '', employeeId = '') {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [tempFilters, setTempFilters] = useState({ status: '', from: '', to: '' });
  
  // Data states
  const [calendar, setCalendar] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [statistics, setStatistics] = useState(null);
  
  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Drawer states
  const [drawerDate, setDrawerDate] = useState(null);
  const [dayDetail, setDayDetail] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState('');

  // Fetch log from backend
  const loadLog = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        month: currentMonth,
        year: currentYear,
        status: statusFilter,
        from: dateRange.from,
        to: dateRange.to,
        employeeId,
        email: employeeEmail
      };
      
      const res = await fetchAttendanceLog(token, params);
      if (res.success && res.data) {
        setCalendar(res.data.calendar || []);
        setAttendance(res.data.attendance || []);
        setSummary(res.data.summary || null);
        setStatistics(res.data.statistics || null);
      } else {
        setError('Failed to retrieve log details.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  }, [token, currentMonth, currentYear, statusFilter, dateRange, employeeEmail, employeeId]);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  // Next / Previous month navigators
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 1) {
        setCurrentYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 12) {
        setCurrentYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
  }, []);

  // Drawer handlers
  const handleOpenDrawer = useCallback(async (ymdString) => {
    setDrawerDate(ymdString);
    setIsDrawerOpen(true);
    setIsDrawerLoading(true);
    setDrawerError('');
    setDayDetail(null);
    
    try {
      const res = await fetchAttendanceDetail(token, ymdString, employeeId || employeeEmail);
      if (res.success && res.data) {
        setDayDetail(res.data);
      } else {
        setDrawerError('Unable to load day details.');
      }
    } catch (err) {
      console.error(err);
      setDrawerError('Error fetching day details.');
    } finally {
      setIsDrawerLoading(false);
    }
  }, [token, employeeId, employeeEmail]);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setDayDetail(null);
    setDrawerDate(null);
  }, []);

  // Filter application
  const handleApplyFilters = useCallback((filters) => {
    setStatusFilter(filters.status);
    setDateRange({ from: filters.from, to: filters.to });
  }, []);

  const handleResetFilters = useCallback(() => {
    setStatusFilter('');
    setDateRange({ from: '', to: '' });
    setTempFilters({ status: '', from: '', to: '' });
  }, []);

  return {
    currentMonth,
    currentYear,
    calendar,
    attendance,
    summary,
    statistics,
    isLoading,
    error,
    drawerDate,
    dayDetail,
    isDrawerOpen,
    isDrawerLoading,
    drawerError,
    tempFilters,
    setTempFilters,
    statusFilter,
    dateRange,
    handlePrevMonth,
    handleNextMonth,
    handleOpenDrawer,
    handleCloseDrawer,
    handleApplyFilters,
    handleResetFilters,
    retry: loadLog
  };
}
