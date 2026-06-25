import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Building2,
  Calendar,
  Clock,
  FolderGit2,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  User,
  X,
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import EmployeeAttendance from './EmployeeAttendance';
import EmployeeChat from './EmployeeChat';
import EmployeeGitHub from './EmployeeGitHub';
import EmployeeLeaves from './EmployeeLeaves';
import EmployeeLogin from './EmployeeLogin';
import EmployeeProfile from './EmployeeProfile';
import EmployeeProjects from './EmployeeProjects';
import FloatingChat from '../FloatingChat';
import NotificationsDropdown from '../NotificationsDropdown';

const Github = ({ size = 20, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const tabs = [
  { id: 'attendance', label: 'Attendance', icon: Clock, component: EmployeeAttendance },
  { id: 'projects', label: 'Projects', icon: FolderGit2, component: EmployeeProjects },
  { id: 'leaves', label: 'Leaves', icon: Calendar, component: EmployeeLeaves },
  { id: 'chat', label: 'Messages', icon: MessageSquare, component: EmployeeChat },
  { id: 'github', label: 'GitHub', icon: Github, component: EmployeeGitHub },
  { id: 'profile', label: 'Profile', icon: User, component: EmployeeProfile },
];

const getDismissedNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
  } catch {
    return [];
  }
};

