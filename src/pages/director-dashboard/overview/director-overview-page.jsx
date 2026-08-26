import React from "react";
import { motion } from "framer-motion";
import {
  Users, DollarSign, Wrench, ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useGetDirectorOverview } from "@/hooks/director-hook/overview.hook";
import DirectorOverviewSkeleton from "./components/DirectorOverviewSkeleton";

// ─── Extracted Components ─────────────────────────────────────
import PulseSection from "./components/PulseSection";
import KpiMetricCard from "./components/KpiMetricCard";
import EnrollmentCard from "./components/EnrollmentCard";
import CoverageCard from "./components/CoverageCard";
import ComplianceCard from "./components/ComplianceCard";
import MaintenanceCard from "./components/MaintenanceCard";
import ExpensesCard from "./components/ExpensesCard";
import TasksCard from "./components/TasksCard";
import OverEscalationCard from "./components/OverEscalationCard";

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
  const { directorOverviewData, isLoading } = useGetDirectorOverview();

  // If loading, render Skeleton Loader
  if (isLoading) {
    return <DirectorOverviewSkeleton />;
  }

  const pulseApi = directorOverviewData?.pulse;
  const topKpis = directorOverviewData?.top_kpis;
  const enrollmentBreakdown = directorOverviewData?.enrollment_breakdown;
  const todayCoverage = directorOverviewData?.today_coverage;
  const upcomingCompliance = directorOverviewData?.upcoming_compliance || [];
  const pettyCashData = directorOverviewData?.recent_expenses_petty_cash;
  const pendingTasksData = directorOverviewData?.pending_tasks_and_escalation;

  // Formatted Pulse Object for Director
  const directorPulse = {
    bpm: pulseApi?.bpm ?? 136,
    composite: Math.round(pulseApi?.composite_score ?? 45.5),
    state: {
      state: pulseApi?.state || "Critical",
      color: pulseApi?.color || "#EF4444",
    },
    subscores: [
      { key: "comp", label: "Compliance", score: pulseApi?.sub_scores?.compliance ?? 85, weight: 0.2, icon: "ShieldCheck" },
      { key: "enroll", label: "Enrollment", score: pulseApi?.sub_scores?.enrollment_health ?? 0, weight: 0.2, icon: "Users" },
      { key: "late", label: "Late AR", score: pulseApi?.sub_scores?.late_payments_ar ?? 0, weight: 0.2, icon: "DollarSign" },
      { key: "class", label: "Class Score", score: pulseApi?.sub_scores?.class_score ?? 100, weight: 0.2, icon: "Star" },
      { key: "cash", label: "Petty Cash", score: pulseApi?.sub_scores?.petty_cash_pace ?? 100, weight: 0.2, icon: "CreditCard" },
    ],
    recommendations: pulseApi?.top_3_recommendations || [],
  };

  const ownerPulseSnapshot = {
    bpm: pulseApi?.owner_macro_badge?.bpm ?? 117,
    state: pulseApi?.owner_macro_badge?.state ?? "Stressed",
    color: pulseApi?.owner_macro_badge?.color ?? "#F97316",
  };

  // Top KPI Metrics
  const enrollmentKpi = topKpis?.enrollment || { total_enrolled: 621, total_capacity: 170, capacity_pct: 365.3, open_spots: 0 };
  const maintKpi = topKpis?.maintenance || { open_tickets: 1, critical_count: 1 };
  const tasksKpi = topKpis?.open_tasks || { total_open: 2, high_priority_count: 2 };

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            30-Second View
            {maintKpi.critical_count > 0 && (
              <span className="ml-3 inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#AE4A3E]/10 text-[#8A362C] text-xs font-bold rounded-full">
                {maintKpi.critical_count} critical
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiMetricCard 
          label="Enrollment" 
          value={enrollmentKpi.total_enrolled} 
          sub={`${enrollmentKpi.capacity_pct}% of ${enrollmentKpi.total_capacity} capacity · ${enrollmentKpi.open_spots} open spots`} 
          icon={Users} 
          color="#1E3A5F" 
          onClick={() => go("/director/enrollment")} 
        />
        <KpiMetricCard 
          label="Maintenance" 
          value={maintKpi.open_tickets} 
          sub={`${maintKpi.critical_count} critical items`} 
          icon={Wrench} 
          color="#B78A2F" 
          subColor="text-[#8F6A1F]" 
          onClick={() => go("/director/maintenance")} 
        />
        <KpiMetricCard 
          label="Open Tasks" 
          value={tasksKpi.total_open} 
          sub={`${tasksKpi.high_priority_count} high priority`} 
          icon={ClipboardList} 
          color="#1E3A5F" 
          subColor="text-[#8F6A1F]" 
          onClick={() => go("/director/tasks")} 
        />
      </div>

      {/* Section 3 + 4: Enrollment + Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EnrollmentCard data={enrollmentBreakdown} onNavigate={go} />
        <CoverageCard coverage={todayCoverage} />
      </div>

      {/* Sections 5, 6: Compliance + Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComplianceCard items={upcomingCompliance} onNavigate={go} />
        <MaintenanceCard items={[]} openCount={maintKpi.open_tickets} criticalCount={maintKpi.critical_count} onNavigate={go} />
      </div>

      {/* Expenses & Petty Cash */}
      <ExpensesCard pettyCashData={pettyCashData} onNavigate={go} />

      {/* Section 8: Pending Tasks */}
      <TasksCard data={pendingTasksData} onNavigate={go} />

      {/* Over-Escalation Rate */}
      <OverEscalationCard data={pendingTasksData?.over_escalation_rate} />
    </motion.div>
  );
};

export default DirectorOverviewPage;
