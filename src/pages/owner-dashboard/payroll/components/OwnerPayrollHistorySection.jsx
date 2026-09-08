import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const OwnerPayrollHistorySection = ({ history = [], onSelectPayroll }) => {
  const [showAllHistory, setShowAllHistory] = useState(false);

  const filteredHistory = useMemo(() => {
    if (showAllHistory) return history;
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    return history.filter((item) => {
      const pEnd = item.cycle_end_date || item.periodEnding || item.submitted_at;
      if (!pEnd) return true;
      return new Date(pEnd) >= twoMonthsAgo;
    });
  }, [history, showAllHistory]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            {showAllHistory ? "All Submissions" : "Recent Submissions (Last 2 Months)"}
          </h3>
          <p className="text-xs text-gray-400">
            Click a record to audit child deductions, PTO used, ADP notes and approvals.
          </p>
        </div>
        <Button
          variant="outline"
          className="text-xs rounded-xl"
          onClick={() => setShowAllHistory(!showAllHistory)}
        >
          {showAllHistory ? "Show Last 2 Months" : "Show All History"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHistory.map((item) => {
          const startDate = item.cycle_start_date || item.periodStart || "";
          const endDate = item.cycle_end_date || item.periodEnding || "";
          const submittedAt = item.submitted_at || item.submittedAt;
          const submittedByName = typeof item.submitted_by === "object" ? item.submitted_by?.name : item.submitted_by || "Director";

          const totalDeductions = item.tags
            ? (item.tags.cc || 0) + (item.tags.ded || 0)
            : (item.childCare?.length || 0) + (item.otherDeductions?.length || 0);

          const totalPtoDays = item.tags
            ? item.tags.pto || 0
            : item.pto?.reduce((acc, curr) => acc + (curr.days || 1), 0) || 0;

          const staffCount = item.staff_count ?? item.hoursToAdd?.length ?? 0;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
              onClick={() => onSelectPayroll(item)}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="px-2.5 py-1 bg-[#1E3A5F]/5 rounded-lg text-xs font-semibold text-[#1E3A5F]">
                    Period: {fmtDate(startDate)} - {fmtDate(endDate)}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    Submitted {fmtDate(submittedAt)}
                  </span>
                </div>

                <h4 className="font-bold text-gray-900 text-base mb-1">
                  Bi-Weekly Report Summary
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Submitted by <span className="font-semibold text-gray-800">{submittedByName}</span>
                </p>

                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-50 mb-3 text-center">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Deductions</p>
                    <p className="text-sm font-bold text-gray-800">{totalDeductions} items</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">PTO Used</p>
                    <p className="text-sm font-bold text-gray-800">{totalPtoDays} Days</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Staff Count</p>
                    <p className="text-sm font-bold text-gray-800">{staffCount} staff</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#1E3A5F] font-semibold pt-1">
                <span>Audit Detailed Sections</span>
                <ChevronRight size={16} />
              </div>
            </motion.div>
          );
        })}

        {filteredHistory.length === 0 && (
          <div className="col-span-2 py-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm text-xs">
            No payroll reports found for this period.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OwnerPayrollHistorySection;
