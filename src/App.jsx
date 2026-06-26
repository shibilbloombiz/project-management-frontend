import { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import Login from './components/admin/Login';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import CompanyAdminDashboard from './components/company/CompanyAdminDashboard';
import ClientShareGateway from './components/ClientShareGateway';
import CompanyRegister from './components/CompanyRegister';
import PlanSelection from './components/PlanSelection';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import LeadDashboard from './components/lead/LeadDashboard';
import LandingPage from './components/landing/LandingPage';
import MethodologyModal from './components/landing/MethodologyModal';
import AdminProfile from './components/company/AdminProfile';
import SuperAdminProfile from './components/admin/SuperAdminProfile';
import useTheme from './hooks/useTheme';

function App() {
  useTheme();
  const [view, setView] = useState('landing'); // 'landing' | 'login' | 'register' | 'plan-selection' | 'dashboard' | 'share'
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [org, setOrg] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [shareAccessKey, setShareAccessKey] = useState('');
  const [plans, setPlans] = useState([]);

  // Fetch subscription plans on mount for pricing sync
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/plans`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPlans(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch pricing plans in App.jsx:', err));
  }, []);

  // Sync state with session storage to handle reloads
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/employee-portal') {
      setView('employee-portal');
      return;
    }
    if (path.startsWith('/share/')) {
      const key = path.split('/share/')[1];
      if (key) {
        setShareAccessKey(key);
        setView('share');
        return;
      }
    }

    const savedToken = sessionStorage.getItem('syncra_token');
    const savedEmail = sessionStorage.getItem('syncra_email');
    const savedRole = sessionStorage.getItem('syncra_role');
    const savedCompanyId = sessionStorage.getItem('syncra_companyId');
    const savedOrg = sessionStorage.getItem('syncra_org');
    const savedView = sessionStorage.getItem('syncra_view');

    if (savedToken && savedEmail) {
      setUserEmail(savedEmail);
      setUserRole(savedRole || 'Employee');
      setCompanyId(savedCompanyId || '');
      setOrg(savedOrg || '');
      setView(savedView || 'dashboard');
    } else if (savedView === 'login') {
      setView('login');
    } else if (savedView === 'register') {
      setView('register');
    } else if (savedView === 'plan-selection') {
      setView('plan-selection');
    } else {
      setView('landing');
    }
  }, []);

  // Intersection Observer for scroll animations (Landing View)
  useEffect(() => {
    if (view !== 'landing') return;

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
      );

      const elements = document.querySelectorAll('.reveal');
      elements.forEach((el) => observer.observe(el));

      return () => {
        elements.forEach((el) => observer.unobserve(el));
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [view]);

  const handleStartTrial = () => {
    setView('register');
    sessionStorage.setItem('syncra_view', 'register');
  };

  const handleGoToLogin = () => {
    setView('login');
    sessionStorage.setItem('syncra_view', 'login');
  };

  const handleSelectPricingPlan = (planName) => {
    setSelectedPlan(planName);
    setView('register');
    sessionStorage.setItem('syncra_view', 'register');
  };

  const handleRegisterSuccess = (adminEmail) => {
    setRegisteredEmail(adminEmail);
    setView('login');
    sessionStorage.setItem('syncra_view', 'login');
  };

  const handleLoginSuccess = (token, email, role, companyIdVal, orgVal) => {
    sessionStorage.setItem('syncra_token', token);
    sessionStorage.setItem('syncra_email', email);
    sessionStorage.setItem('syncra_role', role);
    sessionStorage.setItem('syncra_companyId', companyIdVal || '');
    sessionStorage.setItem('syncra_org', orgVal || '');

    setUserEmail(email);
    setUserRole(role);
    setCompanyId(companyIdVal || '');
    setOrg(orgVal || '');

    // All roles go straight to dashboard — plan was selected at registration
    setView('dashboard');
    sessionStorage.setItem('syncra_view', 'dashboard');
  };

  const handlePlanSelectionSuccess = (planName) => {
    setSelectedPlan(planName);
    setView('dashboard');
    sessionStorage.setItem('syncra_view', 'dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('syncra_token');
    sessionStorage.removeItem('syncra_email');
    sessionStorage.removeItem('syncra_role');
    sessionStorage.removeItem('syncra_companyId');
    sessionStorage.removeItem('syncra_org');
    sessionStorage.setItem('syncra_view', 'landing');
    setUserEmail('');
    setUserRole('');
    setCompanyId('');
    setOrg('');
    setRegisteredEmail('');
    setSelectedPlan('');
    setView('landing');
  };

  const handleOpenModal = (model) => {
    setSelectedModel(model);
  };

  const handleCloseModal = () => {
    setSelectedModel(null);
  };

  // View state-based router
  if (view === 'register') {
    return (
      <CompanyRegister
        defaultPlan={selectedPlan}
        onCancel={() => { setView('landing'); sessionStorage.setItem('syncra_view', 'landing'); }}
        onRegisterSuccess={handleRegisterSuccess}
        onGoToLogin={() => { setView('login'); sessionStorage.setItem('syncra_view', 'login'); }}
      />
    );
  }

  if (view === 'login') {
    return (
      <Login
        initialEmail={registeredEmail}
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => { setView('landing'); sessionStorage.setItem('syncra_view', 'landing'); }}
      />
    );
  }

  if (view === 'plan-selection') {
    return (
      <PlanSelection
        plans={plans}
        companyId={companyId}
        companyName={org}
        onPlanSelected={handlePlanSelectionSuccess}
      />
    );
  }

  if (view === 'share') {
    return (
      <ClientShareGateway
        accessKey={shareAccessKey}
        onBackToLanding={() => {
          setView('landing');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (view === 'employee-portal') {
    return (
      <EmployeeDashboard
        onBackToLanding={() => {
          setView('landing');
          sessionStorage.setItem('syncra_view', 'landing');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (view === 'profile') {
    if (userRole === 'Super Admin') {
      return (
        <SuperAdminProfile
          userEmail={userEmail}
          onBack={() => { setView('dashboard'); sessionStorage.setItem('syncra_view', 'dashboard'); }}
          onLogout={handleLogout}
        />
      );
    } else if (userRole === 'Company Admin') {
      return (
        <AdminProfile
          userEmail={userEmail}
          adminName={localStorage.getItem(`syncra_profile_name_${userEmail.toLowerCase()}`) || ''}
          org={org}
          onBack={() => { setView('dashboard'); sessionStorage.setItem('syncra_view', 'dashboard'); }}
          onLogout={handleLogout}
        />
      );
    }
  }

  if (view === 'dashboard') {
    if (userRole === 'Super Admin') {
      return <SuperAdminDashboard userEmail={userEmail} onLogout={handleLogout} onClickProfile={() => { setView('profile'); sessionStorage.setItem('syncra_view', 'profile'); }} />;
    } else if (userRole === 'Company Admin') {
      return (
        <CompanyAdminDashboard
          userEmail={userEmail}
          companyId={companyId}
          initialOrg={org}
          onLogout={handleLogout}
          onClickProfile={() => { setView('profile'); sessionStorage.setItem('syncra_view', 'profile'); }}
          onChangePlan={() => { setView('plan-selection'); sessionStorage.setItem('syncra_view', 'plan-selection'); }}
        />
      );
    } else if (userRole === 'Project Lead' || userRole === 'project_lead') {
      return (
        <LeadDashboard
          userEmail={userEmail}
          companyId={companyId}
          initialOrg={org}
          onLogout={handleLogout}
        />
      );
    } else {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
          <p className="text-sm text-slate-500 mt-2">Only authorized administrators can access this workspace dashboard console.</p>
          <button onClick={handleLogout} className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer">
            Log Out
          </button>
        </div>
      );
    }
  }

  return (
    <>
      <LandingPage
        plans={plans}
        onStartTrial={handleStartTrial}
        onSelectModel={handleOpenModal}
        onSelectPricingPlan={handleSelectPricingPlan}
        onLogin={handleGoToLogin}
      />
      <MethodologyModal selectedModel={selectedModel} onClose={handleCloseModal} />
    </>
  );
}

export default App;
