import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../config';
import { authHeaders, buildNotifications } from '../utils/dashboardUtils';

export default function useCompanyAdminDashboard(userEmail, companyId, initialOrg) {
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
    attendancePortalEnabled: true,
    attendancePortalOpenTime: '09:00',
    attendancePortalCloseTime: '18:00',
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
      if (attendanceRes?.success) {
        let merged = attendanceRes.data || [];
        try {
          const locals = JSON.parse(localStorage.getItem('local_attendance_logs') || '[]');
          const companyLocals = locals.filter(l => l.companyId === companyId);
          merged = [...companyLocals, ...merged];
        } catch (e) {}
        setAttendance(merged);
      }
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
            attendancePortalEnabled: matchedCompany.attendancePortalEnabled !== false,
            attendancePortalOpenTime: matchedCompany.attendancePortalOpenTime || '09:00',
            attendancePortalCloseTime: matchedCompany.attendancePortalCloseTime || '18:00',
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

  const notifications = useMemo(() => {
    return buildNotifications({ leaves, projects, messages }).filter(
      (item) => !dismissedIds.includes(item.id)
    );
  }, [leaves, projects, messages, dismissedIds]);

  const saveDismissed = (ids) => {
    setDismissedIds(ids);
    localStorage.setItem('dismissed_notifications', JSON.stringify(ids));
  };

  const data = useMemo(() => ({
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
  }), [projects, deletedProjects, employees, projectLeads, attendance, leaves, clients, deletedClients, payments, messages]);

  const handlers = useMemo(() => ({
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
  }), [projects, deletedProjects, clients, deletedClients, leaves, userEmail, adminName]);

  const metrics = useMemo(() => ({
    activeProjectsCount: projects.filter((p) => p.status === 'Active').length,
    projectsCount: projects.length,
    employeeCount: employees.length,
    pendingLeavesCount: leaves.filter((leave) => leave.status === 'Pending').length,
    totalBillings: projects.reduce((sum, p) => {
      const paidInvoices = (p.invoices || []).filter(i => i.status === 'Paid').reduce((s, i) => s + (Number(i.amount) || 0), 0);
      return sum + paidInvoices;
    }, 0),
  }), [projects, employees, leaves]);

  const counts = useMemo(() => ({
    projects: projects.length,
    employees: employees.length,
    projectLeads: projectLeads.length,
    clients: clients.length,
    messages: messages.length,
    trash: deletedProjects.length + deletedClients.length,
  }), [projects, employees, projectLeads, clients, messages, deletedProjects, deletedClients]);

  const floatingChatContacts = useMemo(() => [
    ...employees.map((employee) => ({
      name: employee.name,
      email: employee.email,
      role: employee.role || 'Employee',
      type: 'Staff',
      avatarColor: employee.avatarColor,
    })),
    ...projectLeads.map((lead) => ({
      name: lead.name,
      email: lead.email,
      role: lead.role || 'Project Lead',
      type: 'Staff',
      avatarColor: lead.avatarColor,
    })),
    ...clients.map((client) => ({
      name: client.name,
      email: client.email,
      role: 'Client',
      type: 'Client',
      avatarColor: '#10b981',
    })),
  ], [employees, projectLeads, clients]);

  return {
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
  };
}



