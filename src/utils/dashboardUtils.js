export const getToken = () => sessionStorage.getItem('syncra_token');

export const authHeaders = (json = false) => ({
  ...(json ? { 'Content-Type': 'application/json' } : {}),
  Authorization: `Bearer ${getToken()}`,
});

function getConsecutiveAbsences(employeeEmail, attendanceList, leavesList) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let consecutiveCount = 0;
  let dayOffset = 1; // start from yesterday
  
  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const isoMatch = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    }
    return new Date(dateStr);
  };

  while (dayOffset <= 30) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - dayOffset);
    checkDate.setHours(0, 0, 0, 0);
    
    const isWeekend = checkDate.getDay() === 0 || checkDate.getDay() === 6;
    if (isWeekend) {
      dayOffset++;
      continue;
    }
    
    // Check if on approved leave
    const onLeave = leavesList.some(l => {
      if (l.email.toLowerCase() !== employeeEmail.toLowerCase() || l.status !== 'Approved') return false;
      const start = parseDateStr(l.startDate);
      const end = parseDateStr(l.endDate);
      if (!start || !end) return false;
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return checkDate >= start && checkDate <= end;
    });
    
    if (onLeave) {
      consecutiveCount = 0;
      dayOffset++;
      continue;
    }
    
    // Check if check-in exists
    const hasCheckedIn = attendanceList.some(a => {
      if (a.email.toLowerCase() !== employeeEmail.toLowerCase()) return false;
      const dbDate = parseDateStr(a.date);
      return dbDate &&
             dbDate.getFullYear() === checkDate.getFullYear() &&
             dbDate.getMonth() === checkDate.getMonth() &&
             dbDate.getDate() === checkDate.getDate();
    });
    
    if (hasCheckedIn) {
      break;
    } else {
      consecutiveCount++;
      if (consecutiveCount >= 3) {
        return consecutiveCount;
      }
    }
    dayOffset++;
  }
  return consecutiveCount;
}

export function buildNotifications({ leaves = [], projects = [], messages = [], employees = [], attendance = [] }) {
  return [
    ...leaves
      .filter((leave) => leave.status === 'Pending')
      .map((leave) => ({
        id: `leave_${leave._id || leave.id}`,
        type: 'leave_request',
        title: 'Pending Leave Request',
        desc: `${leave.employeeName || leave.employeeEmail} requested leave from ${leave.startDate} to ${leave.endDate}`,
        tab: 'employees',
      })),

    ...projects.flatMap((project) =>
      (project.clientRequirements || [])
        .filter((req) => req.status === 'Pending Review')
        .map((req) => ({
          id: `scope_${req.id || req._id}`,
          type: 'client_scope',
          title: `Scope Proposed: ${project.name}`,
          desc: req.title || req.description || 'Client submitted a new requirement',
          tab: 'projects',
          project,
        }))
    ),

    ...messages
      .filter((msg) => msg.senderName?.toLowerCase?.().includes('client'))
      .map((msg) => ({
        id: `msg_${msg._id || msg.id || msg.createdAt}`,
        type: 'client_message',
        title: `Client Message: ${msg.senderName}`,
        desc: msg.text || 'Shared an attachment',
        tab: 'messages',
      })),

    ...employees
      .filter(emp => getConsecutiveAbsences(emp.email, attendance, leaves) >= 3)
      .map(emp => ({
        id: `absent_consec_${emp.email.toLowerCase()}`,
        type: 'absence_alert',
        title: 'Consecutive Absence Alert',
        desc: `${emp.name} has been absent for 3 or more consecutive workdays.`,
        tab: 'employees',
      })),
  ];
}
