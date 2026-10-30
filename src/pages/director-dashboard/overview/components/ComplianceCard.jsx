import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";
import { formatExpiryDate, formatExpiryDuration } from "@/lib/datetime";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ComplianceCard = ({ items = [], onNavigate }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className={`relative bg-white border-none shadow-sm h-full`}>
        <CardAccent group={items.length === 0 ? "none" : "operations"} />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar size={16} className={items.length === 0 ? STATUS.none.text : ACCENTS.operations.text} />
            Upcoming Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 ? (
            <p className={`text-xs italic text-center py-4 ${STATUS.none.text}`}>No compliance data.</p>
          ) : items.map((c, i) => {
            const isExpired = c.is_overdue || c.days_left < 0;
            const urgent = !isExpired && c.days_left <= 30;
            const tone = isExpired ? STATUS.problem : urgent ? STATUS.watch : STATUS.good;
            const title = c.title || c.item;

            const daysText = c.expiration_date
              ? `${formatExpiryDate(c.expiration_date)} · Duration ${formatExpiryDuration(c.expiration_date, c.created_at)}`
              : "No expiry date";

            return (
              <div key={c.id || i} className={`p-3 rounded-xl border transition-all ${tone.soft} ${tone.border}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold truncate ${tone.text}`}>{title}</p>
                  <span className={`text-[10px] font-extrabold shrink-0 ml-1.5 px-2 py-0.5 rounded-full border ${tone.badge}`}>
                    {daysText}
                  </span>
                </div>
                <div className={`mt-2 h-1.5 ${tone.soft} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${tone.dot} rounded-full`}
                    style={{ width: `${isExpired ? 100 : Math.min(100, Math.max(10, Math.round((1 - c.days_left / 365) * 100)))}%` }}
                  />
                </div>
              </div>
            );
          })}
          <span className={`text-[9px] cursor-pointer hover:underline block text-center ${ACCENTS.operations.text}`} onClick={() => onNavigate("/director/compliance")}>
            View all compliance →
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ComplianceCard;
