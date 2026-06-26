import React, { useState } from 'react';
import { Briefcase, Loader2 } from 'lucide-react';

export default function ProjectDeploymentCard({ deployedUrl, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [urlInput, setUrlInput] = useState(deployedUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(urlInput.trim());
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
          <Briefcase size={14} className="mr-2 text-indigo-500" /> Deployment Gateway & Live Demo
        </h3>
      </div>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Deployment URL</label>
            <input
              type="url"
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-805 dark:text-white"
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center gap-1"
            >
              {isSaving ? <Loader2 size={11} className="animate-spin" /> : null}
              <span>Save Link</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUrlInput(deployedUrl || '');
                setIsEditing(false);
              }}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-505 dark:text-slate-400 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-semibold">
            Provide a URL link (e.g. Netlify, Vercel, or custom domain) for the client to view the live product demo directly on their dashboard portal.
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-xl text-xs space-y-2 text-left">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 dark:text-slate-550 font-medium">Live Gateway Link:</span>
              {deployedUrl ? (
                <a
                  href={deployedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline font-bold break-all flex items-center gap-1 mt-0.5"
                >
                  {deployedUrl}
                </a>
              ) : (
                <span className="text-slate-400 italic font-semibold">Not active yet</span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setUrlInput(deployedUrl || '');
              setIsEditing(true);
            }}
            className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
          >
            {deployedUrl ? "Modify Link" : "Configure Deployment"}
          </button>
        </div>
      )}
    </div>
  );
}
