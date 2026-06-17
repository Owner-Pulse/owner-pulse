import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const KpiMetricCard = ({ label, value, sub, icon: Icon, color, subColor = "text-gray-400", onClick }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>
              {value}
            </p>
          </div>
          {Icon && (
            <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}15`, color }}>
              <Icon size={18} />
            </div>
          )}
        </div>
        <p className={`text-[10px] mt-1 ${subColor}`}>{sub}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default KpiMetricCard;
