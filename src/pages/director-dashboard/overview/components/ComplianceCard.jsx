import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const COMPLIANCE_ITEMS = [
  { item: "Background Checks", expires: "2026-06-15", days: 35, status: "expiring" },
  { item: "Quarterly DCF Inspection", expires: "2026-06-01", days: 21, status: "expiring" },
  { item: "SR Contract", expires: "2026-07-01", days: 51, status: "expiring" },
  { item: "CPR / First Aid", expires: "2026-04-12", days: -29, status: "expired" },
];

const ComplianceCard = ({ onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar size={16} className="text-red-500" />
          Upcoming Compliance (60-day)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {COMPLIANCE_ITEMS.map((c, i) => {
          const isExpired = c.status === "expired";
          const urgent = !isExpired && c.days <= 30;
          return (
            <div key={i} className={`p-2.5 rounded-lg ${isExpired ? "bg-red-50" : urgent ? "bg-amber-50" : "bg-blue-50"}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-900 truncate">{c.item}</p>
                <span className={`text-[10px] font-bold shrink-0 ml-1 ${isExpired ? "text-red-600" : urgent ? "text-amber-600" : "text-blue-600"}`}>
                  {isExpired ? `${Math.abs(c.days)}d overdue` : `${c.days}d`}
                </span>
              </div>
              <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${isExpired ? "bg-red-400" : urgent ? "bg-amber-400" : "bg-blue-400"}`}
                  style={{ width: `${isExpired ? 100 : Math.min(100, Math.round((1 - c.days / 365) * 100))}%` }} />
              </div>
            </div>
          );
        })}
        <span className="text-[9px] text-blue-600 cursor-pointer hover:underline block text-center" onClick={() => onNavigate("/director/compliance")}>
          View all compliance →
        </span>
      </CardContent>
    </Card>
  </motion.div>
);

export default ComplianceCard;
