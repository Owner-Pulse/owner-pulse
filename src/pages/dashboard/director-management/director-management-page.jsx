import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Search,
  Clock,
  Award,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const getCurrentUser = () =>
  JSON.parse(localStorage.getItem("user") || '{"role":"owner","name":"School Owner","email":"owner@hclc.com"}');

const INITIAL_DIRECTORS = [
  {
    id: 1,
    name: "Sarah Kim",
    email: "sarah@hclc.com",
    phone: "(813) 555-0100",
    status: "active",
    created: "2025-08-15",
    lastLogin: "2026-05-10 08:32 AM",
    role: "Director of Operations",
    department: "Administration",
    bio: "Oversees daily school operations, staff scheduling, and facility management.",
    tasksCompleted: 47,
    logEntries: 182,
    avatar: null,
  },
  {
    id: 2,
    name: "Marcus Webb",
    email: "marcus@hclc.com",
    phone: "(813) 555-0200",
    status: "active",
    created: "2026-01-10",
    lastLogin: "2026-05-09 07:15 AM",
    role: "Assistant Director",
    department: "Administration",
    bio: "Supports the Director with enrollment, parent communications, and curriculum coordination.",
    tasksCompleted: 23,
    logEntries: 94,
    avatar: null,
  },
  {
    id: 3,
    name: "Lisa Park",
    email: "lisa@hclc.com",
    phone: "(813) 555-0300",
    status: "pending",
    created: "2026-04-28",
    lastLogin: null,
    role: "Director",
    department: "Administration",
    bio: "",
    tasksCompleted: 0,
    logEntries: 0,
    avatar: null,
  },
];

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const daysSince = (d) => {
  const diff = Math.ceil((new Date(d) - new Date("2026-05-11")) / 86400000);
  return Math.abs(diff);
};

