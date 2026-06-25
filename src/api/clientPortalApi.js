import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/client-share`;

const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API request failed.');
  return json;
};

export const clientPortalApi = {
  fetchDashboard: (token) => fetch(`${BASE_URL}/${token}/dashboard`).then(handleResponse),
  fetchBilling: (token) => fetch(`${BASE_URL}/${token}/billing`).then(handleResponse),
  fetchRequirements: (token) => fetch(`${BASE_URL}/${token}/requirements`).then(handleResponse),
  submitRequirement: (token, payload) => fetch(`${BASE_URL}/${token}/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleResponse),
  fetchFiles: (token) => fetch(`${BASE_URL}/${token}/files`).then(handleResponse),
  fetchMilestones: (token) => fetch(`${BASE_URL}/${token}/milestones`).then(handleResponse),
  fetchMessages: (token) => fetch(`${BASE_URL}/${token}/messages`).then(handleResponse),
  submitMessage: (token, payload) => fetch(`${BASE_URL}/${token}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleResponse),
  fetchActivity: (token) => fetch(`${BASE_URL}/${token}/activity`).then(handleResponse)
};
