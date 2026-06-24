import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const StatusPill = ({ status, size = "sm" }) => {
  const config = {
    compliant: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Compliant" },
    expiring: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Expiring" },
    expired: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Expired" },
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
