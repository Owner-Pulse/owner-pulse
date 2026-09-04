import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  MessageSquare,
  ClipboardList,
  ShieldAlert,
  Wrench,
  Calendar,
  User,
  Filter,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  ListFilter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const DirectorActivityTab = ({ directors = [] }) => {
  const [selectedDirectorId, setSelectedDirectorId] = useState(
    directors.length > 0 ? directors[0].id : 1
  );
  const [period, setPeriod] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedActivityId, setExpandedActivityId] = useState(null);

  const { activityData, summary, activities, isLoading, isError } = useGetDirectorActivity(
    selectedDirectorId,
    period
  );

  const currentDirector = directors.find((d) => d.id === Number(selectedDirectorId)) || summary?.director;

  const filteredActivities = activities.filter((act) => {
    if (typeFilter === "all") return true;
    return act.type === typeFilter;
  });

  return (
    <div className="space-y-6">
      {/* ── Control Header: Director Selector & Period Filter Chips ── */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Director Dropdown */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F]">
            <User size={20} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Select Director
            </label>
            <select
              value={selectedDirectorId}
              onChange={(e) => setSelectedDirectorId(Number(e.target.value))}
              className="h-9 font-semibold text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-2.5 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] cursor-pointer"
            >
              {directors.length > 0 ? (
                directors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.email})
                  </option>
                ))
              ) : (
                <option value={1}>Director Account (#1)</option>
              )}
            </select>
          </div>
        </div>

        {/* Period & Activity Type Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Chips */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
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

          {/* Type Filter Select */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] cursor-pointer"
          >
            <option value="all">All Event Types</option>
            <option value="task_comment">💬 Comments ({activities.filter(a => a.type === "task_comment").length})</option>
            <option value="task">📋 Tasks ({activities.filter(a => a.type === "task").length})</option>
            <option value="incident">🚨 Incidents ({activities.filter(a => a.type === "incident").length})</option>
            <option value="maintenance">🔧 Maintenance ({activities.filter(a => a.type === "maintenance").length})</option>
            <option value="waitlist">⏳ Waitlist ({activities.filter(a => a.type === "waitlist").length})</option>
          </select>
        </div>
      </div>

      {/* ── Summary Profile Header Card ── */}
      {summary && (
        <Card className="bg-gradient-to-r from-[#1E3A5F] to-[#2A4C7E] text-white border-none shadow-md overflow-hidden">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {summary.director?.avatar ? (
                <img
                  src={summary.director.avatar}
                  alt={summary.director.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-xl border border-white/10">
                  {summary.director?.name?.[0]?.toUpperCase() || "D"}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold capitalize">{summary.director?.name || currentDirector?.name}</h3>
                <p className="text-xs text-white/80">{summary.director?.email || currentDirector?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                    <Activity size={10} /> {summary.total_activities || activities.length} Audit Events Logged
                  </span>
                  <span className="text-[10px] text-white/70 capitalize">Period: {summary.period || period}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs text-center min-w-24">
                <span className="text-2xl font-black">{activities.length}</span>
                <p className="text-[10px] text-white/70">Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Activity Timeline List ── */}
      {isLoading ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 space-y-3">
          <Loader2 size={32} className="animate-spin mx-auto text-[#1E3A5F]" />
          <p className="text-xs text-gray-500 font-medium">Fetching director activity audit log...</p>
        </div>
      ) : isError ? (
        <div className="py-12 text-center bg-red-50 text-red-700 rounded-2xl border border-red-200 p-4">
          <ShieldAlert size={28} className="mx-auto mb-2 text-red-500" />
          <p className="text-sm font-bold">Failed to load director activity</p>
          <p className="text-xs text-red-600 mt-0.5">Please check network or backend endpoint connection.</p>
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="space-y-3">
          {filteredActivities.map((act, index) => {
            const config = ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.default;
            const IconComponent = config.icon;
            const isExpanded = expandedActivityId === (act.raw?.id || index);

            return (
              <motion.div
                key={act.raw?.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 hover:border-gray-200 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Activity Icon Badge */}
                    <div className={`p-2.5 rounded-xl border ${config.bg} shrink-0 mt-0.5`}>
                      <IconComponent size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{act.title}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700">
                          {act.category_label || act.type}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {act.description}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1 text-[#1E3A5F] font-semibold">
                          <Clock size={12} /> {act.display_date} at {formatTime(act.timestamp)}
                        </span>
                        <span>•</span>
                        <span>Timestamp: {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Raw Detail Dropdown */}
                  {act.raw && (
                    <button
                      onClick={() => setExpandedActivityId(isExpanded ? null : (act.raw?.id || index))}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      title="Toggle audit JSON detail"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                </div>

                {/* Expanded Raw Audit Details */}
                <AnimatePresence>
                  {isExpanded && act.raw && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-gray-100 overflow-hidden"
                    >
                      <div className="p-3 bg-gray-900 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto shadow-inner">
                        <p className="text-[10px] text-gray-400 font-sans uppercase font-bold mb-1">
                          Raw Audit Log Payload
                        </p>
                        <pre>{JSON.stringify(act.raw, null, 2)}</pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 space-y-2">
          <ListFilter size={36} className="mx-auto text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">No activity logs recorded for this period</p>
          <p className="text-xs text-gray-400">Try selecting a different time period or director.</p>
        </div>
      )}
    </div>
  );
};

export default DirectorActivityTab;
