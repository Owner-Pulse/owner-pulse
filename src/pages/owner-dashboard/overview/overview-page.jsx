import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Receipt,
  Users,
  DollarSign,
  ClipboardList,
  CheckCircle2 as CheckIcon,
  Wrench,
  AlertTriangle,
  Calendar,
  UserCheck,
  ShieldCheck,
  Wallet,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { computeOwnerPulse } from "@/lib/pulse-engine";

// ─── Extracted Components ─────────────────────────────────────
import PulseSection from "./components/PulseSection";
import FinancialChart from "./components/FinancialChart";
import QuickStatCards from "./components/QuickStatCards";
import AtRiskStudentsCard from "./components/AtRiskStudentsCard";
import MaintenanceCard from "./components/MaintenanceCard";
import TasksCard from "./components/TasksCard";
import BudgetOverviewCard from "./components/BudgetOverviewCard";
import EnrollmentChart from "./components/EnrollmentChart";
import UpcomingEventsCard from "./components/UpcomingEventsCard";
import DonutKpiCard from "./components/DonutKpiCard";

// ─── Data ──────────────────────────────────────────────────────────

// TODO: Backend wiring — replace hardcoded data with API response
const revenueData = [
  { name: "Jan", revenue: 145000, expenses: 95000, tuition: 125000, scholarships: 20000 },
  { name: "Feb", revenue: 152000, expenses: 98000, tuition: 130000, scholarships: 22000 },
  { name: "Mar", revenue: 158000, expenses: 94000, tuition: 135000, scholarships: 23000 },
  { name: "Apr", revenue: 165000, expenses: 102000, tuition: 140000, scholarships: 25000 },
  { name: "May", revenue: 172000, expenses: 99000, tuition: 145000, scholarships: 27000 },
  { name: "Jun", revenue: 184200, expenses: 105000, tuition: 155000, scholarships: 29200 },
];

const enrollmentData = [
  { name: "PreK3", students: 34, capacity: 40, waitlist: 12 },
  { name: "PreK4", students: 42, capacity: 45, waitlist: 8 },
  { name: "Kinder", students: 38, capacity: 40, waitlist: 15 },
  { name: "1st Grade", students: 35, capacity: 35, waitlist: 5 },
  { name: "2nd Grade", students: 30, capacity: 35, waitlist: 7 },
];

// TODO: Backend wiring — replace hardcoded data with API response
const complianceItems = [
  { id: 1, name: "Fire Inspection", status: "compliant", expires: "2026-11-04", daysLeft: 162, authority: "County Fire" },
  { id: 2, name: "Health Dept. Inspection", status: "compliant", expires: "2026-08-22", daysLeft: 88, authority: "FL DOH" },
  { id: 3, name: "Background Checks", status: "expiring", expires: "2026-06-15", daysLeft: 20, authority: "FL DCF" },
  { id: 4, name: "CPR / First Aid", status: "expired", expires: "2026-04-12", daysLeft: -29, authority: "Red Cross" },
  { id: 5, name: "General Liability", status: "expiring", expires: "2026-07-01", daysLeft: 36, authority: "Travelers" },
  { id: 6, name: "VPK Provider Cert.", status: "compliant", expires: "2027-01-30", daysLeft: 249, authority: "ELC" },
];

// TODO: Backend wiring — replace hardcoded data with API response
const tasks = [
  { id: 1, title: "Parent-teacher conference scheduling", assignee: "director", priority: "high", status: "in_progress", due: "2026-05-14" },
  { id: 2, title: "Renew faculty CPR certifications", assignee: "director", priority: "high", status: "open", due: "2026-05-20" },
  { id: 3, title: "Order Grade 5 yearbooks", assignee: "director", priority: "medium", status: "open", due: "2026-05-25" },
  { id: 4, title: "Step Up Q4 attestation", assignee: "director", priority: "high", status: "open", due: "2026-05-28" },
  { id: 5, title: "HVAC replacement quotes", assignee: "owner", priority: "medium", status: "in_progress", due: "2026-05-18" },
  { id: 6, title: "Scholarship renewal letters", assignee: "director", priority: "low", status: "open", due: "2026-06-01" },
];

