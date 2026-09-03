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

import {
  useGetDirectorWaitlistList,
  useAddDirectorWaitlist,
  useUpdateDirectorWaitlist,
  useLogTourDirectorWaitlist,
  useMoveAppliedDirectorWaitlist,
  useOfferSpotDirectorWaitlist,
  useConfirmEnrollmentDirectorWaitlist,
  useMarkLostDirectorWaitlist,
  useDeleteDirectorWaitlist,
} from "@/hooks/director-hook/waitlist.hook";

import { useGetOwnerWaitlistList } from "@/hooks/owner-hook/waitlist.hook";
import { useGetUser } from "@/hooks/auth/user-details.hook";
import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ALL_PROGRAMS = [
  "Infants",
  "Toddlers",
  "Twos",
  "Threes",
  "Pre-K",
  "VPK A",
  "Kindergarten",
  "1st/2nd Grade",
  "3rd/4th Grade",
  "7/8 Grade",
];

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

  // Pagination / Params
  const [page, setPage] = useState(1);

  const waitlistParams = useMemo(
    () => ({
      page,
      per_page: 15,
      status: statusFilter !== "all" ? statusFilter.toLowerCase() : undefined,
      program: programFilter !== "all" ? programFilter : undefined,
      search: searchQuery.trim() || undefined,
    }),
    [page, statusFilter, programFilter, searchQuery]
  );

  // Fetch list states from hooks based on current user role
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

  // Handle updated API response structure: payload can be inside data.data or data directly
  const payload = waitlistData?.data || waitlistData || {};
  const waitlists = payload.waitlists || [];
  const classroomWiseWaitlist = payload.classroom_wise_waitlist || payload.summary?.classroom_wise_waitlist || [];

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

  // Map API snake_case format items into camelCase structure
  const mappedWaitlist = useMemo(() => {
    const rawList = Array.isArray(waitlists)
      ? waitlists
      : Array.isArray(waitlists?.data)
      ? waitlists.data
      : [];

    return rawList.map((item) => {
      const isPast30Days = item.wait_time_days > 30;
      return {
        id: item.id,
        childName: item.child_name,
        ageDob: item.age_dob,
        program: item.program || item.classroom_name || "Unassigned",
        classroomId: item.classroom_id,
        classroomName: item.classroom_name || item.classroom || "Unassigned",
        parentName: item.parent_name,
        phone: item.phone,
        email: item.email,
        source: item.source || "other",
        notes: item.notes || "",
        specialNotes: item.special_notes || "",
        status: (item.status || "inquiry").toLowerCase(),
        tourDate: item.tour_date,
        tourTime: item.tour_time,
        tourShowedUp: item.tour_showed_up,
        tourNotes: item.tour_notes,
        packetHandedToFamily: item.packet_handed_to_family,
        applicationDate: item.application_date,
        applicationNotes: item.application_notes,
        offerDate: item.offer_date,
        offeredStartDate: item.offered_start_date,
        offerNotes: item.offer_notes,
        finalEnrollmentNotes: item.final_enrollment_notes,
        lossReason: item.loss_reason,
        lostDate: item.lost_date,
        enrolledDate: item.enrolled_date,
        addedDate: item.added_date || item.created_at,
        waitTimeDays: item.wait_time_days || 0,
        waitTimeText: item.wait_time_text || `${item.wait_time_days || 0}d`,
        isPast30Days,
        raw: item,
      };
    });
  }, [waitlists]);

  // Calculated Stats & Aggregations
  const stats = useMemo(() => {
    const summary = payload.summary || payload.data?.summary || {};
    const byStatus = summary.by_status || {};

    const total = summary.total_pipeline ?? mappedWaitlist.length;
    const inquiryCount = byStatus.inquiry ?? mappedWaitlist.filter((x) => x.status === "inquiry").length;
    const touredCount = byStatus.toured ?? mappedWaitlist.filter((x) => x.status === "toured").length;
    const appliedCount = byStatus.applied ?? mappedWaitlist.filter((x) => x.status === "applied").length;
    const offeredCount = byStatus.offered ?? mappedWaitlist.filter((x) => x.status === "offered").length;
    const enrolledCount = byStatus.enrolled ?? mappedWaitlist.filter((x) => x.status === "enrolled").length;
    const lostCount = byStatus.lost ?? mappedWaitlist.filter((x) => x.status === "lost").length;

    const staleItems = mappedWaitlist.filter((x) => x.isPast30Days && x.status !== "enrolled" && x.status !== "lost");
    const staleCount = summary.stale_30_days ?? staleItems.length;

    const overallConversionRate = total > 0 ? Math.round((enrolledCount / total) * 100) : 0;
    const touredToAppliedRate = touredCount > 0 ? Math.round(((appliedCount + offeredCount) / touredCount) * 100) : 0;

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
      overallConversionRate,
      touredToAppliedRate,
    };
  }, [payload, mappedWaitlist]);

  // Breakdown aggregations
  const byProgram = useMemo(() => {
    const counts = {};
    const waitTimes = {};
    mappedWaitlist.forEach((x) => {
      const p = x.program;
      counts[p] = (counts[p] || 0) + 1;
      waitTimes[p] = (waitTimes[p] || 0) + x.waitTimeDays;
    });
    return Object.entries(counts).map(([program, count]) => ({
      program,
      count,
      avgWait: Math.round(waitTimes[program] / count),
    }));
  }, [mappedWaitlist]);

  const bySource = useMemo(() => {
    const counts = {};
    mappedWaitlist.forEach((x) => {
      counts[x.source] = (counts[x.source] || 0) + 1;
    });
    return counts;
  }, [mappedWaitlist]);

  // Local Filter matching
  const filtered = useMemo(() => {
    return mappedWaitlist.filter((entry) => {
      if (statusFilter !== "all" && entry.status !== statusFilter.toLowerCase()) return false;
      if (programFilter !== "all" && entry.program !== programFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchChild = entry.childName?.toLowerCase().includes(q);
        const matchParent = entry.parentName?.toLowerCase().includes(q);
        const matchNotes = entry.notes?.toLowerCase().includes(q);
        if (!matchChild && !matchParent && !matchNotes) return false;
      }
      return true;
    });
  }, [mappedWaitlist, statusFilter, programFilter, searchQuery]);

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Waitlist Management
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Track inquiries, tours, offers, and classroom waitlist tallies
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
              icon={GraduationCap}
              label="Offered Spots"
              value={stats.offeredCount}
              sub="Awaiting family response"
              iconBg="bg-teal-100 text-teal-800"
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
              <p className="text-xs font-semibold text-gray-500">Applied</p>
              <p className="text-2xl font-extrabold text-teal-600 mt-1">{stats.appliedCount + stats.offeredCount}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Paperwork / Applied</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">Needs Follow-Up</p>
              <p className={`text-2xl font-extrabold mt-1 ${stats.staleCount > 0 ? "text-[#8A362C]" : "text-gray-900"}`}>
                {stats.staleCount}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">&gt;30 days waiting</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Owner Funnel & Classroom Breakdown Row ──────────────────────── */}
      {isOwner ? (
        <div className="space-y-4">
          {stats.staleCount > 0 && (
            <motion.div variants={itemVariants}>
              <StaleLeadAlertCard staleItems={stats.staleItems} />
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {stats.total > 0 && (
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <WaitlistFunnelCard stats={stats} />
              </motion.div>
            )}
            <motion.div variants={itemVariants} className={stats.total > 0 ? "lg:col-span-1" : "lg:col-span-3"}>
              <ProgramBreakdownCard
                byProgram={byProgram}
                bySource={bySource}
                classroomWiseWaitlist={classroomWiseWaitlist}
              />
            </motion.div>
          </div>
        </div>
      ) : (
        <motion.div variants={itemVariants}>
          <ProgramBreakdownCard
            byProgram={byProgram}
            bySource={bySource}
            classroomWiseWaitlist={classroomWiseWaitlist}
          />
        </motion.div>
      )}

      {/* ── Filter Bar & Primary Waitlist Table ──────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter buttons */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg flex-wrap gap-1">
              {["all", "Inquiry", "Toured", "Applied", "Enrolled", "Lost"].map((st) => (
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

      {/* ── Main Pipeline Table ───────────────────────────────────── */}
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
          {isFetchingNextPage ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
              <span>Loading more waitlist records...</span>
            </div>
          ) : (
            <span>Scroll down to load more</span>
          )}
        </div>
      )}

      {/* ── Action Modals ────────────────────────────────────────── */}
      {showAddModal && (
        <AddWaitlistModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditModalEntry(null);
          }}
          onSubmit={async (data) => {
            if (editModalEntry) {
              await updateMutation({ id: editModalEntry.id, data });
            } else {
              await addMutation(data);
            }
            setShowAddModal(false);
            setEditModalEntry(null);
          }}
          isPending={isAddPending || isUpdatePending}
          editEntry={editModalEntry}
          classrooms={classrooms}
        />
      )}

      {tourModalEntry && (
        <LogTourModal
          isOpen={!!tourModalEntry}
          entry={tourModalEntry}
          onClose={() => setTourModalEntry(null)}
          onSubmit={async (tourData) => {
            await logTourMutation({ id: tourModalEntry.id, data: tourData });
            setTourModalEntry(null);
          }}
          isPending={isTourPending}
        />
      )}

      {appliedModalEntry && (
        <MoveAppliedModal
          isOpen={!!appliedModalEntry}
          entry={appliedModalEntry}
          onClose={() => setAppliedModalEntry(null)}
          onSubmit={async (appliedData) => {
            await moveToAppliedMutation({ id: appliedModalEntry.id, data: appliedData });
            setAppliedModalEntry(null);
          }}
          isPending={isAppliedPending}
        />
      )}

      {offerModalEntry && (
        <OfferSpotModal
          isOpen={!!offerModalEntry}
          entry={offerModalEntry}
          onClose={() => setOfferModalEntry(null)}
          onSubmit={async (offerData) => {
            await offerSpotMutation({ id: offerModalEntry.id, data: offerData });
            setOfferModalEntry(null);
          }}
          isPending={isOfferPending}
        />
      )}

      {enrollModalEntry && (
        <ConfirmEnrollmentModal
          isOpen={!!enrollModalEntry}
          entry={enrollModalEntry}
          onClose={() => setEnrollModalEntry(null)}
          onSubmit={async (enrollData) => {
            await confirmEnrollmentMutation({ id: enrollModalEntry.id, data: enrollData });
            setEnrollModalEntry(null);
          }}
          isPending={isEnrollPending}
        />
      )}

      {lostModalEntry && (
        <MarkLostModal
          isOpen={!!lostModalEntry}
          entry={lostModalEntry}
          onClose={() => setLostModalEntry(null)}
          onSubmit={async (lostData) => {
            await markLostMutation({ id: lostModalEntry.id, data: lostData });
            setLostModalEntry(null);
          }}
          isPending={isLostPending}
        />
      )}

      {deleteModalEntry && (
        <ConfirmationModal
          isOpen={!!deleteModalEntry}
          onClose={() => setDeleteModalEntry(null)}
          onConfirm={async () => {
            await deleteMutation(deleteModalEntry.id);
            setDeleteModalEntry(null);
          }}
          title="Delete Waitlist Entry"
          description={`Are you sure you want to delete ${deleteModalEntry.childName} from the waitlist? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="destructive"
          isPending={isDeletePending}
        />
      )}
    </motion.div>
  );
};

export default WaitlistPage;
