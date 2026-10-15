import React from "react";
import { motion } from "framer-motion";

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
  sentLabel = "Sent by me",
  totalCount,
  extraTabs = [],
}) => {
  // Extra tabs show their own list, so the task priority filter and count do not apply
  const onExtraTab = extraTabs.some((tab) => tab.id === activeTab);

  return (
    <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 md:gap-3">
      {/* Tab filter: Assigned to me / Sent by me / All */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 max-w-full overflow-x-auto no-scrollbar">
        {[
          { id: "assigned", label: "Assigned to me" },
          { id: "sent", label: sentLabel },
          { id: "all", label: "All" },
          ...extraTabs,
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#B78A2F]/20 text-[#8F6A1F] text-[9px] font-extrabold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Priority Filter */}
      {!onExtraTab && (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Priority:
        </span>
        {FILTERS.map((p) => (
          <button
            key={p}
            onClick={() => onFilterChange(p)}
            className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold transition-all cursor-pointer ${
              filterPriority === p
                ? "bg-[#1E3A5F] text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      )}

      {!onExtraTab && (
        <span className="text-[10px] md:text-xs text-gray-400 ml-auto font-medium">
          {totalCount} tasks
        </span>
      )}
    </motion.div>
  );
};

export default TaskFilters;
