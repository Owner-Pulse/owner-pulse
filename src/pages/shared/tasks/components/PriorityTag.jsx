import React from "react";
import { Flag } from "lucide-react";

const PriorityTag = ({ priority }) => {
  const c = {
    high: { bg: "bg-red-50", text: "text-red-700" },
    medium: { bg: "bg-amber-50", text: "text-amber-700" },
    low: { bg: "bg-gray-50", text: "text-gray-600" },
  }[priority] || { bg: "bg-amber-50", text: "text-amber-700" };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>
      <Flag size={10} />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export default PriorityTag;
