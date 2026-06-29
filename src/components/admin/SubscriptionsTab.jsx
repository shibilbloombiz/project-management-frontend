import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Tooltip from '../Tooltip';

export default function SubscriptionsTab({ plans, companies, onEditPlan, onDeletePlan }) {
  const sortedPlans = (plans && plans.length > 0) ? [...plans].sort((a, b) => a.price - b.price) : [];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedPlans.map((plan) => {
          const activeTenants = companies.filter(c => c.plan === plan.name).length;
          const dynamicMRR = companies.filter(c => c.plan === plan.name && c.status === 'Active').reduce((sum, c) => sum + c.billing, 0);
          
          return (
            <div key={plan._id || plan.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between relative group text-left">
              
              {/* Edit & Delete Action Panel (Revealed on hover) */}
              <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip text="Edit Package Details">
                  <button 
                    onClick={() => onEditPlan(plan)}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <Edit size={12} />
                  </button>
                </Tooltip>
                <Tooltip text="Remove Plan">
                  <button 
                    onClick={() => onDeletePlan(plan._id || plan.id)}
                    className="p-1.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </Tooltip>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-display block mb-1">Subscription Plan</span>
                <h4 className="text-md font-extrabold font-display text-slate-800 mr-12 truncate">{plan.name}</h4>
                <p className="text-2xl font-extrabold text-indigo-600 font-display mt-4">${plan.price.toLocaleString()}<span className="text-xs text-slate-400 font-medium"> / Month</span></p>
                <ul className="mt-4 pt-4 border-t border-slate-200 text-xs font-semibold text-slate-500 space-y-2">
                  <li>User Limit cap: <strong>{plan.limit}</strong></li>
                  <li>Max User Seats: <strong>{plan.maxUsers} seats</strong></li>
                  <li>Max Projects limit: <strong>{plan.maxProjects} projects</strong></li>
                  <li>Active Subscribed Tenants: <strong>{activeTenants} companies</strong></li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Estimated MRR</span>
                  <span className="text-sm font-bold text-slate-800">${dynamicMRR.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => onEditPlan(plan)}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg cursor-pointer"
                >
                  Update Tier
                </button>
              </div>
            </div>
          );
        })}

        {sortedPlans.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs font-medium">
            No subscription plans configured. Click "Add Subscription Plan" to build package tiers.
          </div>
        )}
      </div>
    </div>
  );
}
