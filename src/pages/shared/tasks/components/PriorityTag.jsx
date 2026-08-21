import React from "react";
import { Flag } from "lucide-react";

const PriorityTag = ({ priority }) => {
  const c = {
    high: { bg: "bg-[#B78A2F]/10", text: "text-[#8F6A1F]" },
    medium: { bg: "bg-[#1E3A5F]/10", text: "text-[#1E3A5F]" },
    low: { bg: "bg-gray-50", text: "text-gray-600" },
  }[priority] || { bg: "bg-[#1E3A5F]/10", text: "text-[#1E3A5F]" };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>
      <Flag size={10} />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export default PriorityTag;
