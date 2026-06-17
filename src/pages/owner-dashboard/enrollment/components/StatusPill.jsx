import React from "react";

const COLOR_MAP = {
  intervening: "bg-amber-50 text-amber-700 border-amber-200",
  retained: "bg-green-50 text-green-700 border-green-200",
  lost: "bg-red-50 text-red-700 border-red-200",
  compliant: "bg-green-50 text-green-700 border-green-200",
  inquiry: "bg-gray-50 text-gray-600 border-gray-200",
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  toured: "bg-purple-50 text-purple-700 border-purple-200",
  offered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  financial: "bg-amber-50 text-amber-700 border-amber-200",
  transferring: "bg-orange-50 text-orange-700 border-orange-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
  moving: "bg-red-50 text-red-700 border-red-200",
  referral: "bg-blue-50 text-blue-700 border-blue-200",
  website: "bg-cyan-50 text-cyan-700 border-cyan-200",
  walk_in: "bg-emerald-50 text-emerald-700 border-emerald-200",
  event: "bg-purple-50 text-purple-700 border-purple-200",
};

const StatusPill = ({ status, children }) => {
  const c = COLOR_MAP[status] || "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${c}`}>
      {children}
    </span>
  );
};

export default StatusPill;
