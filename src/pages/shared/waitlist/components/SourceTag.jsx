import React from "react";

const COLORS = {
  referral: "bg-green-50 text-green-700",
  website: "bg-blue-50 text-blue-700",
  walk_in: "bg-amber-50 text-amber-700",
  event: "bg-purple-50 text-purple-700",
};

const SourceTag = ({ source }) => (
  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${COLORS[source] || COLORS.website}`}>
    {source.replace("_", " ")}
  </span>
);

export default SourceTag;
