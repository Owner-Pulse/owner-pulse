import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EnrollmentKpiGrid from "./components/EnrollmentKpiGrid";
import EnrollmentTargets from "./components/sections/EnrollmentTargets";
import EnrollmentByProgram from "./components/sections/EnrollmentByProgram";
import AtRiskStudents from "./components/sections/AtRiskStudents";
import Waitlist from "./components/sections/Waitlist";
import Discounts from "./components/sections/Discounts";
import ProgramDetail from "./components/sections/ProgramDetail";

// ─── Data Models ──────────────────────────────────────────────────

const PROGRAMS = [
  { name: "Age 1", enrolled: 6, capacity: 8, waitlist: 2 },
  { name: "Age 2", enrolled: 9, capacity: 10, waitlist: 1 },
  { name: "PreK3", enrolled: 11, capacity: 12, waitlist: 4 },
  { name: "PreK4", enrolled: 16, capacity: 16, waitlist: 3 },
  { name: "VPK", enrolled: 17, capacity: 18, waitlist: 2 },
  { name: "K", enrolled: 19, capacity: 20, waitlist: 5 },
  { name: "1st", enrolled: 18, capacity: 20, waitlist: 1 },
  { name: "2nd", enrolled: 21, capacity: 22, waitlist: 3 },
  { name: "3rd", enrolled: 20, capacity: 22, waitlist: 0 },
  { name: "4th", enrolled: 22, capacity: 24, waitlist: 2 },
  { name: "5th", enrolled: 19, capacity: 24, waitlist: 4 },
  { name: "6th", enrolled: 17, capacity: 24, waitlist: 1 },
  { name: "7th", enrolled: 14, capacity: 24, waitlist: 2 },
  { name: "8th", enrolled: 13, capacity: 24, waitlist: 0 },
];

const ENROLLMENT_TARGETS = {
  total: { label: "Total Enrollment", actual: 222, target: 240 },
  preschool: {
    label: "Preschool (Age 1–VPK)",
    actual: 59,
    target: 65,
  },
  k8: { label: "K–8", actual: 163, target: 175 },
};

const atRiskStudents = [
  {
    id: 1,
    name: "J. Martinez",
    grade: "5th",
    reason: "financial",
    detail: "Lost job · asking about payment plan",
    flagged: "May 4",
    daysActive: 7,
    status: "intervening",
  },
  {
    id: 2,
    name: "A. Choi",
    grade: "7th",
    reason: "transferring",
    detail: "Touring private school in Tampa",
    flagged: "May 6",
    daysActive: 5,
    status: "intervening",
  },
  {
    id: 3,
    name: "R. Hassan",
    grade: "3rd",
    reason: "financial",
    detail: "Asked about scholarship eligibility",
    flagged: "May 8",
    daysActive: 3,
    status: "intervening",
  },
  {
    id: 4,
    name: "S. Patel",
    grade: "6th",
    reason: "other",
    detail: "Parent dissatisfied with math curriculum",
    flagged: "Apr 28",
    daysActive: 13,
    status: "intervening",
  },
  {
    id: 5,
    name: "T. Brooks",
    grade: "2nd",
    reason: "transferring",
    detail: "Considering homeschool",
    flagged: "May 10",
    daysActive: 1,
    status: "intervening",
  },
  {
    id: 6,
    name: "M. Webb",
    grade: "8th",
    reason: "moving",
    detail: "Moving district",
    flagged: "Apr 18",
    daysActive: 23,
    status: "lost",
  },
  {
    id: 7,
    name: "L. Khoury",
    grade: "4th",
    reason: "financial",
    detail: "Two-month tuition balance",
    flagged: "May 2",
    daysActive: 9,
    status: "retained",
  },
];

const waitlistEntries = [
  {
    id: 1,
    child: "Emma R.",
    program: "PreK4",
    parent: "Sara R.",
    phone: "813-555-0142",
    dateAdded: "Mar 18",
    status: "toured",
    source: "referral",
  },
  {
    id: 2,
    child: "Noah K.",
    program: "K",
    parent: "James K.",
    phone: "813-555-0188",
    dateAdded: "Apr 2",
    status: "applied",
    source: "website",
  },
  {
    id: 3,
    child: "Liam M.",
    program: "2nd",
    parent: "Maria M.",
    phone: "813-555-0210",
    dateAdded: "Apr 11",
    status: "offered",
    source: "walk_in",
  },
  {
    id: 4,
    child: "Sophia D.",
    program: "PreK3",
    parent: "Anika D.",
    phone: "813-555-0301",
    dateAdded: "Apr 19",
    status: "inquiry",
    source: "event",
  },
  {
    id: 5,
    child: "Ethan C.",
    program: "5th",
    parent: "Lin C.",
    phone: "813-555-0277",
    dateAdded: "Apr 22",
    status: "toured",
    source: "referral",
  },
  {
    id: 6,
    child: "Ava B.",
    program: "K",
    parent: "Daniel B.",
    phone: "813-555-0344",
    dateAdded: "May 1",
    status: "applied",
    source: "website",
  },
];

