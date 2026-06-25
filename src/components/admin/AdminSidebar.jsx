import React from 'react';
import { Building, CreditCard, Users, DollarSign, Trash2, BarChart3, LogOut } from 'lucide-react';

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  setSelectedCompany, 
  companiesCount, 
  plansCount, 
  usersCount, 
  paymentsCount, 
  trashCompaniesCount, 
  onLogout 
}) {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedCompany(null);
  };

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-6 flex flex-col justify-between shrink-0 text-left">
      
      <div className="space-y-6">
        
        {/* Sidebar Section 1 */}
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3 font-display px-2">Workspace</span>
          <div className="space-y-1">
            <button 
              onClick={() => handleTabClick('companies')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'companies' 
                  ? 'bg-indigo-50/60 text-indigo-600 shadow-sm border-l-4 border-indigo-600 pl-2' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Building size={16} />
              <span>Companies Registry</span>
              <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{companiesCount}</span>
            </button>
            <button 
              onClick={() => handleTabClick('subscriptions')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'subscriptions' 
                  ? 'bg-indigo-50/60 text-indigo-600 shadow-sm border-l-4 border-indigo-600 pl-2' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <CreditCard size={16} />
              <span>Subscriptions Info</span>
              <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{plansCount}</span>
            </button>
            <button 
              onClick={() => handleTabClick('users')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users' 
                  ? 'bg-indigo-50/60 text-indigo-600 shadow-sm border-l-4 border-indigo-600 pl-2' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Users size={16} />
              <span>Platform Users</span>
              <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{usersCount}</span>
            </button>
            <button 
              onClick={() => handleTabClick('payments')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'payments' 
                  ? 'bg-indigo-50/60 text-indigo-600 shadow-sm border-l-4 border-indigo-600 pl-2' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <DollarSign size={16} />
              <span>Payment Ledger</span>
              <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{paymentsCount}</span>
            </button>
            <button 
              onClick={() => handleTabClick('trash')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'trash' 
                  ? 'bg-indigo-50/60 text-indigo-600 shadow-sm border-l-4 border-indigo-600 pl-2' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Trash2 size={16} className={trashCompaniesCount > 0 ? 'text-red-500 animate-pulse' : ''} />
              <span>Trash Registry</span>
              <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{trashCompaniesCount}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Section 2 */}
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3 font-display px-2">Operations</span>
          <div className="space-y-1">
            <button 
              onClick={() => handleTabClick('reports')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reports' 
                  ? 'bg-indigo-50/60 text-indigo-600 shadow-sm border-l-4 border-indigo-600 pl-2' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <BarChart3 size={16} />
              <span>System Reports</span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer Area with active package tier & Logout */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <div className="p-3 bg-gradient-to-tr from-slate-50 to-indigo-50/50 rounded-xl border border-slate-200 text-left">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Enterprise Active</span>
          <span className="text-[11px] font-extrabold text-slate-800 font-display">System Administrator Node</span>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Log out Admin Node</span>
        </button>
      </div>

    </aside>
  );
}
