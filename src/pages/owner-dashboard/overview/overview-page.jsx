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
  Target,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useGetOwnerOverview } from "@/hooks/owner-hook/overview.hook";
import { useConnectQuickBooks, useGetQuickbookStatus } from "@/hooks/owner-hook/quickbookConnect.hook";
import { getPulseCoverage } from "@/components/PulseSetup";
import OwnerOverviewSkeleton from "./components/OwnerOverviewSkeleton";

// ─── Extracted Components ─────────────────────────────────────
import PulseSection from "./components/PulseSection";
import AtRiskStudentsCard from "./components/AtRiskStudentsCard";
import MaintenanceCard from "./components/MaintenanceCard";
import TaskBoard from "@/components/TaskBoard";
import BudgetOverviewCard from "./components/BudgetOverviewCard";
import EnrollmentChart from "./components/EnrollmentChart";
import UpcomingEventsCard from "./components/UpcomingEventsCard";
import DonutKpiCard from "./components/DonutKpiCard";
import CashFlowMetricsCard from "./components/CashFlowMetricsCard";
import LatestPayrollSubmissionCard from "./components/LatestPayrollSubmissionCard";
import CsvUploadModal from "./components/CsvUploadModal";
import EnrollmentTargetsModal from "./components/EnrollmentTargetsModal";
import CollectionsCard from "@/components/collections/CollectionsCard";
import WeeklyDepositsCard from "@/pages/shared/weekly-reports/components/WeeklyDepositsCard";
import DocumentVaultExpiringCard from "./components/DocumentVaultExpiringCard";
import { formatDate } from "@/lib/datetime";
import { PULSE_STATUS_COLORS, STATUS, statusFromPct, statusFromPulseLabel } from "@/lib/theme-tokens";

