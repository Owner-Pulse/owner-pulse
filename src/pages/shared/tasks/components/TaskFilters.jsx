import React from "react";
import { motion } from "framer-motion";
import { Crown, UserCheck, Shield } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const FILTERS = ["all", "high", "medium", "low"];

const TaskFilters = ({
  activeTab,
  onTabChange,
  filterPriority,
  onFilterChange,
  filterOrigin = "all",
  onOriginChange,
  totalCount,
}) => {
  return (
    <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 md:gap-3">
      {/* Tab filter: My Tasks vs All Tasks */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
        <button
          onClick={() => onTabChange("my")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-semibold transition-all ${
            activeTab === "my" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          My Tasks
        </button>
        <button
          onClick={() => onTabChange("all")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-semibold transition-all ${
            activeTab === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Tasks
        </button>
      </div>

      {/* B-06: Task Origin Filter (Owner-Assigned vs Self-Created) */}
      {onOriginChange && (
        <div className="flex items-center gap-1 bg-amber-50/80 border border-amber-200/80 rounded-lg p-0.5">
          <button
            onClick={() => onOriginChange("all")}
            className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold transition-all ${
              filterOrigin === "all"
                ? "bg-[#1E3A5F] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Creators
          </button>
          <button
            onClick={() => onOriginChange("owner")}
            className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-extrabold transition-all flex items-center gap-1 ${
              filterOrigin === "owner"
                ? "bg-[#B78A2F] text-white shadow-xs"
                : "text-[#8F6A1F] hover:bg-amber-100"
            }`}
          >
            <Crown size={12} /> From Owner
          </button>
          <button
            onClick={() => onOriginChange("self")}
            className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold transition-all flex items-center gap-1 ${
              filterOrigin === "self"
                ? "bg-gray-800 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <UserCheck size={12} /> Self-Created
          </button>
        </div>
      )}

      {/* Priority Filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Priority:
        </span>
        {FILTERS.map((p) => (
          <button
            key={p}
            onClick={() => onFilterChange(p)}
            className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold transition-all ${
              filterPriority === p
                ? "bg-[#1E3A5F] text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <span className="text-[10px] md:text-xs text-gray-400 ml-auto font-medium">
        {totalCount} tasks
      </span>
    </motion.div>
  );
};

export default TaskFilters;
