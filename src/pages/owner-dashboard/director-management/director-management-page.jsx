import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, CheckCircle2, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import DirectorCard from "./components/DirectorCard";
import DirectorDetailModal from "./components/DirectorDetailModal";
import CreateDirectorForm from "./components/CreateDirectorForm";
import FilterBar from "./components/FilterBar";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

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

const DirectorManagementPage = () => {
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
        <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm" onClick={() => setShowCreateForm(true)}>
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
      <motion.div variants={itemVariants}>
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
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
              {searchQuery ? "Try a different search term" : 'Click "Add Director" to create the first account'}
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
