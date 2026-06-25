import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';

export default function CompanyDetailsView({ company, projects, users, onClose, onToggleStatus }) {
  const getCompanyDetails = () => {
    const compIdStr = company._id || company.id;
    const compProjects = projects.filter(p => p.companyId === compIdStr || p.org === company.name);
    const compEmployees = users.filter(u => u.companyId === compIdStr || u.org === company.name);
    
    const startDate = company.createdAt 
      ? new Date(company.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) 
      : 'January 1, 2026';
    
    const endDate = company.createdAt
      ? new Date(new Date(company.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'January 31, 2026';

    return {
      projectsList: compProjects,
      projectCount: compProjects.length,
      employeesList: compEmployees,
      employeeCount: compEmployees.length,
      startDate,
      endDate
    };
  };

  const details = getCompanyDetails();

  const handleDownloadReport = () => {
    const reportText = `========================================================================
                      SYNCRA MULTI-TENANT SAAS REPORT
========================================================================
Report Generated:    ${new Date().toLocaleString()}
Company Name:        ${company.name}
Description:         ${company.desc || 'No description provided.'}
Admin Email:         ${company.admin}
Tenant Node ID:      ${company._id || company.id}
Operating Status:    ${company.status}

SUBSCRIPTION SUMMARY:
------------------------------------------------------------------------
Plan Package:        ${company.plan}
Monthly Rate:        ₹${company.billing.toLocaleString()} INR
Started Date:        ${details.startDate}
Renewal Date:        ${details.endDate}

WORKSPACE METRICS:
------------------------------------------------------------------------
Total Projects:      ${details.projectCount}
Total Employees:     ${details.employeeCount}

PROJECT SUMMARY:
------------------------------------------------------------------------
${details.projectsList.map((p, i) => `${i + 1}. ${p.name}
   - Description:  ${p.desc || 'No description.'}
   - Status:       ${p.status}
   - Client Email: ${p.clientEmail}
   - Total Budget: ₹${p.paymentDetails ? p.paymentDetails.total.toLocaleString() : '0'}
   - Tasks Count:  ${p.tasks ? p.tasks.length : 0}
`).join('\n') || 'No active projects found.'}

EMPLOYEE REGISTRY:
------------------------------------------------------------------------
${details.employeesList.map((e, i) => `${i + 1}. ${e.name}
   - Email:        ${e.email}
   - Role:         ${e.role}
   - Status:       ${e.status}
   - Location:     ${e.location || 'Remote'}
`).join('\n') || 'No registered employees found.'}

========================================================================
        Report issued by Syncra Global SaaS Systems Controller.
========================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${company.name.replace(/\s+/g, '_')}_workspace_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-left p-6 md:p-8 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to Registry"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold font-display text-slate-900">{company.name}</h3>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                company.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {company.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium font-mono mt-0.5">Admin Email: {company.admin}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => onToggleStatus(company._id || company.id)}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              company.status === 'Active'
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
          >
            {company.status === 'Active' ? 'Suspend Node' : 'Activate Node'}
          </button>

          <button 
            onClick={handleDownloadReport}
            className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-100 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Download Company Report</span>
          </button>
        </div>
      </div>

      {/* Profile / Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Company Profile Card */}
        <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 space-y-3">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-display">Company Profile</span>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            {company.desc || 'No workspace description provided for this tenant node. Description can be set during creation or upgraded in configurations.'}
          </p>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 font-semibold font-mono">
            <div>Clean DB Namespace: <strong className="text-indigo-600">company_{company._id || company.id}</strong></div>
          </div>
        </div>

        {/* Metric stats card */}
        <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-display">Active Workspace Metrics</span>
          <div className="grid grid-cols-2 gap-4 py-3">
            <div className="text-center bg-white border border-slate-100 rounded-lg p-2">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Projects</span>
              <span className="text-xl font-extrabold text-slate-800 font-display mt-0.5 block">{details.projectCount}</span>
            </div>
            <div className="text-center bg-white border border-slate-100 rounded-lg p-2">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Employees</span>
              <span className="text-xl font-extrabold text-slate-800 font-display mt-0.5 block">{details.employeeCount}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Stats loaded live from active database connections.</span>
        </div>

        {/* Subscription Detail Card */}
        <div className="border border-slate-100 rounded-xl p-5 bg-indigo-50/40 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest block font-display">Subscription Detail</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-md font-extrabold text-slate-800">{company.plan}</span>
              <span className="text-sm font-extrabold text-indigo-600">₹{company.billing.toLocaleString()}/mo</span>
            </div>
          </div>
          <div className="pt-4 border-t border-indigo-100/50 text-[11px] text-slate-600 space-y-1.5 font-semibold">
            <div className="flex justify-between">
              <span>Started Date:</span>
              <span className="font-bold text-slate-800">{details.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Renewal / End Date:</span>
              <span className="font-bold text-slate-800">{details.endDate}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Detail tabs of projects & users of this company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        
        {/* Company Projects list */}
        <div className="space-y-3 text-left">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest block font-display">Projects Ledger</h4>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {details.projectsList.map(p => (
              <div key={p._id || p.id} className="border border-slate-100 rounded-xl p-3 bg-white hover:border-slate-200 transition-colors flex justify-between items-center text-xs font-semibold">
                <div>
                  <span className="font-extrabold text-slate-800 block text-xs">{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate max-w-[200px]">{p.desc || 'No description'}</span>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                  p.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
            {details.projectsList.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 rounded-xl">No projects created yet in this workspace.</div>
            )}
          </div>
        </div>

        {/* Company Employees list */}
        <div className="space-y-3 text-left">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest block font-display">Registered Users</h4>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {details.employeesList.map(e => (
              <div key={e._id || e.email} className="border border-slate-100 rounded-xl p-3 bg-white hover:border-slate-200 transition-colors flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 font-extrabold flex items-center justify-center text-[10px] text-indigo-700">
                    {e.name[0]}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-800 block text-xs">{e.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono font-medium block mt-0.5 truncate max-w-[160px]">{e.email}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100 font-bold uppercase tracking-wider">{e.role}</span>
              </div>
            ))}
            {details.employeesList.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 rounded-xl">No registered users in this company.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
