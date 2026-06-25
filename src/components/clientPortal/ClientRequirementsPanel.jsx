import React, { useState } from 'react';
import { ClipboardList, ChevronDown, ChevronUp, User, Calendar, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { clientPortalHelpers } from '../../utils/clientPortalHelpers';

export default function ClientRequirementsPanel({ requirements }) {
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      case 'Rejected': return 'bg-red-50 border-red-100 text-red-650';
      case 'In Progress': return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'Delivered': return 'bg-indigo-50 border-indigo-100 text-indigo-755';
      default: return 'bg-amber-50 border-amber-100 text-amber-650'; // Pending Review
    }
  };

  const filtered = requirements.filter(req => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return req.status === 'Pending Review';
    return req.status === filter;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
          <ClipboardList size={14} className="mr-1.5 text-indigo-500" />
          Proposals & Scope Changes ({requirements.length})
        </h3>
        
        {/* Filters */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[10px] font-bold text-slate-500 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="In Progress">In Dev</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-400 font-semibold">
          <ClipboardList size={22} className="mx-auto text-slate-300 mb-2" />
          <p>No requirements or scope proposals found.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {filtered.map((req, idx) => {
            const reqId = req._id || req.id || idx;
            const isExpanded = expandedId === reqId;
            const createdBy = req.createdBy || 'Client';

            return (
              <div 
                key={reqId} 
                className="border border-slate-150 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(reqId)}
                  className="w-full p-4 flex items-center justify-between bg-slate-50/30 text-xs text-left cursor-pointer font-bold"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-slate-900 block truncate max-w-[200px] sm:max-w-md">{req.title}</span>
                    <span className="text-[9px] text-slate-450 mt-0.5 block">{req.category} | Proposed by {createdBy}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2.5 flex-shrink-0">
                    <span className={`px-2 py-0.5 border text-[9px] font-black rounded-lg uppercase tracking-wider ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                    {isExpanded ? <ChevronUp size={13} className="text-slate-450" /> : <ChevronDown size={13} className="text-slate-455" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-slate-100 text-[11px] leading-relaxed text-slate-600 font-semibold space-y-3">
                    <div className="space-y-1 text-left">
                      <span className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-400">Description</span>
                      <p className="text-slate-650">{req.description || 'No detailed description provided.'}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-50 font-bold text-slate-500">
                      <div>
                        <span className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-400">Est. Cost</span>
                        <span className="text-slate-800 flex items-center mt-0.5"><DollarSign size={12} className="text-slate-450 mr-0.5 shrink-0" /> {req.estimatedCost ? `${req.estimatedCost.toLocaleString()}` : 'TBD'}</span>
                      </div>
                      <div>
                        <span className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-400">Timeline Impact</span>
                        <span className="text-slate-800 flex items-center mt-0.5"><Clock size={12} className="text-slate-450 mr-1 shrink-0" /> {req.timelineImpact || 'TBD'}</span>
                      </div>
                      <div>
                        <span className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-400">Proposed date</span>
                        <span className="text-slate-805 flex items-center mt-0.5"><Calendar size={12} className="text-slate-450 mr-1 shrink-0" /> {clientPortalHelpers.formatDate(req.createdAt)}</span>
                      </div>
                      <div>
                        <span className="block text-[8.5px] uppercase font-extrabold tracking-widest text-slate-400">Priority level</span>
                        <span className="text-red-650 block mt-0.5">{req.priority || 'Medium'}</span>
                      </div>
                    </div>

                    {req.adminNotes && (
                      <div className="p-3 bg-indigo-50/30 border border-indigo-50 rounded-xl space-y-1 text-left">
                        <span className="block text-[8.5px] uppercase font-extrabold tracking-widest text-indigo-650">Admin / Lead response</span>
                        <p className="text-indigo-900">{req.adminNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
