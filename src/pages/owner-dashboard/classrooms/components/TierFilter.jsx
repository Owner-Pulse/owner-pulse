import React from "react";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const TierFilter = ({ tierFilter, onTierChange, count }) => (
  <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filter:</span>
      {[
        { id: "all", label: "All Classrooms" },
        { id: "preschool", label: "Preschool" },
        { id: "k8", label: "K–8" },
      ].map((f) => (
        <button key={f.id} onClick={() => onTierChange(f.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${tierFilter === f.id ? "bg-[#1E3A5F] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          {f.label}
        </button>
      ))}
    </div>
    <span className="text-xs text-gray-400">{count} classroom{count !== 1 ? "s" : ""}</span>
  </motion.div>
);

export default TierFilter;
