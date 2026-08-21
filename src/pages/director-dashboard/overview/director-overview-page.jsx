import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, DollarSign, Wrench, ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router";
import { computeDirectorPulse, computeOwnerPulse } from "@/lib/pulse-engine";

// ─── Extracted Components ─────────────────────────────────────
import PulseSection from "./components/PulseSection";
import KpiMetricCard from "./components/KpiMetricCard";
import EnrollmentCard from "./components/EnrollmentCard";
import CoverageCard from "./components/CoverageCard";
import ComplianceCard from "./components/ComplianceCard";
import BillingCard from "./components/BillingCard";
import MaintenanceCard from "./components/MaintenanceCard";
import ExpensesCard from "./components/ExpensesCard";
import TasksCard from "./components/TasksCard";
import OverEscalationCard from "./components/OverEscalationCard";

const TODAY = new Date("2026-05-11");
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const daysUntil = (d) => Math.ceil((new Date(d) - TODAY) / 86400000);

const DIRECTOR_BUDGET_TOTAL = 9000;

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

// TODO: Backend wiring — replace hardcoded data with API response
const SEEDED_TASKS = [
  { id: 1, title: "Parent-teacher conference scheduling", priority: "high", status: "in_progress", due: "2026-05-14" },
  { id: 2, title: "Renew faculty CPR certifications", priority: "high", status: "open", due: "2026-05-20" },
  { id: 3, title: "Order Grade 5 yearbooks", priority: "medium", status: "open", due: "2026-05-25" },
  { id: 4, title: "Step Up Q4 attestation", priority: "high", status: "open", due: "2026-05-28" },
  { id: 5, title: "HVAC replacement quotes", priority: "medium", status: "in_progress", due: "2026-05-18", assignee: "owner" },
  { id: 6, title: "Scholarship renewal letters", priority: "low", status: "open", due: "2026-06-01" },
];

// TODO: Backend wiring — replace hardcoded data with API response
const SEEDED_MAINTENANCE = [
  { id: 1, location: "K — Sequoia", issue: "AC unit not cooling", priority: "critical", status: "open" },
  { id: 2, location: "Playground", issue: "Swing chain snapped", priority: "high", status: "in_progress" },
  { id: 3, location: "Cafeteria", issue: "Refrigerator temp running warm", priority: "critical", status: "open" },
];

const dirComplianceItems = [
  { id: 1, item: "Fire Inspection", authority: "County Fire", status: "compliant", expires: "2026-11-04", category: "regulatory" },
  { id: 2, item: "Health Dept. Inspection", authority: "FL DOH", status: "compliant", expires: "2026-08-22", category: "regulatory" },
  { id: 3, item: "Background Checks (Staff)", authority: "FL DCF", status: "expiring", expires: "2026-06-15", category: "regulatory" },
  { id: 4, item: "CPR / First Aid", authority: "Red Cross", status: "expired", expires: "2026-04-12", category: "regulatory" },
];

const DirectorOverviewPage = () => {
  const navigate = useNavigate();
  const go = (path) => navigate(path);

  // ─── Expenses from localStorage ───
  const [expenses, setExpenses] = useState(() => {
    try { const saved = localStorage.getItem("directorExpenses"); return saved ? JSON.parse(saved) : DEFAULT_EXPENSES; } catch { return DEFAULT_EXPENSES; }
  });

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "directorExpenses") { try { setExpenses(JSON.parse(e.newValue)); } catch {} }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ─── Computed values ───
  const openTasks = SEEDED_TASKS.filter(t => t.status !== "done").length;
  const highPriorityTasks = SEEDED_TASKS.filter(t => t.priority === "high" && t.status !== "done").length;
  const openMaintenance = SEEDED_MAINTENANCE.filter(m => m.status !== "done").length;
  const criticalMaintenance = SEEDED_MAINTENANCE.filter(m => m.priority === "critical" && m.status !== "done").length;

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

  // ─── Pulse ───
  const directorPulse = useMemo(() => computeDirectorPulse({
    complianceItems: dirComplianceItems, totalEnrolled: 222, totalCapacity: 292, classAverage: 5.2,
    directorSpent, directorBudget: DIRECTOR_BUDGET_TOTAL, pastDuePct: 8, monthsElapsed: 8,
  }), [directorSpent]);

  const ownerPulseSnapshot = useMemo(() => computeOwnerPulse({
    complianceItems: dirComplianceItems, totalEnrolled: 222, totalCapacity: 292, classAverage: 5.2,
    maintenanceItems: SEEDED_MAINTENANCE, calloutCount: 1, totalStaff: 15,
    directorSpent, directorBudget: DIRECTOR_BUDGET_TOTAL, budgetSpent: 1240000, budgetTotal: 1850000,
    operatingMargin: 24, pastDuePct: 8, monthsElapsed: 8,
  }), [directorSpent]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            30-Second View
            {criticalMaintenance > 0 && (
              <span className="ml-3 inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#AE4A3E]/10 text-[#8A362C] text-xs font-bold rounded-full">
                {criticalMaintenance} critical
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </motion.div>

      {/* Pulse */}
      <PulseSection directorPulse={directorPulse} ownerPulseSnapshot={ownerPulseSnapshot} />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiMetricCard label="Enrollment" value="222" sub="76% of 292 capacity · 70 open spots" icon={Users} color="#1E3A5F" onClick={() => go("/director/enrollment")} />
        <KpiMetricCard label="Late Payments" value="$3,400" sub="7 families need follow-up" icon={DollarSign} color="#AE4A3E" subColor="text-[#8A362C]" onClick={() => go("/director/billing")} />
        <KpiMetricCard label="Maintenance" value={openMaintenance} sub={`${criticalMaintenance} critical items`} icon={Wrench} color="#B78A2F" subColor="text-[#8F6A1F]" onClick={() => go("/director/maintenance")} />
        <KpiMetricCard label="Open Tasks" value={openTasks} sub={`${highPriorityTasks} high priority`} icon={ClipboardList} color="#1E3A5F" subColor="text-[#8F6A1F]" onClick={() => go("/director/tasks")} />
      </div>

      {/* Section 3 + 4: Enrollment + Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EnrollmentCard onNavigate={go} />
        <CoverageCard />
      </div>

      {/* Sections 5, 6, 7: Compliance + Billing + Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComplianceCard onNavigate={go} />
        <BillingCard onNavigate={go} />
        <MaintenanceCard items={SEEDED_MAINTENANCE} onNavigate={go} />
      </div>

      {/* Expenses & Petty Cash */}
      <ExpensesCard
        directorSpent={directorSpent} directorRemaining={directorRemaining} pettyCashPercent={pettyCashPercent}
        recentExpenses={recentExpenses} expenseByReason={expenseByReason}
        DIRECTOR_BUDGET_TOTAL={DIRECTOR_BUDGET_TOTAL} fmtMoney={fmtMoney} fmtDate={fmtDate} onNavigate={go}
      />

      {/* Section 8: Pending Tasks */}
      <TasksCard tasks={SEEDED_TASKS} daysUntil={daysUntil} onNavigate={go} />

      {/* Over-Escalation Rate */}
      <OverEscalationCard />
    </motion.div>
  );
};

export default DirectorOverviewPage;
