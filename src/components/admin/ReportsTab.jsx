import React from 'react';
import { Cpu, Layers } from 'lucide-react';

export default function ReportsTab() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* System resources */}
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 text-left">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-display mb-4 flex items-center">
            <Cpu size={14} className="text-indigo-500 mr-2" /> Global System Resource Usage
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Central Core CPU Load</span>
                <span>22% Capacity</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '22%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Global Node Memory Load</span>
                <span>45% Capacity</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Database Node IOPS</span>
                <span>12ms Latency</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 text-left">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-display mb-4 flex items-center">
            <Layers size={14} className="text-indigo-500 mr-2" /> Global Audit Activity Logs
          </h4>
          <div className="space-y-3 max-h-[140px] overflow-y-auto text-xs font-semibold text-slate-600">
            <div className="flex justify-between items-start border-b border-slate-200 pb-2">
              <p>Tenant <strong className="text-slate-800">Umbrella Corp</strong> upgraded status to Enterprise SaaS Package.</p>
              <span className="text-[9px] text-slate-400 shrink-0 ml-4">12 mins ago</span>
            </div>
            <div className="flex justify-between items-start border-b border-slate-200 pb-2">
              <p>User <strong className="text-slate-800">Peter Gibbons</strong> checked-in shift via IP/location verification.</p>
              <span className="text-[9px] text-slate-400 shrink-0 ml-4">42 mins ago</span>
            </div>
            <div className="flex justify-between items-start border-b border-slate-200 pb-2">
              <p>Security Node <strong className="text-slate-800">Auth0-OTP</strong> dispatched login codes to admin registry.</p>
              <span className="text-[9px] text-slate-400 shrink-0 ml-4">1.2 hrs ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Big chart graphic spacer */}
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 text-left">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-display mb-4">Monthly Revenue Accumulation Curve</h4>
        <div className="h-48 flex items-end justify-between px-6 pt-6 bg-white border border-slate-200 rounded-lg">
          {[35, 42, 50, 48, 55, 62, 70, 68, 75, 84].map((h, i) => (
            <div key={i} className="w-8 flex flex-col items-center gap-2">
              <span className="text-[9px] font-bold text-slate-400">${h}k</span>
              <div className="w-full bg-indigo-500 rounded-t-md hover:bg-brand-purple transition-all cursor-pointer" style={{ height: `${h * 1.5}px` }}></div>
              <span className="text-[9px] font-bold text-slate-400 py-1 uppercase">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
