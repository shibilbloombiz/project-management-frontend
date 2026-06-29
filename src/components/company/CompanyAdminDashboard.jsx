import React, { useState, useEffect } from 'react';
import useCompanyAdminDashboard from '../../hooks/useCompanyAdminDashboard';
import { getToken } from '../../utils/dashboardUtils';
import FloatingChat from '../FloatingChat';
import CompanyInvoiceModal from './dashboard/CompanyInvoiceModal';
import CompanyMainContent from './dashboard/CompanyMainContent';
import CompanySidebar from './dashboard/CompanySidebar';
import CompanyTopNav from './dashboard/CompanyTopNav';

export default function CompanyAdminDashboard({
  userEmail,
  companyId,
  initialOrg,
  onLogout,
  onClickProfile,
  onChangePlan,
}) {
  const {
    activeTab,
    setActiveTab,
    loading,
    org,
    adminName,
    companyDetails,
    plans,
    viewingInvoice,
    setViewingInvoice,
    isEditingBilling,
    setIsEditingBilling,
    billingForm,
    setBillingForm,
    dismissedIds,
    isNotificationsOpen,
    setIsNotificationsOpen,
    selectedProject,
    setSelectedProject,
    selectedEmployee,
    setSelectedEmployee,
    loadData,
    handleSaveBillingDetails,
    handleToggleAutopay,
    notifications,
    saveDismissed,
    data,
    handlers,
    metrics,
    counts,
    floatingChatContacts,
  } = useCompanyAdminDashboard(userEmail, companyId, initialOrg);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <CompanyTopNav
        org={org}
        adminName={adminName}
        activeNotifications={notifications}
        isNotificationsOpen={isNotificationsOpen}
        onToggleNotifications={() => setIsNotificationsOpen((v) => !v)}
        onCloseNotifications={() => setIsNotificationsOpen(false)}
        onDismiss={(id) => saveDismissed([...dismissedIds, id])}
        onDismissAll={() =>
          saveDismissed([...dismissedIds, ...notifications.map((item) => item.id)])
        }
        onNavigate={(item) => {
          if (item.tab) setActiveTab(item.tab);
          if (item.project) setSelectedProject(item.project);
          setIsNotificationsOpen(false);
        }}
        onClickProfile={() => {
          setSelectedProject(null);
          setSelectedEmployee(null);
          onClickProfile?.();
        }}
        userEmail={userEmail}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
      />

      <div className="flex-1 flex flex-col md:flex-row relative">
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden animate-fade-in"
          />
        )}

        <CompanySidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'profile') {
              setSelectedProject(null);
              setSelectedEmployee(null);
              onClickProfile?.();
              return;
            }
            setActiveTab(tab);
          }}
          counts={counts}
          org={org}
          onLogout={onLogout}
          projectLeads={data.projectLeads}
          isOpen={isSidebarOpen}
        />

        <CompanyMainContent
          loading={loading}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          org={org}
          userEmail={userEmail}
          adminName={adminName}
          metrics={metrics}
          data={data}
          selectedProject={selectedProject}
          selectedEmployee={selectedEmployee}
          setSelectedProject={setSelectedProject}
          setSelectedEmployee={setSelectedEmployee}
          companyId={companyId}
          loadData={loadData}
          handlers={handlers}
          billing={{
            companyDetails,
            billingForm,
            setBillingForm,
            isEditingBilling,
            onToggleEditing: () => setIsEditingBilling((v) => !v),
            onSaveBillingDetails: handleSaveBillingDetails,
            onToggleAutopay: handleToggleAutopay,
            onViewInvoice: setViewingInvoice,
            plans,
            currentPlan: companyDetails?.plan || billingForm.plan || null,
            onChangePlan,
          }}
        />
      </div>

      <FloatingChat
        token={getToken()}
        user={{ email: userEmail, name: adminName }}
        userRole="Company Admin"
        extraContacts={floatingChatContacts}
      />

      <CompanyInvoiceModal
        invoice={viewingInvoice}
        companyDetails={companyDetails}
        org={org}
        userEmail={userEmail}
        onClose={() => setViewingInvoice(null)}
      />
    </div>
  );
}
