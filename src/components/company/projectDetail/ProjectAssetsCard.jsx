import React, { useRef, useState } from 'react';
import { FileText, Upload, Loader2 } from 'lucide-react';

export default function ProjectAssetsCard({ description, documents = [], onUpload }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Requirements & Documents description */}
      <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
          <FileText size={14} className="mr-2 text-indigo-500" />Requirements & Description
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-left">
          {description || "No description specified for this project."}
        </p>
        <div className="pt-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[11px] font-bold rounded-xl cursor-pointer shadow-sm transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={12} />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Project Assets & Docs list */}
      <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-805 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-805 pb-3">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
            <FileText size={14} className="mr-2 text-indigo-500" /> Project Assets & Docs
          </h3>
        </div>
        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
          {documents.map((doc, idx) => (
            <a
              href={doc.url || '#'}
              key={idx}
              download={doc.name}
              className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-indigo-300 dark:hover:border-indigo-550 rounded-xl transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs"
            >
              <div className="flex items-center space-x-2.5">
                <FileText size={14} className="text-indigo-500 shrink-0" />
                <span className="truncate max-w-[200px]">{doc.name}</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Download</span>
            </a>
          ))}
          {documents.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium text-center py-6">No assets uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
