import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const OverEscalationCard = ({ data }) => {
  const ratePct = data?.rate_pct ?? 14.3;
  const escalatedCount = data?.escalated_count ?? 3;
  const totalLoggedItems = data?.total_logged_items ?? 21;
  const trendDir = data?.trend || "down"; // "down" is good for over-escalation

  const isHealthy = ratePct <= 20;

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#1E3A5F]/10 text-[#1E3A5F]">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Over-Escalation Rate (30-day)</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                  Items routed to Owner: <strong>{escalatedCount}</strong> · Total logs: <strong>{totalLoggedItems}</strong>
                </p>
              </div>
            </div>
            <div className="text-right flex items-center gap-1.5">
              <div>
                <div className="flex items-center justify-end gap-1">
                  <span className={`text-xl font-extrabold leading-none ${isHealthy ? "text-[#2F6042]" : "text-[#8A362C]"}`}>
                    {ratePct}%
                  </span>
                  {trendDir === "down" ? (
                    <span className="p-0.5 rounded-full bg-emerald-50 text-emerald-700" title="Decreasing escalation rate">
                      <ArrowDownRight size={14} />
                    </span>
                  ) : (
                    <span className="p-0.5 rounded-full bg-red-50 text-red-700" title="Increasing escalation rate">
                      <ArrowUpRight size={14} />
                    </span>
                  )}
                </div>
                <p className="text-[9px] font-bold text-gray-400 mt-0.5">{isHealthy ? "Healthy (< 20%)" : "High Escalation"}</p>
              </div>
            </div>
          </div>

          {/* Plain-Language Explainer (A-04 & D-11) */}
          <div className="p-2.5 rounded-xl bg-[#1E3A5F]/[0.03] border border-[#1E3A5F]/10 flex items-start gap-2">
            <Info size={13} className="text-[#1E3A5F] shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-600 leading-normal font-medium">
              <strong>Explainer:</strong> Measures the proportion of Director operational logs escalated directly to Owner attention. Maintaining a low rate indicates strong autonomous director problem-solving.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OverEscalationCard;
