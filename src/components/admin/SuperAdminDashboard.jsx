import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import { Building, CreditCard, Users, ShieldCheck, Plus, Filter, Download } from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import CompaniesTab from "./CompaniesTab";
import TrashTab from "./TrashTab";
import UsersTab from "./UsersTab";
import SubscriptionsTab from "./SubscriptionsTab";
import PaymentsTab from "./PaymentsTab";
import ReportsTab from "./ReportsTab";
import CompanyDetailsView from "./CompanyDetailsView";
import AiModal from "./AiModal";
import CreateCompanyModal from "./CreateCompanyModal";
import PlanModal from "./PlanModal";
import { downloadFormalReportPdf } from "../../utils/pdfExport";
import Tooltip from "../Tooltip";
export default function SuperAdminDashboard({
  userEmail,
  onLogout,
  onClickProfile
}) {
  const [activeTab, setActiveTab] = useState("companies");
  const [companies, setCompanies] = useState([]);
  const [trashCompanies, setTrashCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    setStatusFilter("All");
    setIsSidebarOpen(false);
  }, [activeTab]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createError, setCreateError] = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planForm, setPlanForm] = useState(null);
  const [planError, setPlanError] = useState("");

  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('syncra_super_dismissed_notifications') || '[]');
    } catch {
      return [];
    }
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const fetchAllData = () => {
    const token = sessionStorage.getItem("syncra_token");
    const headers = {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ""
    };
    const fetchCompanies = fetch(`${API_BASE_URL}/api/companies`, {
      headers
    }).then(res => res.json()).then(res => {
      if (res.success) setCompanies(res.data);
    }).catch(err => console.error("Failed to load companies:", err));
    const fetchTrash = fetch(`${API_BASE_URL}/api/companies/trash`, {
      headers
    }).then(res => res.json()).then(res => {
      if (res.success) setTrashCompanies(res.data);
    }).catch(err => console.error("Failed to load trash companies:", err));
    const fetchUsers = fetch(`${API_BASE_URL}/api/users`, {
      headers
    }).then(res => res.json()).then(res => {
      if (res.success) setUsers(res.data);
    }).catch(err => console.error("Failed to load users:", err));
    const fetchPlans = fetch(`${API_BASE_URL}/api/plans`, {
      headers
    }).then(res => res.json()).then(res => {
      if (res.success) setPlans(res.data);
    }).catch(err => console.error("Failed to load plans:", err));
    const fetchPayments = fetch(`${API_BASE_URL}/api/payments`, {
      headers
    }).then(res => res.json()).then(res => {
      if (res.success) setPayments(res.data);
    }).catch(err => console.error("Failed to load payments:", err));
    const fetchProjects = fetch(`${API_BASE_URL}/api/projects/all`, {
      headers
    }).then(res => res.json()).then(res => {
      if (res.success) setProjects(res.data);
    }).catch(err => console.error("Failed to load projects:", err));
    Promise.all([fetchCompanies, fetchTrash, fetchUsers, fetchPlans, fetchPayments, fetchProjects]).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('syncra_super_dismissed_notifications', JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("syncra_token");
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ""
    };
  };

  const handleToggleCompanyStatus = companyId => {
    fetch(`${API_BASE_URL}/api/companies/${companyId}/toggle`, {
      method: "POST",
      headers: getAuthHeaders()
    }).then(res => res.json()).then(res => {
      if (res.success) {
        setCompanies(prev => prev.map(c => c._id && c._id === companyId || c.id && c.id === companyId ? {
          ...c,
          status: res.data.status
        } : c));
        if (selectedCompany && (selectedCompany._id === companyId || selectedCompany.id === companyId)) {
          setSelectedCompany(prev => ({
            ...prev,
            status: res.data.status
          }));
        }
      }
    }).catch(err => console.error("Failed to toggle company status:", err));
  };
  const handleSoftDeleteCompany = companyId => {
    fetch(`${API_BASE_URL}/api/companies/${companyId}/delete`, {
      method: "POST",
      headers: getAuthHeaders()
    }).then(res => res.json()).then(res => {
      if (res.success) {
        setCompanies(prev => prev.filter(c => (c._id || c.id) !== companyId));
        setTrashCompanies(prev => [...prev, res.data]);
        if (selectedCompany && (selectedCompany._id === companyId || selectedCompany.id === companyId)) {
          setSelectedCompany(null);
        }
      }
    }).catch(err => console.error("Failed to soft delete company:", err));
  };
  const handleRestoreCompany = companyId => {
    fetch(`${API_BASE_URL}/api/companies/${companyId}/restore`, {
      method: "POST",
      headers: getAuthHeaders()
    }).then(res => res.json()).then(res => {
      if (res.success) {
        setTrashCompanies(prev => prev.filter(c => (c._id || c.id) !== companyId));
        setCompanies(prev => [...prev, res.data]);
      }
    }).catch(err => console.error("Failed to restore company:", err));
  };
  const handlePermanentDeleteCompany = companyId => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete this company? This action cannot be undone.")) {
      return;
    }
    fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    }).then(res => res.json()).then(res => {
      if (res.success) {
        setTrashCompanies(prev => prev.filter(c => (c._id || c.id) !== companyId));
      }
    }).catch(err => console.error("Failed to permanently delete company:", err));
  };
  const handleCreateCompanySubmit = formData => {
    setCreateError("");
    fetch(`${API_BASE_URL}/api/companies`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(formData)
    }).then(res => res.json()).then(res => {
      if (res.success) {
        setCompanies(prev => [...prev, res.data]);
        setShowCreateModal(false);
      } else {
        setCreateError(res.message || "Failed to create company.");
      }
    }).catch(err => {
      console.error("Failed to create company:", err);
      setCreateError("Network error connecting to auth server.");
    });
  };
  const handleOpenAddPlan = () => {
    setPlanForm({
      name: "",
      price: 2500,
      limit: "15 Users",
      maxUsers: 15,
      maxProjects: 10
    });
    setIsEditingPlan(false);
    setPlanError("");
    setShowPlanModal(true);
  };
  const handleOpenEditPlan = plan => {
    setPlanForm({
      name: plan.name,
      price: plan.price,
      limit: plan.limit,
      maxUsers: plan.maxUsers || 15,
      maxProjects: plan.maxProjects || 10
    });
    setEditingPlanId(plan._id || plan.id);
    setIsEditingPlan(true);
    setPlanError("");
    setShowPlanModal(true);
  };
  const handlePlanFormSubmit = formData => {
    setPlanError("");
    const method = isEditingPlan ? "PUT" : "POST";
    const url = isEditingPlan ? `${API_BASE_URL}/api/plans/${editingPlanId}` : `${API_BASE_URL}/api/plans`;
    fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(formData)
    }).then(res => res.json()).then(res => {
      if (res.success) {
        setShowPlanModal(false);
        fetchAllData();
      } else {
        setPlanError(res.message || "Error occurred while saving plan.");
      }
    }).catch(err => {
      console.error("Failed to save subscription plan:", err);
      setPlanError("Network error saving plan.");
    });
  };
  const handleDeletePlan = planId => {
    if (!window.confirm("Are you sure you want to remove this subscription plan tier?")) return;
    fetch(`${API_BASE_URL}/api/plans/${planId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    }).then(res => res.json()).then(res => {
      if (res.success) {
        fetchAllData();
      } else {
        alert(res.message || "Failed to delete plan.");
      }
    }).catch(err => console.error("Failed to delete plan:", err));
  };
  const handleDeleteUser = userId => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete this user account from the platform? This cannot be undone.")) return;
    fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    }).then(res => res.json()).then(res => {
      if (res.success) {
        setUsers(prev => prev.filter(u => (u._id || u.id) !== userId));
      } else {
        alert(res.message || "Failed to delete user.");
      }
    }).catch(err => console.error("Failed to delete user:", err));
  };

  const buildNotifications = () => {
    const list = [];
    companies.forEach(c => {
      list.push({
        id: `company_${c._id || c.id}`,
        type: 'company_reg',
        title: 'New Company Node Registered',
        desc: `${c.name} has registered under the ${c.plan || 'Free'} plan.`,
        tab: 'companies'
      });
    });
    payments.forEach(p => {
      list.push({
        id: `payment_${p._id || p.id || p.paymentId}`,
        type: 'payment_rcv',
        title: 'Platform Subscription Payment Received',
        desc: `Received ₹${(p.amount || 0).toLocaleString()} INR from ${p.clientName || 'Tenant'}.`,
        tab: 'payments'
      });
    });
    companies.forEach(c => {
      const planLimits = plans.find(pl => pl.name === c.plan);
      if (planLimits && planLimits.maxUsers > 0) {
        const usage = (c.users / planLimits.maxUsers) * 100;
        if (usage >= 80) {
          list.push({
            id: `limit_warning_${c._id || c.id}`,
            type: 'limit_warning',
            title: 'Workspace Capacity Warning',
            desc: `Workspace ${c.name} is utilizing ${c.users}/${planLimits.maxUsers} seats (${usage.toFixed(0)}%).`,
            tab: 'companies'
          });
        }
      }
    });
    return list;
  };

  const allNotifications = buildNotifications();
  const activeNotifications = allNotifications.filter(n => !dismissedIds.includes(n.id));

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.desc.toLowerCase().includes(searchTerm.toLowerCase()) || c.admin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const filteredTrashCompanies = trashCompanies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.desc.toLowerCase().includes(searchTerm.toLowerCase()) || c.admin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.org.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : (statusFilter === 'Active' ? u.role !== 'Super Admin' : u.role === 'Super Admin');
    return matchesSearch && matchesStatus;
  });
  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || p.org.toLowerCase().includes(searchTerm.toLowerCase()) || p.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadReport = () => {
    if (activeTab === 'companies') {
      const rows = filteredCompanies.map((c, i) => [
        c.name || '-',
        c.admin || '-',
        c.plan || '-',
        `${c.users || 0} Seats`,
        `$${Number(c.billing || 0).toLocaleString()}`,
        c.status || '-'
      ]);
      downloadFormalReportPdf({
        title: 'Platform Companies Directory',
        subtitle: 'Syncra SaaS Global Registry Log',
        meta: [
          ['Total Registered Companies', filteredCompanies.length.toString()],
          ['Active Subscriptions Rate', activeSubscriptionsRate],
          ['Report Date', new Date().toLocaleDateString()]
        ],
        sections: [
          {
            heading: 'Registered Tenants Registry',
            table: {
              headers: ['Company Name', 'Admin Email', 'Plan', 'Seats Used', 'Billing', 'Status'],
              widths: [110, 130, 80, 60, 52, 55],
              rows
            }
          }
        ]
      }, 'companies_registry_report.pdf');
    } else if (activeTab === 'payments') {
      const rows = filteredPayments.map((p, i) => [
        p.paymentId || '-',
        p.clientName || '-',
        p.org || '-',
        `INR ${Number(p.amount || 0).toLocaleString()}`,
        p.status || '-',
        p.date ? new Date(p.date).toLocaleDateString() : '-'
      ]);
      downloadFormalReportPdf({
        title: 'Billing & Payments Ledger',
        subtitle: 'Global Transaction Activity Logs',
        meta: [
          ['Total Transactions Count', filteredPayments.length.toString()],
          ['Total Revenue Volume', `INR ${totalBillingSum.toLocaleString()}`],
          ['Report Date', new Date().toLocaleDateString()]
        ],
        sections: [
          {
            heading: 'Payment Ledger Records',
            table: {
              headers: ['Transaction Ref', 'Client Name', 'Organization', 'Amount', 'Status', 'Date'],
              widths: [80, 110, 110, 75, 52, 60],
              rows
            }
          }
        ]
      }, 'payments_ledger_report.pdf');
    } else if (activeTab === 'users') {
      const rows = filteredUsers.map((u, i) => [
        u.name || '-',
        u.email || '-',
        u.role || '-',
        u.org || '-',
        u.date || '-'
      ]);
      downloadFormalReportPdf({
        title: 'Platform Global Users Directory',
        subtitle: 'Identity Access Registry Logs',
        meta: [
          ['Total System Users', filteredUsers.length.toString()],
          ['Report Date', new Date().toLocaleDateString()]
        ],
        sections: [
          {
            heading: 'Registered Users Registry',
            table: {
              headers: ['Name', 'Email Address', 'Role Permission', 'Associated Organization', 'Joined Date'],
              widths: [100, 130, 90, 100, 67],
              rows
            }
          }
        ]
      }, 'users_registry_report.pdf');
    } else {
      alert(`Report download is not configured for the ${activeTab} tab.`);
    }
  };

  const activeCompaniesCount = companies.filter(c => c.status === "Active").length;
  const totalPlatformUsersSum = companies.reduce((acc, c) => acc + c.users, 0);
  const activeSubscriptionsRate = companies.length > 0 ? `${(activeCompaniesCount / companies.length * 100).toFixed(1)}%` : "100%";
  const totalBillingSum = companies.reduce((acc, c) => acc + (c.status === "Active" ? c.billing : 0), 0);
  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans"> {} <AdminHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onOpenAi={() => setShowAiModal(true)} activeNotifications={activeNotifications} isNotificationsOpen={isNotificationsOpen} onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)} onCloseNotifications={() => setIsNotificationsOpen(false)} onDismiss={(id) => setDismissedIds([...dismissedIds, id])} onDismissAll={() => setDismissedIds([...dismissedIds, ...activeNotifications.map(n => n.id)])} onNavigate={(item) => { if (item.tab) { setActiveTab(item.tab); setSelectedCompany(null); } setIsNotificationsOpen(false); }} onClickProfile={onClickProfile} userEmail={userEmail} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} /> {} <div className="flex-1 flex flex-col md:flex-row relative"> {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden animate-fade-in" />} {} <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} setSelectedCompany={setSelectedCompany} companiesCount={companies.length} plansCount={plans.length} usersCount={users.length} paymentsCount={payments.length} trashCompaniesCount={trashCompanies.length} onLogout={onLogout} isOpen={isSidebarOpen} /> {} <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 space-y-8 overflow-y-auto"> {} <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"> <div> <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight"> Welcome back, Super Admin 👋 </h2> <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium"> Here is a real-time summary of the platform's multi-tenant operations for today. </p> </div> <div className="flex flex-wrap items-center gap-2"> <span className="flex items-center text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800"> <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span> {companies.filter(c => c.status === "Active").length} Companies Active </span> <span className="flex items-center text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800"> <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Uptime Target: 99.99% </span> </div> </div> {} {loading && <div className="p-8 text-center text-slate-400 font-semibold text-xs flex items-center justify-center space-x-2"> <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div> <span>Connecting to database & loading workspace...</span> </div>} {!loading && <> {} <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left"> {} <button onClick={() => {
              setActiveTab("companies");
              setSelectedCompany(null);
            }} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden text-left cursor-pointer group"> <div className="flex justify-between items-start mb-4"> <div> <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-display block">Active Companies</span> <span className="text-2xl font-extrabold text-slate-800 font-display mt-1 block group-hover:text-indigo-600 transition-colors"> {activeCompaniesCount} <span className="text-xs text-slate-400 font-medium">/ {companies.length}</span> </span> </div> <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors"><Building size={16} /></span> </div> <div className="flex items-center text-xs font-semibold text-emerald-600"> <span>Registry Ledger</span> <svg className="h-6 w-16 ml-auto" viewBox="0 0 100 30"> <path d="M0,25 Q15,10 30,22 T60,5 T90,20" fill="none" stroke="#8b5cf6" strokeWidth="2" /> </svg> </div> </button> {} <button onClick={() => {
              setActiveTab("users");
              setSelectedCompany(null);
            }} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden text-left cursor-pointer group"> <div className="flex justify-between items-start mb-4"> <div> <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-display block">Total Platform Users</span> <span className="text-2xl font-extrabold text-slate-800 font-display mt-1 block group-hover:text-purple-600 transition-colors"> {totalPlatformUsersSum.toLocaleString()} </span> </div> <span className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors"><Users size={16} /></span> </div> <div className="flex items-center text-xs font-semibold text-purple-600"> <span>Manage Userbase</span> <svg className="h-6 w-16 ml-auto" viewBox="0 0 100 30"> <path d="M0,28 Q15,20 30,12 T60,25 T90,8" fill="none" stroke="#a855f7" strokeWidth="2" /> </svg> </div> </button> {} <button onClick={() => {
              setActiveTab("subscriptions");
              setSelectedCompany(null);
            }} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden text-left cursor-pointer group"> <div className="flex justify-between items-start mb-4"> <div> <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-display block">Active Subscriptions</span> <span className="text-2xl font-extrabold text-slate-800 font-display mt-1 block group-hover:text-emerald-600 transition-colors"> {activeSubscriptionsRate} </span> </div> <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition-colors"><ShieldCheck size={16} /></span> </div> <div className="flex items-center text-xs font-semibold text-emerald-600"> <span>Subscription Packages</span> <svg className="h-6 w-16 ml-auto" viewBox="0 0 100 30"> <path d="M0,15 Q15,10 30,22 T60,5 T90,8" fill="none" stroke="#10b981" strokeWidth="2" /> </svg> </div> </button> {} <button onClick={() => {
              setActiveTab("payments");
              setSelectedCompany(null);
            }} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden text-left cursor-pointer group"> <div className="flex justify-between items-start mb-4"> <div> <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-display block">Monthly Revenue</span> <span className="text-2xl font-extrabold text-slate-800 font-display mt-1 block group-hover:text-amber-600 transition-colors"> ₹{totalBillingSum.toLocaleString()} </span> </div> <span className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-100 transition-colors"><CreditCard size={16} /></span> </div> <div className="flex items-center text-xs font-semibold text-amber-600"> <span>Payment Ledger</span> <svg className="h-6 w-16 ml-auto" viewBox="0 0 100 30"> <path d="M0,25 Q15,22 30,12 T60,18 T90,2" fill="none" stroke="#fbbf24" strokeWidth="2" /> </svg> </div> </button> </div> {} {selectedCompany ? <CompanyDetailsView company={selectedCompany} projects={projects} users={users} onClose={() => setSelectedCompany(null)} onToggleStatus={handleToggleCompanyStatus} /> : <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-left"> {} <div className="p-6 border-b border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"> <div> <h3 className="text-md font-extrabold font-display text-slate-800 capitalize"> {activeTab === "payments" ? "Payment Ledger" : activeTab === "subscriptions" ? "Subscription Plans" : `${activeTab} Registry`} </h3> <p className="text-xs text-slate-400 font-medium">Real-time status configurations and platform metrics.</p> </div> <div className="flex items-center space-x-2"> <div className="flex border border-slate-200 rounded-xl bg-slate-50 p-1 items-center space-x-1"> <Tooltip text="Filter registry list"> <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-[10px] font-bold text-slate-655 focus:outline-none cursor-pointer px-1.5 py-0.5 border border-slate-200 rounded-lg bg-white shadow-sm font-sans"> <option value="All">All Statuses</option> <option value="Active">Active Only</option> <option value="Suspended">Suspended Only</option> <option value="Pending">Pending Only</option> </select> </Tooltip> <Tooltip text="Export report PDF"> <button onClick={handleDownloadReport} className="p-1.5 text-slate-550 hover:text-slate-800 rounded-lg cursor-pointer transition-colors bg-white border border-slate-200 shadow-sm"> <Download size={12} /> </button> </Tooltip> </div> {activeTab === "companies" && <button onClick={() => {
                  setCreateError("");
                  setShowCreateModal(true);
                }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1 cursor-pointer shadow-md shadow-indigo-100 transition-colors"> <Plus size={12} /> <span>Create Company</span> </button>} {activeTab === "subscriptions" && <button onClick={handleOpenAddPlan} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1 cursor-pointer shadow-md shadow-indigo-100 transition-colors"> <Plus size={12} /> <span>Add Subscription Plan</span> </button>} </div> </div> {} {activeTab === "companies" && <CompaniesTab companies={filteredCompanies} onSelectCompany={setSelectedCompany} onToggleStatus={handleToggleCompanyStatus} onSoftDelete={handleSoftDeleteCompany} />} {activeTab === "trash" && <TrashTab trashCompanies={filteredTrashCompanies} onRestore={handleRestoreCompany} onPermanentDelete={handlePermanentDeleteCompany} />} {activeTab === "subscriptions" && <SubscriptionsTab plans={plans} companies={companies} onEditPlan={handleOpenEditPlan} onDeletePlan={handleDeletePlan} />} {activeTab === "users" && <UsersTab users={filteredUsers} onDeleteUser={handleDeleteUser} />} {activeTab === "payments" && <PaymentsTab payments={filteredPayments} companies={companies} />} {activeTab === "reports" && <ReportsTab />} </div>} </>} </main> </div> {} {showAiModal && <AiModal onClose={() => setShowAiModal(false)} />} {} {showCreateModal && <CreateCompanyModal plans={plans} onClose={() => setShowCreateModal(false)} onSubmit={handleCreateCompanySubmit} error={createError} />} {} {showPlanModal && <PlanModal isEditingPlan={isEditingPlan} planForm={planForm} onClose={() => setShowPlanModal(false)} onSubmit={handlePlanFormSubmit} error={planError} />} </div>;
}
