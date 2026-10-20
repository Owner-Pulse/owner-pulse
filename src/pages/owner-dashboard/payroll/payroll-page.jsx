import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Modular Components
import OwnerPayrollKpiCards from "./components/OwnerPayrollKpiCards";
import OwnerPayrollHistorySection from "./components/OwnerPayrollHistorySection";
import OwnerPayrollScheduleTable from "./components/OwnerPayrollScheduleTable";
import OwnerAuditDetailModal from "./components/OwnerAuditDetailModal";

// Custom API Hooks
import {
  useGetOwnerPayrollOverview,
  useGetOwnerPayrollSchedules,
  useGetOwnerPayrollSubmissions,
} from "@/hooks/payroll/payroll.hook";
import { daysFromToday, toDate } from "@/lib/datetime";

const OwnerPayrollPage = () => {
  const [activeTab, setActiveTab] = useState("history"); // "history" | "schedule"
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  // API Data Queries
  const { data: overviewData } = useGetOwnerPayrollOverview();
  const { schedules: apiSchedules } = useGetOwnerPayrollSchedules();
  const { submissions: apiSubmissions } = useGetOwnerPayrollSubmissions();

  const displaySchedules = useMemo(() => {
    return Array.isArray(apiSchedules) ? apiSchedules : [];
  }, [apiSchedules]);

  const displayHistory = useMemo(() => {
    return Array.isArray(apiSubmissions) ? apiSubmissions : [];
  }, [apiSubmissions]);

  // Compute Next Pending Period and Days Remaining for KPI
  const nextPendingPeriod = useMemo(() => {
    const pending = displaySchedules
      .filter((p) => (p.status || "").toLowerCase() === "pending")
      .sort(
        (a, b) =>
          (toDate(a.submission_due_date || a.dueDate)?.getTime() ?? 0) -
          (toDate(b.submission_due_date || b.dueDate)?.getTime() ?? 0)
      );
    return pending[0] || null;
  }, [displaySchedules]);

  const daysRemaining = useMemo(() => {
    if (!nextPendingPeriod) return null;
    if (typeof nextPendingPeriod.days_remaining === "number") {
      return nextPendingPeriod.days_remaining;
    }
    const due = nextPendingPeriod.submission_due_date || nextPendingPeriod.dueDate || nextPendingPeriod.end_date || nextPendingPeriod.endDate;
    if (!due) return null;
    return Math.max(0, daysFromToday(due) || 0);
  }, [nextPendingPeriod]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Payroll Review
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review the payroll the director runs. Open a submission to audit deductions, PTO, and hours.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Payroll Submissions ({displayHistory.length})
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "schedule"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Schedules ({displaySchedules.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Header */}
      <OwnerPayrollKpiCards
        metrics={overviewData}
        nextPendingPeriod={nextPendingPeriod}
        daysRemaining={daysRemaining}
        historyCount={displayHistory.length}
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "history" ? (
          <OwnerPayrollHistorySection
            key="history-tab"
            history={displayHistory}
            onSelectPayroll={(payroll) => setSelectedPayroll(payroll)}
          />
        ) : (
          <OwnerPayrollScheduleTable
            key="schedule-tab"
            schedule={displaySchedules}
            readOnly
          />
        )}
      </AnimatePresence>

      {/* Audit Details Modal */}
      {selectedPayroll && (
        <OwnerAuditDetailModal
          payroll={selectedPayroll}
          onClose={() => setSelectedPayroll(null)}
        />
      )}

    </div>
  );
};

export default OwnerPayrollPage;
