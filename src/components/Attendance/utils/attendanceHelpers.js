/**
 * Helper utilities for rendering attendance statuses and durations.
 */

export const STATUS_MAP = {
  Present: {
    label: 'Present',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
    dot: 'bg-emerald-500',
    hover: 'hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40',
  },
  Absent: {
    label: 'Absent',
    bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
    dot: 'bg-rose-500',
    hover: 'hover:bg-rose-100/50 dark:hover:bg-rose-950/40',
  },
  'Half Day': {
    label: 'Half Day',
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
    dot: 'bg-amber-500',
    hover: 'hover:bg-amber-100/50 dark:hover:bg-amber-950/40',
  },
  Leave: {
    label: 'Leave',
    bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
    dot: 'bg-blue-500',
    hover: 'hover:bg-blue-100/50 dark:hover:bg-blue-950/40',
  },
  Holiday: {
    label: 'Holiday / Weekend',
    bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800',
    dot: 'bg-slate-450',
    hover: 'hover:bg-slate-150/40 dark:hover:bg-slate-800/60',
  },
  Future: {
    label: 'Future Date',
    bg: 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-900/20 dark:text-slate-650 dark:border-slate-800/10',
    dot: 'bg-slate-200 dark:bg-slate-800',
    hover: 'cursor-not-allowed opacity-50',
  },
  None: {
    label: 'No Record',
    bg: 'bg-white text-slate-400 border-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-850',
    dot: 'bg-slate-200 dark:bg-slate-800',
    hover: 'hover:bg-slate-50 dark:hover:bg-slate-850',
  }
};

/**
 * Returns color classes and labels based on status.
 */
export function getStatusConfig(status) {
  return STATUS_MAP[status] || STATUS_MAP.None;
}

/**
 * Normalizes YYYY-MM-DD date to a readable "Day Month Year" string.
 */
export function formatYmd(ymdString) {
  if (!ymdString) return '';
  const date = new Date(ymdString);
  if (isNaN(date.getTime())) return ymdString;
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
