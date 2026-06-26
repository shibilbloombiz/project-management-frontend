import React, { useState } from 'react';
import { ExternalLink, Globe, RefreshCw, AlertCircle } from 'lucide-react';

export default function ClientLiveProductCard({ deployedUrl }) {
  const [key, setKey] = useState(0);

  const handleReload = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Glossy highlight line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>

      {/* Browser Header Bar */}
      <div className="bg-slate-950/80 px-4 py-3.5 flex items-center justify-between border-b border-slate-850 gap-4">
        {/* Browser Dots */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-lg mx-auto bg-slate-900/90 border border-slate-800/80 rounded-xl px-3 py-1.5 flex items-center space-x-2 text-slate-400 font-semibold text-xs min-w-0 shadow-inner">
          <Globe size={13} className="text-indigo-400 shrink-0" />
          <span className="truncate select-all text-slate-300 font-sans tracking-wide flex-1 text-left">
            {deployedUrl}
          </span>
          <button
            onClick={handleReload}
            className="text-slate-500 hover:text-slate-350 cursor-pointer p-0.5 rounded transition-colors shrink-0"
            title="Reload preview"
          >
            <RefreshCw size={11} />
          </button>
        </div>

        {/* Action Button */}
        <div className="shrink-0 relative">
          {/* Pulsing backdrop ring for micro-animation */}
          <span className="absolute -inset-1 rounded-xl bg-indigo-500/20 blur-sm animate-pulse"></span>
          <a
            href={deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative px-3 py-1.5 bg-indigo-600 hover:bg-indigo-555 text-white font-extrabold text-[10px] sm:text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
          >
            <span>Launch Live Site</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Browser Canvas Area */}
      <div className="relative aspect-video w-full bg-slate-950">
        <iframe
          key={key}
          src={deployedUrl}
          title="Live Product Sandbox"
          className="w-full h-full border-none bg-slate-900"
          sandbox="allow-scripts allow-same-origin allow-forms"
          loading="lazy"
        />

        {/* Floating warning badge if preview block arises */}
        <div className="absolute bottom-4 right-4 max-w-xs sm:max-w-md bg-slate-900/95 border border-slate-800 p-3.5 rounded-2xl shadow-xl backdrop-blur-md flex items-start gap-2.5 text-[10px] sm:text-xs text-slate-300 font-semibold leading-relaxed animate-fade-in pointer-events-auto">
          <AlertCircle size={15} className="text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-left">
            <span className="font-extrabold text-slate-100 block mb-0.5">Preview not loading?</span>
            Browser security policies (CSP) may prevent some sites from embedding. Use the <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-350 underline font-bold cursor-pointer">Launch Live Site</a> action button to open the application in a new tab.
          </div>
        </div>
      </div>
    </div>
  );
}
