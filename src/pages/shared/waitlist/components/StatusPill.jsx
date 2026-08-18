import React from "react";

const COLORS = {
  inquiry: "bg-gray-100 text-gray-600",
  applied: "bg-[#1E3A5F]/10 text-[#1E3A5F]",
  toured: "bg-[#2A4C7E]/10 text-[#2A4C7E]",
  offered: "bg-[#B78A2F]/10 text-[#8F6A1F]",
  enrolled: "bg-[#3E7A54]/10 text-[#2F6042]",
};

const StatusPill = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${COLORS[status] || COLORS.inquiry}`}>
    {status}
  </span>
);

export default StatusPill;
