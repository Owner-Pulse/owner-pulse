import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const StatusPill = ({ status, size = "sm" }) => {
  // Harmonized status tokens — muted tones that sit well with the navy theme
  const config = {
    compliant: { bg: "bg-[#3E7A54]/10", text: "text-[#2F6042]", border: "border-[#3E7A54]/25", label: "Compliant" },
    expiring: { bg: "bg-[#B78A2F]/10", text: "text-[#8F6A1F]", border: "border-[#B78A2F]/25", label: "Expiring" },
    expired: { bg: "bg-[#AE4A3E]/10", text: "text-[#8A362C]", border: "border-[#AE4A3E]/25", label: "Expired" },
  };
  const c = config[status] || config.compliant;
  const padding = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 ${padding} rounded-full font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      {status === "compliant" && <CheckCircle2 size={size === "xs" ? 10 : 12} />}
      {status === "expiring" && <Clock size={size === "xs" ? 10 : 12} />}
      {status === "expired" && <AlertCircle size={size === "xs" ? 10 : 12} />}
      {c.label}
    </span>
  );
};

export default StatusPill;
