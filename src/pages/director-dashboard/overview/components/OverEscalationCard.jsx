import React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const OverEscalationCard = ({ data }) => {
  const ratePct = data?.rate_pct ?? 14.3;
  const escalatedCount = data?.escalated_count ?? 3;
  const totalLoggedItems = data?.total_logged_items ?? 2;
  const formulaDesc = data?.formula_description || "30-day metric formula: (Items routed to Owner / Total Director-logged items) * 100";

  const isHealthy = ratePct <= 20;

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#1E3A5F]/5">
                <TrendingUp size={16} className="text-[#1E3A5F]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Over-Escalation Rate (30-day)</p>
                <p className="text-[10px] text-gray-400 mt-0.5" title={formulaDesc}>
                  Items routed to Owner: <strong>{escalatedCount}</strong> · 
                  Total Director-logged items: <strong>{totalLoggedItems}</strong> · 
                  Rate: <strong className={isHealthy ? "text-[#2F6042]" : "text-[#8A362C]"}>{ratePct}%</strong>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-extrabold ${isHealthy ? "text-[#2F6042]" : "text-[#8A362C]"}`}>{ratePct}%</p>
              <p className="text-[9px] text-gray-400">{isHealthy ? "Healthy < 20%" : "High Escalation"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OverEscalationCard;
