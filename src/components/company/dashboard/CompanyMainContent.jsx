import ProjectsTab from '../ProjectsTab';
import EmployeesTab from '../EmployeesTab';
import CompanyLeadsTab from '../CompanyLeadsTab';
import ClientsTab from '../ClientsTab';
import CompanyTrashTab from '../CompanyTrashTab';
import ProjectDetailPage from '../ProjectDetailPage';
import EmployeeDetailPage from '../EmployeeDetailPage';
import CompanyBillingPanel from './CompanyBillingPanel';
import CompanyKpiGrid from './CompanyKpiGrid';

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
  return (
    <main className="flex-grow p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-62px)]">
      <Header org={org} projectsCount={data?.projects?.length || 0} />

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
        />
      ) : selectedProject ? (
        <ProjectDetailPage
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          token={sessionStorage.getItem('syncra_token')}
          userEmail={userEmail}
          adminName={adminName}
          employees={data?.employees || []}
        />
      ) : (
        <>
          <CompanyKpiGrid {...metrics} onSelectTab={setActiveTab} />

          <div className="mt-8">
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
            />
          </div>
        </>
      )}
    </main>
  );
}

function Header({ org, projectsCount }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          Console Dashboard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Workspace metrics and live collaboration status registers for {org}.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
          {projectsCount} Active Nodes
        </span>

        <span className="flex items-center text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
          Connection Status: Active
        </span>
      </div>
    </div>
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
      />
    );
  }

  if (activeTab === 'company-leads') {
    return (
      <CompanyLeadsTab
        companyId={companyId}
        token={token}
      />
    );
  }

  if (activeTab === 'clients') {
    return (
      <ClientsTab
        clients={data?.clients || []}
        payments={data?.payments || []}
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



  return null;
}