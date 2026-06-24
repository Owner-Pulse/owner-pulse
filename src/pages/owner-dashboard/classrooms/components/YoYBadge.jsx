import React from "react";

const YoYBadge = ({ delta }) => {
  if (!delta) return null;
  const bgColor = delta.color.includes("emerald") ? "bg-emerald-50" : delta.color.includes("red") ? "bg-red-50" : "bg-gray-50";
  const textColor = delta.color;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${bgColor} ${textColor}`}>
      {delta.arrow} {delta.text}
    </span>
  );
};

export default YoYBadge;
