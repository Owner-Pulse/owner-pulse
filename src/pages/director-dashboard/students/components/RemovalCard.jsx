import React from "react";
import { UserMinus } from "lucide-react";

const fmtRelative = (d) => {
  const diff = Math.ceil((new Date(d) - new Date("2026-05-11")) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
};

const RemovalCard = ({ removal }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50">
      <UserMinus size={16} className="text-red-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{removal.student}</p>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 capitalize">
            {removal.reason}
          </span>
          <span className="text-[9px] text-gray-400 ml-auto">{fmtRelative(removal.date)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{removal.classroom}</p>
        {removal.detail && <p className="text-[10px] text-gray-400 mt-0.5">{removal.detail}</p>}
      </div>
    </div>
  );
};

export default RemovalCard;