export default function EmployeeDashboard({ onBackToLanding }) {
  const [token, setToken] = useState(localStorage.getItem('employeeToken'));
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(getDismissedNotifications);
  const [projectsCount, setProjectsCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const activeNotifications = useMemo(
    () => notifications.filter((item) => !dismissedIds.includes(item.id)),
    [dismissedIds, notifications]
  );

  const fetchProfile = useCallback(async (authToken) => {
    setLoadingProfile(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchDashboardData = useCallback(async (authToken, email) => {
    if (!authToken || !email) return;

    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const [leavesRes, projectsRes, attendanceRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/leaves`, { headers }),
        fetch(`${API_BASE_URL}/api/employee-portal/projects`, { headers }),
        fetch(`${API_BASE_URL}/api/employee-portal/attendance/today`, { headers }),
      ]);

      const [leavesData, projectsData, attendanceData] = await Promise.all([
        leavesRes.json(),
        projectsRes.json(),
        attendanceRes.json(),
      ]);

      setIsCheckedIn(Boolean(attendanceData.success && attendanceData.data?.checkIn));

      const nextNotifications = [];

      if (leavesData.success) {
        leavesData.data
          .filter((leave) => leave.email?.toLowerCase() === email.toLowerCase())
          .filter((leave) => leave.status === 'Approved' || leave.status === 'Declined')
          .forEach((leave) => {
            nextNotifications.push({
              id: `leave_emp_${leave._id || leave.id}_${leave.status}`,
              type: 'leave_request',
              title: `Leave Request ${leave.status}`,
              desc: `Your leave request from ${leave.startDate} to ${leave.endDate} was ${leave.status.toLowerCase()}.`,
              tab: 'leaves',
            });
          });
      }

      if (projectsData.success) {
        let pendingTasks = 0;
        setProjectsCount(projectsData.data.length);

        projectsData.data.forEach((project) => {
          (project.tasks || []).forEach((task) => {
            const isMine = task.assigneeEmail?.toLowerCase() === email.toLowerCase();
            if (isMine && task.status !== 'Done') {
              pendingTasks += 1;
              nextNotifications.push({
                id: `task_emp_${task.id || task._id}`,
                type: 'timesheet_approval',
                title: `Task Assigned: ${project.name}`,
                desc: `${task.title} (${task.status})`,
                tab: 'projects',
              });
            }
          });
        });

        setPendingTasksCount(pendingTasks);
      }

      setNotifications(nextNotifications);
    } catch (err) {
      console.error('Failed to load employee dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    if (token) fetchProfile(token);
  }, [fetchProfile, token]);

  useEffect(() => {
    if (!token || !userProfile?.email) return undefined;
    fetchDashboardData(token, userProfile.email);
    const interval = setInterval(() => fetchDashboardData(token, userProfile.email), 10000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, token, userProfile?.email]);

  const handleLoginSuccess = (newToken, data) => {
    setToken(newToken);
    setUserProfile(data);
    fetchProfile(newToken);
  };

  function handleLogout() {
    [
      'employeeToken',
      'employeeName',
      'employeeEmail',
      'employeeId',
      'companyId',
      'org',
    ].forEach((key) => localStorage.removeItem(key));
    setToken(null);
    setUserProfile(null);
    setActiveTab('attendance');
  }

  const saveDismissed = (ids) => {
    setDismissedIds(ids);
    localStorage.setItem('dismissed_notifications', JSON.stringify(ids));
  };

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  if (!token) {
    return <EmployeeLogin onLoginSuccess={handleLoginSuccess} onBackToLanding={onBackToLanding} />;
  }

  if (loadingProfile && !userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-indigo-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading workspace...</p>
      </div>
    );
  }

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || EmployeeAttendance;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      <EmployeeTopBar
        userProfile={userProfile}
        activeNotifications={activeNotifications}
        isNotificationsOpen={isNotificationsOpen}
        onToggleNotifications={() => setIsNotificationsOpen((value) => !value)}
        onCloseNotifications={() => setIsNotificationsOpen(false)}
        onDismiss={(id) => saveDismissed([...dismissedIds, id])}
        onDismissAll={() => saveDismissed([...dismissedIds, ...activeNotifications.map((item) => item.id)])}
        onNavigate={(item) => {
          if (item.tab) setActiveTab(item.tab);
          setIsNotificationsOpen(false);
        }}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((value) => !value)}
      />

      <div className="flex flex-1 min-h-0">
        <EmployeeSidebar
          tabs={tabs}
          activeTab={activeTab}
          onSelectTab={handleTabSelect}
          onLogout={handleLogout}
          onBackToLanding={onBackToLanding}
        />

        {mobileMenuOpen && (
          <MobileMenu
            tabs={tabs}
            activeTab={activeTab}
            onSelectTab={handleTabSelect}
            onClose={() => setMobileMenuOpen(false)}
            onLogout={handleLogout}
            onBackToLanding={onBackToLanding}
          />
        )}

        <main className="flex-1 min-w-0 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <DashboardHeader
              userProfile={userProfile}
              projectsCount={projectsCount}
              pendingTasksCount={pendingTasksCount}
              isCheckedIn={isCheckedIn}
              onSelectTab={setActiveTab}
            />

            <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm sm:p-6">
              <ActiveComponent
                token={token}
                user={userProfile}
                employeeEmail={userProfile?.email}
                onRefreshProfile={() => fetchProfile(token)}
              />
            </section>
          </div>
        </main>
      </div>

      <FloatingChat token={token} user={userProfile} userRole="Employee" />
    </div>
  );
}

function EmployeeTopBar({
  userProfile,
  activeNotifications,
  isNotificationsOpen,
  onToggleNotifications,
  onCloseNotifications,
  onDismiss,
  onDismissAll,
  onNavigate,
  mobileMenuOpen,
  onToggleMobileMenu,
}) {
  return (
    <nav className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Building2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-white">Syncra Workspace</p>
            <p className="truncate text-[11px] font-semibold text-slate-400">
              {userProfile?.org || 'Employee Workspace'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              onClick={onToggleNotifications}
              className="relative rounded-xl p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {activeNotifications.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
              )}
            </button>
            <NotificationsDropdown
              notifications={activeNotifications}
              onDismiss={onDismiss}
              onDismissAll={onDismissAll}
              onNavigate={onNavigate}
              isOpen={isNotificationsOpen}
              onClose={onCloseNotifications}
            />
          </div>

          <div className="hidden items-center gap-3 border-l border-slate-800 pl-3 sm:flex">
            <div className="text-right">
              <p className="text-xs font-extrabold text-white">{userProfile?.name || 'Employee'}</p>
              <p className="text-[10px] font-semibold text-slate-500">
                {userProfile?.domain || 'Team Member'}
              </p>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold text-white"
              style={{ backgroundColor: userProfile?.avatarColor || '#6366f1' }}
            >
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : '?'}
            </div>
          </div>

          <button
            onClick={onToggleMobileMenu}
            className="rounded-xl bg-slate-900 p-2 text-slate-300 transition hover:bg-slate-800 lg:hidden"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

function EmployeeSidebar({ tabs, activeTab, onSelectTab, onLogout, onBackToLanding }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-4 lg:flex lg:flex-col lg:justify-between">
      <TabList tabs={tabs} activeTab={activeTab} onSelectTab={onSelectTab} />
      <SidebarActions onLogout={onLogout} onBackToLanding={onBackToLanding} />
    </aside>
  );
}

function MobileMenu({ tabs, activeTab, onSelectTab, onClose, onLogout, onBackToLanding }) {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden">
      <aside className="flex h-full w-72 flex-col justify-between border-r border-slate-800 bg-slate-950 p-5 shadow-2xl">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-sm font-extrabold text-white">Menu</span>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-900">
              <X size={16} />
            </button>
          </div>
          <TabList tabs={tabs} activeTab={activeTab} onSelectTab={onSelectTab} />
        </div>
        <SidebarActions onLogout={onLogout} onBackToLanding={onBackToLanding} />
      </aside>
    </div>
  );
}

function TabList({ tabs, activeTab, onSelectTab }) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
        Workspace
      </p>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
              isActive
                ? 'bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SidebarActions({ onLogout, onBackToLanding }) {
  return (
    <div className="space-y-2 border-t border-slate-800 pt-4">
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="w-full rounded-xl border border-slate-800 px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-900"
        >
          Landing Page
        </button>
      )}
      <button
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-950/30"
      >
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );
}

function DashboardHeader({
  userProfile,
  projectsCount,
  pendingTasksCount,
  isCheckedIn,
  onSelectTab,
}) {
  return (
    <header className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Employee Console</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {userProfile?.name || 'Workspace'}
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-400">
            Manage attendance, assigned work, leave requests, and workspace messages.
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-extrabold ${
            isCheckedIn
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
          }`}
        >
          {isCheckedIn ? 'Checked In' : 'Not Checked In'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          label="Projects"
          value={projectsCount}
          caption="Assigned"
          icon={FolderGit2}
          color="indigo"
          onClick={() => onSelectTab('projects')}
        />
        <MetricCard
          label="Open Tasks"
          value={pendingTasksCount}
          caption="Pending"
          icon={Clock}
          color="purple"
          onClick={() => onSelectTab('projects')}
        />
        <MetricCard
          label="Shift"
          value={isCheckedIn ? 'Active' : 'Closed'}
          caption="Today"
          icon={Calendar}
          color={isCheckedIn ? 'emerald' : 'amber'}
          onClick={() => onSelectTab('attendance')}
        />
      </div>
    </header>
  );
}

function MetricCard({ label, value, caption, icon: Icon, color, onClick }) {
  const colorClass = {
    amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/20',
    purple: 'bg-purple-500/10 text-purple-300 ring-purple-500/20',
  }[color];

  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left shadow-sm transition hover:border-slate-700 hover:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{caption}</p>
        </div>
        <span className={`rounded-xl p-2 ring-1 ${colorClass}`}>
          <Icon size={16} />
        </span>
      </div>
    </button>
  );
}
