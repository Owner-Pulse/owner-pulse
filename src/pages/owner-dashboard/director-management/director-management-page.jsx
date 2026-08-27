import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, CheckCircle2, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import DirectorCard from "./components/DirectorCard";
import DirectorDetailModal from "./components/DirectorDetailModal";
import CreateDirectorForm from "./components/CreateDirectorForm";
import FilterBar from "./components/FilterBar";
import { useGetAllDirector, useGetSingleDirector } from "@/hooks/owner-hook/create-director.hook";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};


const DirectorManagementPage = () => {
  const { allDirector, isLoading } = useGetAllDirector();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { singleDirector, isLoading: isSingleLoading } = useGetSingleDirector(selectedDirector?.id);

  const filtered = useMemo(() => {
    let result = allDirector || [];
    if (statusFilter !== "all") result = result.filter((d) => d.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) =>
        d?.name?.toLowerCase().includes(q) ||
        d?.email?.toLowerCase().includes(q) ||
        d?.role?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allDirector, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const dirs = allDirector || [];
    return {
      total: dirs.length,
      active: dirs.filter((d) => d.status === "active").length,
      pending: dirs.filter((d) => d.status !== "active").length, // Assuming non-active means pending or something similar
      totalTasks: 0, // Not provided in current API
      totalLogs: 0,  // Not provided in current API
    };
  }, [allDirector]);

  const handleUpdateStatus = (directorId, status) => {
    // Status update logic
  };


  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Director Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.active} active · {stats.pending} pending
          </p>
        </div>
        <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm" onClick={() => setShowCreateForm(true)}>
          <UserPlus size={16} className="mr-2" /> Add Director
        </Button>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={Users} label="Total Directors" value={stats.total} sub="Managing school operations" color="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={CheckCircle2} label="Active" value={stats.active} sub={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total`} color="bg-[#3E7A54]/10 text-[#2F6042]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Clock} label="Pending Invites" value={stats.pending} sub={stats.pending > 0 ? "Awaiting first login" : "All accounts activated"} color={stats.pending > 0 ? "bg-[#B78A2F]/10 text-[#8F6A1F]" : "bg-gray-50 text-gray-400"} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Award} label="Total Activity" value={stats.totalTasks + stats.totalLogs} sub={`${stats.totalTasks} tasks · ${stats.totalLogs} logs`} color="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between animate-pulse min-h-[49">
              <div className="flex gap-5 items-start">
                <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-3 py-1 w-full">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 w-1/2">
                      <div className="h-5 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                    </div>
                    <div className="h-6 w-16 bg-slate-200 rounded-md" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="w-8 h-8 rounded-full bg-slate-200" />
              </div>
            </div>
          ))
        ) : filtered?.length > 0 ? (
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
          director={singleDirector || selectedDirector}
          isLoading={isSingleLoading}
          onClose={() => setSelectedDirector(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Create Director Form */}
      {showCreateForm && (
        <CreateDirectorForm onClose={() => setShowCreateForm(false)} />
      )}
    </motion.div>
  );
};

export default DirectorManagementPage;
