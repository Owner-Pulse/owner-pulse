import React from "react";

const CONFIG = {
  present: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Present" },
  late: { bg: "bg-amber-50", text: "text-amber-700", label: "Late" },
  callout: { bg: "bg-red-50", text: "text-red-700", label: "Call-out" },
};

const StatusBadge = ({ status }) => {
  const config = CONFIG[status] || { bg: "bg-gray-50", text: "text-gray-600", label: status };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
