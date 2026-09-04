import React from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const TierFilter = ({ activeFilter, filters = [], onFilterChange, count, onOpenSettings }) => (
  <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter:</span>
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeFilter === f
              ? "bg-[#1E3A5F] text-white shadow-xs"
              : "bg-gray-50 text-gray-600 border border-gray-200/80 hover:bg-gray-100"
          }`}
        >
          {f}
        </button>
      ))}
    </div>

    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-400">{count} classroom{count !== 1 ? "s" : ""}</span>
      {onOpenSettings && (
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSettings}
          className="h-8 px-2.5 text-xs font-semibold text-gray-700 border-gray-200 hover:bg-gray-50 gap-1.5 cursor-pointer rounded-xl shadow-2xs"
          title="Configure Enrollment Targets"
        >
          <Settings size={14} className="text-[#1E3A5F]" />
          <span>Targets</span>
        </Button>
      )}
    </div>
  </motion.div>
);

export default TierFilter;
