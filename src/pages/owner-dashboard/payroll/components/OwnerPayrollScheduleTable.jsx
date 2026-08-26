import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useDeletePayrollSchedule } from "@/hooks/payroll/payroll.hook";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const OwnerPayrollScheduleTable = ({ schedule = [], onDeleteLocal }) => {
  const { deleteSchedule, isPending } = useDeletePayrollSchedule();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payroll schedule cycle?")) {
      return;
    }
    try {
      await deleteSchedule(id);
      if (onDeleteLocal) onDeleteLocal(id);
    } catch (err) {
      if (onDeleteLocal) onDeleteLocal(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Bi-Weekly Submission Schedule</h3>
          <p className="text-xs text-gray-400">
            View and adjust active payroll schedules for the entire academic/fiscal year.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">Start Date</th>
              <th className="py-3 px-6">End Date</th>
              <th className="py-3 px-6">Submission Due Date</th>
              <th className="py-3 px-6 text-center">Days Remaining</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
            {schedule.map((period) => {
              const startDate = period.start_date || period.startDate;
              const endDate = period.end_date || period.endDate;
              const dueDate = period.submission_due_date || period.dueDate;
              const daysRem = period.days_remaining ?? null;
              const status = period.status || "pending";

              return (
                <tr key={period.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-6 font-mono text-xs text-gray-400">#{period.id}</td>
                  <td className="py-3.5 px-6 font-medium">{fmtDate(startDate)}</td>
                  <td className="py-3.5 px-6 font-medium">{fmtDate(endDate)}</td>
                  <td className="py-3.5 px-6 font-semibold text-gray-900">{fmtDate(dueDate)}</td>
                  <td className="py-3.5 px-6 text-center font-medium text-xs text-gray-500">
                    {daysRem !== null ? `${daysRem} days` : "—"}
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        status.toLowerCase() === "submitted"
                          ? "bg-[#3E7A54]/10 text-[#2F6042]"
                          : status.toLowerCase() === "pending"
                          ? "bg-[#B78A2F]/10 text-[#8F6A1F]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <button
                      onClick={() => handleDelete(period.id)}
                      disabled={isPending}
                      className="p-1.5 text-gray-400 hover:text-[#AE4A3E] hover:bg-[#AE4A3E]/5 rounded-lg transition-colors"
                      title="Delete Schedule Cycle"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {schedule.length === 0 && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-400 text-xs">
                  No payroll cycles scheduled. Click "Schedule Period" above to add single or bi-weekly cycles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default OwnerPayrollScheduleTable;
