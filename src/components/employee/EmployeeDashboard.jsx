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
  CheckSquare,
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import EmployeeAttendance from './EmployeeAttendance';
import EmployeeGitHub from './EmployeeGitHub';
import EmployeeLeaves from './EmployeeLeaves';
import EmployeeLogin from './EmployeeLogin';
import EmployeeProfile from './EmployeeProfile';
import EmployeeProjects from './EmployeeProjects';
import TasksTab from '../TasksTab';
import FloatingChat from '../FloatingChat';
import NotificationsDropdown from '../NotificationsDropdown';
import ThemeToggle from '../ThemeToggle';

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
  { id: 'tasks', label: 'Task Manager', icon: CheckSquare, component: TasksTab },
  { id: 'projects', label: 'Projects', icon: FolderGit2, component: EmployeeProjects },
  { id: 'leaves', label: 'Leaves', icon: Calendar, component: EmployeeLeaves },
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

      if (leavesRes.status === 401 || projectsRes.status === 401 || attendanceRes.status === 401) {
        handleLogout();
        return;
      }

      const [leavesData, projectsData, attendanceData] = await Promise.all([
        leavesRes.json(),
        projectsRes.json(),
        attendanceRes.json(),
      ]);

      setIsCheckedIn(Boolean(attendanceData.success && attendanceData.data?.checkIn && !attendanceData.data?.checkOut));

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

        projectsData.data.forEach((project) => {
          (project.tasks || []).forEach((task) => {
            const isMine =
              task.assigneeEmail?.trim().toLowerCase() === email.trim().toLowerCase();
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-indigo-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading workspace...</p>
      </div>
    );
  }

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || EmployeeAttendance;

  return (
    <div className="employee-light-theme min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden">
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
              isCheckedIn={isCheckedIn}
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
              <ActiveComponent
                role="Employee"
                token={token}
                user={userProfile}
                userEmail={userProfile?.email}
                adminName={userProfile?.name}
                employeeEmail={userProfile?.email}
                onRefreshProfile={() => fetchProfile(token)}
                onAttendanceChange={setIsCheckedIn}
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
    <nav className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Building2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">Syncra Workspace</p>
            <p className="truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-display">
              {userProfile?.org || 'Employee Workspace'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle compact />

          <div className="relative">
            <button
              onClick={onToggleNotifications}
              className="relative rounded-xl p-2 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
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

          <div className="hidden items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-3 sm:flex">
            <div className="text-right">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">{userProfile?.name || 'Employee'}</p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
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
            className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-350 transition hover:bg-slate-200 dark:hover:bg-slate-700 lg:hidden"
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
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 lg:flex lg:flex-col lg:justify-between animate-transition">
      <TabList tabs={tabs} activeTab={activeTab} onSelectTab={onSelectTab} />
      <SidebarActions onLogout={onLogout} onBackToLanding={onBackToLanding} />
    </aside>
  );
}

function MobileMenu({ tabs, activeTab, onSelectTab, onClose, onLogout, onBackToLanding }) {
  return (
    <div className="fixed inset-0 z-40 bg-slate-900/30 dark:bg-slate-950/40 backdrop-blur-sm lg:hidden">
      <aside className="flex h-full w-72 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl animate-slide-right">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">Menu</span>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
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
      <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-450">
        Workspace
      </p>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition cursor-pointer ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-900/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
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
    <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-805 cursor-pointer"
        >
          Landing Page
        </button>
      )}
      <button
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
      >
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );
}

function DashboardHeader({ userProfile, isCheckedIn }) {
  return (
    <header className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Employee Console</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {userProfile?.name || 'Workspace'}
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
            Manage attendance, assigned work, leave requests, and workspace messages.
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-extrabold ${
            isCheckedIn
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {isCheckedIn ? 'Checked In' : 'Not Checked In'}
        </span>
      </div>
    </header>
  );
}



