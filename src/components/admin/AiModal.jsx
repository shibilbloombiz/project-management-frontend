import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AiModal({ onClose }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h3 className="text-md font-extrabold font-display text-slate-800 flex items-center">
            <Sparkles size={16} className="text-indigo-600 mr-2" /> Syncra AI System Co-pilot
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2 text-xs font-semibold text-slate-600 leading-relaxed text-left">
          <p>Hi Sarah, I am ready to assist. You can ask me to run queries on tenants, draft security reports, or update sub-plans configurations.</p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-500">
            <strong>Suggested prompt:</strong> "Show a summary chart of suspended accounts details during Q2."
          </div>
        </div>
        <div className="flex space-x-2 pt-2 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
          >
            Dismiss
          </button>
          <button 
            onClick={() => alert('AI Prompt submitted (Mock Response: Query running...)')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Execute Command
          </button>
        </div>
      </div>
    </div>
  );
}
