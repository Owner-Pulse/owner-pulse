import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, AlertTriangle, UserMinus, ShieldAlert } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const TABS = [
  { id: "enrollment", label: "Enrollment", icon: GraduationCap },
  { id: "incidents", label: "Incidents", icon: AlertTriangle },
  { id: "removals", label: "Removals", icon: UserMinus },
  { id: "at-risk", label: "At-Risk", icon: ShieldAlert },
];

const StudentTabBar = ({ activeTab, onTabChange, incidentCount }) => {
  return (
    <motion.div variants={itemVariants}>
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon size={16} /> {tab.label}
              {tab.id === "incidents" && incidentCount > 0 && ` (${incidentCount})`}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StudentTabBar;
