import React from "react";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const FILTERS = ["all", "high", "medium", "low"];

const TaskFilters = ({ activeTab, onTabChange, filterPriority, onFilterChange, totalCount }) => {
  return (
    <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 md:gap-3">
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
        <button
          onClick={() => onTabChange("my")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-semibold transition-all ${activeTab === "my" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          My Tasks
        </button>
        <button
          onClick={() => onTabChange("all")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-semibold transition-all ${activeTab === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
        >
          All Tasks
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority:</span>
        {FILTERS.map((p) => (
          <button
            key={p}
            onClick={() => onFilterChange(p)}
            className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold transition-all ${filterPriority === p ? "bg-gray-900 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      <span className="text-[10px] md:text-xs text-gray-400 ml-auto">{totalCount} tasks</span>
    </motion.div>
  );
};

export default TaskFilters;