// TODO: Backend wiring — replace hardcoded data with API response
const atRiskStudents = [
  { name: "J. Martinez", grade: "5th", reason: "financial", detail: "Lost job · asking about payment plan", flagged: "2026-05-04", status: "intervening" },
  { name: "A. Choi", grade: "7th", reason: "transferring", detail: "Touring private school in Tampa", flagged: "2026-05-06", status: "intervening" },
  { name: "R. Hassan", grade: "3rd", reason: "financial", detail: "Asked about scholarship eligibility", flagged: "2026-05-08", status: "intervening" },
  { name: "M. Webb", grade: "8th", reason: "moving", detail: "Family relocating out of state", flagged: "2026-04-18", status: "lost" },
];

// TODO: Backend wiring — replace hardcoded data with API response
const maintenanceRequests = [
  { id: 1, location: "K — Sequoia", issue: "AC unit not cooling", priority: "critical", status: "open", submittedBy: "Director" },
  { id: 2, location: "Playground", issue: "Swing chain snapped", priority: "high", status: "in_progress", submittedBy: "Director" },
  { id: 3, location: "PreK3 — Caterpillars", issue: "Sink faucet dripping", priority: "low", status: "open", submittedBy: "Director" },
  { id: 4, location: "Front Office", issue: "Printer not connecting to network", priority: "medium", status: "done", submittedBy: "Owner" },
  { id: 5, location: "1st — Redwood", issue: "Ceiling light flickering", priority: "low", status: "open", submittedBy: "Director" },
  { id: 6, location: "Cafeteria", issue: "Refrigerator temp running warm", priority: "critical", status: "open", submittedBy: "Director" },
];

const budgetData = {
  total: 1850000, spent: 1240000,
  categories: [
    { name: "Payroll & Benefits", spent: 920000, budget: 1200000, percent: 77, color: "#4F46E5" },
    { name: "Facilities & Rent", spent: 142000, budget: 180000, percent: 79, color: "#2563EB" },
    { name: "Curriculum & Books", spent: 58000, budget: 75000, percent: 77, color: "#10B981" },
    { name: "Insurance", spent: 38000, budget: 45000, percent: 84, color: "#F59E0B" },
    { name: "Director Discretionary", spent: 7200, budget: 9000, percent: 80, color: "#EC4899" },
  ],
};

const DEFAULT_EXPENSES = [
  { id: 1, amount: 47.50, reason: "Events & Food", description: "Pizza for parent meeting", date: "2026-04-12" },
  { id: 2, amount: 124.00, reason: "Classroom Supplies", description: "Crayons and markers — PreK3", date: "2026-04-15" },
  { id: 3, amount: 38.00, reason: "Staff Appreciation", description: "Coffee and donuts for staff PD", date: "2026-04-22" },
  { id: 4, amount: 89.00, reason: "Cleaning Supplies", description: "Cleaning wipes restock", date: "2026-04-28" },
  { id: 5, amount: 215.00, reason: "Classroom Supplies", description: "Construction paper bulk order", date: "2026-05-01" },
  { id: 6, amount: 65.00, reason: "Staff Appreciation", description: "Birthday cake for office party", date: "2026-05-04" },
  { id: 7, amount: 180.00, reason: "Office Supplies", description: "Printer ink cartridges", date: "2026-05-06" },
  { id: 8, amount: 42.00, reason: "Teacher Appreciation", description: "Gift cards for teacher appreciation", date: "2026-05-08" },
];

const procareData = {
  dailyCheckIns: 42, absentToday: 4, illnesses: 2, medicationGiven: 1, incidents: 0, parentMessages: 8,
};

const quickbooksStatus = {
  lastSync: "2026-05-11 02:34 AM", pendingTransactions: 3, reconciled: true, bankBalance: 487200,
};

const staffPTO = [
  { name: "Ms. Cohen", used: 7, allowance: 10, recent: "Personal (May 2, May 6)" },
  { name: "Ms. Hassan", used: 8, allowance: 10, recent: "Sick (Apr 28)" },
  { name: "Mr. Nguyen", used: 6, allowance: 10, recent: "Vacation (Apr 22)" },
  { name: "Ms. Patel", used: 5, allowance: 10, recent: "Personal (Apr 15)" },
  { name: "Ms. Brooks", used: 4, allowance: 10, recent: "Sick (Apr 10)" },
];

