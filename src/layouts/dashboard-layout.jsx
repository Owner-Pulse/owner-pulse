import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router';
import { Bell, Menu, X, Home, Users, BookOpen, DollarSign, AlertTriangle, Settings, LogOut, ClipboardList, Wrench, GraduationCap, Calendar, UserCircle, Shield } from 'lucide-react';
import logo from '../assets/Logo.png';
import ErrorBoundary from '../components/ErrorBoundary';

const ownerTabs = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "enrollment", label: "Enrollment", icon: Users },
  { id: "classrooms", label: "Classrooms", icon: BookOpen },
  { id: "cashflow", label: "Cash Flow", icon: DollarSign },
  { id: "compliance", label: "Compliance", icon: AlertTriangle },
  // { id: "billing", label: "Billing / AR", icon: DollarSign },
  // { id: "class-scores", label: "CLASS Scores", icon: BookOpen },
  // { id: "internal-reminders", label: "Reminders", icon: Calendar },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "budget", label: "Budget", icon: DollarSign },
  { id: "scholarships", label: "Scholarships", icon: GraduationCap },
  { id: "staff", label: "Staff", icon: Users },
  { id: "waitlist", label: "Waitlist", icon: Calendar },
  { id: "director-management", label: "Director Mgmt", icon: Shield },
  // { id: "pending-decisions", label: "Decisions", icon: AlertTriangle },
];

const directorTabs = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "daily-log", label: "Daily Log", icon: ClipboardList },
  { id: "staff", label: "Staff", icon: Users },
  { id: "students", label: "Students", icon: GraduationCap },
  // { id: "billing", label: "Billing / AR", icon: DollarSign },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "payroll", label: "Payroll", icon: DollarSign },
  { id: "budget", label: "My Budget", icon: DollarSign },
  { id: "waitlist", label: "Waitlist", icon: Calendar },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
];

const bottomTabs = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── Notification data & helpers ────────────────────────────────────────
const NOTIF_ICONS = {
  maintenance:      { icon: Wrench,        bg: "bg-orange-50",   text: "text-orange-600" },
  incident:         { icon: Shield,        bg: "bg-red-50",      text: "text-red-600" },
  compliance:       { icon: AlertTriangle, bg: "bg-amber-50",    text: "text-amber-600" },
  staff:            { icon: Users,         bg: "bg-purple-50",   text: "text-purple-600" },
  substitute:       { icon: Users,         bg: "bg-blue-50",     text: "text-blue-600" },
  payroll:          { icon: DollarSign,    bg: "bg-emerald-50",  text: "text-emerald-600" },
  scholarship:      { icon: GraduationCap, bg: "bg-violet-50",   text: "text-violet-600" },
  student:          { icon: Users,         bg: "bg-rose-50",     text: "text-rose-600" },
  task:             { icon: ClipboardList, bg: "bg-sky-50",      text: "text-sky-600" },
  financial:        { icon: DollarSign,    bg: "bg-teal-50",     text: "text-teal-600" },
  general:          { icon: Bell,          bg: "bg-gray-50",     text: "text-gray-600" },
};

const getBasePath = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{"role":"owner"}');
  return user.role === 'owner' ? '/owner' : '/director';
};

const INITIAL_NOTIFS = [
  { id: 1,  type: "maintenance",  title: "Critical: AC unit not cooling",           description: "PreK-3 classroom temp reached 87°F.",                time: Date.now() - 1800000,   read: false, critical: true,  link: null, path: "/maintenance" },
  { id: 2,  type: "incident",     title: "Major incident — Sequoia classroom",      description: "Physical altercation between two 5th graders.",       time: Date.now() - 3600000,   read: false, critical: true,  link: null, path: "/students" },
  { id: 3,  type: "compliance",   title: "CPR certifications expired",             description: "3 staff need recertification by May 20.",             time: Date.now() - 7200000,   read: false, critical: true,  link: null, path: "/compliance" },
  { id: 4,  type: "payroll",      title: "Payroll submitted for approval",         description: "Period ending May 15 — owner review needed.",          time: Date.now() - 14400000,  read: false, critical: false, link: null, path: "/payroll" },
  { id: 5,  type: "staff",        title: "Mr. Nguyen called out sick",             description: "6th call-out. Ms. Hart arranged as sub.",             time: Date.now() - 28800000,  read: false, critical: false, link: null, path: "/staff" },
  { id: 6,  type: "scholarship",  title: "Step Up approval stuck — 22 days",       description: "D. Kim's $3,100 application flagged.",                time: Date.now() - 86400000,  read: false, critical: true,  link: null, path: "/scholarships" },
  { id: 7,  type: "student",      title: "J. Martinez at-risk — financial",        description: "Family lost job, asked about payment plan.",           time: Date.now() - 172800000, read: false, critical: true,  link: null, path: "/students" },
  { id: 8,  type: "task",         title: "Faculty CPR certification overdue",      description: "Was due May 1 — 4 staff still need it.",               time: Date.now() - 259200000, read: true,  critical: true,  link: null, path: "/tasks" },
  { id: 9,  type: "maintenance",  title: "Playground gate latch repaired",         description: "Completed for Kindergarten safety issue.",             time: Date.now() - 345600000, read: true,  critical: false, link: null, path: "/maintenance" },
  { id: 10, type: "financial",    title: "QuickBooks sync completed",              description: "Bank balance $487,200. 3 pending transactions.",       time: Date.now() - 432000000, read: true,  critical: false, link: null, path: "/cashflow" },
];

