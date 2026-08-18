import React from "react";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// filters: string[] from API (e.g. ["All Classrooms", "Preschool"])
// activeFilter: currently selected filter string
const TierFilter = ({ activeFilter, filters = [], onFilterChange, count }) => (
  <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filter:</span>
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeFilter === f
              ? "bg-[#1E3A5F] text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
    <span className="text-xs text-gray-400">{count} classroom{count !== 1 ? "s" : ""}</span>
  </motion.div>
);

export default TierFilter;