const discounts = [
  { type: "Staff Children", count: 6, monthlyValue: 5100 },
  { type: "Sibling Discount", count: 5, monthlyValue: 1151 },
  { type: "Hardship Waiver", count: 1, monthlyValue: 500 },
];

// ─── Helpers ──────────────────────────────────────────────────────

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const fmtMoneyShort = (n) =>
  n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + n;

const totalEnrolled = PROGRAMS.reduce((a, p) => a + p.enrolled, 0);
const totalCapacity = PROGRAMS.reduce((a, p) => a + p.capacity, 0);
const totalWaitlist = PROGRAMS.reduce((a, p) => a + p.waitlist, 0);
const openSeats = totalCapacity - totalEnrolled;
const enrollPercent = Math.round((totalEnrolled / totalCapacity) * 100);

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ─── Main Component ───────────────────────────────────────────────

const EnrollmentPage = () => {
  const [activeRiskStatus, setActiveRiskStatus] = useState({});

  const updateRiskStatus = (id, status) => {
    setActiveRiskStatus((prev) => ({ ...prev, [id]: status }));
  };

  const activeRisk = atRiskStudents.filter(
    (r) => (activeRiskStatus[r.id] || r.status) === "intervening"
  );
  const retainedRisk = atRiskStudents.filter(
    (r) => (activeRiskStatus[r.id] || r.status) === "retained"
  );
  const lostRisk = atRiskStudents.filter(
    (r) => (activeRiskStatus[r.id] || r.status) === "lost"
  );
  const staleCases = atRiskStudents.filter(
    (r) => r.daysActive > 14 && (activeRiskStatus[r.id] || r.status) === "intervening"
  );

  const discountTotal = discounts.reduce((a, d) => a + d.monthlyValue, 0);
  const discountPct = Math.round((discounts.length / totalEnrolled) * 100);

  const kpiStats = {
    totalEnrolled,
    totalCapacity,
    openSeats,
    totalWaitlist,
    waitlistCount: waitlistEntries.length,
    activeRiskCount: activeRisk.length,
    staleCasesCount: staleCases.length,
    lostRiskCount: lostRisk.length,
    discountsCount: discounts.length,
    discountPct,
    discountTotalShort: fmtMoneyShort(discountTotal),
  };

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Enrollment
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {totalEnrolled} students · {PROGRAMS.length} programs ·{" "}
            {enrollPercent}% capacity
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" className="bg-white text-xs md:text-sm px-2.5 md:px-3">
            <UserPlus size={14} className="mr-1.5" /> <span className="hidden xs:inline">Add</span> Student
          </Button>
          <Button className="bg-[#0A0F1E] hover:bg-black text-white text-xs md:text-sm px-2.5 md:px-3">
            <GraduationCap size={14} className="mr-1.5" /> Waitlist
          </Button>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <EnrollmentKpiGrid stats={kpiStats} itemVariants={itemVariants} />

      {/* ── Enrollment Targets ───────────────────────────────────── */}
      <EnrollmentTargets targets={ENROLLMENT_TARGETS} itemVariants={itemVariants} />

      {/* ── Enrollment by Program ──────────────────────────────── */}
      <EnrollmentByProgram programs={PROGRAMS} itemVariants={itemVariants} />

      {/* ── At-Risk Students ─────────────────────────────────────── */}
      <AtRiskStudents
        atRiskStudents={atRiskStudents}
        activeRisk={activeRisk}
        retainedRisk={retainedRisk}
        lostRisk={lostRisk}
        staleCases={staleCases}
        activeRiskStatus={activeRiskStatus}
        updateRiskStatus={updateRiskStatus}
        itemVariants={itemVariants}
      />

      {/* ── Waitlist + Discounts ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Waitlist */}
        <Waitlist waitlistEntries={waitlistEntries} itemVariants={itemVariants} />

        {/* Discounts & Waived Tuition */}
        <Discounts
          discounts={discounts}
          discountTotal={discountTotal}
          itemVariants={itemVariants}
          fmtMoney={fmtMoney}
          fmtMoneyShort={fmtMoneyShort}
        />
      </div>

      {/* ── Program Detail Table ──────────────────────────────────── */}
      <ProgramDetail programs={PROGRAMS} itemVariants={itemVariants} />
    </motion.div>
  );
};

export default EnrollmentPage;
