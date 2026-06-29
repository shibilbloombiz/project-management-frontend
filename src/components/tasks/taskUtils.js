// Utility helpers for Task Manager module

export const parseTaskNote = (noteText) => {
  if (!noteText) {
    return {
      log: '',
      hours: '',
      progress: '0',
      blockers: '',
      needSupport: false,
    };
  }
  const logMatch = noteText.match(/\[Log\]\s*(.*?)(?=\. Spent:|$)/);
  const hoursMatch = noteText.match(/Spent:\s*(\d+)h/);
  const progressMatch = noteText.match(/Progress:\s*(\d+)%/);
  const blockersMatch = noteText.match(/Blockers:\s*(.*?)(?=\. Support:|$)/);
  const supportMatch = noteText.match(/Support:\s*(Yes|No)/);
  return {
    log: logMatch ? logMatch[1] : noteText,
    hours: hoursMatch ? hoursMatch[1] : '',
    progress: progressMatch ? progressMatch[1] : '0',
    blockers: blockersMatch ? blockersMatch[1] : '',
    needSupport: supportMatch ? supportMatch[1] === 'Yes' : false,
  };
};

export const formatTaskNote = (log, hours, progress, blockers, needSupport) => {
  return `[Log] ${log || 'Work update'}. Spent: ${hours || '0'}h. Progress: ${progress || '0'}%. Blockers: ${blockers || 'None'}. Support: ${needSupport ? 'Yes' : 'No'}.`;
};

export const getPriorityColor = (priority = 'Medium') => {
  switch (priority) {
    case 'High':
      return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30';
    case 'Medium':
      return 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30';
    case 'Low':
    default:
      return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
  }
};

export const getStatusColor = (status = 'Planning') => {
  switch (status) {
    case 'Done':
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30';
    case 'QA':
    case 'Review':
    case 'QA / Review':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/30';
    case 'Dev':
    case 'In Progress':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30';
    case 'Planning':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
  }
};
