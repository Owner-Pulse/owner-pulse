import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, UserX } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const LOG_TYPES = [
  { 
    id: "incident", 
    label: "Incident", 
    desc: "Student incident", 
    color: "bg-red-500", 
    light: "bg-red-50 text-red-600",
    icon: AlertTriangle 
  },
  { 
    id: "removal", 
    label: "Removal", 
    desc: "Student removed", 
    color: "bg-orange-500", 
    light: "bg-orange-50 text-orange-600",
    icon: UserX         
  },
];

const DailyLogStatsCard = ({ type, stats, filterType, onFilter }) => {
  const t = LOG_TYPES.find((x) => x.id === type);
  if (!t) return null;
  const count = type === "incident" ? stats.incidents : stats.removals;

  return (
    <motion.div variants={itemVariants}>
      <Card
        className={`bg-white border-none shadow-sm hover:shadow-md transition-all cursor-pointer ${filterType === type ? "ring-2 ring-gray-300" : ""}`}
        onClick={() => onFilter(type === filterType ? "all" : type)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase">{t.label}</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.light}`}>
              <t.icon size={20} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyLogStatsCard;
