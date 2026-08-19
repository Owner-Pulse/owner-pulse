import React from "react";

const fmtRelative = (d) => {
  const diff = Math.ceil((new Date(d) - new Date("2026-05-11")) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
};

const SEVERITY_STYLES = {
  major: { dot: "bg-[#AE4A3E]", badge: "bg-[#AE4A3E]/10 text-[#8A362C]", border: "border-l-[#AE4A3E]" },
  moderate: { dot: "bg-[#B78A2F]", badge: "bg-[#B78A2F]/10 text-[#8F6A1F]", border: "border-l-[#B78A2F]" },
  minor: { dot: "bg-[#8F6A1F]", badge: "bg-[#B78A2F]/10 text-[#8F6A1F]", border: "border-l-[#8F6A1F]" },
};

const IncidentCard = ({ incident }) => {
  const styles = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.minor;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all border-l-3 ${styles.border}`}>
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${styles.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{incident.student}</p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${styles.badge}`}>
            {incident.severity}
          </span>
          <span className="text-[9px] text-gray-400 ml-auto">{fmtRelative(incident.date)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{incident.classroom} · {incident.area}</p>
        {incident.description && (
          <p className="text-[10px] text-gray-400 mt-0.5">{incident.description}</p>
        )}
      </div>
    </div>
  );
};

export default IncidentCard;
