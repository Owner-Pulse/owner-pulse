import React from "react";
import { Flag } from "lucide-react";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";

const PriorityTag = ({ priority }) => {
  const p = (priority || "").toLowerCase();
  const c = {
    high: STATUS.problem,
    critical: STATUS.problem,
    medium: STATUS.watch,
    low: ACCENTS.operations,
  }[p] || ACCENTS.operations;

  const label = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "Normal";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${p === "high" || p === "critical" || p === "medium" ? c.badge : c.icon}`}>
      <Flag size={10} />
      {label}
    </span>
  );
};

export default PriorityTag;
