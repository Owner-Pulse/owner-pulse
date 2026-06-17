import React from "react";
import { AlertTriangle } from "lucide-react";

const PriorityTag = ({ priority }) => {
  const config = {
    critical: { bg: "bg-red-50", text: "text-red-700", label: "Critical" },
    high: { bg: "bg-orange-50", text: "text-orange-700", label: "High" },
    medium: { bg: "bg-amber-50", text: "text-amber-700", label: "Medium" },
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
