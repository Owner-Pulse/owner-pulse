import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Clock, AlertCircle, Calendar } from "lucide-react";
import { itemVariants } from "./variants";

const StatCard = ({ label, value, valueClass = "text-gray-900", subLabel, icon, iconBg }) => (
  <motion.div variants={itemVariants}>
    <div className="p-4 rounded-xl bg-white shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
      </div>
      <p className={`text-2xl font-extrabold mt-2 ${valueClass}`}>{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{subLabel}</p>
    </div>
  </motion.div>
);

const DirectorKpiCards = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <StatCard
      label="Director Items"
      value={stats.directorCount}
      subLabel="Primary operational"
      icon={<UserCheck size={16} />}
      iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
    />
    <StatCard
      label="Expiring Soon"
      value={stats.expiring}
      valueClass="text-[#8F6A1F]"
      subLabel="Under 60-day window"
      icon={<Clock size={16} />}
      iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]"
    />
    <StatCard
      label="Urgent Expired"
      value={stats.expired}
      valueClass={stats.expired > 0 ? "text-[#8A362C]" : "text-gray-900"}
      subLabel="Action required"
      icon={<AlertCircle size={16} />}
      iconBg={stats.expired > 0 ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "bg-gray-100 text-gray-400"}
    />
    <StatCard
      label="Next Deadline"
      value={stats.nextDeadline > 0 ? `${stats.nextDeadline}d` : "—"}
      valueClass="text-[#1E3A5F]"
      subLabel={stats.nextDeadlineItem ? stats.nextDeadlineItem.item : "All up to date"}
      icon={<Calendar size={16} />}
      iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
    />
  </div>
);

export default DirectorKpiCards;
