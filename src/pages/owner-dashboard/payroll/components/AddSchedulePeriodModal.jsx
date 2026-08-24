import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeneratePayrollSchedule } from "@/hooks/payroll/payroll.hook";

const AddSchedulePeriodModal = ({ isOpen, onClose, onLocalAdd }) => {
  const [scheduleMode, setScheduleMode] = useState("single"); // "single" | "series"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [seriesCount, setSeriesCount] = useState("12"); // "4" = 2 months, "12" = 6 months, "26" = 1 year
  const [modalError, setModalError] = useState("");

  const { generateSchedule, isPending } = useGeneratePayrollSchedule();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (scheduleMode === "single") {
      if (!startDate || !endDate || !dueDate) {
        setModalError("All dates are required for a single cycle.");
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        setModalError("Start date cannot be after end date.");
        return;
      }

      const payload = {
        cycle_start_date: startDate,
        cycle_end_date: endDate,
        submission_due_date: dueDate,
        status: "pending",
      };

      try {
        await generateSchedule(payload);
        if (onLocalAdd) {
          onLocalAdd({
            id: Date.now(),
            startDate,
            endDate,
            dueDate,
            status: "Pending",
          });
        }
        resetAndClose();
      } catch (err) {
        // Fallback for demo/mock if backend endpoint is unavailable
        if (onLocalAdd) {
          onLocalAdd({
            id: Date.now(),
            startDate,
            endDate,
            dueDate,
            status: "Pending",
          });
          resetAndClose();
        } else {
          setModalError(err?.response?.data?.message || "Failed to create schedule cycle.");
        }
      }
    } else {
      // Auto-Generate Series
      if (!startDate) {
        setModalError("First cycle start date is required.");
        return;
      }

      const payload = {
        first_cycle_start_date: startDate,
        series_duration: parseInt(seriesCount, 10),
      };

      try {
        await generateSchedule(payload);
        if (onLocalAdd) {
          // Generate series locally for mock preview if offline
          const count = parseInt(seriesCount, 10);
          const newPeriods = [];
          let currentStart = new Date(startDate);

          for (let i = 0; i < count; i++) {
            const currentEnd = new Date(currentStart);
            currentEnd.setDate(currentStart.getDate() + 13);
            const due = new Date(currentEnd);
            due.setDate(currentEnd.getDate() + 2);

            const startStr = currentStart.toISOString().split("T")[0];
            const endStr = currentEnd.toISOString().split("T")[0];
            const dueStr = due.toISOString().split("T")[0];

            newPeriods.push({
              id: Date.now() + i,
              startDate: startStr,
              endDate: endStr,
              dueDate: dueStr,
              status: "Pending",
            });

            currentStart = new Date(currentEnd);
            currentStart.setDate(currentStart.getDate() + 1);
          }
          onLocalAdd(newPeriods);
        }
        resetAndClose();
      } catch (err) {
        if (onLocalAdd) {
          const count = parseInt(seriesCount, 10);
          const newPeriods = [];
          let currentStart = new Date(startDate);

          for (let i = 0; i < count; i++) {
            const currentEnd = new Date(currentStart);
            currentEnd.setDate(currentStart.getDate() + 13);
            const due = new Date(currentEnd);
            due.setDate(currentEnd.getDate() + 2);

            const startStr = currentStart.toISOString().split("T")[0];
            const endStr = currentEnd.toISOString().split("T")[0];
            const dueStr = due.toISOString().split("T")[0];

            newPeriods.push({
              id: Date.now() + i,
              startDate: startStr,
              endDate: endStr,
              dueDate: dueStr,
              status: "Pending",
            });

            currentStart = new Date(currentEnd);
            currentStart.setDate(currentStart.getDate() + 1);
          }
          onLocalAdd(newPeriods);
          resetAndClose();
        } else {
          setModalError(err?.response?.data?.message || "Failed to generate schedule series.");
        }
      }
    }
  };

  const resetAndClose = () => {
    setStartDate("");
    setEndDate("");
    setDueDate("");
    setModalError("");
    setScheduleMode("single");
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Schedule Payroll</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Define a single custom cycle or auto-generate a recurring series.
                </p>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex bg-gray-50 border border-gray-100 rounded-xl p-1 mb-5">
              <button
                type="button"
                onClick={() => setScheduleMode("single")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  scheduleMode === "single"
                    ? "bg-[#1E3A5F] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                }`}
              >
                Single Custom Cycle
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode("series")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  scheduleMode === "series"
                    ? "bg-[#1E3A5F] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                }`}
              >
                Auto-Generate Series
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                {scheduleMode === "single" ? (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Cycle Start Date *
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Cycle End Date *
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Submission Due Date *
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white transition-all"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        First Cycle Start Date *
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Generate Duration *
                      </label>
                      <select
                        value={seriesCount}
                        onChange={(e) => setSeriesCount(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white transition-all cursor-pointer"
                      >
                        <option value="4">4 Cycles (Next 2 Months)</option>
                        <option value="12">12 Cycles (Auto Bi-Weekly)</option>
                        <option value="26">26 Cycles (Next 1 Year)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {modalError && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-[#AE4A3E]/5 border border-[#AE4A3E]/10 rounded-xl text-xs font-semibold text-[#8A362C]">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetAndClose}
                  className="flex-1 rounded-xl h-11 text-xs font-bold border-gray-200 hover:bg-gray-50"
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl h-11 text-xs font-bold shadow-md shadow-[#1E3A5F]/15 transition-all"
                >
                  {isPending ? "Generating..." : scheduleMode === "single" ? "Schedule Cycle" : "Generate Series"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddSchedulePeriodModal;
