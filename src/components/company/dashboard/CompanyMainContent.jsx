import React, { useState } from 'react';
import ProjectsTab from '../ProjectsTab';
import EmployeesTab from '../EmployeesTab';
import CompanyLeadsTab from '../CompanyLeadsTab';
import ClientsTab from '../ClientsTab';
import CompanyTrashTab from '../CompanyTrashTab';
import ProjectDetailPage from '../ProjectDetailPage';
import EmployeeDetailPage from '../EmployeeDetailPage';
import CompanyBillingPanel from './CompanyBillingPanel';
import MarkAttendancePage from '../MarkAttendancePage';
import TasksTab from '../../TasksTab';

export default function CompanyMainContent({
  loading,
  activeTab,
  setActiveTab,
  org,
  userEmail,
  adminName,
  metrics,
  data,
  selectedProject,
  selectedEmployee,
  setSelectedProject,
  setSelectedEmployee,
  companyId,
  loadData,
  handlers,
  billing,
}) {
  const [attendanceMarkEmail, setAttendanceMarkEmail] = useState('');

  return (
    <main className="flex-grow min-w-0 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-62px)]">
      {loading ? (
        <div className="p-8 text-center text-slate-400 font-semibold text-xs flex items-center justify-center space-x-2">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
          <span>Configuring workspace console context...</span>
        </div>
      ) : selectedEmployee ? (
        <EmployeeDetailPage
          employee={selectedEmployee}
          token={sessionStorage.getItem('syncra_token')}
          onBack={() => setSelectedEmployee(null)}
          attendance={data?.attendance || []}
          leaves={data?.leaves || []}
          onMarkAttendance={(email) => {
            setAttendanceMarkEmail(email);
            setSelectedEmployee(null);
            setActiveTab('employees');
          }}
        />
      ) : selectedProject ? (
        <ProjectDetailPage
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          token={sessionStorage.getItem('syncra_token')}
          userEmail={userEmail}
          adminName={adminName}
          employees={data?.employees || []}
          companyName={billing?.companyDetails?.name || org}
          companyLogo={billing?.companyDetails?.logo || ''}
          onProjectUpdated={(updatedProject) => {
            setSelectedProject(updatedProject);
            if (typeof loadData === 'function') loadData();
          }}
        />
      ) : (
        <TabContent
          activeTab={activeTab}
          org={org}
          data={data}
          handlers={handlers}
          loadData={loadData}
          setSelectedProject={setSelectedProject}
          setSelectedEmployee={setSelectedEmployee}
          billing={billing}
          userEmail={userEmail}
          companyId={companyId}
          adminName={adminName}
          setActiveTab={setActiveTab}
          attendanceMarkEmail={attendanceMarkEmail}
          setAttendanceMarkEmail={setAttendanceMarkEmail}
        />
      )}
    </main>
  );
}



function TabContent({
  activeTab,
  org,
  data,
  handlers,
  loadData,
  setSelectedProject,
  setSelectedEmployee,
  billing,
  userEmail,
  companyId,
  adminName,
  setActiveTab,
  attendanceMarkEmail,
  setAttendanceMarkEmail,
}) {
  const token = sessionStorage.getItem('syncra_token');

  if (activeTab === 'projects') {
    return (
      <ProjectsTab
        projects={data?.projects || []}
        projectLeads={data?.projectLeads || []}
        onCreateProject={handlers?.createProject}
        onSoftDelete={handlers?.softDeleteProject}
        org={org}
        onViewProject={setSelectedProject}
        userEmail={userEmail}
        adminName={adminName}
      />
    );
  }

  if (activeTab === 'employees') {
    return (
      <EmployeesTab
        employees={data?.employees || []}
        attendance={data?.attendance || []}
        leaves={data?.leaves || []}
        onApproveLeave={handlers?.approveLeave}
        onDeclineLeave={handlers?.declineLeave}
        org={org}
        onRefreshEmployees={loadData}
        token={token}
        onViewEmployee={setSelectedEmployee}
        companyDetails={billing?.companyDetails}
        attendanceMarkEmail={attendanceMarkEmail}
        setAttendanceMarkEmail={setAttendanceMarkEmail}
      />
    );
  }

  if (activeTab === 'company-leads') {
    return (
      <CompanyLeadsTab
        companyId={companyId}
        token={token}
        employees={data?.employees || []}
        onRefresh={loadData}
        onGoToProject={(projId) => {
          const found = (data?.projects || []).find(p => (p._id || p.id) === projId);
          if (found) {
            setSelectedProject(found);
            setActiveTab('projects');
          } else {
            alert("Project details not found.");
          }
        }}
      />
    );
  }

  if (activeTab === 'clients') {
    const clientPayments = (data?.projects || []).flatMap(project => {
      const clientInfo = (data?.clients || []).find(c => c.email?.toLowerCase() === project.clientEmail?.toLowerCase());
      const clientName = clientInfo ? clientInfo.name : project.clientEmail;
      return (project.invoices || []).map(inv => ({
        _id: inv._id || inv.invoiceId,
        id: inv.id || inv.invoiceId,
        clientName: clientName,
        clientEmail: project.clientEmail,
        projectName: project.name,
        amount: inv.amount,
        status: inv.status,
        date: inv.date,
      }));
    });

    return (
      <ClientsTab
        clients={data?.clients || []}
        payments={clientPayments}
        onCreateClient={handlers?.createClient}
        onSoftDelete={handlers?.softDeleteClient}
        org={org}
      />
    );
  }

  if (activeTab === 'trash') {
    return (
      <CompanyTrashTab
        deletedProjects={data?.deletedProjects || []}
        deletedClients={data?.deletedClients || []}
        onRestoreProject={handlers?.restoreProject}
        onPurgeProject={handlers?.purgeProject}
        onRestoreClient={handlers?.restoreClient}
        onPurgeClient={handlers?.purgeClient}
        org={org}
      />
    );
  }

  if (activeTab === 'billing') {
    return (
      <CompanyBillingPanel
        {...billing}
        org={org}
        payments={data?.payments || []}
      />
    );
  }

  if (activeTab === 'tasks') {
    return (
      <TasksTab
        role="Company Admin"
        token={token}
        userEmail={userEmail}
        adminName={adminName}
        onRefresh={loadData}
      />
    );
  }

  return null;
}
