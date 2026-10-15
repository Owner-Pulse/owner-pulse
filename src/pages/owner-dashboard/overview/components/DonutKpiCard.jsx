import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

/**
 * accent: card group (finance, collections, students, operations, staff) for the strip and icon.
 * status: good | watch | problem colours the ring and subtitle; without it the ring uses the accent.
 * noData: gray ring and "No data yet" instead of a made-up colour.
 */
const DonutKpiCard = ({ label, value, pct, accent = "operations", status, noData = false, sub, icon: Icon, index = 0, onClick, centerText }) => {
  const isNoData = noData || status === "none";
  const group = ACCENTS[accent] || ACCENTS.operations;
  const tone = isNoData ? STATUS.none : STATUS[status] || null;
  const ringColor = tone ? tone.hex : group.hex;
  const centerColor = isNoData ? "text-gray-500" : tone ? tone.text : group.text;
  const subBadge = tone ? tone.badge : group.badge;

  return (
    <motion.div variants={itemVariants} key={index} onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
      <Card className="relative bg-white border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
        <CardAccent group={isNoData ? "none" : accent} />
        <CardContent className="p-3">
          <div className="flex items-start gap-1.5 mb-1">
            {Icon && (
              <span className={`shrink-0 -mt-px p-0.5 rounded-md ${isNoData ? "bg-gray-100 text-gray-500" : group.icon}`}>
                <Icon size={13} strokeWidth={2} aria-hidden />
              </span>
            )}
            <p className="text-[11px] font-bold text-gray-500 uppercase leading-tight break-words min-w-0">{label}</p>
          </div>
          <div className="relative flex items-center justify-center h-[110px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { value: isNoData ? 0 : pct, fill: ringColor },
                    { value: isNoData ? 100 : 100 - pct, fill: "#F1F5F9" },
                  ]}
                  dataKey="value"
                  innerRadius="68%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={`absolute text-xl font-extrabold ${centerColor}`}>
              {isNoData ? "—" : centerText !== undefined ? centerText : `${pct}%`}
            </div>
          </div>
          <p className={`text-sm font-bold text-center mt-1.5 truncate ${isNoData ? "text-gray-600" : "text-gray-900"}`}>{isNoData ? "No data" : value}</p>
          <p className={`inline-flex max-w-full mx-auto border px-2 py-0.5 rounded-full text-[10px] text-center mt-0.5 truncate ${subBadge}`}>{isNoData ? "No data" : sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DonutKpiCard;
