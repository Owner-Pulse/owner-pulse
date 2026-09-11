import React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import LogEntryCard from "./LogEntryCard";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const DailyLogGroupList = ({ 
  groupedByDate = [], 
  groupedTimeline = [], 
  filterType = "all", 
  searchQuery = "", 
  isLoading = false, 
  todayStr 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((g) => (
          <div key={g} className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 animate-pulse rounded-md mb-2" />
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-gray-200 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Filter helper matching log category & search query
  const matchesFilter = (log) => {
    if (!log) return false;

    // 1. Filter by Category / Type or Timeframe
    if (filterType && filterType !== "all") {
      if (filterType === "this_week") {
        const dateStr = log.raw_data?.created_at || log.created_at || log.date;
        if (dateStr) {
          const logTime = new Date(dateStr).getTime();
          const nowTime = new Date().getTime();
          const daysDiff = (nowTime - logTime) / (1000 * 60 * 60 * 24);
          if (isNaN(daysDiff) || daysDiff > 7) {
            return false;
          }
        } else if (log.date_group) {
          const dg = (log.date_group || "").toLowerCase();
          if (dg.includes("ago")) {
            const match = dg.match(/(\d+)\s*days?\s*ago/);
            if (match && parseInt(match[1], 10) > 7) return false;
          }
        }
      } else {
        const cat = (log.category || log.type || "").toLowerCase().replace("-", "_");
        const targetFilter = filterType.toLowerCase().replace("-", "_");
        if (cat !== targetFilter) return false;
      }
    }

    // 2. Filter by Search Query
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const searchableStr = [
        log.title,
        log.subtitle,
        log.details,
        log.category_label,
        log.student_name,
        log.student,
        log.staff_name,
        log.staffName,
        log.classroom_name,
        log.classroom,
        log.reason,
        log.notes,
        log.area,
        log.childName,
        log.parentName,
        log.substituteName
      ].filter(Boolean).join(" ").toLowerCase();

      if (!searchableStr.includes(q)) return false;
    }

    return true;
  };

  // Normalize groups into unified array format: [ { title, count, logs: [] }, ... ]
  const normalizedGroups = React.useMemo(() => {
    if (Array.isArray(groupedTimeline) && groupedTimeline.length > 0) {
      return groupedTimeline
        .map((group) => {
          const filteredLogs = (group.logs || []).filter(matchesFilter);
          return {
            key: group.display_date || group.date_group || "Date",
            title: group.display_date || group.date_group || "Today",
            countText: `${filteredLogs.length} entr${filteredLogs.length !== 1 ? "ies" : "y"}`,
            logs: filteredLogs,
          };
        })
        .filter((group) => group.logs.length > 0);
    }
    if (Array.isArray(groupedByDate) && groupedByDate.length > 0) {
      return groupedByDate
        .map(([date, entries]) => {
          const filteredLogs = (entries || []).filter(matchesFilter);
          return {
            key: date,
            title: date === todayStr ? "Today" : fmtDate(date),
            countText: `${filteredLogs.length} entr${filteredLogs.length !== 1 ? "ies" : "y"}`,
            logs: filteredLogs,
          };
        })
        .filter((group) => group.logs.length > 0);
    }
    return [];
  }, [groupedTimeline, groupedByDate, filterType, searchQuery, todayStr]);

  return (
    <motion.div variants={itemVariants}>
      {normalizedGroups.length > 0 ? (
        <div className="space-y-6">
          {normalizedGroups.map((group) => (
            <div key={group.key}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-2 h-2 rounded-full ${group.title === "Today" ? "bg-[#1E3A5F]" : "bg-gray-300"}`} />
                <span className="text-sm font-bold text-gray-700">
                  {group.title}
                </span>
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] text-gray-400 font-medium">
                  {group.countText}
                </span>
              </div>
              <div className="space-y-2">
                {group.logs.map((entry, i) => (
                  <LogEntryCard key={entry.id || i} entry={entry} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No daily log entries found</p>
        </div>
      )}
    </motion.div>
  );
};

export default DailyLogGroupList;
