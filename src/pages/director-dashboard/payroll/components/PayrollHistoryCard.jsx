import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ClipboardList, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DirectorPayrollDetailModal from "./DirectorPayrollDetailModal";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const PayrollHistoryCard = ({ history }) => {
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  return (
    <>
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList size={16} /> Payroll History
            </CardTitle>
            <CardDescription>Previously submitted payroll periods</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((ph) => {
                  const pEnd = ph.payroll_cycle?.end_date || ph.periodEnding || ph.cycle_end_date;
                  const subAt = ph.submitted_at || ph.submittedAt;
                  const subBy = typeof ph.submitted_by === "object" ? ph.submitted_by?.name : ph.submitted_by || "Director";

                  return (
                    <div
                      key={ph.id}
                      onClick={() => setSelectedPayroll(ph)}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-all cursor-pointer border border-gray-100"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center shrink-0">
                            <DollarSign size={18} className="text-[#1E3A5F]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Period ending {fmtDate(pEnd)}</p>
                            <p className="text-xs text-gray-500">
                              Submitted {fmtDate(subAt)} by {subBy}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#1E3A5F] font-semibold">
                            <span>View details</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <ClipboardList size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No payroll history yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {selectedPayroll && (
        <DirectorPayrollDetailModal
          payroll={selectedPayroll}
          onClose={() => setSelectedPayroll(null)}
        />
      )}
    </>
  );
};

export default PayrollHistoryCard;
