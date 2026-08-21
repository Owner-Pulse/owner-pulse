import React from "react";
import { UserMinus, Trash } from "lucide-react";

const TODAY = new Date("2026-05-11");

const RemovalCard = ({ removal }) => {
  const elapsedDays = Math.max(0, Math.ceil((TODAY - new Date(removal.date)) / 86400000));
  const remainingDays = Math.max(0, 60 - elapsedDays);

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all border-l-3 border-l-[#AE4A3E]">
      <div className="p-2 rounded-xl bg-[#AE4A3E]/10 text-[#AE4A3E] mt-0.5 shrink-0">
        <UserMinus size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{removal.student}</p>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#AE4A3E]/10 text-[#8A362C] capitalize">
            {removal.reason}
          </span>
          <span className="text-[9px] text-gray-400 ml-auto font-medium">Removed {elapsedDays} days ago</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{removal.classroom}</p>
        {removal.detail && <p className="text-[10px] text-gray-500 mt-1 italic">"{removal.detail}"</p>}
        
        {/* Retention / Info Bar */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] font-semibold flex-wrap gap-2">
          <span className="text-gray-400">Parent Notified: {removal.parentNotified || "Yes"}</span>
          <span className="flex items-center gap-1 text-[#8F6A1F]">
            <Trash size={10} /> Purges in {remainingDays} days (60-day limit)
          </span>
        </div>
      </div>
    </div>
  );
};

export default RemovalCard;
