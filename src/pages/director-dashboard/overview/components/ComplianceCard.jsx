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
            const isExpired = c.is_overdue || c.days_left < 0;
            const urgent = !isExpired && c.days_left <= 30;
            const title = c.title || c.item;

            const daysText = c.days_left < 0
              ? `${Math.abs(c.days_left)}d overdue`
              : c.days_left === 0
              ? "Due today"
              : `${c.days_left}d left`;

            const boxBg = isExpired
              ? "bg-[#AE4A3E] text-white shadow-xs"
              : urgent
              ? "bg-[#B78A2F] text-white shadow-xs"
              : "bg-[#1E3A5F] text-white shadow-xs";

            return (
              <div key={c.id || i} className={`p-3 rounded-xl transition-all ${boxBg}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white truncate">{title}</p>
                  <span className="text-[10px] font-extrabold shrink-0 ml-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                    {daysText}
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/90 rounded-full"
                    style={{ width: `${isExpired ? 100 : Math.min(100, Math.max(10, Math.round((1 - c.days_left / 365) * 100)))}%` }}
                  />
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
