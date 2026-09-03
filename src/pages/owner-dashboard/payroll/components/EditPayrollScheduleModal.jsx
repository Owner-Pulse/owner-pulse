import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdatePayrollSchedule } from "@/hooks/payroll/payroll.hook";

const EditPayrollScheduleModal = ({ isOpen, onClose, period }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [modalError, setModalError] = useState("");

  const { updateSchedule, isPending } = useUpdatePayrollSchedule();

  useEffect(() => {
    if (period) {
      setStartDate(period.start_date || period.startDate || "");
      setEndDate(period.end_date || period.endDate || "");
      setDueDate(period.submission_due_date || period.dueDate || "");
      setStatus(period.status || "pending");
      setModalError("");
    }
  }, [period]);

  if (!isOpen || !period) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!startDate || !endDate || !dueDate) {
      setModalError("All date fields are required.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setModalError("Start date cannot be after end date.");
      return;
    }

    const payload = {
      start_date: startDate,
      end_date: endDate,
      submission_due_date: dueDate,
      status: status,
    };

    try {
      await updateSchedule({ id: period.id, data: payload });
      onClose();
    } catch (err) {
      setModalError(err?.response?.data?.message || "Failed to update payroll schedule.");
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
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
                <h2 className="text-lg font-bold text-gray-900">Edit Payroll Schedule</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update cycle #{period.id} dates and submission parameters.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
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

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white transition-all cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                  </select>
                </div>
              </div>

              {modalError && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-[#AE4A3E]/5 border border-[#AE4A3E]/10 rounded-xl text-xs font-semibold text-[#8A362C]">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
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
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditPayrollScheduleModal;
