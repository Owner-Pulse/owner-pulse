import React from "react";

const CategoryTag = ({ category }) => {
  const config = {
    regulatory: { bg: "bg-blue-50", text: "text-blue-700", label: "Regulatory" },
  };
  const c = config[category] || config.regulatory;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};

export default CategoryTag;
