import React from "react";
import { ShieldAlert, UserMinus, CheckCircle2 } from "lucide-react";

const fmtRelative = (d) => {
  if (!d) return "Recently";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return "Recently";
  const diff = Math.ceil((dateObj - new Date()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
};

const AtRiskCard = ({ student, onWithdraw = () => {}, onRetain = () => {} }) => {
  if (!student) return null;

  const statusKey = String(student.status || "intervening").toLowerCase();
  const isLost = statusKey === "lost" || statusKey === "withdrawn";
  const isRetained = statusKey === "retained";

  const studentName = student.student || student.student_full_name || "Unknown Student";
  const classroomGrade = student.grade || student.classroom_name || student.classroom || "General";
  const detailText = student.detail || student.risk_details || student.notes || "Under watch";
  const flaggedDate = student.flagged || student.flag_date || student.created_at;
  const reasonText = student.reason || student.risk_category;

  return (
    <div className={`flex items-start gap-3.5 p-4 rounded-2xl border-l-3 transition-all ${isLost ? "bg-gray-50 border-l-gray-300 border border-gray-100 opacity-60" : isRetained ? "bg-[#3E7A54]/[0.03] border-l-[#3E7A54] border border-[#3E7A54]/10 hover:shadow-sm" : "bg-[#AE4A3E]/[0.03] border-l-[#AE4A3E] border border-[#AE4A3E]/10 hover:shadow-sm"}`}>
      <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${isLost ? "bg-gray-200 text-gray-500" : isRetained ? "bg-[#3E7A54]/10 text-[#3E7A54]" : "bg-[#AE4A3E]/10 text-[#AE4A3E]"}`}>
        <ShieldAlert size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-bold text-gray-900">{studentName} · Class: {classroomGrade}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${isLost ? "bg-gray-200 text-gray-600" : isRetained ? "bg-[#3E7A54]/10 text-[#2F6042]" : "bg-[#AE4A3E]/10 text-[#8A362C]"}`}>
              {isLost ? "Lost" : isRetained ? "Retained" : "Intervening"}
            </span>
            {!isLost && !isRetained && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onRetain(student)}
                  className="flex items-center gap-1 text-[10px] font-bold text-white bg-[#3E7A54] hover:bg-[#2F6042] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md"
                  title="Retain Student"
                >
                  <CheckCircle2 size={11} /> Retain
                </button>
                <button 
                  onClick={() => onWithdraw(student)}
                  className="flex items-center gap-1 text-[10px] font-bold text-white bg-[#AE4A3E] hover:bg-[#8A362C] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md"
                  title="Withdraw Student"
                >
                  <UserMinus size={11} /> Withdraw
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1.5 font-medium leading-relaxed">{detailText}</p>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#AE4A3E]/10 text-[9px] text-gray-400 font-semibold">
          <span>Flagged {fmtRelative(flaggedDate)}</span>
          {reasonText && <span className="uppercase tracking-wider text-[#8A362C]/60">Reason: {reasonText}</span>}
        </div>
      </div>
    </div>
  );
};

export default AtRiskCard;
