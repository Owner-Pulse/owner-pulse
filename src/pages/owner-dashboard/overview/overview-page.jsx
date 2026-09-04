import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
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
  Link2,
  UploadCloud,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useGetOwnerOverview } from "@/hooks/owner-hook/overview.hook";
import { useConnectQuickBooks, useGetQuickbookStatus } from "@/hooks/owner-hook/quickbookConnect.hook";
import OwnerOverviewSkeleton from "./components/OwnerOverviewSkeleton";

// ─── Extracted Components ─────────────────────────────────────
import PulseSection from "./components/PulseSection";
import AtRiskStudentsCard from "./components/AtRiskStudentsCard";
import MaintenanceCard from "./components/MaintenanceCard";
import TasksCard from "./components/TasksCard";
import BudgetOverviewCard from "./components/BudgetOverviewCard";
import EnrollmentChart from "./components/EnrollmentChart";
import UpcomingEventsCard from "./components/UpcomingEventsCard";
import DonutKpiCard from "./components/DonutKpiCard";
import CashFlowMetricsCard from "./components/CashFlowMetricsCard";
import CsvUploadModal from "./components/CsvUploadModal";

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtMoney = (n) => "$" + Math.round(n || 0).toLocaleString();
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

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Fetch API data
  const { ownerOverviewData, isLoading } = useGetOwnerOverview();
  const { isConnected: isQbConnected, isLoading: isQbStatusLoading } = useGetQuickbookStatus();
  const { getConnectUrl, isPending: isConnectingQb } = useConnectQuickBooks();

  // If fetching, render Skeleton Loader
  if (isLoading) {
    return <OwnerOverviewSkeleton />;
  }

  const pulseApi = ownerOverviewData?.pulse;
  const kpiCards = ownerOverviewData?.kpi_cards;
  const cashFlowMetrics = ownerOverviewData?.cash_flow_metrics;
  const atRiskList = ownerOverviewData?.at_risk_students || [];
  const openMaintList = ownerOverviewData?.open_maintenance || [];
  const activeTaskList = ownerOverviewData?.active_tasks || [];
  const budgetOverview = ownerOverviewData?.budget_overview;
  const enrollmentByGrade = ownerOverviewData?.enrollment_by_grade || [];
  const upcomingEvents = ownerOverviewData?.upcoming_events || [];

  // Mapped Pulse from API
  const ownerPulse = {
    bpm: pulseApi?.bpm ?? 0,
    composite: Math.round(pulseApi?.composite_score ?? 0),
    state: {
      state: pulseApi?.state || "Normal",
      color: pulseApi?.color || "#3E7A54",
    },
    recommendations: pulseApi?.top_3_recommendations || [],
    sub_scores: pulseApi?.sub_scores || {},
  };

  const pulseHistory = ownerOverviewData?.pulse_history || [
    { date: "Current", bpm: ownerPulse.bpm },
  ];

  // KPI calculations from real API data
  const enrolledData = kpiCards?.enrolled || { count: 0, capacity: 0, capacity_pct: 0, yoy_growth: "0%" };
  const revenueDataKpi = kpiCards?.revenue || { amount: 0, formatted: "$0", mom_growth: "0%" };
  const waitlistKpi = kpiCards?.waitlist || { count: 0, open_seats: 0, waitlist_ratio_pct: 0 };
  const tasksKpi = kpiCards?.tasks_done || { completed: 0, total: 0, high_priority: 0 };
  const maintKpi = kpiCards?.maintenance || { resolved: 0, total: 0, critical_count: 0 };
  const atRiskKpi = kpiCards?.at_risk_students || { intervening: 0, total: 0 };
  const ptoKpi = kpiCards?.pto_used || { days_used: 0, total_allowance: 0, subs_count: 0, used_pct: 0 };
  const complianceKpi = kpiCards?.compliance || { compliant: 0, need_attention: 0, total: 0, compliant_pct: 0 };
  const pettyCashKpi = kpiCards?.petty_cash || { spent: 0, remaining: 0, budget: 0, used_pct: 0 };
  const discountsKpi = kpiCards?.discounts || { total_amount: 0, active_discounts: 0, pct_share: 0 };
  const payrollKpi = kpiCards?.payroll_cycles || { filed_count: 0, next_due_days: 0, progress_pct: 0 };

  // Enrollment Chart formatting
  const formattedEnrollmentData = enrollmentByGrade.map((item) => ({
    name: item.name,
    students: item.enrolled,
    capacity: item.capacity,
    waitlist: item.waitlist || 0,
  }));

  // Budget Overview Data from real API response
  const schoolBudget = budgetOverview?.school_budget || { total_budget: 0, total_spent: 0, remaining: 0, used_pct: 0 };
  const directorPettyCash = budgetOverview?.director_petty_cash || { total_budget: 0, total_spent: 0, remaining: 0, used_pct: 0, recent_expenses: [] };

  const budgetCategories = budgetOverview?.categories || [
    { name: "Payroll & Benefits", spent: Math.round(schoolBudget.total_spent * 0.7), budget: Math.round(schoolBudget.total_budget * 0.7), percent: 70, color: "#1E3A5F" },
    { name: "Facilities & Rent", spent: Math.round(schoolBudget.total_spent * 0.15), budget: Math.round(schoolBudget.total_budget * 0.15), percent: 15, color: "#2A4C7E" },
    { name: "Curriculum & Supplies", spent: Math.round(schoolBudget.total_spent * 0.1), budget: Math.round(schoolBudget.total_budget * 0.1), percent: 10, color: "#4A6B96" },
    { name: "Director Discretionary", spent: directorPettyCash.total_spent, budget: directorPettyCash.total_budget, percent: Math.round(directorPettyCash.used_pct), color: "#9DB8D9" },
  ];

  const budgetDataForCard = {
    total: schoolBudget.total_budget,
    spent: schoolBudget.total_spent,
    categories: budgetCategories,
  };

  const kpiIcon = { Users, DollarSign, ClipboardList, CheckCircle2, Wrench, AlertTriangle, Calendar, UserCheck, ShieldCheck, Wallet, Tag };

  return (
    <motion.div className="space-y-6 pb-8 max-w-400 mx-auto" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Dashboard Overview
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs md:text-sm text-gray-500">QuickBooks:</span>
            {isQbStatusLoading ? (
              <Skeleton className="h-4 w-16 rounded-full" />
            ) : isQbConnected ? (
              <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 bg-[#3E7A54]/10 text-[#2F6042] text-[9px] md:text-xs rounded-full whitespace-nowrap font-medium">
                <CheckIcon size={10} /> Synced
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] md:text-xs rounded-full whitespace-nowrap font-medium">
                Not Connected
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Button
            onClick={() => setIsCsvModalOpen(true)}
            className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-3 md:px-4 h-9 font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UploadCloud size={15} /> Upload CSV
          </Button>

          {isQbStatusLoading ? (
            <Skeleton className="h-9 w-40 rounded-xl" />
          ) : isQbConnected ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2CA01C]/10 border border-[#2CA01C]/30 text-[#207514] text-xs md:text-sm font-semibold rounded-xl shadow-sm">
              <CheckIcon size={14} className="text-[#207514]" /> Connected
            </div>
          ) : (
            <Button 
              onClick={() => getConnectUrl()}
              disabled={isConnectingQb}
              className="bg-[#2CA01C] hover:bg-[#207514] text-white text-xs md:text-sm px-3 md:px-4 h-9 font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isConnectingQb ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 size={14} /> Connect QuickBooks
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Pulse Health Score */}
      <PulseSection ownerPulse={ownerPulse} pulseHistory={pulseHistory} />

      {/* Cash Flow Metrics */}
      <CashFlowMetricsCard cashFlowMetrics={cashFlowMetrics} />

      {/* KPI Row 1 — Donut Charts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DonutKpiCard label="Enrolled" value={enrolledData.count} pct={Math.min(100, Math.round(enrolledData.capacity_pct))} color="#1E3A5F" sub={`${enrolledData.yoy_growth} y/y`} subColor="text-[#2F6042]" icon={kpiIcon.Users} />
        <DonutKpiCard label="Revenue" value={revenueDataKpi.formatted} pct={85} color="#3E7A54" sub={`${revenueDataKpi.mom_growth} MoM`} subColor="text-[#2F6042]" icon={kpiIcon.DollarSign} />
        <DonutKpiCard label="Waitlist" value={waitlistKpi.count} pct={Math.round(waitlistKpi.waitlist_ratio_pct)} color="#1E3A5F" sub={`${waitlistKpi.open_seats} open seats`} subColor="text-gray-400" icon={kpiIcon.ClipboardList} />
        <DonutKpiCard label="Tasks Done" value={`${tasksKpi.completed}/${tasksKpi.total}`} pct={tasksKpi.total ? Math.round((tasksKpi.completed / tasksKpi.total) * 100) : 0} color="#B78A2F" sub={`${tasksKpi.high_priority} high priority`} subColor="text-[#8F6A1F]" icon={kpiIcon.CheckCircle2} />
      </div>

      {/* KPI Row 2 — Donut Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DonutKpiCard label="Maintenance" value={`${maintKpi.resolved}/${maintKpi.total}`} pct={maintKpi.total ? Math.round((maintKpi.resolved / maintKpi.total) * 100) : 0} color="#AE4A3E" sub={`${maintKpi.critical_count} critical`} subColor="text-[#8A362C]" icon={kpiIcon.Wrench} />
        <DonutKpiCard label="At-Risk" value={`${atRiskKpi.intervening}/${atRiskKpi.total}`} pct={atRiskKpi.total ? Math.round((atRiskKpi.intervening / atRiskKpi.total) * 100) : 0} color="#AE4A3E" sub="intervening" subColor="text-[#8A362C]" icon={kpiIcon.AlertTriangle} />
        <DonutKpiCard label="PTO Used" value={`${ptoKpi.days_used}/${ptoKpi.total_allowance}`} pct={Math.round(ptoKpi.used_pct)} color="#1E3A5F" sub={`${ptoKpi.subs_count} subs this mo`} subColor="text-gray-400" icon={kpiIcon.Calendar} />
      </div>

      {/* KPI Row 3 — Compliance, Director Discretionary Budget, Discounts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DonutKpiCard label="Compliance" value={`${complianceKpi.compliant}/${complianceKpi.total}`} pct={Math.round(complianceKpi.compliant_pct)} color={complianceKpi.compliant_pct >= 80 ? "#3E7A54" : complianceKpi.compliant_pct >= 50 ? "#B78A2F" : "#AE4A3E"} sub={`${complianceKpi.need_attention} need attention`} subColor={complianceKpi.compliant_pct >= 80 ? "text-[#2F6042]" : complianceKpi.compliant_pct >= 50 ? "text-[#8F6A1F]" : "text-[#8A362C]"} icon={kpiIcon.ShieldCheck} />
        <DonutKpiCard label="Director Discretionary Budget" value={fmtMoney(pettyCashKpi.spent)} pct={Math.round(pettyCashKpi.used_pct)} color="#1E3A5F" sub={`${fmtMoney(pettyCashKpi.remaining)} left`} subColor={pettyCashKpi.remaining > 0 ? "text-[#2F6042]" : "text-[#8A362C]"} icon={kpiIcon.Wallet} />
        <DonutKpiCard label="Discounts" value={fmtMoney(discountsKpi.total_amount)} pct={Math.round(discountsKpi.pct_share)} color="#1E3A5F" sub={`${discountsKpi.active_discounts} active discounts`} subColor="text-gray-400" icon={kpiIcon.Tag} />
        <DonutKpiCard 
          label="Payroll Cycles" 
          value={`${payrollKpi.filed_count} filed`} 
          pct={Math.round(payrollKpi.progress_pct)} 
          color="#1E3A5F" 
          sub={`Next due in ${payrollKpi.next_due_days}d`} 
          subColor="text-gray-400" 
          icon={kpiIcon.ClipboardList}
          onClick={() => navigate("/owner/payroll")}
        />
      </div>

      {/* Middle Row — At-Risk + Maintenance + Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AtRiskStudentsCard students={atRiskList} activeAtRisk={atRiskKpi.intervening} fmtDate={fmtDate} onNavigate={go} />
        <MaintenanceCard requests={openMaintList} openCount={maintKpi.total} criticalCount={maintKpi.critical_count} onNavigate={go} />
        <TasksCard tasks={activeTaskList} highPriorityCount={tasksKpi.high_priority} fmtDate={fmtDate} daysUntil={daysUntil} onNavigate={go} />
      </div>

      {/* Bottom Section — Budget + Enrollment + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <BudgetOverviewCard
          budgetData={budgetDataForCard} budgetPercent={Math.round(schoolBudget.used_pct)} schoolBudgetRemaining={schoolBudget.remaining}
          DIRECTOR_BUDGET_TOTAL={directorPettyCash.total_budget} directorSpent={directorPettyCash.total_spent} directorRemaining={directorPettyCash.remaining}
          pettyCashPercent={Math.round(directorPettyCash.used_pct)} recentExpenses={directorPettyCash.recent_expenses || []} expenseByReason={[]}
          fmtMoney={fmtMoney} fmtDate={fmtDate} onNavigate={go}
        />
        <EnrollmentChart data={formattedEnrollmentData} totalEnrolled={enrolledData.count} totalWaitlist={waitlistKpi.count} openSeats={enrollmentByGrade.reduce((sum, g) => sum + (g.available || 0), 0)} />
        <UpcomingEventsCard events={upcomingEvents} />
      </div>

      {/* CSV Upload Modal */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />
    </motion.div>
  );
};

export default OverviewPage;
