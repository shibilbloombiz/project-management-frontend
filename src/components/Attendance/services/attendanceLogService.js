import { API_BASE_URL } from '../../../config';

/**
 * Service to interact with attendance log backend APIs.
 */

function buildQueryString(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

export async function fetchAttendanceLog(token, params = {}) {
  const url = `${API_BASE_URL}/api/attendance/log${buildQueryString(params)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to load attendance logs.');
  }
  return response.json();
}

export async function fetchAttendanceDetail(token, date, employeeId = '') {
  const query = employeeId ? `?employeeId=${employeeId}` : '';
  const url = `${API_BASE_URL}/api/attendance/log/${date}${query}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to load attendance day details.');
  }
  return response.json();
}

export async function fetchAttendanceSummary(token, params = {}) {
  const url = `${API_BASE_URL}/api/attendance/summary${buildQueryString(params)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to load attendance summary.');
  }
  return response.json();
}
