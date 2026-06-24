import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const STATUSES = ["all", "inquiry", "applied", "toured", "offered", "enrolled"];

const WaitlistFilters = ({ statusFilter, onStatusChange, searchQuery, onSearchChange }) => {
  return (
    <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status:</span>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-all ${statusFilter === s ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search child, parent, program..."
          className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </motion.div>
  );
};

export default WaitlistFilters;
