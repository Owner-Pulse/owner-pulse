import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router';
import { Bell, Menu, X, Home, Users, BookOpen, DollarSign, AlertTriangle, Settings, LogOut, ClipboardList, Wrench, GraduationCap, Calendar, UserCircle, Shield, Percent } from 'lucide-react';
import logo from '../assets/Logo.png';
import ErrorBoundary from '../components/ErrorBoundary';
import { useGetUser } from '@/hooks/auth/user-details.hook';
import { useSignout } from '@/hooks/auth/auth.hook';
import { useGetNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/notification.hook';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { useQueryClient } from '@tanstack/react-query';
import { initEcho, listenToNotifications, requestNotificationPermission, setupNotificationTapListener } from '@/lib/reverb-connection';

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
  { id: "payroll", label: "Payroll", icon: DollarSign },
  { id: "scholarships", label: "Scholarships", icon: GraduationCap },
  { id: "discounts", label: "Discounts", icon: Percent },
  { id: "staff", label: "Staff", icon: Users },
  { id: "pto", label: "PTO", icon: Calendar },
  { id: "waitlist", label: "Waitlist", icon: Calendar },
  { id: "director-management", label: "Director Management", icon: Shield },
  // { id: "pending-decisions", label: "Decisions", icon: AlertTriangle },
];

const directorTabs = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "daily-log", label: "Daily Log", icon: ClipboardList },
  { id: "staff", label: "Staff", icon: Users },
  { id: "pto", label: "PTO", icon: Calendar },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "discounts", label: "Discounts", icon: Percent },
  { id: "compliance", label: "Compliance", icon: AlertTriangle },
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

// Notification data & helpers — icon glyphs only; the tint is driven by
// severity (brick = critical, navy = unread, gray = read) so color always
// means the same thing.
const NOTIF_ICONS = {
  maintenance: Wrench,
  incident: Shield,
  compliance: AlertTriangle,
  staff: Users,
  substitute: Users,
  payroll: DollarSign,
  scholarship: GraduationCap,
  discount: Percent,
  student: Users,
  task: ClipboardList,
  financial: DollarSign,
  general: Bell,
};

// const getBasePath = () => {
//   const user = JSON.parse(localStorage.getItem('user') || '{"role":"owner"}');
//   return user.role === 'owner' ? '/owner' : '/director';
// };

