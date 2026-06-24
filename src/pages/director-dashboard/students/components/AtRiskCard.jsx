import React from "react";

const fmtRelative = (d) => {
  const diff = Math.ceil((new Date(d) - new Date("2026-05-11")) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
};

const AtRiskCard = ({ student }) => {
  const isLost = student.status === "lost";

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl ${isLost ? "bg-gray-50 opacity-60" : "bg-red-50"}`}>
      <div className={`w-2 h-2 rounded-full mt-1.5 ${isLost ? "bg-gray-400" : "bg-red-500"}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{student.student} · {student.grade}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLost ? "bg-gray-200 text-gray-600" : "bg-red-100 text-red-700"}`}>
            {isLost ? "Lost" : "Intervening"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{student.detail}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Flagged {fmtRelative(student.flagged)}</p>
      </div>
    </div>
  );
};

export default AtRiskCard;
