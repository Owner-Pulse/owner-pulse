import React from "react";
import { ShieldAlert, UserMinus } from "lucide-react";

const fmtRelative = (d) => {
  const diff = Math.ceil((new Date(d) - new Date("2026-05-11")) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
};

const AtRiskCard = ({ student, onWithdraw }) => {
  const isLost = student.status === "lost";

  return (
    <div className={`flex items-start gap-3.5 p-4 rounded-2xl border-l-3 transition-all ${isLost ? "bg-gray-50 border-l-gray-300 border border-gray-100 opacity-60" : "bg-[#AE4A3E]/[0.03] border-l-[#AE4A3E] border border-[#AE4A3E]/10 hover:shadow-sm"}`}>
      <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${isLost ? "bg-gray-200 text-gray-500" : "bg-[#AE4A3E]/10 text-[#AE4A3E]"}`}>
        <ShieldAlert size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-bold text-gray-900">{student.student} · Class: {student.grade}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${isLost ? "bg-gray-200 text-gray-600" : "bg-[#AE4A3E]/10 text-[#8A362C]"}`}>
              {isLost ? "Lost" : "Intervening"}
            </span>
            {!isLost && (
              <button 
                onClick={() => onWithdraw(student)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-[#AE4A3E] hover:bg-[#8A362C] px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md"
                title="Withdraw Student"
              >
                <UserMinus size={11} /> Withdraw
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1.5 font-medium leading-relaxed">{student.detail}</p>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#AE4A3E]/10 text-[9px] text-gray-400 font-semibold">
          <span>Flagged {fmtRelative(student.flagged)}</span>
          {student.reason && <span className="uppercase tracking-wider text-[#8A362C]/60">Reason: {student.reason}</span>}
        </div>
      </div>
    </div>
  );
};

export default AtRiskCard;