const fmtDate = (d) => formatDate(d, { month: "short", day: "numeric" });
const fmtMoney = (n) => "$" + Math.round(n || 0).toLocaleString();

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
  const [isTargetsModalOpen, setIsTargetsModalOpen] = useState(false);

  // Fetch API data
  const { ownerOverviewData, isLoading, refetch } = useGetOwnerOverview();
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
  const budgetOverview = ownerOverviewData?.budget_overview;
  const enrollmentByGrade = ownerOverviewData?.enrollment_by_grade || [];
  const upcomingEvents = ownerOverviewData?.upcoming_events || [];
  const latestPayrollSubmission = ownerOverviewData?.latest_payroll_submission;

  // Mapped Pulse from API
  const ownerPulse = {
    bpm: pulseApi?.bpm ?? null,
    composite: pulseApi?.composite_score == null ? null : Math.round(pulseApi.composite_score),
    state: {
      state: pulseApi?.state || "No data",
      color: PULSE_STATUS_COLORS[statusFromPulseLabel(pulseApi?.state)],
    },
    recommendations: pulseApi?.top_3_recommendations || [],
    sub_scores: pulseApi?.sub_scores || {},
    ...getPulseCoverage(pulseApi),
  };

  const pulseHistory = ownerOverviewData?.pulse_history || [
    { date: "Current", bpm: ownerPulse.bpm },
  ];

  // KPI calculations from real API data
  const enrolledData = kpiCards?.enrolled || { count: 0, capacity: 0, capacity_pct: 0, open_seats: 0, yoy_growth: "0%" };
  const revenueDataKpi = kpiCards?.revenue || { amount: 0, formatted: "$0", formatted_full: "$0", mom_growth: "0%" };
  const waitlistKpi = kpiCards?.waitlist || { count: 0, open_seats: 0, waitlist_ratio_pct: 0, conversion_rate_pct: 0 };
  const tasksKpi = kpiCards?.tasks_done || { completed: 0, total: 0, high_priority: 0 };
  const maintKpi = kpiCards?.maintenance || { resolved: 0, total: 0, critical_count: 0 };
  const atRiskKpi = kpiCards?.at_risk_students || { intervening: 0, total: 0 };
  const ptoKpi = kpiCards?.pto_used || { days_used: 0, total_allowance: 0, subs_count: 0, used_pct: 0 };
  const pettyCashKpi = kpiCards?.petty_cash || { spent: 0, remaining: 0, budget: 0, used_pct: 0 };
  const discountsKpi = kpiCards?.discounts || { total_amount: 0, formatted_monthly_amount: "$0/mo", active_discounts: 0, pct_share: 0 };
  const payrollKpi = kpiCards?.payroll_cycles || { filed_count: 0, next_due_days: 0, progress_pct: 0 };

  // Robust Compliance KPI derivation
  const complianceKpi = kpiCards?.compliance || {
    compliant: 0,
    need_attention: 0,
    expired: 0,
    expiring: 0,
    total: 0,
    compliant_pct: 0,
  };
  const complianceTotal = complianceKpi.total || 0;
  const complianceCompliant = complianceKpi.compliant || 0;
  const complianceNeedAttention = complianceKpi.need_attention ?? ((complianceKpi.expired || 0) + (complianceKpi.expiring || 0));
  const compliancePct = Math.round(
    complianceKpi.compliant_pct !== undefined && complianceKpi.compliant_pct !== null
      ? complianceKpi.compliant_pct
      : complianceTotal > 0
      ? (complianceCompliant / complianceTotal) * 100
      : 0
  );
  const complianceStatus = complianceTotal > 0 ? statusFromPct(compliancePct) : "none";

  const enrolledOpenSeats = enrolledData.open_seats ?? enrolledData.open_spots ?? Math.max(0, enrolledData.capacity - enrolledData.count);

  // Enrollment Chart formatting
  const formattedEnrollmentData = enrollmentByGrade.map((item) => ({
    id: item.id,
    name: item.name,
    program_type: item.program_type,
    students: item.enrolled,
    capacity: item.capacity,
    available: item.available ?? Math.max(0, item.capacity - item.enrolled),
    waitlist: item.waitlist || 0,
    fill_rate: item.fill_rate ?? (item.capacity > 0 ? Math.round((item.enrolled / item.capacity) * 1000) / 10 : 0),
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
              <span className={`inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 ${STATUS.good.badge} text-[9px] md:text-xs rounded-full whitespace-nowrap font-medium`}>
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
            onClick={() => setIsTargetsModalOpen(true)}
            variant="outline"
            className="bg-white text-xs md:text-sm px-3 border-gray-200 text-[#1E3A5F] hover:bg-gray-50 h-9 font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs"
          >
            <Target size={14} className="text-[#1E3A5F]" /> Enrollment Goals
          </Button>
          {isQbStatusLoading ? (
            <Skeleton className="h-9 w-40 rounded-xl" />
          ) : isQbConnected ? (
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 ${STATUS.good.badge} text-xs md:text-sm font-semibold rounded-xl shadow-sm`}>
              <CheckIcon size={14} className={STATUS.good.text} /> Connected
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

      {/* Latest Payroll Submission Summary */}
      {latestPayrollSubmission && (
        <LatestPayrollSubmissionCard
          submission={latestPayrollSubmission}
          onNavigate={() => navigate("/owner/payroll")}
        />
      )}

      {/* Cash Flow Metrics */}
      <CashFlowMetricsCard cashFlowMetrics={cashFlowMetrics} />

      {/* Collections */}
      <CollectionsCard role="owner" data={ownerOverviewData?.collections} />

      {/* Weekly report & deposits */}
      <WeeklyDepositsCard data={ownerOverviewData?.weekly_report} />

      {/* KPI Row 1 — Donut Charts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DonutKpiCard
          label="Enrolled"
          value={`${enrolledData.count}/${enrolledData.capacity}`}
          pct={Math.min(100, Math.round(enrolledData.capacity_pct || (enrolledData.capacity > 0 ? (enrolledData.count / enrolledData.capacity) * 100 : 0)))}
          accent="students"
          status={enrolledData.capacity > 0 ? statusFromPct(enrolledData.capacity_pct || (enrolledData.count / enrolledData.capacity) * 100, { good: 80, watch: 60 }) : "none"}
          noData={enrolledData.capacity <= 0}
          sub={`${enrolledOpenSeats} open seats · ${enrolledData.yoy_growth || "0%"} y/y`}
          icon={kpiIcon.Users}
        />
        <DonutKpiCard
          label="Revenue"
          value={revenueDataKpi.formatted_full || revenueDataKpi.formatted || fmtMoney(revenueDataKpi.amount)}
          pct={revenueDataKpi.pct ?? (revenueDataKpi.amount > 0 ? 85 : 0)}
          accent="finance"
          noData={!kpiCards?.revenue}
          sub={`${revenueDataKpi.mom_growth || "0%"} MoM`}
          icon={kpiIcon.DollarSign}
        />
        <DonutKpiCard
          label="Waitlist"
          value={`${waitlistKpi.count} Leads`}
          pct={Math.round(waitlistKpi.waitlist_ratio_pct || 0)}
          accent="students"
          noData={!kpiCards?.waitlist}
          sub={`${waitlistKpi.open_seats ?? waitlistKpi.open_spots ?? 0} open seats · ${waitlistKpi.conversion_rate_pct ?? 0}% conv`}
          icon={kpiIcon.ClipboardList}
        />
        <DonutKpiCard label="Tasks Done" value={`${tasksKpi.completed}/${tasksKpi.total}`} pct={tasksKpi.total ? Math.round((tasksKpi.completed / tasksKpi.total) * 100) : 0} accent="operations" status={tasksKpi.total ? statusFromPct((tasksKpi.completed / tasksKpi.total) * 100) : "none"} noData={!kpiCards?.tasks_done || !tasksKpi.total} sub={`${tasksKpi.high_priority} high priority`} icon={kpiIcon.CheckCircle2} />
      </div>

      {/* KPI Row 2 — Donut Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DonutKpiCard label="Maintenance" value={`${maintKpi.resolved}/${maintKpi.total}`} pct={maintKpi.total ? Math.round((maintKpi.resolved / maintKpi.total) * 100) : 0} accent="operations" status={maintKpi.total ? statusFromPct((maintKpi.resolved / maintKpi.total) * 100) : "none"} noData={!kpiCards?.maintenance || !maintKpi.total} sub={`${maintKpi.critical_count} critical`} icon={kpiIcon.Wrench} />
        <DonutKpiCard
          label="At-Risk"
          value={`${atRiskKpi.intervening} Students`}
          centerText={atRiskKpi.total ? `${atRiskKpi.intervening}/${atRiskKpi.total}` : `${atRiskKpi.intervening}`}
          pct={atRiskKpi.total ? Math.round((atRiskKpi.intervening / atRiskKpi.total) * 100) : 0}
          accent="students"
          status={atRiskKpi.total ? statusFromPct((atRiskKpi.intervening / atRiskKpi.total) * 100, { higherIsBetter: false, good: 10, watch: 25 }) : "none"}
          noData={!kpiCards?.at_risk_students || !atRiskKpi.total}
          sub="intervening"
          icon={kpiIcon.AlertTriangle}
        />
        <DonutKpiCard label="PTO Used" value={`${ptoKpi.days_used}/${ptoKpi.total_allowance}`} pct={Math.round(ptoKpi.used_pct)} accent="staff" noData={!kpiCards?.pto_used || !ptoKpi.total_allowance} sub={`${ptoKpi.subs_count} subs this mo`} icon={kpiIcon.Calendar} />
      </div>

      {/* KPI Row 3 — Compliance, Director Discretionary Budget, Discounts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DonutKpiCard
          label="Compliance"
          value={`${complianceCompliant}/${complianceTotal}`}
          pct={compliancePct}
          accent="operations"
          status={complianceStatus}
          noData={complianceStatus === "none"}
          sub={`${complianceNeedAttention} need attention`}
          icon={kpiIcon.ShieldCheck}
          onClick={() => navigate("/owner/compliance")}
        />
        <DonutKpiCard label="Director Discretionary Budget" value={fmtMoney(pettyCashKpi.spent)} pct={Math.round(pettyCashKpi.used_pct)} accent="finance" noData={!kpiCards?.petty_cash || !pettyCashKpi.budget} sub={`${fmtMoney(pettyCashKpi.remaining)} left`} icon={kpiIcon.Wallet} />
        <DonutKpiCard
          label="Discounts"
          value={discountsKpi.formatted_monthly_amount || discountsKpi.formatted_total_amount || (fmtMoney(discountsKpi.total_amount) + "/mo")}
          pct={Math.round(discountsKpi.pct_share || discountsKpi.discount_percentage || 0)}
          accent="finance"
          noData={!kpiCards?.discounts}
          sub={`${discountsKpi.active_discounts ?? discountsKpi.students_count ?? 0} active (${discountsKpi.pct_share ?? discountsKpi.discount_percentage ?? 0}% share)`}
          icon={kpiIcon.Tag}
        />
        <DonutKpiCard 
          label="Payroll Cycles" 
          value={`${payrollKpi.filed_count} filed`} 
          pct={Math.round(payrollKpi.progress_pct)} 
          accent="staff"
          status={kpiCards?.payroll_cycles ? statusFromPct(payrollKpi.progress_pct) : "none"}
          noData={!kpiCards?.payroll_cycles}
          sub={`Next due in ${payrollKpi.next_due_days}d`} 
          icon={kpiIcon.ClipboardList}
          onClick={() => navigate("/owner/payroll")}
        />
      </div>

      {/* Middle Row — At-Risk + Maintenance + Document Vault */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AtRiskStudentsCard students={atRiskList} activeAtRisk={atRiskKpi.intervening} noData={!kpiCards?.at_risk_students} fmtDate={fmtDate} onNavigate={go} />
        <MaintenanceCard requests={openMaintList} openCount={maintKpi.total} criticalCount={maintKpi.critical_count} noData={!ownerOverviewData?.open_maintenance} onNavigate={go} />
        <DocumentVaultExpiringCard />
      </div>

      {/* Task ownership board */}
      <TaskBoard data={ownerOverviewData?.task_board} role="owner" noData={!ownerOverviewData?.task_board} onNavigate={go} onRefresh={refetch} />

      {/* Bottom Section — Budget + Enrollment + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <BudgetOverviewCard
          budgetData={budgetDataForCard} budgetPercent={Math.round(schoolBudget.used_pct)} schoolBudgetRemaining={schoolBudget.remaining}
          DIRECTOR_BUDGET_TOTAL={directorPettyCash.total_budget} directorSpent={directorPettyCash.total_spent} directorRemaining={directorPettyCash.remaining}
          pettyCashPercent={Math.round(directorPettyCash.used_pct)} recentExpenses={directorPettyCash.recent_expenses || []} expenseByReason={[]}
          fmtMoney={fmtMoney} fmtDate={fmtDate} noData={!budgetOverview} onNavigate={go}
        />
        <EnrollmentChart data={formattedEnrollmentData} totalEnrolled={enrolledData.count} totalWaitlist={waitlistKpi.count} openSeats={enrollmentByGrade.reduce((sum, g) => sum + (g.available || 0), 0)} noData={!Array.isArray(ownerOverviewData?.enrollment_by_grade) || enrollmentByGrade.length === 0} />
        <UpcomingEventsCard events={upcomingEvents} noData={!ownerOverviewData?.upcoming_events} />
      </div>

      {/* Modals */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />

      <EnrollmentTargetsModal
        isOpen={isTargetsModalOpen}
        onClose={() => setIsTargetsModalOpen(false)}
      />
    </motion.div>
  );
};

export default OverviewPage;
