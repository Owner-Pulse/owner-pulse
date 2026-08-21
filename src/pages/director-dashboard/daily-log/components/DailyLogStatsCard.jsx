import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertTriangle, 
  UserX, 
  Calendar, 
  UserCheck, 
  UserPlus, 
  Wrench, 
  ShieldAlert, 
  ClipboardList 
} from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const STAT_CONFIG = [
  { id: "all", label: "Total Logs Today", icon: ClipboardList, color: "text-[#1E3A5F]", bg: "bg-[#1E3A5F]/10" },
  { id: "incident", label: "Incidents", icon: AlertTriangle, color: "text-[#8A362C]", bg: "bg-[#AE4A3E]/10" },
  { id: "removal", label: "Removals", icon: UserX, color: "text-[#8A362C]", bg: "bg-[#8A362C]/10" },
  { id: "pto", label: "PTO Entries", icon: Calendar, color: "text-blue-700", bg: "bg-blue-50" },
  { id: "substitute", label: "Substitutes", icon: UserCheck, color: "text-teal-700", bg: "bg-teal-50" },
  { id: "waitlist", label: "Waitlist Inquiries", icon: UserPlus, color: "text-purple-700", bg: "bg-purple-50" },
  { id: "maintenance", label: "Maintenance", icon: Wrench, color: "text-amber-700", bg: "bg-amber-50" },
  { id: "at_risk", label: "At-Risk Flags", icon: ShieldAlert, color: "text-rose-700", bg: "bg-rose-50" },
];

const DailyLogStatsCard = ({ type, count, filterType, onFilter }) => {
  const cfg = STAT_CONFIG.find((x) => x.id === type) || STAT_CONFIG[0];
  const Icon = cfg.icon;
  const isSelected = filterType === type;

  return (
    <motion.div variants={itemVariants}>
      <Card
        className={`bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer rounded-2xl ${
          isSelected ? "ring-2 ring-[#1E3A5F] border-transparent" : ""
        }`}
        onClick={() => onFilter(isSelected ? "all" : type)}
      >
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{cfg.label}</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{count}</p>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
              <Icon size={18} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyLogStatsCard;