const INITIAL_NOTIFS = [
  { id: 1, type: "maintenance", title: "Critical: AC unit not cooling", description: "PreK-3 classroom temp reached 87°F.", time: Date.now() - 1800000, read: false, critical: true, link: null, path: "/maintenance" },
  { id: 2, type: "incident", title: "Major incident — Sequoia classroom", description: "Physical altercation between two 5th graders.", time: Date.now() - 3600000, read: false, critical: true, link: null, path: "/students" },
  { id: 3, type: "compliance", title: "CPR certifications expired", description: "3 staff need recertification by May 20.", time: Date.now() - 7200000, read: false, critical: true, link: null, path: "/compliance" },
  { id: 4, type: "payroll", title: "Payroll submitted for approval", description: "Period ending May 15 — owner review needed.", time: Date.now() - 14400000, read: false, critical: false, link: null, path: "/payroll" },
  { id: 5, type: "staff", title: "Mr. Nguyen called out sick", description: "6th call-out. Ms. Hart arranged as sub.", time: Date.now() - 28800000, read: false, critical: false, link: null, path: "/staff" },
  { id: 6, type: "scholarship", title: "Step Up approval stuck — 22 days", description: "D. Kim's $3,100 application flagged.", time: Date.now() - 86400000, read: false, critical: true, link: null, path: "/scholarships" },
  { id: 7, type: "student", title: "J. Martinez at-risk — financial", description: "Family lost job, asked about payment plan.", time: Date.now() - 172800000, read: false, critical: true, link: null, path: "/students" },
  { id: 8, type: "task", title: "Faculty CPR certification overdue", description: "Was due May 1 — 4 staff still need it.", time: Date.now() - 259200000, read: true, critical: true, link: null, path: "/tasks" },
  { id: 9, type: "maintenance", title: "Playground gate latch repaired", description: "Completed for Kindergarten safety issue.", time: Date.now() - 345600000, read: true, critical: false, link: null, path: "/maintenance" },
  { id: 10, type: "financial", title: "QuickBooks sync completed", description: "Bank balance $487,200. 3 pending transactions.", time: Date.now() - 432000000, read: true, critical: false, link: null, path: "/cashflow" },
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
  const queryClient = useQueryClient();
  const { user } = useGetUser();
  const { signout, isPending: isPendingSignout } = useSignout();
  const { notifications: apiNotifications } = useGetNotifications();
  const { markAsRead } = useMarkNotificationAsRead();
  const { markAllAsRead } = useMarkAllNotificationsAsRead();


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const role = user?.role;
  const basePath = `/${role || 'owner'}`;
  const menuItems = role === "owner" ? ownerTabs : directorTabs;

  const notificationsList = useMemo(() => {
    if (apiNotifications && apiNotifications.length > 0) {
      return apiNotifications;
    }
    return INITIAL_NOTIFS;
  }, [apiNotifications]);

  // Reverb Real-Time Notification Listener
  useEffect(() => {
    const tokenName = import.meta.env.VITE_AUTH_TOKEN_NAME || "pulse_token";
    const token = localStorage.getItem(tokenName);
    const userId = user?.id;

    if (!token || !userId) return;

    // 1. Request notification permissions (Mobile native & Web browser)
    requestNotificationPermission();

    // 2. Set up mobile notification tap handler (navigates to relevant route)
    setupNotificationTapListener((targetPath) => {
      if (!targetPath) return;
      const destination =
        targetPath.startsWith('/owner') || targetPath.startsWith('/director')
          ? targetPath
          : `${basePath}${targetPath.startsWith('/') ? '' : '/'}${targetPath}`;
      navigate(destination);
    });

    // 3. Start Echo WebSocket client
    const echo = initEcho(token);

    // 4. Listen for incoming real-time notifications
    let cleanupListener = null;
    if (echo) {
      cleanupListener = listenToNotifications(echo, userId, (notification) => {
        console.log("⚡️ Real-time Notification Received via Reverb:", notification);

        // Display rich interactive toast with asset logo
        if (notification?.title) {
          toast.custom(
            (t) => (
              <div
                onClick={() => {
                  toast.dismiss(t.id);
                  if (notification.path) {
                    const destination =
                      notification.path.startsWith('/owner') || notification.path.startsWith('/director')
                        ? notification.path
                        : `${basePath}${notification.path.startsWith('/') ? '' : '/'}${notification.path}`;
                    navigate(destination);
                  } else {
                    setNotifOpen(true);
                  }
                }}
                className={`${
                  t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex p-3.5 border ${
                  notification.critical ? 'border-red-300 ring-2 ring-red-100' : 'border-blue-100 ring-2 ring-blue-50'
                } cursor-pointer transition-all duration-200 hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 p-1 border border-gray-100">
                    <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">Just now</span>
                    </div>
                    {notification.body && (
                      <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.body}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ),
            { duration: 5000, position: 'top-right' }
          );
        }

        // Invalidate queries to refresh notification list and badge count
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });
    }

    return () => {
      if (cleanupListener) cleanupListener();
      if (echo) echo.disconnect();
    };
  }, [user?.id, role, queryClient, navigate, basePath]);

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
    unread: notificationsList.filter((n) => !n.read).length,
    critical: notificationsList.filter((n) => n.critical && !n.read).length,
  }), [notificationsList]);

  const filteredNotifs = useMemo(() => {
    if (notifFilter === "unread") return notificationsList.filter((n) => !n.read);
    if (notifFilter === "critical") return notificationsList.filter((n) => n.critical);
    return notificationsList;
  }, [notifFilter, notificationsList]);

  const markAllRead = () => {
    markAllAsRead();
  };

  const toggleNotifRead = (id) => {
    if (id) {
      markAsRead(id);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await signout();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Logout failed");
    } finally {

      const tokenName = import.meta.env.VITE_AUTH_TOKEN_NAME || "pulse_token";
      localStorage.removeItem(tokenName);
      queryClient.clear();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen text-white flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 w-72 h-screen bg-white border-r border-gray-200 shadow-sm transition-transform duration-300`}>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
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
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Title / Page Name */}
            <div className="hidden lg:block">
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
                  <Bell size={24} />
                  {notifStats.unread > 0 && (
                    <span className="absolute top-2 right-2 min-w-4.5 h-4.5 flex items-center justify-center bg-[#AE4A3E] rounded-full ring-2 text-white ring-white text-[9px] font-bold px-1">
                      {notifStats.unread > 9 ? "9+" : notifStats.unread}
                    </span>
                  )}
                </button>

                {/* Dropdown Panel */}
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="fixed inset-0 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-100 md:max-h-130 bg-white md:rounded-2xl md:shadow-2xl md:border md:border-gray-200 overflow-hidden z-100 flex flex-col" style={{ boxShadow: "0 20px 60px -12px rgba(0,0,0,0.25)" }}
                    >
                      {/* Header — navy gradient */}
                      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#1E3A5F] to-[#2A4C7E] shrink-0">
                        <div>
                          <h3 className="text-sm font-bold text-white">Notifications</h3>
                          <p className="text-[10px] text-white/60 mt-0.5">
                            {notifStats.unread > 0
                              ? `${notifStats.unread} unread${notifStats.critical > 0 ? ` · ${notifStats.critical} critical` : ""}`
                              : "All caught up!"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {notifStats.unread > 0 && (
                            <button
                              onClick={markAllRead}
                              className="text-[10px] font-semibold text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                          <button onClick={() => setNotifOpen(false)} className="md:hidden p-1 text-white/70">
                            <X size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Filter Chips */}
                      <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-50 shrink-0">
                        {[
                          { key: "all", label: "All" },
                          { key: "unread", label: "Unread" },
                          { key: "critical", label: "Critical" },
                        ].map((f) => (
                          <button
                            key={f.key}
                            onClick={() => setNotifFilter(f.key)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${notifFilter === f.key
                              ? "bg-[#1E3A5F] text-white shadow-sm"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      {/* Notifications List (scrollable) */}
                      <div className="overflow-y-auto flex-1">
                        {filteredNotifs.length === 0 ? (
                          <div className="p-6 text-center">
                            <div className="mx-auto w-10 h-10 bg-[#1E3A5F]/10 rounded-full flex items-center justify-center mb-2">
                              <Bell size={20} className="text-[#1E3A5F]" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">All clear!</p>
                            <p className="text-xs text-gray-400 mt-0.5">No notifications to show.</p>
                          </div>
                        ) : (
                          filteredNotifs.map((notif) => {
                            const Icon = NOTIF_ICONS[notif.type] || NOTIF_ICONS.general;
                            // Severity-driven tint — brick = critical, navy = unread, gray = read
                            const tint = notif.critical
                              ? { bg: "bg-[#AE4A3E]/10", text: "text-[#8A362C]" }
                              : !notif.read
                                ? { bg: "bg-[#1E3A5F]/10", text: "text-[#1E3A5F]" }
                                : { bg: "bg-gray-100", text: "text-gray-400" };
                            return (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  toggleNotifRead(notif.id);
                                  if (notif.path) {
                                    const destination =
                                      notif.path.startsWith('/owner') || notif.path.startsWith('/director')
                                        ? notif.path
                                        : `${basePath}${notif.path.startsWith('/') ? '' : '/'}${notif.path}`;
                                    navigate(destination);
                                  }
                                  setNotifOpen(false);
                                }}
                                className={`flex items-start gap-3 px-5 py-3 cursor-pointer transition-all hover:bg-gray-50 ${notif.critical
                                  ? "bg-[#AE4A3E]/[0.05]"
                                  : !notif.read
                                    ? "bg-[#1E3A5F]/[0.04]"
                                    : ""
                                  } ${notif.critical ? "border-l-2 border-l-[#AE4A3E]" : ""
                                  } border-b border-gray-50 last:border-b-0`}
                              >
                                {/* Icon — tinted by severity */}
                                <div className={`w-9 h-9 rounded-xl ${tint.bg} flex items-center justify-center shrink-0`}>
                                  <Icon size={18} className={tint.text} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`text-xs ${notif.read ? "font-medium" : "font-semibold"} text-gray-900 line-clamp-1`}>
                                      {notif.title}
                                    </p>
                                    <span className="text-[9px] text-gray-400 whitespace-nowrap shrink-0 leading-4">{timeAgo(notif.time)}</span>
                                  </div>
                                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 leading-normal">{notif.description}</p>
                                </div>

                                {/* Unread indicator */}
                                {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] shrink-0 mt-1" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                >

                  <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="Logo" className="h-9 w-9 rounded-full" />
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
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl relative"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
                <p className="text-sm text-gray-500">Are you sure you want to log out of your account?</p>
              </div>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="cursor-pointer flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                  disabled={isPendingSignout}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="cursor-pointer flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                  disabled={isPendingSignout}
                >
                  {isPendingSignout ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    "Log Out"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
