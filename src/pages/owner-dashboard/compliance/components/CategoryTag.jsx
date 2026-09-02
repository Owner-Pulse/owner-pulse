import React from "react";

const CategoryTag = ({ category }) => {
  const config = {
    regulatory: { bg: "bg-[#1E3A5F]/10", text: "text-[#1E3A5F]", label: "Regulatory" },
    operational: { bg: "bg-blue-50 border border-blue-200", text: "text-blue-700", label: "Operational" },
    safety_facility: { bg: "bg-amber-50 border border-amber-200", text: "text-amber-700", label: "Safety / Facility" },
    safety: { bg: "bg-amber-50 border border-amber-200", text: "text-amber-700", label: "Safety / Facility" },
    academic_testing: { bg: "bg-purple-50 border border-purple-200", text: "text-purple-700", label: "Academic / Testing" },
    academic: { bg: "bg-purple-50 border border-purple-200", text: "text-purple-700", label: "Academic / Testing" },
  };
  const c = config[category] || config.regulatory;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};

export default CategoryTag;
