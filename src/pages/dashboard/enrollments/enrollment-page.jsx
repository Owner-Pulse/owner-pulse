import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Award,
  Calendar,
  ArrowUpRight,
  UserMinus,
  UserPlus,
  GraduationCap,
  Building2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

// ─── Status Pill ──────────────────────────────────────────────────

const StatusPill = ({ status, children }) => {
  const colors = {
    intervening: "bg-amber-50 text-amber-700 border-amber-200",
    retained: "bg-green-50 text-green-700 border-green-200",
    lost: "bg-red-50 text-red-700 border-red-200",
    compliant: "bg-green-50 text-green-700 border-green-200",
    inquiry: "bg-gray-50 text-gray-600 border-gray-200",
    applied: "bg-blue-50 text-blue-700 border-blue-200",
    toured: "bg-purple-50 text-purple-700 border-purple-200",
    offered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    financial: "bg-amber-50 text-amber-700 border-amber-200",
    transferring: "bg-orange-50 text-orange-700 border-orange-200",
    other: "bg-gray-50 text-gray-600 border-gray-200",
    moving: "bg-red-50 text-red-700 border-red-200",
    referral: "bg-blue-50 text-blue-700 border-blue-200",
    website: "bg-cyan-50 text-cyan-700 border-cyan-200",
    walk_in: "bg-emerald-50 text-emerald-700 border-emerald-200",
    event: "bg-purple-50 text-purple-700 border-purple-200",
  };
  const c = colors[status] || "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${c}`}
    >
      {children}
    </span>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, accent, trend }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${accent}`}>
          <Icon size={18} />
        </div>
      </div>
      {sub && (
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">{sub}</span>
        </div>
      )}
      {trend && (
        <div className="mt-2 flex items-center text-xs">
          <span className="flex items-center text-emerald-600 font-medium">
            <ArrowUpRight size={12} className="mr-1" />
            {trend}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Users}
            label="Total Enrolled"
            value={totalEnrolled}
            sub={`out of ${totalCapacity} capacity`}
            accent="bg-blue-50 text-blue-600"
            trend="+9% YoY"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Building2}
            label="Open Seats"
            value={openSeats}
            sub={`${Math.round((openSeats / totalCapacity) * 100)}% availability`}
            accent="bg-emerald-50 text-emerald-600"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Calendar}
            label="Waitlist"
            value={totalWaitlist}
            sub={`${waitlistEntries.length} families waiting`}
            accent="bg-purple-50 text-purple-600"
            trend="+33% this month"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={AlertTriangle}
            label="At-Risk"
            value={activeRisk.length}
            sub={`${staleCases.length} stale · ${lostRisk.length} lost`}
            accent="bg-red-50 text-red-600"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Award}
            label="Discounts"
            value={discounts.length}
            sub={`${discountPct}% of students · ${fmtMoneyShort(discountTotal)}/mo`}
            accent="bg-cyan-50 text-cyan-600"
          />
        </motion.div>
      </div>

      {/* ── Enrollment Targets ───────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              Annual Enrollment Targets
            </CardTitle>
            <CardDescription>
              Progress toward this year's enrollment goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {Object.values(ENROLLMENT_TARGETS).map((target) => {
                const pct = Math.round((target.actual / target.target) * 100);
                const met = pct >= 100;
                const close = pct >= 90 && pct < 100;
                const barColor = met
                  ? "bg-emerald-500"
                  : close
                    ? "bg-amber-500"
                    : "bg-blue-500";

                return (
                  <div
                    key={target.label}
                    className="p-5 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">
                        {target.label}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          met
                            ? "bg-emerald-100 text-emerald-700"
                            : close
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {met ? "✓ Met" : `${100 - pct}% to go`}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-extrabold text-gray-900">
                        {target.actual}
                      </span>
                      <span className="text-sm text-gray-500">
                        / {target.target}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>0</span>
                        <span className="font-semibold">{pct}%</span>
                        <span>target</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Enrollment by Program ──────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Enrollment by Program</CardTitle>
            <CardDescription>
              Current enrollment vs capacity across all programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] md:h-[280px] w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={PROGRAMS}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="capacity"
                    fill="#E5E8F0"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                    name="Capacity"
                  />
                  <Bar
                    dataKey="enrolled"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                    name="Enrolled"
                  >
                    {PROGRAMS.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.enrolled >= entry.capacity
                            ? "#F59E0B"
                            : "#2563EB"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── At-Risk Students ─────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">              <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserMinus size={18} className="text-red-500" />
                  At-Risk Students
                </CardTitle>
                <CardDescription>
                  Families signaling they may leave
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] md:text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-semibold">
                  {activeRisk.length} active
                </span>
                <span className="text-[10px] md:text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-semibold">
                  {retainedRisk.length} retained
                </span>
                <span className="text-[10px] md:text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-full font-semibold">
                  {lostRisk.length} lost
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Stale alert */}
            {staleCases.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-800">
                  <span className="font-bold">{staleCases.length} stale case
                  {staleCases.length > 1 ? "s" : ""}</span> · not touched in
                  over 14 days. Status update needed.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {atRiskStudents
                .filter(
                  (r) =>
                    (activeRiskStatus[r.id] || r.status) !== "lost" &&
                    (activeRiskStatus[r.id] || r.status) !== "retained"
                )
                .map((student) => {
                  const currentStatus = activeRiskStatus[student.id] || student.status;
                  const isActive = currentStatus === "intervening";
                  const isStale = student.daysActive > 14 && isActive;

                  return (
                    <div
                      key={student.id}
                      className={`p-4 rounded-xl border ${
                        isStale
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              {student.name}
                            </span>
                            <StatusPill status={student.grade}>
                              {student.grade}
                            </StatusPill>
                            <StatusPill status={student.reason}>
                              {student.reason}
                            </StatusPill>
                            {isStale && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">
                                ⏰ {student.daysActive}d stale
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {student.detail}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Flagged {student.flagged} · {student.daysActive}{" "}
                            days ago
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {["intervening", "retained"].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateRiskStatus(student.id, status)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                currentStatus === status
                                  ? "bg-red-500 text-white shadow-sm"
                                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                          <button
                            onClick={() => updateRiskStatus(student.id, "lost")}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all bg-white text-red-500 border border-red-200 hover:bg-red-50"
                          >
                            lost
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {activeRisk.length === 0 && (
                <div className="py-8 text-center">
                  <CheckCircle2
                    size={32}
                    className="mx-auto text-emerald-400 mb-2"
                  />
                  <p className="text-sm text-gray-500">
                    No active at-risk students. All families current.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Waitlist + Discounts ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Waitlist */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={18} className="text-purple-500" />
                Waitlist
              </CardTitle>
              <CardDescription>
                {waitlistEntries.length} families waiting for spots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Child
                      </th>
                      <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Program
                      </th>
                      <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                        Parent
                      </th>
                      <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlistEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2.5 font-medium text-gray-900">
                          {entry.child}
                        </td>
                        <td className="py-2.5 text-gray-600">
                          {entry.program}
                        </td>
                        <td className="py-2.5 text-gray-500 hidden md:table-cell">
                          {entry.parent}
                        </td>
                        <td className="py-2.5">
                          <StatusPill status={entry.status}>
                            {entry.status}
                          </StatusPill>
                        </td>
                        <td className="py-2.5 hidden md:table-cell">
                          <StatusPill status={entry.source}>
                            {entry.source}
                          </StatusPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">
                    {waitlistEntries.filter((e) => e.status === "inquiry")
                      .length + waitlistEntries.filter((e) => e.status === "applied").length}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Active
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-600">
                    {waitlistEntries.filter((e) => e.status === "toured")
                      .length + waitlistEntries.filter((e) => e.status === "offered").length}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Toured
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {waitlistEntries.filter((e) => e.status === "offered")
                      .length}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Offered
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full mt-3 text-sm text-blue-600"
              >
                View full waitlist →
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Discounts & Waived Tuition */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award size={18} className="text-cyan-500" />
                Discounts & Waived Tuition
              </CardTitle>
              <CardDescription>
                {discounts.reduce((a, d) => a + d.count, 0)} students
                receiving tuition breaks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 rounded-xl bg-gray-50 text-center">
                  <p className="text-2xl font-extrabold text-cyan-600">
                    {discounts.reduce((a, d) => a + d.count, 0)}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                    Students
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 text-center">
                  <p className="text-2xl font-extrabold text-amber-600">
                    {fmtMoneyShort(discountTotal)}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                    Per Month
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 text-center">
                  <p className="text-2xl font-extrabold text-amber-600">
                    {fmtMoneyShort(discountTotal * 10)}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                    Annualized
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {discounts.map((d) => (
                  <div
                    key={d.type}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {d.type}
                      </p>
                      <p className="text-xs text-gray-500">{d.count} students</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {fmtMoney(d.monthlyValue)}/mo
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800">
                  <span className="font-bold">Annual revenue impact:</span>{" "}
                  {fmtMoney(discountTotal * 10)} given away in discounts across
                  a 10-month school year.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Program Detail Table ──────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 size={18} className="text-gray-500" />
              Program Detail
            </CardTitle>
            <CardDescription>
              Full breakdown by program with capacity and waitlist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Enrolled
                    </th>
                    <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Open Seats
                    </th>
                    <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Waitlist
                    </th>
                    <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Fill %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PROGRAMS.map((p) => {
                    const fillPct = Math.round((p.enrolled / p.capacity) * 100);
                    const isFull = p.enrolled >= p.capacity;
                    const nearFull = fillPct >= 90 && !isFull;

                    return (
                      <tr
                        key={p.name}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2.5 font-medium text-gray-900">
                          {p.name}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-gray-900">
                          {p.enrolled}
                        </td>
                        <td className="py-2.5 text-right text-gray-500">
                          {p.capacity}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`font-semibold ${
                              p.capacity - p.enrolled === 0
                                ? "text-red-500"
                                : nearFull
                                  ? "text-amber-500"
                                  : "text-emerald-600"
                            }`}
                          >
                            {p.capacity - p.enrolled}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-gray-500 hidden md:table-cell">
                          {p.waitlist > 0 ? (
                            <span className="font-semibold text-purple-600">
                              {p.waitlist}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right hidden md:table-cell">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isFull
                                    ? "bg-amber-500"
                                    : nearFull
                                      ? "bg-emerald-400"
                                      : "bg-blue-500"
                                }`}
                                style={{ width: `${fillPct}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-semibold ${
                                isFull
                                  ? "text-amber-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {fillPct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Preschool</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Elementary (K–5th)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Middle School (6th–8th)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default EnrollmentPage;
