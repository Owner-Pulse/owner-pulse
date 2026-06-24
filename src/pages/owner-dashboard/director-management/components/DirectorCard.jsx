import React from "react";
import { motion } from "framer-motion";
import { Mail, Clock, AlertTriangle, ChevronRight } from "lucide-react";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const daysSince = (d) => {
  const diff = Math.ceil((new Date(d) - new Date("2026-05-11")) / 86400000);
  return Math.abs(diff);
};

const DirectorCard = ({ director, onClick }) => {
  const initials = director.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const daysSinceCreation = daysSince(director.created);
  const isActive = director.status === "active";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer overflow-hidden"
      onClick={() => onClick(director)}
    >
      <div className={`h-1.5 w-full ${isActive ? "bg-emerald-400" : "bg-amber-400"}`} />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0 ${
            isActive ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-amber-400 to-amber-500"
          }`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 truncate">{director.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                {isActive ? "Active" : "Pending"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{director.role}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Mail size={12} /> {director.email}
              </span>
              {director.lastLogin ? (
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Last login {formatDate(director.lastLogin)}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-500">
                  <AlertTriangle size={12} /> Not yet logged in
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{daysSinceCreation}d</p>
                <p className="text-[10px] text-gray-400">Active</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{director.tasksCompleted}</p>
                <p className="text-[10px] text-gray-400">Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{director.logEntries}</p>
                <p className="text-[10px] text-gray-400">Logs</p>
              </div>
              <div className="flex-1" />
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DirectorCard;
