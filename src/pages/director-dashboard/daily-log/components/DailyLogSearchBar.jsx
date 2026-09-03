import React from "react";
import { motion } from "framer-motion";
import { Search, X, Layers, CalendarCheck2 } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const FILTERS = [
  { id: "all", label: "All History" },
  { id: "open", label: "Open Items", icon: Layers },
  { id: "this_week", label: "This Week", icon: CalendarCheck2 },
  { id: "incident", label: "Incidents" },
  { id: "removal", label: "Withdrawn" },
  { id: "substitute", label: "Substitutes" },
  { id: "maintenance", label: "Maintenance" },
  { id: "at_risk", label: "At-Risk" },
];

const DailyLogSearchBar = ({ searchQuery, onSearchChange, filterType, onFilterChange }) => {
  return (
    <motion.div variants={itemVariants} className="space-y-3">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-200 px-3.5 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-[#1E3A5F]/20 transition-all">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by student, staff, classroom, reason or maintenance title..."
          className="text-xs bg-transparent border-none outline-none w-full text-gray-800 placeholder-gray-400"
        />
        {searchQuery && (
          <button onClick={() => onSearchChange("")} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => {
          const isActive = filterType === f.id;
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive 
                  ? "bg-[#1E3A5F] text-white shadow-sm" 
                  : "bg-white text-gray-600 hover:bg-slate-100 border border-gray-200"
              }`}
            >
              {Icon && <Icon size={13} />}
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DailyLogSearchBar;
