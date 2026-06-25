import React from 'react';
import { FileDown, FileText, Download, Check } from 'lucide-react';
import { clientPortalHelpers } from '../../utils/clientPortalHelpers';

export default function ClientFilesPanel({ files }) {
  if (!files || files.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-slate-400 font-semibold py-12">
        <FileText size={24} className="mx-auto text-slate-300 mb-2" />
        <p>No project documents shared yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
        <FileDown size={14} className="mr-1.5 text-indigo-500" />
        Project Resources & Shared Files
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
        {files.map((file, idx) => (
          <div 
            key={idx} 
            className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-slate-300 transition-all text-xs font-semibold"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <span className="p-2.5 bg-indigo-500/5 text-indigo-500 rounded-xl">
                <FileText size={16} className="shrink-0" />
              </span>
              <div className="min-w-0">
                <span className="text-slate-800 font-bold block truncate max-w-[150px] sm:max-w-[200px]">{file.name}</span>
                <span className="text-[9px] text-slate-450 block mt-0.5">
                  {file.size || '1.5 MB'} | Uploaded by {file.uploadedBy || 'PM'}
                </span>
              </div>
            </div>

            <button
              onClick={() => alert(`Downloading shared file: ${file.name}`)}
              className="p-2 bg-white hover:bg-indigo-50 text-slate-450 hover:text-indigo-650 border border-slate-200 hover:border-indigo-200 rounded-xl cursor-pointer shadow-sm transition-all"
              title="Download Shared Resource"
            >
              <Download size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