const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const user = JSON.parse(localStorage.getItem('user') || '{"role": "owner"}');
  const role = user.role;
  const menuItems = role === "owner" ? ownerTabs : directorTabs;

  // Click-outside handler for notification dropdown
  useEffect(() => {
    if (!notifOpen) return;
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  // Notif helpers
  const notifStats = useMemo(() => ({
    unread: notifications.filter((n) => !n.read).length,
    critical: notifications.filter((n) => n.critical && !n.read).length,
  }), [notifications]);

  const filteredNotifs = useMemo(() => {
    if (notifFilter === "unread") return notifications.filter((n) => !n.read);
    if (notifFilter === "critical") return notifications.filter((n) => n.critical);
    return notifications;
  }, [notifFilter, notifications]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleNotifRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const basePath = `/${role}`;

  return (
    <div className="min-h-screen text-white flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 w-72 h-screen bg-white border-r border-gray-200 shadow-sm transition-transform duration-300`}>
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="Logo" className="h-14 w-auto scale-145" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">OwnerPulse</h1>
              <p className="text-[10px] text-gray-400 capitalize">{role} Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
            {menuItems.map((item) => {
              const basePath = `/${role}`;
              const destination = `${basePath}/${item.id}`;
              const isActive = currentPath === destination;
              
              return (
                <NavLink
                  key={item.id}
                  to={destination}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive 
                      ? 'bg-[#1E3A5F] text-white font-semibold' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          
          {/* Profile & Settings */}
          <nav className="space-y-1 mb-2">
            {bottomTabs.map((item) => {
              const destination = `/${role}/${item.id}`;
              const isActive = currentPath === destination;
              return (
                <NavLink
                  key={item.id}
                  to={destination}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive 
                      ? 'bg-[#1E3A5F] text-white font-semibold' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="pt-3 border-t border-gray-200">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-all">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex shrink-0 items-center px-4 md:px-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between w-full ">
            {/* Mobile Menu Button */}              <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Title / Page Name */}
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notifications Bell — dropdown panel */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors relative text-gray-600"
                >
                  <Bell size={22} />
                  {notifStats.unread > 0 && (
                    <span className="absolute top-2 right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 rounded-full ring-2 ring-white text-[9px] font-bold px-1">
                      {notifStats.unread > 9 ? "9+" : notifStats.unread}
                    </span>
                  )}
                </button>

                {/* Dropdown Panel */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[400px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[100]" style={{ boxShadow: "0 20px 60px -12px rgba(0,0,0,0.25)" }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {notifStats.unread > 0
                            ? `${notifStats.unread} unread · ${notifStats.critical} critical`
                            : "All caught up!"}
                        </p>
                      </div>
                      {notifStats.unread > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Filter Chips */}
                    <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-50">
                      {[
                        { key: "all", label: "All" },
                        { key: "unread", label: "Unread" },
                        { key: "critical", label: "Critical" },
                      ].map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setNotifFilter(f.key)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                            notifFilter === f.key
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Notifications List (scrollable) */}
                    <div className="overflow-y-auto max-h-[340px]">
                      {filteredNotifs.length === 0 ? (
                        <div className="p-6 text-center">
                          <div className="mx-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                            <Bell size={20} className="text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">All clear!</p>
                          <p className="text-xs text-gray-400 mt-0.5">No notifications to show.</p>
                        </div>
                      ) : (
                        filteredNotifs.map((notif) => {
                          const cfg = NOTIF_ICONS[notif.type] || NOTIF_ICONS.general;
                          const Icon = cfg.icon;
                          return (
                            <div
                              key={notif.id}
                              onClick={() => {
                                toggleNotifRead(notif.id);
                                if (notif.path) navigate(getBasePath() + notif.path);
                                setNotifOpen(false);
                              }}
                              className={`flex items-start gap-3 px-5 py-3 cursor-pointer transition-all hover:bg-gray-50 ${
                                !notif.read ? "bg-blue-50/40" : ""
                              } border-b border-gray-50 last:border-b-0`}
                            >
                              {/* Icon */}
                              <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                                <Icon size={18} className={cfg.text} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-xs ${notif.read ? "font-medium" : "font-semibold"} text-gray-900 line-clamp-1`}>
                                    {notif.critical && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1 shrink-0" />}
                                    {notif.title}
                                  </p>
                                  <span className="text-[9px] text-gray-400 whitespace-nowrap shrink-0 leading-4">{timeAgo(notif.time)}</span>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 leading-normal">{notif.description}</p>
                              </div>

                              {/* Unread indicator */}
                              {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold uppercase">
                    {user?.name?.slice(0, 2) || "JD"}
                  </div>
                  <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-800">{user?.name || "John Doe"}</p>
                  <p className="text-xs text-gray-400 -mt-0.5 capitalize">{role}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 text-gray-900 relative p-5">
          <ErrorBoundary fallbackTitle="Dashboard Error" fallbackMessage="A section of the dashboard encountered an error. The rest of the page should still work.">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
