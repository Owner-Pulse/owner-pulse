import React from "react";

const CategoryTag = ({ category }) => {
  const config = {
    regulatory: { bg: "bg-[#1E3A5F]/10", text: "text-[#1E3A5F]", label: "Regulatory" },
  };
  const c = config[category] || config.regulatory;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};

export default CategoryTag;
