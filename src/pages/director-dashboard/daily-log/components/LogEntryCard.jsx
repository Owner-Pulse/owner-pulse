import React from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  UserX, 
  Calendar, 
  UserCheck, 
  UserPlus, 
  Wrench, 
  ShieldAlert 
} from "lucide-react";

const LOG_TYPE_CONFIG = {
  incident: {
    label: "Incident",
    icon: AlertTriangle,
    dotColor: "bg-[#AE4A3E]",
    badgeBg: "bg-[#AE4A3E]/10 text-[#8A362C] border-[#AE4A3E]/20"
  },
  removal: {
    label: "Withdrawn",
    icon: UserX,
    dotColor: "bg-[#8A362C]",
    badgeBg: "bg-[#8A362C]/10 text-[#8A362C] border-[#8A362C]/20"
  },
  pto: {
    label: "Staff PTO",
    icon: Calendar,
    dotColor: "bg-blue-600",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200"
  },
  substitute: {
    label: "Substitute",
    icon: UserCheck,
    dotColor: "bg-teal-600",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200"
  },
  waitlist: {
    label: "Waitlist",
    icon: UserPlus,
    dotColor: "bg-purple-600",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200"
  },
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    dotColor: "bg-amber-600",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200"
  },
  at_risk: {
    label: "At-Risk Student",
    icon: ShieldAlert,
    dotColor: "bg-rose-600",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200"
  }
};

const fmtRelative = (d, dateGroup) => {
  if (dateGroup) return dateGroup;
  if (!d) return "Today";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return d;
  const TODAY = new Date();
  const diff = Math.round((dateObj - TODAY) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff > 0) return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
};

const LogEntryCard = ({ entry, index }) => {
  const typeKey = (entry.category || entry.type || "incident").toLowerCase();
  const config = LOG_TYPE_CONFIG[typeKey] || LOG_TYPE_CONFIG.incident;
  const Icon = config.icon;

  const renderTitleAndSubtitle = () => {
    // If backend provided pre-formatted title and details
    let title = entry.title;
    let sub = entry.details || entry.subtitle;
    let extraTag = null;

    if (typeKey === "incident") {
      if (!title) title = `Incident: ${entry.student_name || entry.student || "Student"}`;
      if (!sub) sub = `${entry.classroom_name || entry.classroom || "General"} · Area: ${entry.area || "Classroom"}`;
      const severity = entry.severity || (entry.subtitle?.includes("severity") ? entry.subtitle.split(" ")[0] : null);
      if (severity) {
        extraTag = (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
            severity === "minor" ? "bg-amber-100 text-amber-800" :
            severity === "moderate" ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"
          }`}>
            {severity} severity
          </span>
        );
      }
    } else if (typeKey === "removal") {
      if (!title) title = `Withdrawn: ${entry.student_name || entry.student || "Student"}`;
      if (!sub) sub = `${entry.classroom_name || entry.classroom || "General"} · Reason: ${entry.reason?.replace("_", " ") || "Withdrawn"}`;
      extraTag = (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
          Withdrawn
        </span>
      );
    } else if (typeKey === "pto") {
      if (!title) title = `PTO Request: ${entry.staff_name || entry.staffName || "Staff"}`;
      if (!sub) sub = `${entry.role || "Staff"} · ${entry.ptoType || "Leave"}${entry.notes ? ` (${entry.notes})` : ""}`;
      extraTag = (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
          {entry.ptoType || "PTO"}
        </span>
      );
    } else if (typeKey === "substitute") {
      if (!title) title = `Sub Coverage: ${entry.substituteName || entry.staff_name || "Substitute"}`;
      if (!sub) sub = `Covering in ${entry.classroom_name || entry.classroom || "Classroom"}${entry.notes ? ` · ${entry.notes}` : ""}`;
      extraTag = (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
          Active Shift
        </span>
      );
    } else if (typeKey === "waitlist") {
      if (!title) title = `Waitlist Inquiry: ${entry.childName || entry.student_name || "Prospect"}`;
      if (!sub) sub = `Desired Class: ${entry.classroom_name || entry.classroom || "PreK"}${entry.phone ? ` · ${entry.phone}` : ""}`;
      extraTag = (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
          Inquiry
        </span>
      );
    } else if (typeKey === "maintenance") {
      if (!title) title = `Maintenance: ${entry.title || "Facility Ticket"}`;
      if (!sub) sub = `Location: ${entry.location || "Facility"}${entry.details ? ` · ${entry.details}` : ""}`;
      const priority = entry.priority || "Medium";
      extraTag = (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
          priority === "Emergency" || priority === "High" 
            ? "bg-red-100 text-red-800" 
            : "bg-amber-100 text-amber-800"
        }`}>
          {priority} Priority
        </span>
      );
    } else if (typeKey === "at_risk") {
      if (!title) title = `At-Risk Flag: ${entry.student_name || entry.student || "Student"}`;
      if (!sub) sub = `${entry.classroom_name || entry.classroom || "General"} · Reason: ${entry.riskCategory || entry.subtitle || "Retention Concern"}`;
      extraTag = (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          Flagged Student
        </span>
      );
    }

    return {
      title: title || `Log Entry: ${entry.category_label || "Record"}`,
      sub: sub || "Operational Record",
      extraTag
    };
  };

  const { title, sub, extraTag } = renderTitleAndSubtitle();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ delay: index * 0.03 }}
      className="group flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
    >
      <div className="flex flex-col items-center pt-1 shrink-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${config.badgeBg}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-extrabold text-gray-900 group-hover:text-[#1E3A5F] transition-colors">
              {title}
            </h4>
            {extraTag}
          </div>
          <span className="text-[10px] text-gray-400 font-semibold shrink-0">
            {fmtRelative(entry.date || entry.created_at, entry.date_group)}
          </span>
        </div>
        <p className="text-[11px] text-gray-500 mt-1 leading-normal font-medium">
          {sub}
        </p>
      </div>
    </motion.div>
  );
};

export default LogEntryCard;
