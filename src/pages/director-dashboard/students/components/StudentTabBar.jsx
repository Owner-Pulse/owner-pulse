import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, AlertTriangle, UserMinus, ShieldAlert } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const TABS = [
  { id: "enrollment", label: "Enrollment", icon: GraduationCap, accent: "text-[#1E3A5F]", activeBg: "bg-[#1E3A5F]" },
  { id: "incidents", label: "Incidents", icon: AlertTriangle, accent: "text-[#8F6A1F]", activeBg: "bg-[#B78A2F]" },
  { id: "removals", label: "Withdrawn", icon: UserMinus, accent: "text-[#8A362C]", activeBg: "bg-[#AE4A3E]" },
  { id: "at-risk", label: "At-Risk", icon: ShieldAlert, accent: "text-[#8A362C]", activeBg: "bg-[#AE4A3E]" },
];

const StudentTabBar = ({ activeTab, onTabChange, incidentCount }) => {
  return (
    <motion.div variants={itemVariants}>
      <div className="flex gap-1 bg-gray-100/80 rounded-xl p-1 overflow-x-auto scrollbar-none max-w-full w-full md:w-fit whitespace-nowrap snap-x">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all shrink-0 snap-align-start ${
                isActive ? `${tab.activeBg} text-white shadow-sm` : `text-gray-500 hover:bg-white/80 hover:text-gray-700`
              }`}
            >
              <Icon size={14} className={`md:w-4 md:h-4 ${!isActive ? tab.accent : ""}`} /> {tab.label}
              {tab.id === "incidents" && incidentCount > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isActive ? "bg-white/20" : "bg-gray-200 text-gray-500"}`}>
                  {incidentCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StudentTabBar;
