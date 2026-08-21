import React from "react";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

const ICON_MAP = {
  ArrowUp,
  ArrowDown,
  ArrowRight,
};

const TONE_STYLES = {
  red: { border: "border-[#AE4A3E]/25", bg: "bg-[#AE4A3E]/10", icon: "text-[#8A362C]", text: "text-[#8A362C]" },
  amber: { border: "border-[#B78A2F]/25", bg: "bg-[#B78A2F]/10", icon: "text-[#8F6A1F]", text: "text-[#8F6A1F]" },
  green: { border: "border-[#3E7A54]/25", bg: "bg-[#3E7A54]/10", icon: "text-[#2F6042]", text: "text-[#2F6042]" },
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
