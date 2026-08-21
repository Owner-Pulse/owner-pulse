import React from "react";

// Semantic tokens — same hue always means the same thing:
//   navy  → neutral / informational
//   sage  → good / on-track
//   gold  → warning / needs attention
//   brick → critical / at-risk
const COLOR_MAP = {
  intervening: "bg-[#B78A2F]/10 text-[#8F6A1F] border-[#B78A2F]/25",
  retained: "bg-[#3E7A54]/10 text-[#2F6042] border-[#3E7A54]/25",
  lost: "bg-[#AE4A3E]/10 text-[#8A362C] border-[#AE4A3E]/25",
  compliant: "bg-[#3E7A54]/10 text-[#2F6042] border-[#3E7A54]/25",
  inquiry: "bg-gray-50 text-gray-600 border-gray-200",
  applied: "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/25",
  toured: "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/25",
  offered: "bg-[#B78A2F]/10 text-[#8F6A1F] border-[#B78A2F]/25",
  financial: "bg-[#B78A2F]/10 text-[#8F6A1F] border-[#B78A2F]/25",
  transferring: "bg-[#B78A2F]/10 text-[#8F6A1F] border-[#B78A2F]/25",
  other: "bg-gray-50 text-gray-600 border-gray-200",
  moving: "bg-[#AE4A3E]/10 text-[#8A362C] border-[#AE4A3E]/25",
  referral: "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/25",
  website: "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/25",
  walk_in: "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/25",
  event: "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/25",
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
