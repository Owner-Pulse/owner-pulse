import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// accent: card group for the strip, icon and value; status (good | watch | problem) colours the sub line
const KpiMetricCard = ({ label, value, sub, icon: Icon, accent = "operations", status, noData = false, onClick }) => {
  const isNoData = noData || status === "none";
  const group = ACCENTS[accent] || ACCENTS.operations;
  const subBadge = isNoData ? STATUS.none.badge : STATUS[status]?.badge || group.badge;

  return (
    <motion.div variants={itemVariants}>
      <Card className="relative bg-white border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden" onClick={onClick}>
        <CardAccent group={isNoData ? "none" : accent} />
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase">{label}</p>
              <p className={`text-2xl font-bold ${isNoData ? "text-gray-500" : group.text}`}>{isNoData ? "—" : value}</p>
            </div>
            {Icon && (
              <div className={`p-2 rounded-lg ${isNoData ? "bg-gray-100 text-gray-500" : group.icon}`}>
                <Icon size={18} />
              </div>
            )}
          </div>
          <p className={`inline-flex border px-2 py-0.5 rounded-full text-[10px] mt-1 ${subBadge}`}>{isNoData ? "No data" : sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default KpiMetricCard;
