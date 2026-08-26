import React, { useState, useMemo, useEffect, useRef } from "react";
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
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import WaitlistFunnelCard from "./components/WaitlistFunnelCard";
import StaleLeadAlertCard from "./components/StaleLeadAlertCard";

import { useGetUser } from "@/hooks/auth/user-details.hook";
import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";
import {
  useGetDirectorWaitlistList,
  useAddDirectorWaitlist,
  useUpdateDirectorWaitlist,
  useLogTourDirectorWaitlist,
  useMoveAppliedDirectorWaitlist,
  useOfferSpotDirectorWaitlist,
  useConfirmEnrollmentDirectorWaitlist,
  useMarkLostDirectorWaitlist,
  useDeleteDirectorWaitlist
} from "@/hooks/director-hook/waitlist.hook";
import { useGetOwnerWaitlistList } from "@/hooks/owner-hook/waitlist.hook";

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
  const role = user?.role || "director";
  const isOwner = role === "owner";

  const { classrooms = [] } = useGetAllClassrooms();

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
  const [deleteModalEntry, setDeleteModalEntry] = useState(null);

  // Map local filter state parameters to API specifications
  const waitlistParams = useMemo(() => {
    const matchedClassroom = classrooms.find(
      (c) => (c.classroom_name || c.name) === programFilter
    );
    return {
      status: statusFilter === "all" ? undefined : statusFilter.toLowerCase(),
      classroom_id: matchedClassroom ? (matchedClassroom.procare_classroom_id || matchedClassroom.id) : undefined,
      search: searchQuery.trim() || undefined,
      per_page: 15,
    };
  }, [statusFilter, programFilter, searchQuery, classrooms]);

  // Fetch list states from hooks based on current user role roles
  const directorHook = useGetDirectorWaitlistList(!isOwner ? waitlistParams : undefined);
  const ownerHook = useGetOwnerWaitlistList(isOwner ? waitlistParams : undefined);

  const activeHook = isOwner ? ownerHook : directorHook;
  const {
    waitlistData,
    isWaitlistLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = activeHook;

  const waitlists = waitlistData?.waitlists || [];

  // Mutations
  const { addWaitlist: addMutation, isPending: isAddPending } = useAddDirectorWaitlist();
  const { updateWaitlist: updateMutation, isPending: isUpdatePending } = useUpdateDirectorWaitlist();
  const { logTour: logTourMutation, isPending: isTourPending } = useLogTourDirectorWaitlist();
  const { moveToApplied: moveToAppliedMutation, isPending: isAppliedPending } = useMoveAppliedDirectorWaitlist();
  const { offerSpot: offerSpotMutation, isPending: isOfferPending } = useOfferSpotDirectorWaitlist();
  const { confirmEnrollment: confirmEnrollmentMutation, isPending: isEnrollPending } = useConfirmEnrollmentDirectorWaitlist();
  const { markLost: markLostMutation, isPending: isLostPending } = useMarkLostDirectorWaitlist();
  const { deleteEntry: deleteMutation, isPending: isDeletePending } = useDeleteDirectorWaitlist();

  // Infinite Scroll Trigger observer ref
  const observerRef = useRef(null);
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    const current = observerRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Map API snake_case format items into camelCase structure key references of view components
  const mappedWaitlist = useMemo(() => {
    return waitlists.map((w) => {
      // Normalize statuses with capitalized letters for views matching old state
      const capStatus = w.status
        ? w.status.charAt(0).toUpperCase() + w.status.slice(1).toLowerCase()
        : "Inquiry";

      return {
        ...w,
        id: w.id,
        childName: w.child_name || w.childName || "Unknown",
        age: w.age_dob || w.age || "",
        program: w.program || w.classroom || "",
        parentName: w.parent_name || w.parentName || "",
        phone: w.phone || "",
        email: w.email || "",
        status: capStatus,
        notes: w.notes_and_history || w.notes || "",
        source: w.source || "Referral",
        addedDate: w.added_date || w.addedDate || new Date().toISOString(),
      };
    });
  }, [waitlists]);

  // Local matching filters fallback (if anything slipped or needs safety local filter)
  const filtered = useMemo(() => {
    return mappedWaitlist.filter((w) => {
      if (statusFilter !== "all" && w.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
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
  }, [mappedWaitlist, statusFilter, programFilter, searchQuery]);

  // Adapt backend metrics / summary data into stats matching component props
  const stats = useMemo(() => {
    const summary = waitlistData?.summary;
    const byStatus = summary?.by_status || {};

    const total = summary?.total_pipeline ?? 0;
    const inquiryCount = byStatus.inquiry ?? 0;
    const touredCount = byStatus.toured ?? 0;
    const appliedCount = byStatus.applied ?? 0;
    const offeredCount = byStatus.offered ?? 0;
    const enrolledCount = byStatus.enrolled ?? 0;
    const lostCount = byStatus.lost ?? 0;
    const staleCount = summary?.stale_30_days ?? 0;
    const staleItems = waitlistData?.stale_warning_list || [];

    // Funnel conversions calculation
    const touredOrHigher = touredCount + appliedCount + offeredCount + enrolledCount;
    const appliedOrHigher = appliedCount + offeredCount + enrolledCount;
    const offeredOrHigher = offeredCount + enrolledCount;

    const inquiryToTourRate = total > 0 ? Math.round((touredOrHigher / total) * 100) : 0;
    const tourToAppliedRate = touredOrHigher > 0 ? Math.round((appliedOrHigher / touredOrHigher) * 100) : 0;
    const appliedToOfferRate = appliedOrHigher > 0 ? Math.round((offeredOrHigher / appliedOrHigher) * 100) : 0;
    const offerToEnrollRate = offeredOrHigher > 0 ? Math.round((enrolledCount / offeredOrHigher) * 100) : 0;

    const overallConversionRate = summary?.conversion_rate_numeric ?? (total > 0 ? Math.round((enrolledCount / total) * 100) : 0);

    const projectedMonthlyRevenue = summary?.projected_revenue_numeric ??
      (waitlistData?.revenue_forecast?.monthly_forecast_numeric ?? (appliedCount + offeredCount) * 950);

    return {
      total,
      inquiryCount,
      touredCount,
      appliedCount,
      offeredCount,
      enrolledCount,
      lostCount,
      staleCount,
      staleItems,
      inquiryToTourRate,
      tourToAppliedRate,
      appliedToOfferRate,
      offerToEnrollRate,
      overallConversionRate,
      projectedMonthlyRevenue,
    };
  }, [waitlistData]);

  // Program Breakdown Data mapped from owner endpoints or fallback
  const byProgram = useMemo(() => {
    if (waitlistData?.by_program) {
      return waitlistData.by_program.map((p) => ({
        program: p.program || p.classroom_name || "Unknown",
        count: p.total_families ?? 0,
        avgWait: p.avg_wait_days ?? 0,
      }));
    }
    return [];
  }, [waitlistData]);

  const bySource = useMemo(() => {
    return waitlistData?.by_source || {};
  }, [waitlistData]);

  // Action Dispatch Handlers
  const handleSaveAddModal = async (formData) => {
    const classroom = classrooms.find(
      (c) => (c.classroom_name || c.name) === formData.program
    );
    const procareClassroomId = classroom ? (classroom.procare_classroom_id || classroom.id) : null;

    const payload = {
      child_full_name: formData.childName,
      age_dob: formData.dob || "—",
      procare_classroom_id: procareClassroomId,
      parent_guardian_name: formData.parentName,
      phone: formData.phone,
      email: formData.email,
      lead_source: formData.source,
      special_notes: formData.notes,
    };

    if (editModalEntry) {
      await updateMutation({ id: editModalEntry.id, payload });
      setEditModalEntry(null);
    } else {
      await addMutation(payload);
    }
  };

  const logTour = async (id, data) => {
    const payload = {
      tour_date: data.tourDate,
      tour_time: data.tourTime,
      did_they_show_up: data.showedUp === "yes" ? "Yes - Showed up (Move to Toured)" : "No - Did not show up (Mark Lost)",
      tour_notes: data.tourNotes,
    };
    await logTourMutation({ id, payload });
  };

  const moveToApplied = async (id, data) => {
    const payload = {
      packet_handed_to_family: data.packetGiven === "Yes" ? "Yes - Paperwork/Digital Packet Issued" : "No - Pending Packet",
      application_date: data.appliedDate,
      application_notes: data.appliedNotes,
    };
    await moveToAppliedMutation({ id, payload });
  };

  const offerSpot = async (id, data) => {
    const payload = {
      offer_date: data.offerDate,
      offered_start_date: data.startDate,
      offer_notes: data.offerNotes,
    };
    await offerSpotMutation({ id, payload });
  };

  const confirmEnrollment = async (id, data) => {
    const payload = {
      procare_child_id: Number(data.childId) || 0,
      procare_parent_person_id: Number(data.personId) || 0,
      student_full_name: data.childName,
      date_of_birth: data.dob,
      gender: data.gender,
      primary_classroom: data.finalRoom,
      enrollment_status: data.status,
      enrollment_date: data.actualStart,
      medical_allergy_alerts: data.allergies || "None",
      parent_name: data.parentName,
      parent_phone: data.phone,
      parent_email: data.email,
      final_enrollment_notes: data.enrollNotes,
    };
    await confirmEnrollmentMutation({ id, payload });
  };

  const markLost = async (id, reason) => {
    const payload = {
      loss_reason: reason || "Other",
      lost_date: new Date().toISOString().slice(0, 10),
    };
    await markLostMutation({ id, payload });
  };

  const confirmDeleteEntry = async () => {
    if (!deleteModalEntry) return;
    try {
      await deleteMutation(deleteModalEntry.id);
      setDeleteModalEntry(null);
    } catch (err) {
      // Error handled by mutation toast
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
            {stats.total > 0 && (
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <WaitlistFunnelCard stats={stats} />
              </motion.div>
            )}
            <motion.div variants={itemVariants} className={stats.total > 0 ? "lg:col-span-1" : "lg:col-span-3"}>
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
                    statusFilter.toLowerCase() === st.toLowerCase()
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
        isLoading={isWaitlistLoading}
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
        onDelete={(entry) => setDeleteModalEntry(entry)}
      />

      {hasNextPage && (
        <div ref={observerRef} className="py-4 text-center text-xs text-gray-500 font-medium">
          {isFetchingNextPage ? "Loading more families..." : "Scroll down to load more"}
        </div>
      )}

      {/* ── Interactive Stage Modals ───────────────────────────── */}
      <AddWaitlistModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditModalEntry(null);
        }}
        onSave={handleSaveAddModal}
        editItem={editModalEntry}
        isPending={isAddPending || isUpdatePending}
      />

      <LogTourModal
        isOpen={!!tourModalEntry}
        onClose={() => setTourModalEntry(null)}
        entry={tourModalEntry}
        onLogTour={logTour}
        isPending={isTourPending}
      />

      <MoveAppliedModal
        isOpen={!!appliedModalEntry}
        onClose={() => setAppliedModalEntry(null)}
        entry={appliedModalEntry}
        onMoveToApplied={moveToApplied}
        isPending={isAppliedPending}
      />

      <OfferSpotModal
        isOpen={!!offerModalEntry}
        onClose={() => setOfferModalEntry(null)}
        entry={offerModalEntry}
        onOfferSpot={offerSpot}
        isPending={isOfferPending}
      />

      <ConfirmEnrollmentModal
        isOpen={!!enrollModalEntry}
        onClose={() => setEnrollModalEntry(null)}
        entry={enrollModalEntry}
        onConfirmEnrollment={confirmEnrollment}
        isPending={isEnrollPending}
      />

      <MarkLostModal
        isOpen={!!lostModalEntry}
        onClose={() => setLostModalEntry(null)}
        entry={lostModalEntry}
        onMarkLost={markLost}
        isPending={isLostPending}
      />

      {/* ── Global Delete Confirmation Modal ────────────────────── */}
      <ConfirmationModal
        isOpen={!!deleteModalEntry}
        onClose={() => setDeleteModalEntry(null)}
        onConfirm={confirmDeleteEntry}
        title="Delete Waitlist Entry"
        message={`Are you sure you want to delete "${deleteModalEntry?.childName || "this entry"}" from the waitlist? This action cannot be undone.`}
        confirmText="Delete Entry"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeletePending}
      />
    </motion.div>
  );
};

export default WaitlistPage;
