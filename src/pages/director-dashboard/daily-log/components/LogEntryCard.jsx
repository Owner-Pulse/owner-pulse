import React from "react";
import { motion } from "framer-motion";

const LOG_TYPES = [
  { id: "incident", label: "Incident", desc: "Student incident", color: "bg-[#AE4A3E]", light: "bg-[#AE4A3E]/10 text-[#8A362C]" },
  { id: "removal", label: "Removal", desc: "Student removed", color: "bg-[#B78A2F]", light: "bg-[#B78A2F]/10 text-[#8F6A1F]" },
];

const fmtRelative = (d) => {
  const TODAY = new Date("2026-05-11");
  const diff = Math.ceil((new Date(d) - TODAY) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
};

const LogEntryCard = ({ entry, index }) => {
  const typeConfig = LOG_TYPES.find((t) => t.id === entry.type);
  const renderDetails = () => {
    if (entry.type === "incident") {
      return (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium text-gray-700">{entry.student}</span>
          <span className="text-gray-300">·</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
            entry.severity === "minor" ? "bg-[#B78A2F]/10 text-[#8F6A1F]" :
            entry.severity === "moderate" ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "bg-[#8A362C]/10 text-[#8A362C]"
          }`}>{entry.severity}</span>
          <span className="text-gray-300">·</span>
          <span>{entry.area}</span>
        </div>
      );
    }
    if (entry.type === "removal") {
      return (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium text-gray-700">{entry.student}</span>
          <span className="text-gray-300">·</span>
          <span className="capitalize">{entry.reason?.replace("_", " ")}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
      className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
      <div className="flex flex-col items-center pt-1">
        <div className={`w-3 h-3 rounded-full ring-2 ring-white ${typeConfig?.color || "bg-gray-400"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">
            {entry.type === "incident" ? `Incident: ${entry.student}` : `Removal: ${entry.student}`}
          </p>
          <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium">{fmtRelative(entry.date)}</span>
        </div>
        <div className="mt-1">{renderDetails()}</div>
      </div>
    </motion.div>
  );
};

export default LogEntryCard;
