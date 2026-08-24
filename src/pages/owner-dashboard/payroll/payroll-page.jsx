import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Modular Components
import OwnerPayrollKpiCards from "./components/OwnerPayrollKpiCards";
import OwnerPayrollHistorySection from "./components/OwnerPayrollHistorySection";
import OwnerPayrollScheduleTable from "./components/OwnerPayrollScheduleTable";
import OwnerAuditDetailModal from "./components/OwnerAuditDetailModal";
import AddSchedulePeriodModal from "./components/AddSchedulePeriodModal";

// Custom API Hooks
import {
  useGetOwnerPayrollOverview,
  useGetOwnerPayrollSchedules,
  useGetOwnerPayrollSubmissions,
} from "@/hooks/payroll/payroll.hook";

// Local Storage Fallback Utils
import {
  getPayrollHistory,
  savePayrollHistory,
  getPayrollSchedule,
  savePayrollSchedule,
} from "@/utils/payroll-storage";


const OwnerPayrollPage = () => {
  const [activeTab, setActiveTab] = useState("history"); // "history" | "schedule"
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);

  // API Data Queries
  const { data: overviewData } = useGetOwnerPayrollOverview();
  const { schedules: apiSchedules } = useGetOwnerPayrollSchedules();
  const { submissions: apiSubmissions } = useGetOwnerPayrollSubmissions();

  // Local Storage Fallback State
  const [localHistory, setLocalHistory] = useState([]);
  const [localSchedule, setLocalSchedule] = useState([]);

  const loadLocalData = () => {
    setLocalHistory(getPayrollHistory());
    setLocalSchedule(getPayrollSchedule());
  };

  useEffect(() => {
    loadLocalData();
    window.addEventListener("pulse_payroll_update", loadLocalData);
    return () => window.removeEventListener("pulse_payroll_update", loadLocalData);
  }, []);

  // Merge API data with Local Storage fallbacks (use API data if available, even if empty array)
  const displaySchedules = useMemo(() => {
    if (Array.isArray(apiSchedules)) return apiSchedules;
    return localSchedule;
  }, [apiSchedules, localSchedule]);

  const displayHistory = useMemo(() => {
    if (Array.isArray(apiSubmissions)) return apiSubmissions;
    return localHistory;
  }, [apiSubmissions, localHistory]);

  // Compute Next Pending Period and Days Remaining for KPI
  const nextPendingPeriod = useMemo(() => {
    const pending = displaySchedules
      .filter((p) => (p.status || "").toLowerCase() === "pending")
      .sort(
        (a, b) =>
          new Date(a.submission_due_date || a.dueDate) -
          new Date(b.submission_due_date || b.dueDate)
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
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dueDt = new Date(due);
    dueDt.setHours(0, 0, 0, 0);
    const diffTime = dueDt - now;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [nextPendingPeriod]);

  // Handle local schedule modifications if offline
  const handleLocalAddSchedule = (newItems) => {
    const itemsToAdd = Array.isArray(newItems) ? newItems : [newItems];
    const updated = [...displaySchedules, ...itemsToAdd].sort(
      (a, b) =>
        new Date(a.startDate || a.start_date) - new Date(b.startDate || b.start_date)
    );
    setLocalSchedule(updated);
    savePayrollSchedule(updated);
  };

  const handleLocalDeleteSchedule = (id) => {
    const updated = displaySchedules.filter((p) => p.id !== id);
    setLocalSchedule(updated);
    savePayrollSchedule(updated);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Payroll Overview & Approvals
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review bi-weekly submissions from directors, audit deductions, and track schedules.
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

          <Button
            onClick={() => setIsAddPeriodOpen(true)}
            className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-semibold rounded-xl text-xs md:text-sm flex items-center gap-1.5"
          >
            <Plus size={16} /> Schedule Period
          </Button>
        </div>
      </div>

      {/* KPI Cards Header */}
      <OwnerPayrollKpiCards
        overviewData={overviewData}
        nextPendingPeriod={nextPendingPeriod}
        daysRemaining={daysRemaining}
        displayHistory={displayHistory}
        displaySchedules={displaySchedules}
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
            onDeleteLocal={handleLocalDeleteSchedule}
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

      {/* Add Schedule Period Modal */}
      <AddSchedulePeriodModal
        isOpen={isAddPeriodOpen}
        onClose={() => setIsAddPeriodOpen(false)}
        onLocalAdd={handleLocalAddSchedule}
      />
    </div>
  );
};

export default OwnerPayrollPage;