const substitutes = [
  { id: 1, date: "2026-05-11", coveringFor: "Ms. Cohen", subName: "Ms. Hart" },
  { id: 2, date: "2026-05-05", coveringFor: "Mr. Levine", subName: "Mr. Owens" },
  { id: 3, date: "2026-04-28", coveringFor: "Ms. Diaz", subName: "Ms. Hart" },
];

// TODO: Backend wiring — replace hardcoded data with API response
const discounts = [
  { student: "E. Foster", grade: "K", type: "staff_child", monthlyValue: 850 },
  { student: "N. Patel", grade: "2nd", type: "sibling", monthlyValue: 225 },
  { student: "C. Patel", grade: "K", type: "sibling", monthlyValue: 213 },
  { student: "D. Alvarez", grade: "3rd", type: "staff_child", monthlyValue: 925 },
  { student: "S. Tran", grade: "5th", type: "staff_child", monthlyValue: 850 },
];

const DIRECTOR_BUDGET_TOTAL = 9000;

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const OverviewPage = () => {
  const navigate = useNavigate();
  const go = (path) => navigate(path);

  // ─── Expenses from localStorage ───
  const [expenses, setExpenses] = useState(() => {
    try { const saved = localStorage.getItem("directorExpenses"); return saved ? JSON.parse(saved) : DEFAULT_EXPENSES; } catch { return DEFAULT_EXPENSES; }
  });

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "directorExpenses") { try { setExpenses(JSON.parse(e.newValue)); } catch { } }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const directorSpent = useMemo(() => expenses.reduce((a, e) => a + e.amount, 0), [expenses]);
  const directorRemaining = DIRECTOR_BUDGET_TOTAL - directorSpent;
  const pettyCashPercent = Math.round((directorSpent / DIRECTOR_BUDGET_TOTAL) * 100);

  const expenseByReason = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const reason = e.reason || "Other";
      map[reason] = (map[reason] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const recentExpenses = useMemo(() => [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [expenses]);

  // ─── Computed stats ───
  const totalEnrolled = 245;
  const totalCapacity = 292;
  const enrollPercent = Math.round((totalEnrolled / totalCapacity) * 100);
  const totalWaitlist = enrollmentData.reduce((sum, e) => sum + e.waitlist, 0);
  const openSeats = 47;
  const tasksDone = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;
  const tasksPct = Math.round((tasksDone / totalTasks) * 100);
  const highPriorityTasks = tasks.filter((t) => t.priority === "high" && t.status !== "done").length;
  const criticalMaintenance = maintenanceRequests.filter((m) => m.priority === "critical" && m.status !== "done").length;
  const openMaintenance = maintenanceRequests.filter((m) => m.status !== "done").length;
  const maintenanceDone = maintenanceRequests.filter((m) => m.status === "done").length;
  const maintenancePct = Math.round((maintenanceDone / maintenanceRequests.length) * 100);
  const activeAtRisk = atRiskStudents.filter(r => r.status !== "lost").length;
  const atRiskPct = Math.round((activeAtRisk / atRiskStudents.length) * 100);
  const totalPTOUsed = staffPTO.reduce((sum, s) => sum + s.used, 0);
  const totalPTOAllowance = staffPTO.reduce((sum, s) => sum + s.allowance, 0);
  const ptoPct = Math.round((totalPTOUsed / totalPTOAllowance) * 100);
  const totalCheckins = procareData.dailyCheckIns + procareData.absentToday;
  const checkinPct = Math.round((procareData.dailyCheckIns / totalCheckins) * 100);
  const revenueTarget = 220000;
  const revenuePct = Math.round((184200 / revenueTarget) * 100);
  const waitlistPct = Math.round((totalWaitlist / totalEnrolled) * 100);
  const budgetPercent = Math.round((budgetData.spent / budgetData.total) * 100);
  const schoolBudgetRemaining = budgetData.total - budgetData.spent;

  // ─── Compliance stats ───
  const compliantCount = complianceItems.filter((c) => c.status === "compliant").length;
  const compliancePct = Math.round((compliantCount / complianceItems.length) * 100);

  // ─── Discount stats ───
  const totalDiscountValue = discounts.reduce((sum, d) => sum + d.monthlyValue, 0);
  const discountTarget = 5000; // monthly discount allowance target
  const discountPct = Math.round((totalDiscountValue / discountTarget) * 100);
  const discountCount = discounts.length;

  const calloutCount = staffPTO.filter((s) => s.used >= 6 && s.used > s.allowance * 0.5).length;
  const classScoreAverage = 5.2;
  const pastDuePercent = 8;

  // ─── Pulse ───
  const ownerPulse = useMemo(() =>
    computeOwnerPulse({
      complianceItems, totalEnrolled, totalCapacity, classAverage: classScoreAverage,
      maintenanceItems: maintenanceRequests, calloutCount, totalStaff: staffPTO.length || 15,
      directorSpent, directorBudget: DIRECTOR_BUDGET_TOTAL,
      budgetSpent: budgetData.spent, budgetTotal: budgetData.total,
      operatingMargin: 24, pastDuePct: pastDuePercent, monthsElapsed: 8,
    }),
    [complianceItems, totalEnrolled, totalCapacity, maintenanceRequests, directorSpent]
  );

  const pulseHistory = useMemo(() => [
    { date: "Aug", bpm: 78 }, { date: "Sep", bpm: 82 }, { date: "Oct", bpm: 85 },
    { date: "Nov", bpm: 79 }, { date: "Dec", bpm: 72 }, { date: "Jan", bpm: 68 },
    { date: "Feb", bpm: 74 }, { date: "Mar", bpm: 71 }, { date: "Apr", bpm: 76 },
    { date: "May", bpm: ownerPulse.bpm },
  ], [ownerPulse.bpm]);

  // ─── KPI icon map ───
  const kpiIcon = { Users, DollarSign, ClipboardList, CheckCircle2, Wrench, AlertTriangle, Calendar, UserCheck, ShieldCheck, Wallet, Tag };

  return (
    <motion.div className="space-y-6 pb-8 max-w-400 mx-auto" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Dashboard Overview
            {criticalMaintenance > 0 && (
              <span className="ml-2 md:ml-3 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] md:text-xs font-bold rounded-full align-middle">
                {criticalMaintenance} critical
              </span>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs md:text-sm text-gray-500">Integrated:</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-md">
              <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center text-[8px] font-bold text-blue-600">P</div>
              <span className="text-[10px] md:text-xs font-medium text-gray-600">Procare</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-md">
              <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center text-[8px] font-bold text-green-600">QB</div>
              <span className="text-[10px] md:text-xs font-medium text-gray-600">QuickBooks</span>
            </div>
            {quickbooksStatus.reconciled && (
              <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 bg-green-100 text-green-700 text-[9px] md:text-xs rounded-full whitespace-nowrap">
                <CheckIcon size={10} /> Synced
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Button variant="outline" className="bg-white text-xs md:text-sm px-2.5 md:px-3 h-9">
            <FileText size={14} className="mr-1.5" /> Export
          </Button>
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-2.5 md:px-3 h-9">
            <Receipt size={14} className="mr-1.5" /> Run Payroll
          </Button>
        </div>
      </motion.div>

      {/* Pulse Health Score */}
      <PulseSection ownerPulse={ownerPulse} pulseHistory={pulseHistory} />

      {/* KPI Row 1 — Donut Charts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DonutKpiCard label="Enrolled" value={totalEnrolled} pct={enrollPercent} color="#2563EB" sub="+12% y/y" subColor="text-emerald-600" icon={kpiIcon.Users} />
        <DonutKpiCard label="Revenue" value="$184.2k" pct={revenuePct} color="#10B981" sub="+8.4% MoM" subColor="text-emerald-600" icon={kpiIcon.DollarSign} />
        <DonutKpiCard label="Waitlist" value={totalWaitlist} pct={waitlistPct} color="#F59E0B" sub={`${openSeats} open seats`} subColor="text-gray-400" icon={kpiIcon.ClipboardList} />
        <DonutKpiCard label="Tasks Done" value={`${tasksDone}/${totalTasks}`} pct={tasksPct} color="#4F46E5" sub={`${highPriorityTasks} high priority`} subColor="text-red-500" icon={kpiIcon.CheckCircle2} />
      </div>

      {/* KPI Row 2 — Donut Charts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DonutKpiCard label="Maintenance" value={`${maintenanceDone}/${maintenanceRequests.length}`} pct={maintenancePct} color="#EF4444" sub={`${criticalMaintenance} critical`} subColor="text-red-500" icon={kpiIcon.Wrench} />
        <DonutKpiCard label="At-Risk" value={`${activeAtRisk}/${atRiskStudents.length}`} pct={atRiskPct} color="#8B5CF6" sub="intervening" subColor="text-gray-400" icon={kpiIcon.AlertTriangle} />
        <DonutKpiCard label="PTO Used" value={`${totalPTOUsed}/${totalPTOAllowance}`} pct={ptoPct} color="#14B8A6" sub={`${substitutes.length} subs this mo`} subColor="text-gray-400" icon={kpiIcon.Calendar} />
        <DonutKpiCard label="Check-ins" value={procareData.dailyCheckIns} pct={checkinPct} color="#F97316" sub={`${procareData.absentToday} absent`} subColor="text-amber-600" icon={kpiIcon.UserCheck} />
      </div>

      {/* KPI Row 3 — Compliance, Petty Cash, Discounts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DonutKpiCard label="Compliance" value={`${compliantCount}/${complianceItems.length}`} pct={compliancePct} color="#16A34A" sub={`${complianceItems.length - compliantCount} need attention`} subColor={compliancePct >= 80 ? "text-emerald-600" : compliancePct >= 50 ? "text-amber-600" : "text-red-500"} icon={kpiIcon.ShieldCheck} />
        <DonutKpiCard label="Petty Cash" value={fmtMoney(directorSpent)} pct={pettyCashPercent} color="#EC4899" sub={`${fmtMoney(directorRemaining)} of ${fmtMoney(DIRECTOR_BUDGET_TOTAL)} left`} subColor={directorRemaining > 0 ? "text-pink-600" : "text-red-500"} icon={kpiIcon.Wallet} />
        <DonutKpiCard label="Discounts" value={fmtMoney(totalDiscountValue)} pct={discountPct} color="#8B5CF6" sub={`${discountCount} active discounts`} subColor="text-gray-400" icon={kpiIcon.Tag} />
        <div />{/* empty slot for symmetry */}
      </div>

      {/* Financial Chart + Quick Stat Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <FinancialChart data={revenueData} />
        <QuickStatCards quickbooksStatus={quickbooksStatus} procareData={procareData} />
      </div>

      {/* Middle Row — At-Risk + Maintenance + Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AtRiskStudentsCard students={atRiskStudents} activeAtRisk={activeAtRisk} fmtDate={fmtDate} onNavigate={go} />
        <MaintenanceCard requests={maintenanceRequests} openCount={openMaintenance} criticalCount={criticalMaintenance} onNavigate={go} />
        <TasksCard tasks={tasks} highPriorityCount={highPriorityTasks} fmtDate={fmtDate} daysUntil={daysUntil} onNavigate={go} />
      </div>

      {/* Bottom Section — Budget + Enrollment + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <BudgetOverviewCard
          budgetData={budgetData} budgetPercent={budgetPercent} schoolBudgetRemaining={schoolBudgetRemaining}
          DIRECTOR_BUDGET_TOTAL={DIRECTOR_BUDGET_TOTAL} directorSpent={directorSpent} directorRemaining={directorRemaining}
          pettyCashPercent={pettyCashPercent} recentExpenses={recentExpenses} expenseByReason={expenseByReason}
          fmtMoney={fmtMoney} fmtDate={fmtDate} onNavigate={go}
        />
        <EnrollmentChart data={enrollmentData} totalEnrolled={totalEnrolled} totalWaitlist={totalWaitlist} openSeats={openSeats} />
        <UpcomingEventsCard />
      </div>
    </motion.div>
  );
};

export default OverviewPage;
