import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Users, 
  CheckCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "./components/StatCard";
import TabBar from "./components/TabBar";
import PTOHistoryCard from "./components/PTOHistoryCard";
import SubstituteHistoryCard from "./components/SubstituteHistoryCard";
import PTOForm from "./components/PTOForm";
import SubstituteForm from "./components/SubstituteForm";
import StaffRosterTable from "../../owner-dashboard/staff/components/StaffRosterTable";
import PTOSummaryCard from "../../owner-dashboard/staff/components/PTOSummaryCard";
import StaffFormModal from "../../owner-dashboard/staff/components/StaffFormModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { 
  useGetDirectorStaff, 
  useAddStaff, 
  useUpdateStaff, 
  useDeleteStaff, 
  useGetPtoStaff 
} from "@/hooks/director-hook/staff.hook";

const TODAY = new Date("2026-05-11");

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const DirectorStaffManagement = () => {
  const [activeTab, setActiveTab] = useState("roster");
  const [ptoLog, setPtoLog] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Pagination states
  const [rosterPage, setRosterPage] = useState(1);
  const [ptoPage, setPtoPage] = useState(1);
  const [subPage, setSubPage] = useState(1);

  // Local state for accumulated staff list & PTO list
  const [allStaffRoster, setAllStaffRoster] = useState([]);
  const [allPtoStaff, setAllPtoStaff] = useState([]);
  const [sortBy, setSortBy] = useState("name");

  // Modal and action states
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // API hooks
  const currentPageParam = activeTab === "pto" ? ptoPage : activeTab === "substitute" ? subPage : rosterPage;
  const { data: directorData, isLoading: isDirectorLoading, isFetching: isDirectorFetching } = useGetDirectorStaff({
    type: activeTab === "substitute" ? "substitutes" : activeTab,
    page: currentPageParam,
    per_page: 50,
  });

  const { staffList = [] } = useGetPtoStaff({ per_page: 1000 });
  const { addStaff, isPending: isAdding } = useAddStaff();
  const { updateStaff, isPending: isUpdating } = useUpdateStaff();
  const { deleteStaff, isPending: isDeleting } = useDeleteStaff();

  const directorDataContent = directorData?.data || directorData || {};

  // Extract tab specific data
  const staffRosterFromApi = directorDataContent.staff_roster || directorDataContent.staff_list || [];
  const rosterPagination = directorDataContent.staff_roster_pagination || directorDataContent.pagination || null;
  const summaryMetrics = directorDataContent.summary || directorDataContent.roster_metrics || {};

  // PTO metrics & history from API
  const ptoMetricsFromApi = directorDataContent.pto_metrics || (directorDataContent.type === "pto" ? directorDataContent.summary : null);
  const ptoHistoryFromApi = directorDataContent.pto_history;
  const staffPtoFromApi = directorDataContent.staff_pto_list;
  const ptoPaginationFromApi = directorDataContent.staff_pto_list_pagination || directorDataContent.pto_history_pagination;

  // Substitute metrics & history from API
  const subMetricsFromApi = directorDataContent.substitutes_metrics || (directorDataContent.type === "substitutes" ? directorDataContent.summary : null);
  const subHistoryFromApi = directorDataContent.substitute_history || (Array.isArray(directorDataContent.substitutes) ? directorDataContent.substitutes : null);

  // Sync staff roster list
  useEffect(() => {
    if (staffRosterFromApi && Array.isArray(staffRosterFromApi) && staffRosterFromApi.length > 0) {
      const formattedApiItems = staffRosterFromApi.map((s) => ({
        ...s,
        employee_id: s.employee_id || s.procare_employee_id || s.id,
        name: s.name,
        role: s.role || "Lead Teacher",
        ptoAllowance: s.ptoAllowance || s.total_allowance_days || 10,
        pto_used: s.pto_used ?? s.ptoUsed ?? 0,
        remaining: (s.total_allowance_days || s.ptoAllowance || 10) - (s.pto_used ?? s.ptoUsed ?? 0),
        usage_percentage: Math.round(((s.pto_used ?? s.ptoUsed ?? 0) / (s.total_allowance_days || s.ptoAllowance || 10)) * 100)
      }));

      if (rosterPage === 1) {
        setAllStaffRoster(formattedApiItems);
      } else {
        setAllStaffRoster((prev) => {
          const existingIds = new Set(prev.map((item) => item.employee_id || item.id || item.name));
          const newUnique = formattedApiItems.filter((item) => !existingIds.has(item.employee_id || item.id || item.name));
          return [...prev, ...newUnique];
        });
      }
    } else if (staffList && staffList.length > 0 && allStaffRoster.length === 0) {
      const formatted = staffList.map((s) => ({
        ...s,
        employee_id: s.employee_id || s.procare_employee_id || s.id,
        name: s.name,
        role: s.role || "Lead Teacher",
        ptoAllowance: s.total_allowance_days || 10,
        pto_used: s.pto_used ?? s.ptoUsed ?? 0,
        remaining: (s.total_allowance_days || 10) - (s.pto_used ?? s.ptoUsed ?? 0),
        usage_percentage: Math.round(((s.pto_used ?? s.ptoUsed ?? 0) / (s.total_allowance_days || 10)) * 100)
      }));
      setAllStaffRoster(formatted);
    }
  }, [directorData, staffList, rosterPage]);

  // Sync PTO staff list
  useEffect(() => {
    if (staffPtoFromApi && Array.isArray(staffPtoFromApi)) {
      if (ptoPage === 1) {
        setAllPtoStaff(staffPtoFromApi);
      } else {
        setAllPtoStaff((prev) => {
          const existingIds = new Set(prev.map((item) => item.employee_id || item.id || item.name));
          const newUnique = staffPtoFromApi.filter((item) => !existingIds.has(item.employee_id || item.id || item.name));
          return [...prev, ...newUnique];
        });
      }
    }
  }, [directorData, ptoPage]);

  const handleLoadMoreRoster = () => {
    if (rosterPagination && rosterPage < Number(rosterPagination.last_page)) {
      setRosterPage((prev) => prev + 1);
    }
  };

  const handleLoadMorePto = () => {
    if (ptoPaginationFromApi && ptoPage < Number(ptoPaginationFromApi.last_page)) {
      setPtoPage((prev) => prev + 1);
    }
  };

  // Stat computations (Prioritize real API metrics)
  const ptoStats = useMemo(() => {
    if (ptoMetricsFromApi) {
      return {
        totalDays: ptoMetricsFromApi.total_pto_days ?? 0,
        sickDays: ptoMetricsFromApi.sick_days ?? 0,
        personalDays: ptoMetricsFromApi.personal_days ?? 0,
        uniqueStaff: ptoMetricsFromApi.staff_affected ?? 0,
      };
    }
    return {
      totalDays: ptoLog.reduce((a, r) => a + r.days, 0),
      sickDays: ptoLog.filter((r) => r.dayType === "sick").reduce((a, r) => a + r.days, 0),
      personalDays: ptoLog.filter((r) => r.dayType === "personal").reduce((a, r) => a + r.days, 0),
      uniqueStaff: [...new Set(ptoLog.map((r) => r.staffId))].length,
    };
  }, [ptoMetricsFromApi, ptoLog]);

  const subStats = useMemo(() => {
    if (subMetricsFromApi) {
      return {
        total: subMetricsFromApi.total_substitutes ?? 0,
        thisWeek: subMetricsFromApi.this_week ?? 0,
        uniqueSubs: subMetricsFromApi.unique_subs ?? 0,
        coverage: subMetricsFromApi.coverage_percentage ? `${subMetricsFromApi.coverage_percentage}%` : "100%"
      };
    }
    const thisWeekCount = substitutes.filter((r) => {
      const diff = Math.ceil((TODAY - new Date(r.date)) / 86400000);
      return diff >= 0 && diff <= 7;
    }).length;
    return {
      total: substitutes.length,
      thisWeek: thisWeekCount,
      uniqueSubs: [...new Set(substitutes.map((r) => r.subName))].length,
      coverage: thisWeekCount > 0 ? `${Math.round((thisWeekCount / substitutes.length) * 100)}%` : "100%"
    };
  }, [subMetricsFromApi, substitutes]);

  const rosterStats = useMemo(() => ({
    total: summaryMetrics.total_staff || summaryMetrics.total_roster || allStaffRoster.length,
    leadTeachers: summaryMetrics.lead_teachers ?? allStaffRoster.filter(s => s.role === "Lead Teacher").length,
    assistants: summaryMetrics.assistants ?? allStaffRoster.filter(s => s.role === "Assistant Teacher").length,
    support: summaryMetrics.other_staff ?? allStaffRoster.filter(s => !["Lead Teacher", "Assistant Teacher"].includes(s.role)).length,
  }), [allStaffRoster, summaryMetrics]);

  // Active PTO History list (Prioritize API response)
  const activePtoHistory = Array.isArray(ptoHistoryFromApi) ? ptoHistoryFromApi : ptoLog;
  
  // Active Substitutes History list (Prioritize API response)
  const activeSubstitutesHistory = Array.isArray(subHistoryFromApi) ? subHistoryFromApi : substitutes;

  // CRUD events
  const handleAddStaffClick = () => {
    setEditingStaff(null);
    setIsStaffModalOpen(true);
  };

  const handleEditStaffClick = (staff) => {
    setEditingStaff(staff);
    setIsStaffModalOpen(true);
  };

  const handleDeleteStaffClick = (employeeId) => {
    setPendingDeleteId(employeeId);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteStaff = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteStaff(pendingDeleteId);
      setAllStaffRoster((prev) => prev.filter((s) => (s.procare_employee_id || s.employee_id || s.id) !== pendingDeleteId));
    } catch {
      // Toast handled by hook
    } finally {
      setIsConfirmDeleteOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handleSaveStaff = async (form) => {
    try {
      if (editingStaff) {
        const staffId = editingStaff.procare_employee_id || editingStaff.employee_id || editingStaff.id;
        await updateStaff({ staffId, body: form });
      } else {
        await addStaff(form);
      }
      setIsStaffModalOpen(false);
      setEditingStaff(null);
    } catch {
      // Toast handled by hook
    }
  };

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {rosterStats.total} staff members · Track PTO & substitutes
          </p>
        </div>
        {activeTab === "roster" ? (
          <Button 
            className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold transition-all px-4 py-2.5 rounded-xl text-xs md:text-sm flex items-center gap-1.5"
            onClick={handleAddStaffClick}
          >
            <Plus size={16} /> Add Staff Member
          </Button>
        ) : (
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold transition-all px-4 py-2 rounded-xl text-xs md:text-sm flex items-center gap-1.5" onClick={() => setShowForm(true)}>
            <Plus size={16} /> {activeTab === "pto" ? "Log PTO" : "Log Substitute"}
          </Button>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <TabBar 
          activeTab={activeTab} 
          onTabChange={(id) => { 
            setActiveTab(id); 
            setShowForm(false); 
            setRosterPage(1); 
            setPtoPage(1);
            setSubPage(1);
          }} 
        />
      </motion.div>

      {/* ─── ROSTER TAB ─── */}
      {activeTab === "roster" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Total Roster" 
                value={rosterStats.total} 
                sub="Active staff" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Lead Teachers" 
                value={rosterStats.leadTeachers} 
                valueColor="text-[#2F6042]" 
                sub="Classroom leads" 
                iconBg="bg-[#3E7A54]/10 text-[#2F6042]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Assistants" 
                value={rosterStats.assistants} 
                valueColor="text-[#1E3A5F]" 
                sub="Co-teachers & helpers" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Other Staff" 
                value={rosterStats.support} 
                sub="Chef, admins & floaters" 
                iconBg="bg-gray-50 text-gray-600" 
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-6">
            <StaffRosterTable
              staffRoster={allStaffRoster}
              sortBy={sortBy}
              onSortChange={setSortBy}
              pagination={rosterPagination}
              onLoadMore={handleLoadMoreRoster}
              isLoadingMore={isDirectorFetching && rosterPage > 1}
              onEdit={handleEditStaffClick}
              onDelete={handleDeleteStaffClick}
            />
          </motion.div>
        </>
      )}

      {/* ─── PTO TAB ─── */}
      {activeTab === "pto" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Calendar} 
                label="Total PTO Days" 
                value={ptoStats.totalDays} 
                sub="Logged requests" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={AlertTriangle} 
                label="Sick Days" 
                value={ptoStats.sickDays} 
                valueColor="text-[#8F6A1F]" 
                sub="Medical call-outs" 
                iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Clock} 
                label="Personal Days" 
                value={ptoStats.personalDays} 
                valueColor="text-[#1E3A5F]" 
                sub="Personal leave" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Staff Affected" 
                value={ptoStats.uniqueStaff} 
                sub="Distinct members" 
                iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]" 
              />
            </motion.div>
          </div>

          <div className="space-y-6 mt-6">
            <motion.div variants={itemVariants}>
              <PTOHistoryCard
                ptoLog={activePtoHistory}
                staff={allStaffRoster.length > 0 ? allStaffRoster : staffList}
              />
            </motion.div>

            {/* PTO Summary Card for Staff List & Balances */}
            {allPtoStaff.length > 0 && (
              <motion.div variants={itemVariants}>
                <PTOSummaryCard
                  ptoSummary={directorDataContent.summary || directorDataContent.pto_metrics || {}}
                  staffList={allPtoStaff}
                  pagination={ptoPaginationFromApi}
                  onLoadMore={handleLoadMorePto}
                  isLoadingMore={isDirectorFetching && ptoPage > 1}
                />
              </motion.div>
            )}
          </div>
        </>
      )}

      {/* ─── SUBSTITUTES TAB ─── */}
      {activeTab === "substitute" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Total Substitutes" 
                value={subStats.total} 
                sub="Coverages filled" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Calendar} 
                label="This Week" 
                value={subStats.thisWeek} 
                valueColor="text-[#1E3A5F]" 
                sub="Active substitute needs" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={Users} 
                label="Unique Subs" 
                value={subStats.uniqueSubs} 
                sub="Sub Pool size" 
                iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                icon={CheckCircle} 
                label="Coverage" 
                value={subStats.coverage} 
                valueColor="text-[#2F6042]" 
                sub="Fill rate percentage" 
                iconBg="bg-[#3E7A54]/10 text-[#2F6042]" 
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-6">
            <SubstituteHistoryCard substitutes={activeSubstitutesHistory} />
          </motion.div>
        </>
      )}

      {/* Forms and modals */}
      {showForm && activeTab === "pto" && (
        <PTOForm onClose={() => setShowForm(false)} />
      )}
      {showForm && activeTab === "substitute" && (
        <SubstituteForm onClose={() => setShowForm(false)} />
      )}

      {/* Staff Form Modal */}
      <StaffFormModal
        isOpen={isStaffModalOpen}
        staff={editingStaff}
        onSave={handleSaveStaff}
        isSubmitting={isAdding || isUpdating}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
      />

      {/* Confirmation Modal for Staff Deletion */}
      <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={confirmDeleteStaff}
        title="Remove Staff Member"
        message="Are you sure you want to remove this employee? This will immediately disable their roster assignment and archive their Procare profile history."
        confirmText={isDeleting ? "Removing..." : "Remove Staff"}
        cancelText="Cancel"
        type="danger"
      />
    </motion.div>
  );
};

export default DirectorStaffManagement;
