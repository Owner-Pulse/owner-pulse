import React from "react";
import { CheckCircle2, Clock, Wrench } from "lucide-react";

const StatusTag = ({ status }) => {
  const config = {
    open: { bg: "bg-gray-100", text: "text-gray-600", label: "Open" },
    in_progress: { bg: "bg-blue-50", text: "text-blue-700", label: "In Progress" },
    done: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Done" },
  };
  const c = config[status] || config.open;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>
      {status === "done" ? <CheckCircle2 size={10} /> : status === "in_progress" ? <Clock size={10} /> : <Wrench size={10} />}
      {c.label}
    </span>
  );
};

export default StatusTag;
