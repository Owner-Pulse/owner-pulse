import React from "react";
import { CheckCircle2, Clock, Wrench } from "lucide-react";

const StatusTag = ({ status }) => {
  const config = {
    open: { bg: "bg-gray-100", text: "text-gray-600", label: "Open" },
    in_progress: { bg: "bg-[#1E3A5F]/10", text: "text-[#1E3A5F]", label: "In Progress" },
    done: { bg: "bg-[#3E7A54]/10", text: "text-[#2F6042]", label: "Done" },
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
