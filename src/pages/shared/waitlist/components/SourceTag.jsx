import React from "react";

// Navy-family categorical shades — sources stay distinguishable but on-theme
const COLORS = {
  referral: "bg-[#1E3A5F]/10 text-[#1E3A5F]",
  website: "bg-[#2A4C7E]/10 text-[#2A4C7E]",
  walk_in: "bg-[#4A6B96]/10 text-[#4A6B96]",
  event: "bg-[#5B7FA6]/10 text-[#5B7FA6]",
};

const SourceTag = ({ source }) => (
  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${COLORS[source] || COLORS.website}`}>
    {source.replace("_", " ")}
  </span>
);

export default SourceTag;
