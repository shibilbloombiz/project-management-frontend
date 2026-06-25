import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';
import FloatingChat from '../FloatingChat';
import CompanyInvoiceModal from './dashboard/CompanyInvoiceModal';
import CompanyMainContent from './dashboard/CompanyMainContent';
import CompanySidebar from './dashboard/CompanySidebar';
import CompanyTopNav from './dashboard/CompanyTopNav';

const getToken = () => sessionStorage.getItem('syncra_token');

const authHeaders = (json = false) => ({
  ...(json ? { 'Content-Type': 'application/json' } : {}),
  Authorization: `Bearer ${getToken()}`,
});

export default function CompanyAdminDashboard({
  userEmail,
  companyId,
  initialOrg,
  onLogout,
  onClickProfile,
}) {
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(initialOrg || 'Company');
  const [adminName, setAdminName] = useState(() => {
    const saved = localStorage.getItem(`syncra_profile_name_${userEmail?.toLowerCase?.()}`);
    return saved || 'Company Admin';
  });

  const [companyDetails, setCompanyDetails] = useState(null);
  const [plans, setPlans] = useState([]);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [isEditingBilling, setIsEditingBilling] = useState(false);

  const [billingForm, setBillingForm] = useState({
    billingName: '',
    billingEmail: '',
    billingPhone: '',
    billingAddress: '',
    logo: '',
    autopay: true,
    plan: '',
    users: 0,
  });

  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    } catch {
      return [];
    }
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [projects, setProjects] = useState([]);
  const [deletedProjects, setDeletedProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projectLeads, setProjectLeads] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [clients, setClients] = useState([]);
  const [deletedClients, setDeletedClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const key = `syncra_profile_name_${userEmail?.toLowerCase?.()}`;
    const handleStorageChange = () => {
      const saved = localStorage.getItem(key);
      if (saved) setAdminName(saved);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userEmail]);

  useEffect(() => {
    let ignore = false;

    const loadUserContext = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/users`, {
          headers: authHeaders(),
        });
        const json = await res.json();

        if (!json?.success || ignore) return;

        const matched = (json.data || []).find(
          (user) => user.email?.toLowerCase() === userEmail?.toLowerCase()
        );

        if (matched) {
          setOrg(matched.org || initialOrg || 'Company');

          const savedName = localStorage.getItem(
            `syncra_profile_name_${userEmail?.toLowerCase?.()}`
          );
          if (!savedName && matched.name) {
            setAdminName(matched.name);
          }
        }
      } catch (err) {
        console.error('Failed to load company admin context:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadUserContext();
    return () => {
      ignore = true;
    };
  }, [userEmail, initialOrg]);

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, {
      headers: authHeaders(options.method && options.method !== 'GET'),
      ...options,
    });
    return res.json();
  };

  const loadData = async () => {
    try {
      const [
        projectsRes,
        deletedProjectsRes,
        employeesRes,
        projectLeadsRes,
        attendanceRes,
        leavesRes,
        clientsRes,
        deletedClientsRes,
        paymentsRes,
        messagesRes,
        companiesRes,
        plansRes,
      ] = await Promise.all([
        fetchJson(`${API_BASE_URL}/api/projects`),
        fetchJson(`${API_BASE_URL}/api/projects/trash`),
        fetchJson(`${API_BASE_URL}/api/employees`),
        fetchJson(`${API_BASE_URL}/api/project-leads`),
        fetchJson(`${API_BASE_URL}/api/attendance`),
        fetchJson(`${API_BASE_URL}/api/leaves`),
        fetchJson(`${API_BASE_URL}/api/clients`),
        fetchJson(`${API_BASE_URL}/api/clients/trash`),
        fetchJson(`${API_BASE_URL}/api/payments`),
        fetchJson(`${API_BASE_URL}/api/messages`),
        fetchJson(`${API_BASE_URL}/api/companies`),
        fetchJson(`${API_BASE_URL}/api/plans`),
      ]);

      if (projectsRes?.success) setProjects(projectsRes.data || []);
      if (deletedProjectsRes?.success) setDeletedProjects(deletedProjectsRes.data || []);
      if (employeesRes?.success) setEmployees(employeesRes.data || []);
      if (projectLeadsRes?.success) setProjectLeads(projectLeadsRes.data || []);
      if (attendanceRes?.success) setAttendance(attendanceRes.data || []);
      if (leavesRes?.success) setLeaves(leavesRes.data || []);
      if (clientsRes?.success) setClients(clientsRes.data || []);
      if (deletedClientsRes?.success) setDeletedClients(deletedClientsRes.data || []);
      if (paymentsRes?.success) setPayments(paymentsRes.data || []);
      if (messagesRes?.success) setMessages(messagesRes.data || []);
      if (plansRes?.success) setPlans(plansRes.data || []);

      if (companiesRes?.success) {
        const matchedCompany = (companiesRes.data || []).find(
          (company) => (company._id || company.id) === companyId
        );

        if (matchedCompany) {
          setOrg(matchedCompany.name || org);
          setCompanyDetails(matchedCompany);

          setBillingForm((prev) => ({
            ...prev,
            billingName: matchedCompany.billingName || '',
            billingEmail: matchedCompany.billingEmail || '',
            billingPhone: matchedCompany.billingPhone || '',
            billingAddress: matchedCompany.billingAddress || '',
            logo: matchedCompany.logo || '',
            autopay: matchedCompany.autopay !== false,
            plan: matchedCompany.plan || '',
            users: matchedCompany.users || 0,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load company dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [companyId]);

  const postJson = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const deleteRequest = async (url) => {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  };

  const handleCreateProject = async (details) => {
    try {
      const res = await postJson(`${API_BASE_URL}/api/projects`, details);
      if (!res?.success) return alert(res?.message || 'Failed to create project.');
      setProjects((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleSoftDeleteProject = async (id) => {
    try {
      const res = await postJson(`${API_BASE_URL}/api/projects/${id}/delete`, {});
      if (!res?.success) return;
      setProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
      setDeletedProjects((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to soft delete project:', err);
    }
  };

  const handleRestoreProject = async (id) => {
    try {
      const res = await postJson(`${API_BASE_URL}/api/projects/${id}/restore`, {});
      if (!res?.success) return;
      setDeletedProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
      setProjects((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to restore project:', err);
    }
  };

  const handlePurgeProject = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this project?')) return;
    try {
      const res = await deleteRequest(`${API_BASE_URL}/api/projects/${id}`);
      if (!res?.success) return;
      setDeletedProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      console.error('Failed to purge project:', err);
    }
  };

  const handleCreateClient = async (details) => {
    try {
      const res = await postJson(`${API_BASE_URL}/api/clients`, details);
      if (!res?.success) return alert(res?.message || 'Failed to create client.');
      setClients((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to create client:', err);
    }
  };

  const handleSoftDeleteClient = async (id) => {
    try {
      const res = await postJson(`${API_BASE_URL}/api/clients/${id}/delete`, {});
      if (!res?.success) return;
      setClients((prev) => prev.filter((c) => (c._id || c.id) !== id));
      setDeletedClients((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to soft delete client:', err);
    }
  };

  const handleRestoreClient = async (id) => {
    try {
      const res = await postJson(`${API_BASE_URL}/api/clients/${id}/restore`, {});
      if (!res?.success) return;
      setDeletedClients((prev) => prev.filter((c) => (c._id || c.id) !== id));
      setClients((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to restore client:', err);
    }
  };

  const handlePurgeClient = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this client?')) return;
    try {
      const res = await deleteRequest(`${API_BASE_URL}/api/clients/${id}`);
      if (!res?.success) return;
      setDeletedClients((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      console.error('Failed to purge client:', err);
    }
  };

  const handleApproveLeave = async (id) => {
    try {
      const res = await postJson(`${API_BASE_URL}/api/leaves/${id}/approve`, {});
      if (!res?.success) return;
      setLeaves((prev) =>
        prev.map((leave) =>
          (leave._id || leave.id) === id ? { ...leave, status: 'Approved' } : leave
        )
      );
    } catch (err) {
      console.error('Failed to approve leave:', err);
    }
  };

  const handleDeclineLeave = async (id) => {
    try {
      const res = await postJson(`${API_BASE_URL}/api/leaves/${id}/decline`, {});
      if (!res?.success) return;
      setLeaves((prev) =>
        prev.map((leave) =>
          (leave._id || leave.id) === id ? { ...leave, status: 'Declined' } : leave
        )
      );
    } catch (err) {
      console.error('Failed to decline leave:', err);
    }
  };

  const handleSendMessage = async (text, receiver = 'all') => {
    try {
      const res = await postJson(`${API_BASE_URL}/api/messages`, {
        sender: userEmail,
        senderName: adminName,
        receiver,
        text,
      });
      if (!res?.success) return;
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSaveBillingDetails = async (e) => {
    e.preventDefault();
    try {
      const res = await postJson(`${API_BASE_URL}/api/companies/${companyId}/plan`, billingForm);
      if (!res?.success) return alert(res?.message || 'Failed to update billing details.');
      setCompanyDetails(res.data);
      setIsEditingBilling(false);
    } catch (err) {
      console.error('Failed to save billing details:', err);
    }
  };

  const handleToggleAutopay = async (currentAutopay) => {
    try {
      const res = await postJson(`${API_BASE_URL}/api/companies/${companyId}/plan`, {
        autopay: !currentAutopay,
      });
      if (!res?.success) return alert(res?.message || 'Failed to update autopay.');
      setCompanyDetails(res.data);
      setBillingForm((prev) => ({ ...prev, autopay: !currentAutopay }));
    } catch (err) {
      console.error('Failed to toggle autopay:', err);
    }
  };

  const notifications = buildNotifications({ leaves, projects, messages }).filter(
    (item) => !dismissedIds.includes(item.id)
  );

  const saveDismissed = (ids) => {
    setDismissedIds(ids);
    localStorage.setItem('dismissed_notifications', JSON.stringify(ids));
  };

  const data = {
    projects,
    deletedProjects,
    employees,
    projectLeads,
    attendance,
    leaves,
    clients,
    deletedClients,
    payments,
    messages,
  };

  const handlers = {
    createProject: handleCreateProject,
    softDeleteProject: handleSoftDeleteProject,
    restoreProject: handleRestoreProject,
    purgeProject: handlePurgeProject,
    createClient: handleCreateClient,
    softDeleteClient: handleSoftDeleteClient,
    restoreClient: handleRestoreClient,
    purgeClient: handlePurgeClient,
    approveLeave: handleApproveLeave,
    declineLeave: handleDeclineLeave,
    sendMessage: handleSendMessage,
  };

  const metrics = {
    activeProjectsCount: projects.filter((p) => p.status === 'Active').length,
    projectsCount: projects.length,
    employeeCount: employees.length,
    pendingLeavesCount: leaves.filter((leave) => leave.status === 'Pending').length,
    totalBillings: payments.reduce(
      (sum, payment) => sum + (payment.status === 'Paid' ? Number(payment.amount || 0) : 0),
      0
    ),
  };

  const counts = {
    projects: projects.length,
    employees: employees.length,
    projectLeads: projectLeads.length,
    clients: clients.length,
    messages: messages.length,
    trash: deletedProjects.length + deletedClients.length,
  };

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
      />

      <div className="flex-1 flex flex-col md:flex-row">
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
          projectLeads={projectLeads}
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
          }}
        />
      </div>

      <FloatingChat
        token={getToken()}
        user={{ email: userEmail, name: adminName }}
        userRole="Company Admin"
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

function buildNotifications({ leaves = [], projects = [], messages = [] }) {
  return [
    ...leaves
      .filter((leave) => leave.status === 'Pending')
      .map((leave) => ({
        id: `leave_${leave._id || leave.id}`,
        type: 'leave_request',
        title: 'Pending Leave Request',
        desc: `${leave.employeeName || leave.employeeEmail} requested leave from ${leave.startDate} to ${leave.endDate}`,
        tab: 'employees',
      })),

    ...projects.flatMap((project) =>
      (project.clientRequirements || [])
        .filter((req) => req.status === 'Pending Review')
        .map((req) => ({
          id: `scope_${req.id || req._id}`,
          type: 'client_scope',
          title: `Scope Proposed: ${project.name}`,
          desc: req.title || req.description || 'Client submitted a new requirement',
          tab: 'projects',
          project,
        }))
    ),

    ...messages
      .filter((msg) => msg.senderName?.toLowerCase?.().includes('client'))
      .map((msg) => ({
        id: `msg_${msg._id || msg.id || msg.createdAt}`,
        type: 'client_message',
        title: `Client Message: ${msg.senderName}`,
        desc: msg.text || 'Shared an attachment',
        tab: 'messages',
      })),
  ];
}
