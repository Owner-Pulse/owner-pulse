import React from "react";

const fmtRelative = (d) => {
  const diff = Math.ceil((new Date(d) - new Date("2026-05-11")) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
};

const SEVERITY_STYLES = {
  major: { dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
  moderate: { dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  minor: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
};

const IncidentCard = ({ incident }) => {
  const styles = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.minor;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
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
