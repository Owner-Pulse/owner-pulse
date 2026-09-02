import React from "react";
import { Flag } from "lucide-react";

const PriorityTag = ({ priority }) => {
  const p = (priority || "").toLowerCase();
  const c = {
    high: { bg: "bg-[#AE4A3E]/10", text: "text-[#8A362C]" }, // High priority ALWAYS RED per D-10
    critical: { bg: "bg-[#AE4A3E]/15", text: "text-[#8A362C]" },
    medium: { bg: "bg-[#1E3A5F]/10", text: "text-[#1E3A5F]" },
    low: { bg: "bg-gray-100", text: "text-gray-600" },
  }[p] || { bg: "bg-[#1E3A5F]/10", text: "text-[#1E3A5F]" };

  const label = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "Normal";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${c.bg} ${c.text}`}>
      <Flag size={10} />
      {label}
    </span>
  );
};

export default PriorityTag;
