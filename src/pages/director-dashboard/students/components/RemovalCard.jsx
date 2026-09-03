import React from "react";
import { UserMinus, Trash } from "lucide-react";

const RemovalCard = ({ removal }) => {
  if (!removal) return null;

  const dateObj = new Date(removal.date || removal.effective_date || removal.created_at || Date.now());
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const elapsedDays = Math.max(0, Math.ceil((new Date() - validDate) / 86400000));
  const remainingDays = Math.max(0, 60 - elapsedDays);

  const studentName = removal.student || removal.student_full_name || "Unknown Student";
  const reasonText = removal.reason || removal.removal_reason || "Withdrawal";
  const classroomName = removal.classroom || removal.classroom_name || "General";
  const detailText = removal.detail || removal.details || removal.notes || "";
  const parentNotifiedText = removal.parentNotified || (removal.parent_notification_received ? "Yes" : "No");

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all border-l-3 border-l-[#AE4A3E]">
      <div className="p-2 rounded-xl bg-[#AE4A3E]/10 text-[#AE4A3E] mt-0.5 shrink-0">
        <UserMinus size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{studentName}</p>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#AE4A3E]/10 text-[#8A362C] capitalize">
            {reasonText}
          </span>
          <span className="text-[9px] text-gray-400 ml-auto font-medium">Withdrawn {elapsedDays} days ago</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{classroomName}</p>
        {detailText && <p className="text-[10px] text-gray-500 mt-1 italic">"{detailText}"</p>}
        
        {/* Retention / Info Bar */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] font-semibold flex-wrap gap-2">
          <span className="text-gray-400">Parent Notified: {parentNotifiedText}</span>
          <span className="flex items-center gap-1 text-[#8F6A1F]">
            <Trash size={10} /> Purges in {remainingDays} days (60-day limit)
          </span>
        </div>
      </div>
    </div>
  );
};

export default RemovalCard;
