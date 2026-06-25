import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import ClientProjectAccessPage from '../pages/client/ClientProjectAccessPage';

export default function ClientShareGateway({ accessKey, onBackToLanding }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessKey) {
      setError('Invalid access token key.');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/api/projects/share/${accessKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProject(data.data);
        } else {
          setError(data.message || 'Project not found or link has expired.');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to connect to server. Ensure port 5000 is active.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accessKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-left font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-8 relative z-10">
          <div className="py-12 text-center text-slate-400 font-semibold text-xs flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-650 border-t-transparent animate-spin"></div>
            <span>Fetching project access configurations...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-left font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-8 relative z-10 text-center space-y-4">
          <div className="inline-flex p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 shadow-sm mx-auto">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-md font-extrabold text-slate-805">Access Error</h3>
          <p className="text-xs text-slate-450 font-semibold max-w-sm mx-auto">{error || 'Project link has expired.'}</p>
          <button
            onClick={onBackToLanding}
            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition-colors mx-auto block"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ClientProjectAccessPage
      token={accessKey}
      onBackToLanding={onBackToLanding}
    />
  );
}
