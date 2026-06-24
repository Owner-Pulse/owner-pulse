import React from "react";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

const ICON_MAP = {
  ArrowUp,
  ArrowDown,
  ArrowRight,
};

const TONE_STYLES = {
  red: { border: "border-red-200", bg: "bg-red-50", icon: "text-red-500", text: "text-red-800" },
  amber: { border: "border-amber-200", bg: "bg-amber-50", icon: "text-amber-500", text: "text-amber-800" },
  green: { border: "border-emerald-200", bg: "bg-emerald-50", icon: "text-emerald-500", text: "text-emerald-800" },
};

const InsightCard = ({ insight }) => {
  const s = TONE_STYLES[insight.tone] || TONE_STYLES.amber;
  const Icon = ICON_MAP[insight.icon];
  return (
    <div className={`p-3 rounded-xl border ${s.border} ${s.bg} flex items-start gap-2.5`}>
      {Icon ? <Icon size={14} className={`flex-shrink-0 mt-0.5 ${s.icon}`} /> : null}
      <p className={`text-xs leading-relaxed ${s.text}`}>{insight.text}</p>
    </div>
  );
};

export default InsightCard;