const KpiCard = ({ icon: Icon, label, value, sub, color }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color || "bg-blue-50 text-blue-600"}`}>
          <Icon size={18} />
        </div>
      </div>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </CardContent>
  </Card>
);

const DirectorCard = ({ director, onClick }) => {
  const initials = director.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const daysSinceCreation = daysSince(director.created);
  const isActive = director.status === "active";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer overflow-hidden"
      onClick={() => onClick(director)}
    >
      {/* Color top accent */}
      <div className={`h-1.5 w-full ${isActive ? "bg-emerald-400" : "bg-amber-400"}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0 ${
            isActive ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-amber-400 to-amber-500"
          }`}>
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 truncate">{director.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                {isActive ? "Active" : "Pending"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{director.role}</p>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Mail size={12} /> {director.email}
              </span>
              {director.lastLogin ? (
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Last login {formatDate(director.lastLogin)}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-500">
                  <AlertTriangle size={12} /> Not yet logged in
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{daysSinceCreation}d</p>
                <p className="text-[10px] text-gray-400">Active</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{director.tasksCompleted}</p>
                <p className="text-[10px] text-gray-400">Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{director.logEntries}</p>
                <p className="text-[10px] text-gray-400">Logs</p>
              </div>
              <div className="flex-1" />
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DirectorDetailModal = ({ director, onClose, onUpdateStatus }) => {
  if (!director) return null;
  const initials = director.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isActive = director.status === "active";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 ${isActive ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-amber-400 to-amber-500"} text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold">{director.name}</h2>
                <p className="text-sm text-white/80">{director.role}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-white/30 text-white"
                }`}>
                  {isActive ? "Active" : "Pending Invitation"}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900">{director.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{director.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Building2 size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm font-medium text-gray-900">{director.department}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {director.bio && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{director.bio}</p>
            </div>
          )}

          {/* Activity Stats */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity Overview</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{Math.abs(Math.ceil((new Date("2026-05-11") - new Date(director.created)) / 86400000))}d</p>
                <p className="text-[10px] text-gray-400">Since Joined</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{director.tasksCompleted}</p>
                <p className="text-[10px] text-gray-400">Tasks Done</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{director.logEntries}</p>
                <p className="text-[10px] text-gray-400">Log Entries</p>
              </div>
            </div>
          </div>

          {/* Account info */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Account Details</p>
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Account Created</span>
                <span className="font-medium text-gray-900">{formatDate(director.created)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Login</span>
                <span className="font-medium text-gray-900">
                  {director.lastLogin ? formatDate(director.lastLogin) : "Never"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${isActive ? "text-emerald-600" : "text-amber-600"}`}>
                  {isActive ? "Active" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
            {director.status === "pending" && (
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onUpdateStatus(director.id, "active")}>
                <CheckCircle2 size={14} className="mr-2" /> Activate Account
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CreateDirectorForm = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "Director" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    onAdd({
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || "(813) 555-0000",
      status: "pending",
      created: new Date().toISOString().split("T")[0],
      lastLogin: null,
      role: form.role,
      department: "Administration",
      bio: "",
      tasksCompleted: 0,
      logEntries: 0,
      avatar: null,
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Director Account</h2>
              <p className="text-sm text-gray-500 mt-0.5">Add a new director to manage school operations</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {success ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-gray-900">Director Created!</p>
              <p className="text-sm text-gray-500 mt-1">{form.name} has been added. They'll need to log in to activate.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
                  <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Jane Smith" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                    placeholder="director@hclc.com" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone (optional)</label>
                  <input type="text" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                    placeholder="(813) 555-0000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role</label>
                  <select value={form.role} onChange={(e) => update("role", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                    <option value="Director">Director</option>
                    <option value="Assistant Director">Assistant Director</option>
                    <option value="Operations Manager">Operations Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Min. 6 characters" required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-xs text-red-600 font-medium">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#0A0F1E] hover:bg-black text-white">
                  <UserPlus size={16} className="mr-2" /> Create Account
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const DirectorManagementPage = () => {
  const currentUser = getCurrentUser();
  const [directors, setDirectors] = useState(INITIAL_DIRECTORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleAddDirector = (director) => {
    setDirectors((prev) => [...prev, director]);
  };

  const handleUpdateStatus = (id, status) => {
    setDirectors((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    setSelectedDirector((prev) => prev && prev.id === id ? { ...prev, status } : prev);
  };

  const filtered = useMemo(() => {
    let result = directors;
    if (statusFilter !== "all") result = result.filter((d) => d.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.role.toLowerCase().includes(q)
      );
    }
    return result;
  }, [directors, statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: directors.length,
    active: directors.filter((d) => d.status === "active").length,
    pending: directors.filter((d) => d.status === "pending").length,
    totalTasks: directors.reduce((a, d) => a + d.tasksCompleted, 0),
    totalLogs: directors.reduce((a, d) => a + d.logEntries, 0),
  }), [directors]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Director Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.active} active · {stats.pending} pending · {stats.totalTasks} tasks completed
          </p>
        </div>
        <Button className="bg-[#0A0F1E] hover:bg-black text-white shadow-sm" onClick={() => setShowCreateForm(true)}>
          <UserPlus size={16} className="mr-2" /> Add Director
        </Button>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={Users} label="Total Directors" value={stats.total} sub="Managing school operations" color="bg-blue-50 text-blue-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={CheckCircle2} label="Active" value={stats.active} sub={`${stats.active > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total`} color="bg-emerald-50 text-emerald-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Clock} label="Pending Invites" value={stats.pending} sub={stats.pending > 0 ? "Awaiting first login" : "All accounts activated"} color={stats.pending > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-400"} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Award} label="Total Activity" value={stats.totalTasks + stats.totalLogs} sub={`${stats.totalTasks} tasks · ${stats.totalLogs} logs`} color="bg-purple-50 text-purple-600" />
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 flex-1 w-full sm:w-auto">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search directors by name, email, or role..."
            className="text-sm bg-transparent border-none outline-none w-full min-w-[200px]" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          )}
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
          {[{ id: "all", label: "All" }, { id: "active", label: "Active" }, { id: "pending", label: "Pending" }].map((f) => (
            <button key={f.id} onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === f.id ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Director Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((director) => (
            <DirectorCard key={director.id} director={director} onClick={setSelectedDirector} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No directors found</p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery ? "Try a different search term" : "Click \"Add Director\" to create the first account"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Director Detail Modal */}
      {selectedDirector && (
        <DirectorDetailModal
          director={selectedDirector}
          onClose={() => setSelectedDirector(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Create Director Form */}
      {showCreateForm && (
        <CreateDirectorForm onAdd={handleAddDirector} onClose={() => setShowCreateForm(false)} />
      )}
    </motion.div>
  );
};

export default DirectorManagementPage;
