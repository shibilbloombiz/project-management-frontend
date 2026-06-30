import React, { useMemo } from 'react';
import AttendanceCalendarCell from './AttendanceCalendarCell';
import { getWeekdayPadding, getDaysInMonth, WEEKDAYS } from '../utils/calendarUtils';

export default function AttendanceCalendar({ month, year, calendarData, onSelectDate }) {
  const cells = useMemo(() => {
    const list = [];
    const padding = getWeekdayPadding(year, month);
    
    // Add empty padding cells for initial weekday alignment
    for (let i = 0; i < padding; i++) {
      list.push(null);
    }
    
    // Map dates in month
    const totalDays = getDaysInMonth(year, month);
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const formattedDayNum = String(dayNum).padStart(2, '0');
      const formattedMonthNum = String(month).padStart(2, '0');
      const ymd = `${year}-${formattedMonthNum}-${formattedDayNum}`;
      
      const dayData = calendarData.find((c) => c.date === ymd) || {
        date: ymd,
        dayNumber: dayNum,
        status: 'None',
        isLate: false,
        checkIn: '',
        checkOut: '',
        duration: ''
      };
      
      list.push(dayData);
    }
    
    return list;
  }, [month, year, calendarData]);

  // Check if cell matches "Today" in system local date
  const isCellToday = (dateStr) => {
    const local = new Date();
    const y = local.getFullYear();
    const m = String(local.getMonth() + 1).padStart(2, '0');
    const d = String(local.getDate()).padStart(2, '0');
    return dateStr === `${y}-${m}-${d}`;
  };

  return (
    <div className="w-full space-y-2 text-left">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 py-0.5">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-0.5">
            {day}
          </div>
        ))}
      </div>

      {/* Grid cells */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 select-none">
        {cells.map((cell, index) => (
          <AttendanceCalendarCell
            key={cell ? cell.date : `padding-${index}`}
            day={cell}
            isToday={cell ? isCellToday(cell.date) : false}
            onClick={onSelectDate}
          />
        ))}
      </div>
    </div>
  );
}
