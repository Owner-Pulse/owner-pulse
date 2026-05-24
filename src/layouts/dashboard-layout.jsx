import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useParams, useLocation } from 'react-router';
import { Bell, User, Menu, X, Home, Users, BookOpen, DollarSign, AlertTriangle, Settings, LogOut, FileText, ClipboardList, Wrench, GraduationCap, Calendar } from 'lucide-react';
import logo from '../assets/Logo.png'

const ownerTabs = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "enrollment", label: "Enrollment", icon: Users },
  { id: "classrooms", label: "Classrooms", icon: BookOpen },
  { id: "cashflow", label: "Cash Flow", icon: DollarSign },
  { id: "compliance", label: "Compliance", icon: AlertTriangle },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "budget", label: "Budget", icon: DollarSign },
  { id: "scholarships", label: "Scholarships", icon: GraduationCap },
  { id: "staff", label: "Staff", icon: Users },
  { id: "waitlist", label: "Waitlist", icon: Calendar },
];

const directorTabs = [
  { id: "log", label: "Daily Log", icon: FileText },
  { id: "payroll", label: "Payroll", icon: DollarSign },
  { id: "budget", label: "My Budget", icon: DollarSign },
  { id: "waitlist", label: "Waitlist", icon: Calendar },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { tab } = useParams();

  const user = JSON.parse(localStorage.getItem('user') || '{"role": "owner"}');
  const role = user.role;
  const menuItems = role === "owner" ? ownerTabs : directorTabs;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen text-white flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 w-72 h-screen bg-[#283353] border-r border-white/10 transition-transform duration-300`}>
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <img src={logo} alt="Logo" className="h-12 scale-135 w-auto" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">OwnerPulse</h1>
              <p className="text-xs text-white/50 capitalize">{role} Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
            {menuItems.map((item) => {
              const isDefaultTab = item.id === (role === 'owner' ? 'overview' : 'log');
              const isActive = tab === item.id || (!tab && isDefaultTab);
              const destination = isDefaultTab ? '/dashboard' : `/dashboard/${item.id}`;
              
              return (
                <NavLink
                  key={item.id}
                  to={destination}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-white/10 text-white' 
                      : 'hover:bg-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          
          {/* Bottom Section */}
          <div className="mt-auto pt-6">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/5 rounded-xl text-sm font-medium transition-all">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Top Header */}
        <header className="h-16 bg-[#283353] border-b border-white/10 flex shrink-0 items-center px-4 md:px-6 sticky top-0 z-40">
          <div className="flex items-center justify-between w-full ">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-white"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Title / Page Name */}
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold">Dashboard</h2>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 hover:bg-white/10 rounded-xl transition-colors relative"
                >
                  <Bell size={22} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0A0F1E]"></span>
                </button>
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold uppercase">
                    {user?.name?.slice(0, 2) || "JD"}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.name || "John Doe"}</p>
                    <p className="text-xs text-white/50 -mt-0.5 capitalize">{role}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 text-gray-900 relative p-5">
          <Outlet />
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