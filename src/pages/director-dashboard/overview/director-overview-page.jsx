import React from "react";
import { motion } from "framer-motion";
import {
  Users, Wrench, ClipboardList, DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useGetDirectorOverview } from "@/hooks/director-hook/overview.hook";
import { getPulseCoverage } from "@/components/PulseSetup";
import DirectorOverviewSkeleton from "./components/DirectorOverviewSkeleton";

// ─── Extracted Components ─────────────────────────────────────
import PulseSection from "./components/PulseSection";
import KpiMetricCard from "./components/KpiMetricCard";
import EnrollmentCard from "./components/EnrollmentCard";
import CoverageCard from "./components/CoverageCard";
import ComplianceCard from "./components/ComplianceCard";
import MaintenanceCard from "./components/MaintenanceCard";
import ExpensesCard from "./components/ExpensesCard";
import TaskBoard from "@/components/TaskBoard";
import OwnerDependenceCard from "./components/OwnerDependenceCard";
import CollectionsCard from "@/components/collections/CollectionsCard";
import WeeklyDepositsCard from "@/pages/shared/weekly-reports/components/WeeklyDepositsCard";
import { formatDate } from "@/lib/datetime";
import { PULSE_STATUS_COLORS, statusFromPct, statusFromPulseLabel } from "@/lib/theme-tokens";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const DirectorOverviewPage = () => {
  const navigate = useNavigate();
  const go = (path) => navigate(path);

  // Fetch Director Overview Data
  const { directorOverviewData, isLoading, refetch } = useGetDirectorOverview();

  // If loading, render Skeleton Loader
  if (isLoading) {
    return <DirectorOverviewSkeleton />;
  }

  const pulseApi = directorOverviewData?.pulse;
  const topKpis = directorOverviewData?.top_kpis;
  const enrollmentBreakdown = directorOverviewData?.enrollment_breakdown;
  const todayCoverage = directorOverviewData?.today_coverage;
  const upcomingCompliance = directorOverviewData?.upcoming_compliance || [];
  const openMaintList = directorOverviewData?.open_maintenance || [];
  const pettyCashData = directorOverviewData?.recent_expenses_petty_cash;
  const pendingTasksData = directorOverviewData?.pending_tasks_and_escalation;

  // Formatted Pulse Object for Director
  const directorPulse = {
    bpm: pulseApi?.bpm ?? null,
    composite: pulseApi?.composite_score == null ? null : Math.round(pulseApi.composite_score),
    state: {
      state: pulseApi?.state || "No data",
      color: PULSE_STATUS_COLORS[statusFromPulseLabel(pulseApi?.state)],
    },
    subscores: [
      { key: "comp", label: "Compliance", score: pulseApi?.sub_scores?.compliance ?? null, weight: pulseApi?.weights?.compliance ?? 0.2, icon: "ShieldCheck" },
      { key: "enroll", label: "Enrollment", score: pulseApi?.sub_scores?.enrollment_health ?? null, weight: pulseApi?.weights?.enrollment_health ?? 0.2, icon: "Users" },
      { key: "late", label: "Collections", score: pulseApi?.sub_scores?.late_payments_ar ?? null, weight: pulseApi?.weights?.late_payments_ar ?? 0.2, icon: "DollarSign" },
      { key: "class", label: "Class Score", score: pulseApi?.sub_scores?.class_score ?? null, weight: pulseApi?.weights?.class_score ?? 0.2, icon: "Star" },
      { key: "cash", label: "Petty Cash", score: pulseApi?.sub_scores?.petty_cash_pace ?? null, weight: pulseApi?.weights?.petty_cash_pace ?? 0.2, icon: "CreditCard" },
      { key: "dependence", label: "Owner Dependence", score: pulseApi?.sub_scores?.owner_dependence ?? null, weight: pulseApi?.weights?.owner_dependence ?? 0.05, icon: "UserCheck" },
    ],
    recommendations: pulseApi?.top_3_recommendations || [],
    ...getPulseCoverage(pulseApi),
  };

  const ownerPulseSnapshot = {
    bpm: pulseApi?.owner_macro_badge?.bpm ?? null,
    label: pulseApi?.owner_macro_badge?.label ?? "Owner's pulse: No data",
    state: pulseApi?.owner_macro_badge?.state ?? "No data",
    color: pulseApi?.owner_macro_badge?.bpm == null
      ? PULSE_STATUS_COLORS.none
      : PULSE_STATUS_COLORS[statusFromPulseLabel(pulseApi?.owner_macro_badge?.state)],
  };

  // Top KPI Metrics
  const enrollmentKpi = topKpis?.enrollment || { total_enrolled: 0, total_capacity: 0, capacity_pct: 0, open_spots: 0 };
  const maintKpi = topKpis?.maintenance || { open_tickets: 0, critical_count: 0 };
  const tasksKpi = topKpis?.open_tasks || { total_open: 0, high_priority_count: 0 };
  // late_payments now carries the weekly Collections balance (null until one is entered)
  const collectionsKpi = topKpis?.late_payments || null;
  const collectionsEntered = collectionsKpi?.past_due_amount != null;
  const scrollToCollections = () =>
    document.getElementById("collections-card")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Director Operational Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(new Date(), { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </motion.div>

      {/* Pulse */}
      <PulseSection directorPulse={directorPulse} ownerPulseSnapshot={ownerPulseSnapshot} />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiMetricCard
          label="Enrollment"
          value={enrollmentKpi.total_enrolled}
          sub={
            enrollmentKpi.total_capacity > 0
              ? `${enrollmentKpi.capacity_pct}% of ${enrollmentKpi.total_capacity} capacity · ${enrollmentKpi.open_spots} open spots`
              : `${enrollmentKpi.total_enrolled} Enrolled Students`
          }
          icon={Users}
          accent="students"
          status={enrollmentKpi.total_capacity > 0 ? statusFromPct(enrollmentKpi.capacity_pct, { good: 80, watch: 60 }) : "none"}
          noData={!topKpis?.enrollment || enrollmentKpi.total_capacity <= 0}
          onClick={() => go("/director/students")}
        />
        <KpiMetricCard
          label="Maintenance"
          value={maintKpi.open_tickets}
          sub={`${maintKpi.critical_count} critical items`}
          icon={Wrench}
          accent="operations"
          status={!topKpis?.maintenance ? "none" : maintKpi.critical_count > 0 ? "problem" : "good"}
          noData={!topKpis?.maintenance}
          onClick={() => go("/director/maintenance")}
        />
        <KpiMetricCard
          label="Open Tasks"
          value={tasksKpi.total_open}
          sub={`${tasksKpi.high_priority_count} high priority`}
          icon={ClipboardList}
          accent="operations"
          status={!topKpis?.open_tasks ? "none" : tasksKpi.high_priority_count > 3 ? "problem" : tasksKpi.high_priority_count > 0 ? "watch" : "good"}
          noData={!topKpis?.open_tasks}
          onClick={() => go("/director/tasks")}
        />
        <KpiMetricCard
          label="Collections"
          value={collectionsEntered ? collectionsKpi.formatted || `$${Math.round(collectionsKpi.past_due_amount).toLocaleString()}` : "—"}
          sub={
            !collectionsEntered
              ? "Not entered yet"
              : collectionsKpi.families_count != null
              ? `${collectionsKpi.families_count} families in collections`
              : "Balance in collections"
          }
          icon={DollarSign}
          accent="collections"
          noData={!collectionsEntered}
          onClick={scrollToCollections}
        />
      </div>

      {/* Collections */}
      <CollectionsCard role="director" data={directorOverviewData?.collections} />

      {/* Weekly deposits */}
      {directorOverviewData?.weekly_report && <WeeklyDepositsCard role="director" data={directorOverviewData.weekly_report} />}

      {/* Section 3 + 4: Enrollment + Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EnrollmentCard data={enrollmentBreakdown} onNavigate={go} />
        <CoverageCard coverage={todayCoverage} />
      </div>

      {/* Sections 5, 6: Compliance + Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComplianceCard items={upcomingCompliance} onNavigate={go} />
        <MaintenanceCard items={openMaintList} openCount={maintKpi.open_tickets} criticalCount={maintKpi.critical_count} noData={!directorOverviewData?.open_maintenance} onNavigate={go} />
      </div>

      {/* Expenses & Petty Cash */}
      <ExpensesCard pettyCashData={pettyCashData} onNavigate={go} />

      {/* Section 8: Pending Tasks */}
      <TaskBoard data={pendingTasksData} role="director" noData={!pendingTasksData} onNavigate={go} onRefresh={refetch} />

      {/* Owner Dependence Index */}
      <OwnerDependenceCard data={pendingTasksData?.owner_dependence_index ?? pendingTasksData?.over_escalation_rate} />
    </motion.div>
  );
};

export default DirectorOverviewPage;
