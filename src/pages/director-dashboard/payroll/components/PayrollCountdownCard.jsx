import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtRelative = (d) => {
  const diff = Math.ceil((new Date(d) - new Date("2026-05-11")) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff > 0) return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
};

const PayrollCountdownCard = ({ periodEnd, payrollDays }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className={`bg-white border-none shadow-sm ${payrollDays <= 3 ? "ring-2 ring-[#AE4A3E]/25" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              payrollDays <= 3 ? "bg-[#AE4A3E]/10" : "bg-[#1E3A5F]/10"
            }`}>
              <Calendar size={22} className={payrollDays <= 3 ? "text-[#AE4A3E]" : "text-[#1E3A5F]"} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Next Payroll</p>
              <p className="text-base font-bold text-gray-900">
                {new Date(periodEnd).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {payrollDays <= 0 ? "Overdue!" : `${payrollDays} days away`} · {fmtRelative(periodEnd)}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
              payrollDays <= 3 ? "bg-[#AE4A3E]/10 text-[#AE4A3E]" : payrollDays <= 7 ? "bg-[#B78A2F]/10 text-[#B78A2F]" : "bg-[#3E7A54]/10 text-[#3E7A54]"
            }`}>
              {payrollDays}d
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PayrollCountdownCard;
