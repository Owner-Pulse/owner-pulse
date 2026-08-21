import React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import LogEntryCard from "./LogEntryCard";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const DailyLogGroupList = ({ groupedByDate, todayStr }) => {
  return (
    <motion.div variants={itemVariants}>
      {groupedByDate.length > 0 ? (
        <div className="space-y-6">
          {groupedByDate.map(([date, entries]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-2 h-2 rounded-full ${date === todayStr ? "bg-[#1E3A5F]" : "bg-gray-300"}`} />
                <span className="text-sm font-bold text-gray-700">
                  {date === todayStr ? "Today" : fmtDate(date)}
                </span>
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] text-gray-400 font-medium">
                  {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
                </span>
              </div>
              <div className="space-y-1">
                {entries.map((entry, i) => (
                  <LogEntryCard key={entry.id} entry={entry} index={i} />
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
          <p className="text-sm font-medium text-gray-500">No entries found</p>
        </div>
      )}
    </motion.div>
  );
};

export default DailyLogGroupList;
