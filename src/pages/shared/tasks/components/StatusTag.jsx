import React from "react";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";

const STATUS_CONFIG = {
  open: { bg: "bg-gray-100", text: "text-gray-600", icon: ClipboardList },
  pending: { bg: "bg-gray-100", text: "text-gray-600", icon: ClipboardList },
  in_progress: { bg: "bg-[#1E3A5F]/10", text: "text-[#1E3A5F]", icon: Clock },
  delayed: { bg: "bg-[#AE4A3E]/10", text: "text-[#8A362C]", icon: Clock },
  done: { bg: "bg-[#3E7A54]/10", text: "text-[#2F6042]", icon: CheckCircle2 },
  completed: { bg: "bg-[#3E7A54]/10", text: "text-[#2F6042]", icon: CheckCircle2 },
};

const StatusTag = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const Icon = c.icon;
  const label = status === "in_progress" 
    ? "In Progress" 
    : status === "delayed"
    ? "Delayed"
    : status === "pending"
    ? "Pending"
    : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>
      <Icon size={10} />
      {label}
    </span>
  );
};

export default StatusTag;
