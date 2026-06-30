/**
 * Utility functions for calendar calculations.
 */

/**
 * Returns the number of days in a given month of a year.
 * Handles leap years correctly.
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Returns weekday index of the first day of the month aligned to:
 * 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
 */
export function getWeekdayPadding(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const day = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Map so that 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
  return day === 0 ? 6 : day - 1;
}

/**
 * Returns standard 3-letter month abbreviations.
 */
export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Returns standard weekday abbreviations.
 */
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Generates an array of years around the current year for dropdown selection.
 */
export function getYearList(currentYear = new Date().getFullYear()) {
  const list = [];
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    list.push(i);
  }
  return list;
}
