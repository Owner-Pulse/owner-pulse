import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Percent, AlertTriangle, Loader2, Plus } from "lucide-react";
import KpiCard from "./components/KpiCard";
import PTOSummaryCard from "./components/PTOSummaryCard";
import SubstitutesCard from "./components/SubstitutesCard";
import StaffRosterTable from "./components/StaffRosterTable";
import StaffFormModal from "./components/StaffFormModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { useGetStaff } from "@/hooks/owner-hook/staff.hook";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const StaffPage = () => {
  const [rosterPage, setRosterPage] = useState(1);
  const [ptoPage, setPtoPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [allPtoStaff, setAllPtoStaff] = useState([]);
  const [allStaffRoster, setAllStaffRoster] = useState([]);

  // Modal and action states
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const { data, isLoading, isFetching } = useGetStaff({
    roster_page: rosterPage,
    pto_page: ptoPage,
  });

  const staffDashboard = data?.staff_dashboard || {};
  const summary = staffDashboard.summary || {};
  const metrics = staffDashboard.metrics || {};
  const todaysAttendance = staffDashboard.todays_attendance || {};
  const ptoSummary = staffDashboard.pto_summary || {};
  const substitutesData = staffDashboard.substitutes || {};
  const staffRoster = staffDashboard.staff_roster || [];
  const rosterPagination = staffDashboard.staff_roster_pagination || null;
  const ptoPagination = ptoSummary.staff_pto_list_pagination || null;

  useEffect(() => {
    const ptoItems = data?.staff_dashboard?.pto_summary?.staff_pto_list;
    if (ptoItems && Array.isArray(ptoItems)) {
      if (ptoPage === 1) {
        setAllPtoStaff(ptoItems);
      } else {
        setAllPtoStaff((prev) => {
          const existingIds = new Set(prev.map((item) => item.employee_id || item.name));
          const newUnique = ptoItems.filter((item) => !existingIds.has(item.employee_id || item.name));
          return [...prev, ...newUnique];
        });
      }
    }
  }, [data, ptoPage]);

  useEffect(() => {
    const rosterItems = data?.staff_dashboard?.staff_roster;
    if (rosterItems && Array.isArray(rosterItems)) {
      if (rosterPage === 1) {
        setAllStaffRoster(rosterItems);
      } else {
        setAllStaffRoster((prev) => {
          const existingIds = new Set(prev.map((item) => item.employee_id || item.id || item.name));
          const newUnique = rosterItems.filter((item) => !existingIds.has(item.employee_id || item.id || item.name));
          return [...prev, ...newUnique];
        });
      }
    }
  }, [data, rosterPage]);

  const handleLoadMorePto = () => {
    if (ptoPagination && ptoPage < Number(ptoPagination.last_page)) {
      setPtoPage((prev) => prev + 1);
    }
  };

  const handleLoadMoreRoster = () => {
    if (rosterPagination && rosterPage < Number(rosterPagination.last_page)) {
      setRosterPage((prev) => prev + 1);
    }
  };

  // Staff CRUD logic
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

  const confirmDeleteStaff = () => {
    setAllStaffRoster((prev) => prev.filter((s) => (s.employee_id || s.id) !== pendingDeleteId));
    setIsConfirmDeleteOpen(false);
    setPendingDeleteId(null);
  };

  const handleSaveStaff = (form) => {
    if (editingStaff) {
      setAllStaffRoster((prev) =>
        prev.map((s) =>
          (s.employee_id || s.id) === (editingStaff.employee_id || editingStaff.id)
            ? {
                ...s,
                name: form.name,
                role: form.role,
                classroom: form.classroom,
                status: form.status,
                ptoAllowance: form.ptoAllowance,
                pto_used: form.pto_used,
                hireDate: form.hireDate,
                phone: form.phone,
                email: form.email,
                remaining: form.ptoAllowance - form.pto_used,
                usage_percentage: Math.round((form.pto_used / form.ptoAllowance) * 100)
              }
            : s
        )
      );
    } else {
      const newStaff = {
        id: Math.floor(Math.random() * 1000) + 100,
        employee_id: form.employee_id,
        name: form.name,
        role: form.role,
        classroom: form.classroom,
        status: form.status,
        ptoAllowance: form.ptoAllowance,
        pto_used: form.pto_used,
        hireDate: form.hireDate,
        phone: form.phone,
        email: form.email,
        remaining: form.ptoAllowance - form.pto_used,
        usage_percentage: Math.round((form.pto_used / form.ptoAllowance) * 100)
      };
      setAllStaffRoster((prev) => [newStaff, ...prev]);
    }
  };

  // KPI Metrics
  const totalStaff = allStaffRoster.length || summary.total_staff || metrics.total_staff?.count || 0;
  const presentToday = summary.present_today ?? todaysAttendance.present ?? 0;
  const lateToday = summary.late_today ?? todaysAttendance.late ?? 0;
  const outToday = summary.out_today ?? todaysAttendance.call_out ?? 0;

  const ptoUsedMetric = metrics.pto_used || {};
  const ptoPercent = ptoUsedMetric.percentage_numeric ?? ptoSummary.overall_pto_percentage ?? 0;
  const ptoUsedDays = ptoUsedMetric.used_days ?? ptoSummary.total_pto_used_days ?? 0;
  const ptoAllowanceDays = ptoUsedMetric.total_allowance_days ?? ptoSummary.total_pto_allowance_days ?? 0;

  const GlenUsage = allStaffRoster.filter(s => {
    const used = s.pto_used ?? s.ptoUsed ?? 0;
    const allowance = s.ptoAllowance || 10;
    return (used / allowance) >= 0.7;
  }).length;
  const highPtoCount = GlenUsage || (metrics.high_pto_usage?.count ?? ptoSummary.high_usage_count ?? 0);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex items-center gap-3 text-gray-500 font-medium">
          <Loader2 className="animate-spin text-blue-650" size={24} />
          <span>Loading staff data...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalStaff} total · {presentToday} present today
          </p>
        </div>
        <Button 
          onClick={handleAddStaffClick}
          className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold transition-all px-4 py-2.5 rounded-xl text-xs md:text-sm flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={16} /> Add Staff
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={Users} label="Total Staff" value={totalStaff} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={UserCheck}
            label={presentToday === totalStaff && totalStaff > 0 ? "All Present" : "Present Today"}
            value={presentToday}
            sub={lateToday > 0 || outToday > 0 ? `${lateToday} late · ${outToday} out` : "Full attendance"}
            iconBg="bg-[#3E7A54]/10 text-[#2F6042]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Percent}
            label="PTO Used"
            value={`${ptoPercent}%`}
            sub={`${ptoUsedDays}/${ptoAllowanceDays} days`}
            iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={AlertTriangle}
            label="High PTO Usage"
            value={highPtoCount}
            sub={highPtoCount > 0 ? "Staff using ≥70% allowance" : "All within healthy range"}
            iconBg={highPtoCount > 0 ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "bg-[#3E7A54]/10 text-[#2F6042]"}
            valueColor={highPtoCount > 0 ? "text-[#8A362C]" : "text-gray-900"}
          />
        </motion.div>
      </div>

      {/* PTO Summary */}
      <motion.div variants={itemVariants}>
        <PTOSummaryCard
          ptoSummary={ptoSummary}
          staffList={allPtoStaff.length > 0 ? allPtoStaff : ptoSummary.staff_pto_list || []}
          pagination={ptoPagination}
          onLoadMore={handleLoadMorePto}
          isLoadingMore={isFetching && ptoPage > 1}
        />
      </motion.div>

      {/* Substitutes Section */}
      <motion.div variants={itemVariants}>
        <SubstitutesCard substitutesData={substitutesData} />
      </motion.div>

      {/* Staff Roster */}
      <motion.div variants={itemVariants}>
        <StaffRosterTable
          staffRoster={allStaffRoster.length > 0 ? allStaffRoster : staffRoster}
          sortBy={sortBy}
          onSortChange={setSortBy}
          pagination={rosterPagination}
          onLoadMore={handleLoadMoreRoster}
          isLoadingMore={isFetching && rosterPage > 1}
          onEdit={handleEditStaffClick}
          onDelete={handleDeleteStaffClick}
        />
      </motion.div>

      {/* Add / Edit Staff Modal */}
      <StaffFormModal
        isOpen={isStaffModalOpen}
        staff={editingStaff}
        onSave={handleSaveStaff}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
      />

      {/* Delete Staff Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={confirmDeleteStaff}
        title="Remove Staff Member"
        message="Are you sure you want to remove this employee? This will immediately disable their time clock, remove active schedules, and archive their Procare profile history."
        confirmText="Remove Staff"
        cancelText="Cancel"
        type="danger"
      />
    </motion.div>
  );
};

export default StaffPage;
