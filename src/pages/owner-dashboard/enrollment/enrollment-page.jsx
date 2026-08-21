import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, GraduationCap, Building2, Calendar, AlertTriangle, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import EnrollmentTargetsCard from "./components/EnrollmentTargetsCard";
import EnrollmentChart from "./components/EnrollmentChart";
import AtRiskStudentsCard from "./components/AtRiskStudentsCard";
import WaitlistCard from "./components/WaitlistCard";
import DiscountsCard from "./components/DiscountsCard";
import ProgramDetailTable from "./components/ProgramDetailTable";
import { useGetOwnerEnrollments } from "@/hooks/owner-hook/enrollments.hook";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtMoneyShort = (n) => (n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + n);

const EnrollmentPage = () => {
  const { enrollmentData, isLoading, isError, refetch } = useGetOwnerEnrollments();
  const [activeRiskStatus, setActiveRiskStatus] = useState({});

  const updateRiskStatus = (id, status) => {
    setActiveRiskStatus((prev) => ({ ...prev, [id]: status }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F] mb-2" />
        <p className="text-sm font-medium">Loading Enrollment Overview...</p>
      </div>
    );
  }

  // Extract real backend response data with safe fallbacks
  const header = enrollmentData?.header || {};
  const totalEnrolledObj = enrollmentData?.total_enrolled || {};
  const openSeatsObj = enrollmentData?.open_seats || {};
  const waitlistObj = enrollmentData?.waitlist || {};
  const atRiskObj = enrollmentData?.at_risk || {};
  const atRiskListRaw = enrollmentData?.at_risk_students?.list || [];
  const discountsObj = enrollmentData?.discounts_waived_tuition || {};
  const classroomsRaw = enrollmentData?.classrooms || [];
  const annualTargetsRaw = enrollmentData?.annual_targets || [];

  // Map classrooms for chart and table
  const programsData = classroomsRaw.map((cls) => ({
    id: cls.id,
    name: cls.program || cls.classroom_name || `Room ${cls.id}`,
    enrolled: cls.enrolled || 0,
    capacity: cls.capacity || 0,
    openSeats: cls.open_seats || 0,
    waitlist: cls.waitlist || 0,
    fillPercentage: cls.fill_percentage || 0,
  }));

  // Map targets
  const targetsData = {
    total: { 
      label: "Total Enrollment", 
      actual: annualTargetsRaw[0]?.current || totalEnrolledObj.count || 0, 
      target: annualTargetsRaw[0]?.target || 650 
    },
    preschool: { 
      label: "Preschool (Age 1–VPK)", 
      actual: annualTargetsRaw[1]?.current || 301, 
      target: annualTargetsRaw[1]?.target || 320 
    },
    k8: { 
      label: "K–8", 
      actual: annualTargetsRaw[2]?.current || 319, 
      target: annualTargetsRaw[2]?.target || 330 
    },
  };

  // Map at risk students
  const atRiskStudents = atRiskListRaw.map((s) => ({
    id: s.id,
    name: s.student_name || s.student || "Student",
    grade: s.classroom_name || "General",
    reason: s.risk_category || "Financial Concerns",
    detail: s.risk_details || "Early warning signs observed",
    flagged: s.formatted_flag_date || s.flag_date || "Recently",
    daysActive: s.days_ago || 1,
    status: s.status === "withdrawn" ? "lost" : (s.status || "intervening"),
  }));

  // Map discounts
  const discountCategories = (discountsObj.categories || []).map((c) => ({
    type: c.category,
    count: c.students_count,
    monthlyValue: c.monthly_amount,
  }));

  const totalEnrolledCount = totalEnrolledObj.count || header.students_count || 620;
  const openSeatsCount = openSeatsObj.count || 0;
  const totalWaitlistCount = waitlistObj.count || 0;
  const activeRiskCount = atRiskObj.active_count ?? atRiskStudents.filter((r) => (activeRiskStatus[r.id] || r.status) === "intervening").length;
  const discountTotalMonthly = discountsObj.monthly_amount || 0;

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Enrollment Overview
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {totalEnrolledCount} students · {header.programs_count || classroomsRaw.length} classrooms · {header.overall_capacity_percentage || 0}% capacity
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="self-start md:self-auto">
          Refresh Data
        </Button>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard 
            icon={Users} 
            label="Total Enrolled" 
            value={totalEnrolledCount} 
            sub={`capacity ${totalEnrolledObj.capacity || 0}`} 
            accent="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
            trend={`${totalEnrolledObj.yoy_growth_percentage || 0}% YoY`} 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard 
            icon={Building2} 
            label="Open Seats" 
            value={openSeatsCount} 
            sub={`${openSeatsObj.availability_percentage || 0}% availability`} 
            accent="bg-[#3E7A54]/10 text-[#2F6042]" 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard 
            icon={Calendar} 
            label="Waitlist" 
            value={totalWaitlistCount} 
            sub={`${waitlistObj.families_waiting || 0} families waiting`} 
            accent="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
            trend={`+${waitlistObj.mom_growth_percentage || 0}% MoM`} 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard 
            icon={AlertTriangle} 
            label="At-Risk" 
            value={activeRiskCount} 
            sub={`${atRiskObj.stale_count || 0} stale · ${atRiskObj.lost_count || 0} lost`} 
            accent="bg-[#AE4A3E]/10 text-[#8A362C]" 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard 
            icon={Award} 
            label="Discounts" 
            value={discountsObj.count || 0} 
            sub={`${discountsObj.student_percentage || 0}% of students · ${fmtMoneyShort(discountTotalMonthly)}/mo`} 
            accent="bg-[#1E3A5F]/10 text-[#1E3A5F]" 
          />
        </motion.div>
      </div>

      {/* ── Enrollment Targets ───────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <EnrollmentTargetsCard targets={targetsData} />
      </motion.div>

      {/* ── Enrollment by Program ────────────────────────── */}
      <div className="grid grid-cols-1 gap-4">
        <motion.div variants={itemVariants}>
          <EnrollmentChart programs={programsData} />
        </motion.div>
      </div>

      {/* ── At-Risk Students ─────────────────────────────────────── */}
      <AtRiskStudentsCard
        atRiskStudents={atRiskStudents}
        activeRiskStatus={activeRiskStatus}
        onUpdateRiskStatus={updateRiskStatus}
      />

      {/* ── Waitlist + Discounts ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <WaitlistCard entries={[]} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DiscountsCard discounts={discountCategories} />
        </motion.div>
      </div>

      {/* ── Program Detail Table ──────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <ProgramDetailTable programs={programsData} />
      </motion.div>
    </motion.div>
  );
};

export default EnrollmentPage;
