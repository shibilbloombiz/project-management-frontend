import React, { useState } from 'react';
import { ListPlus, Loader2, Clipboard } from 'lucide-react';

export default function ClientRequirementForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Feature');
  const [cost, setCost] = useState('');
  const [timeline, setTimeline] = useState('');
  const [impact, setImpact] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: desc.trim(),
        priority,
        category,
        estimatedCost: cost ? Number(cost) : 0,
        timelineImpact: timeline.trim(),
        businessImpact: impact.trim()
      });
      // Reset
      setTitle('');
      setDesc('');
      setPriority('Medium');
      setCategory('Feature');
      setCost('');
      setTimeline('');
      setImpact('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
        <ListPlus size={14} className="mr-1.5 text-indigo-500" />
        Propose Scope Change Request
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-350">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Proposal Title</label>
            <input
              type="text"
              placeholder="E.g. Custom Reports PDF Export..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-1 focus:ring-indigo-400 focus:border-transparent font-bold"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Proposal Type</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="Feature">New Feature Request</option>
              <option value="Bugfix">UI Refinement / Bugfix</option>
              <option value="Integration">Third-Party Integration</option>
              <option value="Documentation">Additional Documentation</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Detailed Description</label>
          <textarea
            rows={3}
            placeholder="Outline details, design links, user story specifications..."
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-1 focus:ring-indigo-400 resize-none font-sans font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Target Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Suggested Cost (₹)</label>
            <input
              type="number"
              placeholder="e.g. 1500"
              value={cost}
              onChange={e => setCost(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Estimated Timeline</label>
            <input
              type="text"
              placeholder="e.g. +3 Days"
              value={timeline}
              onChange={e => setTimeline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-750 text-white font-bold rounded-xl cursor-pointer shadow transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Saving proposal details...</span>
            </>
          ) : (
            <span>Submit Proposal for PM Review</span>
          )}
        </button>
      </form>
    </div>
  );
}
