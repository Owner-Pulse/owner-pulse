import React from "react";
import { motion } from "framer-motion";
import { Search, X, AlertTriangle, UserMinus } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "incident", label: "Incident" },
  { id: "removal", label: "Removal" },
];

const DailyLogSearchBar = ({ searchQuery, onSearchChange, filterType, onFilterChange }) => {
  return (
    <motion.div variants={itemVariants}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-[#1E3A5F] flex-1">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search entries..."
            className="text-sm bg-transparent border-none outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange("")} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === f.id ? "bg-[#1E3A5F] text-white" : "text-gray-500 hover:bg-gray-50"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DailyLogSearchBar;
