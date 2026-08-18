import React from "react";
import { motion } from "framer-motion";
import { DollarSign, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const PayrollHistoryCard = ({ history }) => {
  return (
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
              {history.map((ph) => (
                <div key={ph.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center">
                        <DollarSign size={18} className="text-[#1E3A5F]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Period ending {fmtDate(ph.periodEnding)}</p>
                        <p className="text-xs text-gray-500">Submitted {fmtDate(ph.submittedAt)} by {ph.submittedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {ph.childCare?.length > 0 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F]">{ph.childCare.length} CC</span>
                      )}
                      {ph.otherDeductions?.length > 0 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#B78A2F]/10 text-[#B78A2F]">{ph.otherDeductions.length} Ded</span>
                      )}
                      {ph.pto?.length > 0 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#B78A2F]/10 text-[#B78A2F]">{ph.pto.length} PTO</span>
                      )}
                      {ph.hoursToAdd?.length > 0 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#3E7A54]/10 text-[#3E7A54]">{ph.hoursToAdd.length} Hrs</span>
                      )}
                    </div>
                  </div>
                  <details className="mt-2">
                    <summary className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 font-medium">View details</summary>
                    <div className="mt-2 space-y-2 text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
                      {ph.childCare?.length > 0 && (
                        <div><span className="font-semibold text-gray-700">Child Care:</span> {ph.childCare.map((c) => `${c.name} ($${c.amount})`).join(", ")}</div>
                      )}
                      {ph.otherDeductions?.length > 0 && (
                        <div><span className="font-semibold text-gray-700">Deductions:</span> {ph.otherDeductions.map((d) => `${d.name} $${d.amount}`).join(", ")}</div>
                      )}
                      {ph.pto?.length > 0 && (
                        <div><span className="font-semibold text-gray-700">PTO:</span> {ph.pto.map((p) => `${p.name} ${p.days}d`).join(", ")}</div>
                      )}
                      {ph.hoursToAdd?.length > 0 && (
                        <div><span className="font-semibold text-gray-700">Extra Hours:</span> {ph.hoursToAdd.map((h) => `${h.name} ${h.hours}h`).join(", ")}</div>
                      )}
                    </div>
                  </details>
                </div>
              ))}
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
  );
};

export default PayrollHistoryCard;
