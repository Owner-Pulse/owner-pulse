import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  UserPlus,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import ProgramBreakdownCard from "./components/ProgramBreakdownCard";
import WaitlistFilters from "./components/WaitlistFilters";
import WaitlistTable from "./components/WaitlistTable";
import AddWaitlistModal from "./components/AddWaitlistModal";
import { useGetUser, useGetDirectorWaitlistList, useGetOwnerWaitlistList } from "@/hooks";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const PRESCHOOL_PROGRAMS = ["Age 1", "Age 2", "PreK3", "PreK4", "VPK", "Summer"];
const K8_PROGRAMS = ["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const ALL_PROGRAMS = [...PRESCHOOL_PROGRAMS, ...K8_PROGRAMS];

const WaitlistPage = () => {
  const { user } = useGetUser();
  const role = user?.role;
  const isOwner = role === "owner";

  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search so we don't fire on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Build server-side params
  const params = useMemo(() => {
    const p = {};
    if (statusFilter !== "all") p.status = statusFilter;
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [statusFilter, debouncedSearch]);

  const directorQuery = useGetDirectorWaitlistList(isOwner ? undefined : params);
  const ownerQuery = useGetOwnerWaitlistList(isOwner ? params : undefined);

  const activeQuery = isOwner ? ownerQuery : directorQuery;
  const {
    waitlistData,
    isWaitlistLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = activeQuery;

  // Flatten API waitlists
  const waitlists = waitlistData?.waitlists || [];
  const summary = waitlistData?.summary || {};

  // KPI values from API summary
  const totalFamilies = summary.total_families ?? waitlists.length;
  const preschoolCount = summary.preschool ?? 0;
  const k8Count = summary.k8 ?? 0;
  const staleCount = summary.stale_30_days ?? 0;

  // Program breakdown for owner view (client-side from fetched data)
  const byProgram = useMemo(() => {
    return ALL_PROGRAMS.map((p) => {
      const items = waitlists.filter((w) => w.program?.toLowerCase() === p.toLowerCase());
      return { program: p, count: items.length, avgWait: 0 };
    }).filter((p) => p.count > 0);
  }, [waitlists]);

  const bySource = useMemo(() => {
    const src = {};
    waitlists.forEach((w) => { src[w.source] = (src[w.source] || 0) + 1; });
    return src;
  }, [waitlists]);

  // Infinite-scroll sentinel
  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Waitlist</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalFamilies} families · {preschoolCount} preschool · {k8Count} K–8
            {role === "director" && " · Manage inquiries and add new families"}
          </p>
        </div>
        {role === "director" && (
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} className="mr-2" /> Add to Waitlist
          </Button>
        )}
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={Calendar} label="Total Families" value={totalFamilies}
            sub={`${summary.by_status?.enrolled ?? 0} enrolled`} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Users} label="Preschool" value={preschoolCount}
            sub={totalFamilies > 0 ? `${Math.round(preschoolCount / totalFamilies * 100)}% of waitlist` : "—"}
            iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={GraduationCap} label="K–8" value={k8Count}
            sub={totalFamilies > 0 ? `${Math.round(k8Count / totalFamilies * 100)}% of waitlist` : "—"}
            iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={AlertTriangle} label="Stale (30d+)" value={staleCount}
            sub={staleCount > 0 ? "Need follow-up" : "All recent"}
            iconBg={staleCount > 0 ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "bg-[#3E7A54]/10 text-[#2F6042]"}
            valueColor={staleCount > 0 ? "text-[#8A362C]" : "text-gray-900"} />
        </motion.div>
      </div>

      {/* Owner: High-level program breakdown */}
      {(role === "owner" || role === "director") && <ProgramBreakdownCard byProgram={byProgram} bySource={bySource} />}

      {/* Filters & Search */}
      <WaitlistFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Waitlist Table */}
      <WaitlistTable
        entries={waitlists}
        role={role}
        isLoading={isWaitlistLoading}
        onShowAdd={() => setShowAddModal(true)}
      />

      {/* Infinite-scroll sentinel */}
      <div ref={sentinelRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Loading more…
          </div>
        )}
      </div>

      {/* Add Waitlist Modal */}
      <AddWaitlistModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </motion.div>
  );
};

export default WaitlistPage;
