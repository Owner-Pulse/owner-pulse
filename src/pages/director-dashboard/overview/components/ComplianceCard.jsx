import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ComplianceCard = ({ items = [], onNavigate }) => {
  const complianceList = items.length > 0 ? items : [
    { title: "Quarterly DCF Inspection", expiration_date: "2026-10-10", days_left: 46, is_overdue: false, status: "warning" },
  ];

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar size={16} className="text-[#AE4A3E]" />
            Upcoming Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {complianceList.map((c, i) => {
            const isExpired = c.is_overdue || c.days_left <= 0;
            const urgent = !isExpired && c.days_left <= 30;
            const title = c.title || c.item;

            return (
              <div key={c.id || i} className={`p-2.5 rounded-lg ${isExpired ? "bg-[#AE4A3E]/[0.06]" : urgent ? "bg-[#B78A2F]/[0.08]" : "bg-[#1E3A5F]/[0.04]"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-900 truncate">{title}</p>
                  <span className={`text-[10px] font-bold shrink-0 ml-1 ${isExpired ? "text-[#8A362C]" : urgent ? "text-[#8F6A1F]" : "text-[#1E3A5F]"}`}>
                    {isExpired ? `${Math.abs(c.days_left)}d overdue` : `${c.days_left}d`}
                  </span>
                </div>
                <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isExpired ? "bg-[#AE4A3E]" : urgent ? "bg-[#B78A2F]" : "bg-[#1E3A5F]"}`}
                    style={{ width: `${isExpired ? 100 : Math.min(100, Math.round((1 - c.days_left / 365) * 100))}%` }} />
                </div>
              </div>
            );
          })}
          <span className="text-[9px] text-[#1E3A5F] cursor-pointer hover:underline block text-center" onClick={() => onNavigate("/director/compliance")}>
            View all compliance →
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ComplianceCard;
