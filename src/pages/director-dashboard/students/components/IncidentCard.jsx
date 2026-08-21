import React from "react";

const fmtRelative = (d) => {
  if (!d) return "Recently";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return "Recently";
  const diff = Math.ceil((dateObj - new Date()) / 86400000);
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
  if (!incident) return null;

  const severityKey = String(incident.severity || "minor").toLowerCase();
  const styles = SEVERITY_STYLES[severityKey] || SEVERITY_STYLES.minor;

  const studentName = incident.student || incident.student_full_name || incident.student_name || "Unknown Student";
  const classroomName = incident.classroom || incident.classroom_name || "General";
  const areaName = incident.area || incident.location || "Classroom";
  const descriptionText = incident.description || incident.details || "";
  const dateValue = incident.date || incident.created_at || incident.logged_at;

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all border-l-3 ${styles.border}`}>
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${styles.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{studentName}</p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${styles.badge}`}>
            {severityKey}
          </span>
          <span className="text-[9px] text-gray-400 ml-auto">{fmtRelative(dateValue)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{classroomName} · {areaName}</p>
        {descriptionText && (
          <p className="text-[10px] text-gray-400 mt-0.5">{descriptionText}</p>
        )}
      </div>
    </div>
  );
};

export default IncidentCard;
