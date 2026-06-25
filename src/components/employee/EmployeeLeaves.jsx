import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { Calendar, FileText, Plus, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function EmployeeLeaves({ token, user }) {
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLeaves = async () => {
    setFetching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaves`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Filter to display only this employee's requests
        const myLeaves = data.data.filter(l => l.email?.toLowerCase() === user?.email?.toLowerCase());
        setLeaves(myLeaves);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (token && user?.email) {
      fetchLeaves();
    }
  }, [token, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before or equal to the end date.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the leave.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          reason: reason.trim(),
          startDate,
          endDate
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Leave request submitted successfully!');
        setReason('');
        setStartDate('');
        setEndDate('');
        fetchLeaves();
      } else {
        setError(data.message || 'Failed to submit leave request.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-left text-slate-100 font-sans space-y-6">
      
      {/* Header Banner */}
      <div className="flex items-center space-x-2.5 mb-2">
        <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <Calendar size={24} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-white">Leave Requests</h2>
          <p className="text-xs text-slate-400">Request time off and monitor approval responses from your project lead.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        
        {/* Create Request Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-3xl p-6 space-y-5 text-xs font-semibold text-slate-350">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-700/50 pb-2">
            Submit New Request
          </span>

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-950/40 border border-red-800/50 text-red-300 rounded-xl">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-red-450" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start space-x-2 p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 rounded-xl">
              <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5 text-emerald-450" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setError(''); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setError(''); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
              Reason / Justification
            </label>
            <div className="relative">
              <span className="absolute top-2.5 left-3 text-slate-500">
                <FileText size={14} />
              </span>
              <textarea
                rows={3}
                placeholder="Brief description of the reason for your time off..."
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(''); }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-indigo-950/20"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Submitting request...</span>
              </>
            ) : (
              <>
                <Plus size={13} />
                <span>Submit Leave Request</span>
              </>
            )}
          </button>
        </form>

        {/* History / Status List */}
        <div className="md:col-span-3 bg-slate-800/60 border border-slate-700/50 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              My Leave History ({leaves.length})
            </span>
            {fetching && <Loader2 size={12} className="text-indigo-400 animate-spin" />}
          </div>

          {leaves.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-[11px] font-semibold">
              No leave requests registered.
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {leaves.map((leave) => (
                <div key={leave.id || leave._id} className="p-4 bg-slate-900/40 border border-slate-700/35 rounded-2xl flex items-start justify-between gap-3 text-xs leading-relaxed">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-350">
                      <span>{leave.startDate}</span>
                      <span className="text-slate-600">→</span>
                      <span>{leave.endDate}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-medium break-words leading-snug">
                      {leave.reason}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 border text-[9px] font-black rounded-lg uppercase tracking-wider flex items-center space-x-1 flex-shrink-0 ${
                    leave.status === 'Approved'
                      ? 'bg-emerald-500/10 border-emerald-550/20 text-emerald-400'
                      : leave.status === 'Declined'
                        ? 'bg-red-500/10 border-red-550/20 text-red-450'
                        : 'bg-amber-500/10 border-amber-550/20 text-amber-400'
                  }`}>
                    {leave.status === 'Approved' && <CheckCircle2 size={10} className="mr-0.5" />}
                    {leave.status === 'Declined' && <XCircle size={10} className="mr-0.5" />}
                    <span>{leave.status}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>

    </div>
  );
}
