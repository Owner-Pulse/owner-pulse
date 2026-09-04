import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Activity,
  MessageSquare,
  ClipboardList,
  ShieldAlert,
  Wrench,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetDirectorActivity } from "@/hooks/owner-hook/create-director.hook";

const ACTIVITY_ICONS = {
  task_comment: { icon: MessageSquare, bg: "bg-blue-50 text-blue-600 border-blue-200" },
  task: { icon: ClipboardList, bg: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  incident: { icon: ShieldAlert, bg: "bg-red-50 text-red-600 border-red-200" },
  maintenance: { icon: Wrench, bg: "bg-amber-50 text-amber-600 border-amber-200" },
  waitlist: { icon: Calendar, bg: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  default: { icon: Activity, bg: "bg-gray-50 text-gray-600 border-gray-200" },
};

const formatTime = (ts) => {
  if (!ts) return "";
  const date = new Date(ts);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const DirectorActivityModal = ({ isOpen, onClose, director }) => {
  const [period, setPeriod] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedActivityId, setExpandedActivityId] = useState(null);

  const directorId = director?.id;

  const { summary, activities, isLoading, isError } = useGetDirectorActivity(
    directorId,
    period
  );

  if (!isOpen || !director) return null;

  const name = director?.name || summary?.director?.name || "Director";
  const email = director?.email || summary?.director?.email || "";
  const avatar = director?.avatar || summary?.director?.avatar;
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const filteredActivities = activities.filter((act) => {
    if (typeFilter === "all") return true;
    return act.type === typeFilter;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-gray-100 flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#1E3A5F] to-[#2A4C7E] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg border border-white/10">
                  {initials}
                </div>
              )}
              <div>
                <h3 className="text-base md:text-lg font-bold capitalize flex items-center gap-2">
                  <Activity size={18} className="text-[#9DB8D9]" /> {name}'s Activity Audit Log
                </h3>
                <p className="text-xs text-white/80">{email}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Controls: Period Filter Chips & Type Selector */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
              {[
                { id: "all", label: "All Time" },
                { id: "7_days", label: "7 Days" },
                { id: "30_days", label: "30 Days" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    period === p.id
                      ? "bg-[#1E3A5F] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] cursor-pointer w-full sm:w-auto"
              >
                <option value="all">All Event Types ({activities.length})</option>
                <option value="task_comment">💬 Comments ({activities.filter((a) => a.type === "task_comment").length})</option>
                <option value="task">📋 Tasks ({activities.filter((a) => a.type === "task").length})</option>
                <option value="incident">🚨 Incidents ({activities.filter((a) => a.type === "incident").length})</option>
                <option value="maintenance">🔧 Maintenance ({activities.filter((a) => a.type === "maintenance").length})</option>
                <option value="waitlist">⏳ Waitlist ({activities.filter((a) => a.type === "waitlist").length})</option>
              </select>
            </div>
          </div>

          {/* Activity Feed Body */}
          <div className="p-5 space-y-3 overflow-y-auto flex-1 bg-gray-50/50">
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 size={32} className="animate-spin mx-auto text-[#1E3A5F]" />
                <p className="text-xs text-gray-500 font-medium">Fetching director activity logs...</p>
              </div>
            ) : isError ? (
              <div className="py-12 text-center bg-red-50 text-red-700 rounded-xl border border-red-200 p-4">
                <ShieldAlert size={28} className="mx-auto mb-2 text-red-500" />
                <p className="text-sm font-bold">Failed to load activity logs</p>
                <p className="text-xs text-red-600 mt-0.5">Check API connection for director ID: {directorId}</p>
              </div>
            ) : filteredActivities.length > 0 ? (
              filteredActivities.map((act, index) => {
                const config = ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.default;
                const IconComponent = config.icon;
                const isExpanded = expandedActivityId === (act.raw?.id || index);

                return (
                  <motion.div
                    key={act.raw?.id || index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white rounded-xl p-3.5 shadow-2xs border border-gray-200/80 hover:border-gray-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-xl border ${config.bg} shrink-0 mt-0.5`}>
                          <IconComponent size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h4 className="text-xs font-bold text-gray-900 truncate">{act.title}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700">
                              {act.category_label || act.type}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 font-medium leading-normal">
                            {act.description}
                          </p>

                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-medium">
                            <span className="flex items-center gap-1 text-[#1E3A5F] font-bold">
                              <Clock size={11} /> {act.display_date} at {formatTime(act.timestamp)}
                            </span>
                            <span>•</span>
                            <span>
                              {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {act.raw && (
                        <button
                          onClick={() => setExpandedActivityId(isExpanded ? null : (act.raw?.id || index))}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </div>

                    {isExpanded && act.raw && (
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                        <div className="p-2.5 bg-gray-900 rounded-lg text-emerald-400 font-mono text-[10px] overflow-x-auto shadow-inner">
                          <p className="text-[9px] text-gray-400 font-sans uppercase font-bold mb-1">
                            Raw Event Payload
                          </p>
                          <pre>{JSON.stringify(act.raw, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="py-12 text-center bg-white rounded-xl border border-dashed border-gray-200 space-y-1">
                <ListFilter size={32} className="mx-auto text-gray-300" />
                <p className="text-xs font-bold text-gray-700">No activity logs recorded for this period</p>
                <p className="text-[11px] text-gray-400">Try switching filters or period.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
            <span className="text-xs text-gray-500 font-medium">
              Showing <strong>{filteredActivities.length}</strong> of <strong>{activities.length}</strong> activity entries
            </span>
            <Button onClick={onClose} variant="outline" className="text-xs h-8">
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DirectorActivityModal;
