import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Percent, AlertTriangle } from "lucide-react";
import KpiCard from "./components/KpiCard";
import AttendanceChart from "./components/AttendanceChart";
import PTOSummaryCard from "./components/PTOSummaryCard";
import SubstitutesCard from "./components/SubstitutesCard";
import StaffRosterTable from "./components/StaffRosterTable";
import { useGetStaff } from "@/hooks";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const STAFF = [
  { id: 1, name: "Ms. Alvarez", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 3, birthdayUsedThisYear: false },
  { id: 2, name: "Ms. Soto", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 2, birthdayUsedThisYear: true },
  { id: 3, name: "Ms. Patel", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 5, birthdayUsedThisYear: false },
  { id: 4, name: "Ms. Rivera", role: "Teacher", today: "late", ptoAllowance: 10, ptoUsed: 1, birthdayUsedThisYear: false },
  { id: 5, name: "Ms. Brooks", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 4, birthdayUsedThisYear: false },
  { id: 6, name: "Mr. Nguyen", role: "Teacher", today: "callout", ptoAllowance: 10, ptoUsed: 6, birthdayUsedThisYear: false },
  { id: 7, name: "Ms. Cohen", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 7, birthdayUsedThisYear: false },
  { id: 8, name: "Ms. Diaz", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 0, birthdayUsedThisYear: true },
  { id: 9, name: "Mr. Park", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 3, birthdayUsedThisYear: false },
  { id: 10, name: "Mr. O'Brien", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 2, birthdayUsedThisYear: false },
  { id: 11, name: "Ms. Hassan", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 8, birthdayUsedThisYear: false },
];

const SUBSTITUTES = [
  { id: 1, date: "2026-05-11", coveringFor: "Ms. Cohen", subName: "Ms. Hart", calledBy: "Director" },
  { id: 2, date: "2026-05-05", coveringFor: "Mr. Levine", subName: "Mr. Owens", calledBy: "Director" },
  { id: 3, date: "2026-04-28", coveringFor: "Ms. Diaz", subName: "Ms. Hart", calledBy: "Director" },
];

const StaffPage = () => {
  const { data, isLoading } = useGetStaff();
  const stafData = data?.staff_dashboard;
  console.log("Staff dashboard", stafData);

  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const counts = useMemo(() => ({
    present: STAFF.filter((s) => s.today === "present").length,
    late: STAFF.filter((s) => s.today === "late").length,
    callout: STAFF.filter((s) => s.today === "callout").length,
  }), []);

  const totalPtoUsed = useMemo(() => STAFF.reduce((a, s) => a + s.ptoUsed, 0), []);
  const totalPtoAllowance = useMemo(() => STAFF.reduce((a, s) => a + s.ptoAllowance, 0), []);
  const ptoPercent = Math.round((totalPtoUsed / totalPtoAllowance) * 100);

  const filtered = useMemo(() => {
    if (filterStatus === "all") return STAFF;
    return STAFF.filter((s) => s.today === filterStatus);
  }, [filterStatus]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "ptoUsed") return b.ptoUsed - a.ptoUsed;
      if (sortBy === "ptoRemaining") return (a.ptoAllowance - a.ptoUsed) - (b.ptoAllowance - b.ptoUsed);
      return 0;
    });
  }, [filtered, sortBy]);

  const highPtoUsers = useMemo(() => STAFF.filter((s) => s.ptoUsed >= 7), []);

  const subStats = useMemo(() => ({
    total: SUBSTITUTES.length,
    thisWeek: SUBSTITUTES.filter((r) => {
      const diff = Math.ceil((new Date() - new Date(r.date)) / 86400000);
      return diff >= 0 && diff <= 7;
    }).length,
    uniqueSubs: [...new Set(SUBSTITUTES.map((r) => r.subName))].length,
  }), []);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500 mt-1">{STAFF.length} total · {counts.present} present today</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={Users} label="Total Staff" value={STAFF.length} iconBg="bg-blue-50 text-blue-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={UserCheck} label={counts.present === STAFF.length ? "All Present" : "Present Today"} value={counts.present}
            sub={counts.late > 0 || counts.callout > 0 ? `${counts.late} late · ${counts.callout} out` : "Full attendance"}
            iconBg="bg-emerald-50 text-emerald-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Percent} label="PTO Used" value={`${ptoPercent}%`} sub={`${totalPtoUsed}/${totalPtoAllowance} days`} iconBg="bg-purple-50 text-purple-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={AlertTriangle} label="High PTO Usage" value={highPtoUsers.length}
            sub={highPtoUsers.length > 0 ? "Staff using ≥70% allowance" : "All within healthy range"}
            iconBg={highPtoUsers.length > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}
            valueColor={highPtoUsers.length > 0 ? "text-red-600" : "text-gray-900"} />
        </motion.div>
      </div>

      {/* Attendance Chart + PTO Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="md:col-span-1">
          <AttendanceChart counts={counts} />
        </motion.div>
        <motion.div variants={itemVariants} className="md:col-span-2">
          <PTOSummaryCard staff={STAFF} ptoPercent={ptoPercent} />
        </motion.div>
      </div>

      {/* Substitutes Section */}
      <motion.div variants={itemVariants}>
        <SubstitutesCard substitutes={SUBSTITUTES} subStats={subStats} />
      </motion.div>

      {/* Staff Roster */}
      <motion.div variants={itemVariants}>
        <StaffRosterTable
          staff={STAFF}
          sorted={sorted}
          filterStatus={filterStatus}
          sortBy={sortBy}
          onFilterChange={setFilterStatus}
          onSortChange={setSortBy}
        />
      </motion.div>
    </motion.div>
  );
};

export default StaffPage;
