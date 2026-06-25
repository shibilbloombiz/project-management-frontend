import { useState, useEffect, useCallback } from 'react';
import { clientPortalApi } from '../api/clientPortalApi';

export function useClientProjectPortal(token) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [dashboard, setDashboard] = useState(null);
  const [billing, setBilling] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [files, setFiles] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState([]);

  const refreshAll = useCallback(async () => {
    if (!token) return;
    try {
      const [dashRes, billRes, reqRes, filesRes, milesRes, actRes] = await Promise.all([
        clientPortalApi.fetchDashboard(token),
        clientPortalApi.fetchBilling(token),
        clientPortalApi.fetchRequirements(token),
        clientPortalApi.fetchFiles(token),
        clientPortalApi.fetchMilestones(token),
        clientPortalApi.fetchActivity(token)
      ]);

      setDashboard(dashRes.data);
      setBilling(billRes.data);
      setRequirements(reqRes.data);
      setFiles(filesRes.data);
      setMilestones(milesRes.data);
      setActivity(actRes.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sync client portal workspace details.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await clientPortalApi.fetchMessages(token);
      setMessages(res.data);
    } catch (e) {
      console.error('Messages sync failed:', e);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      refreshAll();
      loadMessages();
    }
  }, [token, refreshAll, loadMessages]);

  // Polling for messages
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [token, loadMessages]);

  const proposeRequirement = async (payload) => {
    try {
      await clientPortalApi.submitRequirement(token, payload);
      await refreshAll();
    } catch (err) {
      alert(err.message || 'Failed to submit requirement proposal.');
      throw err;
    }
  };

  const sendMessage = async (receiver, text, imageUrl) => {
    try {
      const res = await clientPortalApi.submitMessage(token, { receiver, text, imageUrl });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      alert(err.message || 'Message failed to send.');
      throw err;
    }
  };
  return {
    loading,
    error,
    dashboard,
    billing,
    requirements,
    files,
    milestones,
    messages,
    activity,
    proposeRequirement,
    sendMessage,
    refresh: refreshAll
  };
}
export default useClientProjectPortal;
