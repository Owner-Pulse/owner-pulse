import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Clock, AlertTriangle, ChevronRight, User } from "lucide-react";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const DirectorCard = ({ director, onClick }) => {
  const name = director?.name || "Unknown";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isActive = director?.status === "active";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white hover:bg-linear-to-br hover:from-white hover:to-[#1E3A5F]/3 rounded-2xl border border-gray-100 hover:border-[#1E3A5F]/20 hover:shadow-[0_8px_30px_rgb(30,58,95,0.08)] transition-all duration-300 cursor-pointer overflow-hidden group relative"
      onClick={() => onClick(director)}
    >
      {/* Decorative left accent on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1E3A5F] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom" />

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">

          {/* Avatar Area */}
          <div className="relative shrink-0">
            {director?.avatar ? (
              <img
                src={director.avatar}
                alt={name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-gray-50 group-hover:ring-[#1E3A5F]/10 transition-all"
              />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-linear-to-br from-[#1E3A5F] to-[#2A4C7E] ring-4 ring-gray-50 group-hover:ring-[#1E3A5F]/10 transition-all shadow-sm">
                {initials}
              </div>
            )}

            {/* Status indicator dot */}
            <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          </div>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1E3A5F] transition-colors truncate capitalize">
                  {name}
                </h3>
                <p className="text-sm font-medium text-[#1E3A5F]/70 mt-0.5 capitalize flex items-center gap-1.5">
                  <User size={14} />
                  {director?.role || "Director"}
                </p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                  : "bg-amber-50 text-amber-700 border-amber-200/50"
                }`}>
                {isActive ? "ACTIVE" : "PENDING"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                  <Mail size={14} />
                </div>
                <span className="truncate">{director?.email}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                  <Phone size={14} />
                </div>
                <span className="truncate">{director?.phone || <span className="text-gray-400 italic">No phone</span>}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs">
                {director?.last_activity_at ? (
                  <>
                    <Clock size={14} className="text-[#1E3A5F]/60" />
                    <span className="text-gray-500">
                      Active <span className="font-semibold text-gray-700">{formatDate(director.last_activity_at)}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-amber-600 font-medium">Never logged in</span>
                  </>
                )}
              </div>

              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors text-gray-400">
                <ChevronRight size={16} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default DirectorCard;