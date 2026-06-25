import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, AlertTriangle, Briefcase, RefreshCw } from 'lucide-react';
import { useClientProjectPortal } from '../../hooks/useClientProjectPortal';
import ClientProjectHeader from '../../components/clientPortal/ClientProjectHeader';
import ClientProjectKpiCards from '../../components/clientPortal/ClientProjectKpiCards';
import ClientPaymentLedger from '../../components/clientPortal/ClientPaymentLedger';
import ClientInvoiceTable from '../../components/clientPortal/ClientInvoiceTable';
import ClientRequirementsPanel from '../../components/clientPortal/ClientRequirementsPanel';
import ClientRequirementForm from '../../components/clientPortal/ClientRequirementForm';
import ClientFilesPanel from '../../components/clientPortal/ClientFilesPanel';
import ClientMilestonesTimeline from '../../components/clientPortal/ClientMilestonesTimeline';
import ClientMessagesPanel from '../../components/clientPortal/ClientMessagesPanel';
import ClientActivityFeed from '../../components/clientPortal/ClientActivityFeed';
import ClientPendingActionsCard from '../../components/clientPortal/ClientPendingActionsCard';
import FloatingChat from '../../components/FloatingChat';


export default function ClientProjectAccessPage({ token, onBackToLanding }) {
  const {
    loading,
    error,
    dashboard,
    billing,
    requirements,
    files,
    milestones,
    messages,
    activity,
    proposeRequirement,
    sendMessage,
    refresh
  } = useClientProjectPortal(token);

  const [selectedContact, setSelectedContact] = useState('company');
  const [messageText, setMessageText] = useState('');
  const [syncing, setSyncing] = useState(false);

  const overview = dashboard?.projectOverview || {};
  const staff = overview.assignedStaff || [];
  const contacts = [
    { id: 'company', email: overview.companyAdminEmail || 'admin@company.com', name: `Company Admin (${overview.org || 'Agency'})` },
    staff[0] && { 
      id: 'staff1', 
      email: typeof staff[0] === 'object' ? staff[0].email : staff[0], 
      name: typeof staff[0] === 'object' ? `${staff[0].name} (Lead Specialist)` : `Lead Specialist (${staff[0]})` 
    },
    staff[1] && { 
      id: 'staff2', 
      email: typeof staff[1] === 'object' ? staff[1].email : staff[1], 
      name: typeof staff[1] === 'object' ? `${staff[1].name} (Co-Specialist)` : `Co-Specialist (${staff[1]})` 
    },
  ].filter(Boolean);

  // Sync selected contact if list updates
  useEffect(() => {
    if (contacts.length > 0 && !contacts.some(c => c.id === selectedContact)) {
      setSelectedContact(contacts[0].id);
    }
  }, [contacts, selectedContact]);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
        {/* Background gradients */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-8 relative z-10 text-center">
          <div className="py-8 flex flex-col items-center space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-650 border-t-transparent animate-spin"></div>
            <p className="text-xs text-slate-450 font-bold">Synchronizing client workspace modules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-8 relative z-10 text-center space-y-4">
          <div className="inline-flex p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 shadow-sm">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-sm font-extrabold text-slate-800">Connection Error</h3>
          <p className="text-xs text-slate-450 font-semibold max-w-sm mx-auto">{error}</p>
          <div className="pt-2 flex gap-3 justify-center">
            <button
              onClick={onBackToLanding}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={handleManualSync}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition-colors"
            >
              Retry Sync
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden text-left font-sans flex flex-col pb-16">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Bar Navigation */}
      <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/60 z-30 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBackToLanding}
            className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-850 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Landing</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-white text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer transition-all flex items-center justify-center disabled:opacity-50"
              title="Sync Workspace Modules"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            </button>

            <span className="text-[10px] bg-emerald-50 text-emerald-755 border border-emerald-100 font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center">
              <ShieldCheck size={11} className="mr-1 text-emerald-600" />
              Secure Link Active
            </span>
          </div>
        </div>
      </header>

      {/* Dashboard Main Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        
        {/* Header Summary */}
        <ClientProjectHeader overview={overview} />

        {/* Snapshot KPI Counters */}
        {dashboard?.kpis && <ClientProjectKpiCards kpis={dashboard.kpis} />}

        {/* Two-Column Grid Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Scope Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Required Actions Card */}
            <ClientPendingActionsCard actions={dashboard?.pendingActions} />

            {/* Financial Ledger Section */}
            {billing?.paymentLedger && (
              <ClientPaymentLedger ledger={billing.paymentLedger} />
            )}

            {/* Invoice Breakdown Table */}
            <ClientInvoiceTable invoices={billing?.invoices} />

            {/* Scope proposals Panel */}
            <ClientRequirementsPanel requirements={requirements} />

            {/* Scope proposal Form */}
            <ClientRequirementForm onSubmit={proposeRequirement} />

          </div>

          {/* Sidebar Engagement Column (1/3 width) */}
          <div className="space-y-6">
            
            {/* Direct Message Portal */}
            <ClientMessagesPanel
              messages={messages}
              contacts={contacts}
              selectedContact={selectedContact}
              setSelectedContact={setSelectedContact}
              messageText={messageText}
              setMessageText={setMessageText}
              sending={syncing} // disables input during active sync/loads
              onSendMessage={sendMessage}
              clientEmail={overview.clientEmail}
            />

            {/* Milestones Roadmaps */}
            <ClientMilestonesTimeline milestones={milestones} />

            {/* Shared deliverables/files documents */}
            <ClientFilesPanel files={files} />

            {/* Activity Timelines Feed */}
            <ClientActivityFeed activity={activity} />

          </div>

        </div>

        {/* Security warning notice */}
        <div className="bg-emerald-50/30 border border-emerald-100/60 p-4 rounded-3xl flex items-start gap-2.5 text-[11px] text-emerald-800 font-semibold leading-relaxed">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong>Guest Link Notice</strong>: You have connected securely utilizing a workspace token. No credential sign-in is necessary to review project metrics, download resources, or communicate with lead administrators.
          </div>
        </div>

      </main>

      {/* Floating Chat widget for Client */}
      {overview && overview.clientEmail && (
        <FloatingChat 
          token={token} 
          user={{ email: overview.clientEmail, name: overview.clientName || 'Client' }} 
          userRole="Client" 
        />
      )}
    </div>
  );
}
