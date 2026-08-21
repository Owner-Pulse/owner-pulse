import React from "react";
import { AlertTriangle } from "lucide-react";

const PriorityTag = ({ priority }) => {
  const config = {
    critical: { bg: "bg-[#AE4A3E]/10", text: "text-[#8A362C]", label: "Critical" },
    high: { bg: "bg-[#B78A2F]/10", text: "text-[#8F6A1F]", label: "High" },
    medium: { bg: "bg-[#1E3A5F]/10", text: "text-[#1E3A5F]", label: "Medium" },
    low: { bg: "bg-gray-50", text: "text-gray-600", label: "Low" },
  };
  const c = config[priority] || config.medium;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>
      {priority === "critical" && <AlertTriangle size={10} />}
      {c.label}
    </span>
  );
};

export default PriorityTag;
