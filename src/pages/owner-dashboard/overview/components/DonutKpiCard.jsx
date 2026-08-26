import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const DonutKpiCard = ({ label, value, pct, color, sub, subColor, icon: Icon, index = 0, onClick }) => {
  return (
    <motion.div variants={itemVariants} key={index} onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
      <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {Icon && (
              <Icon size={15} strokeWidth={2} style={{ color }} aria-hidden />
            )}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
          </div>
          <div className="relative flex items-center justify-center h-[110px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { value: pct, fill: color },
                    { value: 100 - pct, fill: "#F1F5F9" },
                  ]}
                  dataKey="value"
                  innerRadius="65%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-2xl font-black" style={{ color }}>
              {pct}%
            </div>
          </div>
          <p className="text-base font-bold text-gray-900 text-center mt-2">{value}</p>
          <p className={`text-xs ${subColor} text-center mt-0.5`}>{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DonutKpiCard;
