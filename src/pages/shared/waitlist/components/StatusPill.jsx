import React from "react";

const COLORS = {
  inquiry: "bg-gray-100 text-gray-600",
  applied: "bg-[#1E3A5F]/10 text-[#1E3A5F]",
  toured: "bg-[#2A4C7E]/10 text-[#2A4C7E]",
  offered: "bg-[#1E3A5F]/10 text-[#1E3A5F]",
  enrolled: "bg-[#3E7A54]/10 text-[#2F6042]",
  lost: "bg-red-100 text-red-700",
};

const StatusPill = ({ status }) => {
  const normStatus = (status || "").toLowerCase();
  const displayLabel = normStatus === "offered" ? "Applied" : status;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${COLORS[normStatus] || COLORS.inquiry}`}>
      {displayLabel}
    </span>
  );
};

export default StatusPill;
