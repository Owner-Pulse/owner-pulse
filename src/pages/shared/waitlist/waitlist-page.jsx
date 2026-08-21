import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  UserPlus,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import KpiCard from "./components/KpiCard";
import ProgramBreakdownCard from "./components/ProgramBreakdownCard";
import WaitlistTable from "./components/WaitlistTable";
import AddWaitlistModal from "./components/AddWaitlistModal";
import LogTourModal from "./components/LogTourModal";
import MoveAppliedModal from "./components/MoveAppliedModal";
import OfferSpotModal from "./components/OfferSpotModal";
import ConfirmEnrollmentModal from "./components/ConfirmEnrollmentModal";
import MarkLostModal from "./components/MarkLostModal";
import WaitlistFunnelCard from "./components/WaitlistFunnelCard";
import StaleLeadAlertCard from "./components/StaleLeadAlertCard";

import { useWaitlistStore, daysSince } from "@/hooks/waitlist/useWaitlistStore";
import { useGetUser } from "@/hooks/auth/user-details.hook";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ALL_PROGRAMS = ["2 Yr Old Room", "PreK3", "PreK4", "VPK", "Kindergarten", "1st-8th Grade"];

const WaitlistPage = () => {
  const { user } = useGetUser();
  const role = user?.role || "director"; // defaults to director if undefined
  const isOwner = role === "owner";

  const {
    waitlist,
    addInquiry,
    logTour,
    moveToApplied,
    offerSpot,
    confirmEnrollment,
    markLost,
    deleteEntry,
    updateEntry,
    stats,
  } = useWaitlistStore();

  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal active states
  const [showAddModal, setShowAddModal] = useState(false);
  const [tourModalEntry, setTourModalEntry] = useState(null);
  const [appliedModalEntry, setAppliedModalEntry] = useState(null);
  const [offerModalEntry, setOfferModalEntry] = useState(null);
  const [enrollModalEntry, setEnrollModalEntry] = useState(null);
  const [lostModalEntry, setLostModalEntry] = useState(null);
  const [editModalEntry, setEditModalEntry] = useState(null);

  // Filtered waitlist items
  const filtered = useMemo(() => {
    return waitlist.filter((w) => {
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (programFilter !== "all" && w.program !== programFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          w.childName.toLowerCase().includes(q) ||
          w.parentName.toLowerCase().includes(q) ||
          (w.notes && w.notes.toLowerCase().includes(q)) ||
          w.program.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [waitlist, statusFilter, programFilter, searchQuery]);

  // Program Breakdown Data for Owner
  const byProgram = useMemo(() => {
    return ALL_PROGRAMS.map((p) => {
      const items = waitlist.filter((w) => w.program === p);
      return { program: p, count: items.length, avgWait: 15 };
    }).filter((p) => p.count > 0);
  }, [waitlist]);

  const bySource = useMemo(() => {
    const src = {};
    waitlist.forEach((w) => {
      const s = w.source || "Website";
      src[s] = (src[s] || 0) + 1;
    });
    return src;
  }, [waitlist]);

  const handleSaveAddModal = (formData) => {
    if (editModalEntry) {
      updateEntry(editModalEntry.id, formData);
      setEditModalEntry(null);
    } else {
      addInquiry(formData);
    }
  };

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            {isOwner ? "Waitlist & Funnel Analytics" : "Waitlist Management"}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {isOwner
              ? "Strategic overview of inquiries, funnel conversion rates, and tuition forecasts"
              : "Manage family inquiries → tours → enrollment pipeline"}
          </p>
        </div>

        {!isOwner && (
          <Button
            onClick={() => {
              setEditModalEntry(null);
              setShowAddModal(true);
            }}
            className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm"
          >
            <UserPlus size={16} className="mr-2" /> Add to Waitlist
          </Button>
        )}
      </div>

      {/* ── Summary KPI Cards ───────────────────────────────────── */}
      {isOwner ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <KpiCard
              icon={Calendar}
              label="Total Pipeline"
              value={stats.total}
              sub={`${stats.enrolledCount} enrolled`}
              iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KpiCard
              icon={TrendingUp}
              label="Conversion Rate"
              value={`${stats.overallConversionRate}%`}
              sub="Inquiry to Enrolled"
              iconBg="bg-emerald-100 text-emerald-800"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KpiCard
              icon={DollarSign}
              label="Projected Revenue"
              value={`$${stats.projectedMonthlyRevenue.toLocaleString()}`}
              sub="Monthly tuition from pending seats"
              iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KpiCard
              icon={AlertTriangle}
              label="Stale Leads (30d+)"
              value={stats.staleCount}
              sub={stats.staleCount > 0 ? "Need follow-up" : "All current"}
              iconBg={stats.staleCount > 0 ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "bg-emerald-50 text-emerald-700"}
              valueColor={stats.staleCount > 0 ? "text-[#8A362C]" : "text-gray-900"}
            />
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div variants={itemVariants}>
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">Total Pipeline</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.total}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">All entries</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">Inquiry Leads</p>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.inquiryCount}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">New leads</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">Toured</p>
              <p className="text-2xl font-extrabold text-purple-600 mt-1">{stats.touredCount}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Facility tours</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">Offered</p>
              <p className="text-2xl font-extrabold text-teal-600 mt-1">{stats.offeredCount}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Spot offered</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">Stale (30d+)</p>
              <p className={`text-2xl font-extrabold mt-1 ${stats.staleCount > 0 ? "text-[#8A362C]" : "text-gray-900"}`}>
                {stats.staleCount}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Need follow-up</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Owner Funnel & Alert Row ─────────────────────────────── */}
      {isOwner && (
        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <StaleLeadAlertCard staleItems={stats.staleItems} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <WaitlistFunnelCard stats={stats} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <ProgramBreakdownCard byProgram={byProgram} bySource={bySource} />
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter buttons */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg flex-wrap gap-1">
              {["all", "Inquiry", "Toured", "Applied", "Offered", "Enrolled", "Lost"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? "bg-[#1E3A5F] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {st === "all" ? `All (${stats.total})` : st}
                </button>
              ))}
            </div>

            {/* Program Filter Dropdown */}
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
            >
              <option value="all">All Programs</option>
              {ALL_PROGRAMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-64">
            <Input
              type="text"
              placeholder="Search child, parent, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Waitlist Table ─────────────────────────────────────── */}
      <WaitlistTable
        entries={filtered}
        role={role}
        onOpenAdd={() => {
          setEditModalEntry(null);
          setShowAddModal(true);
        }}
        onOpenEdit={(entry) => {
          setEditModalEntry(entry);
          setShowAddModal(true);
        }}
        onOpenTour={(entry) => setTourModalEntry(entry)}
        onOpenApplied={(entry) => setAppliedModalEntry(entry)}
        onOpenOffer={(entry) => setOfferModalEntry(entry)}
        onOpenEnroll={(entry) => setEnrollModalEntry(entry)}
        onOpenLost={(entry) => setLostModalEntry(entry)}
        onDelete={deleteEntry}
      />

      {/* ── Interactive Stage Modals ───────────────────────────── */}
      <AddWaitlistModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditModalEntry(null);
        }}
        onSave={handleSaveAddModal}
        editItem={editModalEntry}
      />

      <LogTourModal
        isOpen={!!tourModalEntry}
        onClose={() => setTourModalEntry(null)}
        entry={tourModalEntry}
        onLogTour={logTour}
      />

      <MoveAppliedModal
        isOpen={!!appliedModalEntry}
        onClose={() => setAppliedModalEntry(null)}
        entry={appliedModalEntry}
        onMoveToApplied={moveToApplied}
      />

      <OfferSpotModal
        isOpen={!!offerModalEntry}
        onClose={() => setOfferModalEntry(null)}
        entry={offerModalEntry}
        onOfferSpot={offerSpot}
      />

      <ConfirmEnrollmentModal
        isOpen={!!enrollModalEntry}
        onClose={() => setEnrollModalEntry(null)}
        entry={enrollModalEntry}
        onConfirmEnrollment={confirmEnrollment}
      />

      <MarkLostModal
        isOpen={!!lostModalEntry}
        onClose={() => setLostModalEntry(null)}
        entry={lostModalEntry}
        onMarkLost={markLost}
      />
    </motion.div>
  );
};

export default WaitlistPage;
