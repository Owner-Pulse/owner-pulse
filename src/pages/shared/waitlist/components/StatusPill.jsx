import React from "react";

const COLORS = {
  inquiry: "bg-gray-100 text-gray-600",
  applied: "bg-blue-50 text-blue-700",
  toured: "bg-purple-50 text-purple-700",
  offered: "bg-amber-50 text-amber-700",
  enrolled: "bg-emerald-50 text-emerald-700",
};

const StatusPill = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${COLORS[status] || COLORS.inquiry}`}>
    {status}
  </span>
);

export default StatusPill;
