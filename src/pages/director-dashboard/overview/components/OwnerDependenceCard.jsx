import React from "react";
import { motion } from "framer-motion";
import { UserCheck, ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const BREAKDOWN_LABELS = {
  incidents: "Incidents",
  staff_pto_logs: "PTO",
  staff_substitute_logs: "Substitutes",
  waitlists: "Waitlist",
  maintenance_requests: "Maintenance",
  at_risk_students: "At-Risk",
  student_removals: "Removals",
  director_tasks: "Tasks to Owner",
  standalone_escalations: "Standalone",
};

// Why items were sent to the Owner — one color per reason
const REASON_CHIPS = [
  { key: "approval", label: "Approval", className: "bg-[#1E3A5F]/10 text-[#1E3A5F]" },
  { key: "outside_authority", label: "Outside authority", className: "bg-purple-100 text-purple-800" },
  { key: "financial_limit", label: "Financial limit", className: "bg-[#B78A2F]/15 text-[#8F6A1F]" },
  { key: "safety_legal", label: "Safety / legal", className: "bg-[#AE4A3E]/10 text-[#8A362C]" },
  { key: "other", label: "Other", className: "bg-gray-100 text-gray-600" },
];

const OwnerDependenceCard = ({ data }) => {
  const totalLoggedItems = data?.total_logged_items ?? 0;
  const hasData = data?.rate_pct != null && totalLoggedItems > 0;
  const ratePct = hasData ? data.rate_pct : 0;
  const escalatedCount = data?.escalated_count ?? 0;
  const trendDir = hasData ? data.trend : null;
  const sources = data?.breakdown || {};
  const breakdown = Object.entries(BREAKDOWN_LABELS)
    .filter(([key]) => sources[key] > 0)
    .map(([key, label]) => `${label} ${sources[key]}`)
    .join(" · ");
  const byReason = sources.escalations_by_reason || data?.escalations_by_reason || {};
  const reasonChips = REASON_CHIPS.filter((chip) => byReason[chip.key] > 0);
  const escalatedDetail = [
    sources.director_tasks > 0 && `${sources.director_tasks} tasks`,
    sources.maintenance_high_critical > 0 && `${sources.maintenance_high_critical} urgent maintenance`,
  ]
    .filter(Boolean)
    .join(", ");

  const isHealthy = ratePct <= 20;
  const accent = !hasData ? "#94A0B5" : isHealthy ? "#2F6042" : "#8A362C";
  const statusLabel = !hasData ? "No data yet" : isHealthy ? "Healthy (20% or less)" : "High dependence";

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden py-0 gap-0">
        <div className="px-4 py-2.5 flex items-center justify-between gap-2 text-white" style={{ backgroundColor: accent }}>
          <div className="flex items-center gap-2 min-w-0">
            <UserCheck size={18} className="shrink-0" />
            <p className="text-sm font-bold break-words">Owner Dependence Index (30-day)</p>
          </div>
          <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full shrink-0">
            {statusLabel}
          </span>
        </div>
        <CardContent className="p-4 space-y-3 border-l-4" style={{ borderLeftColor: accent }}>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-gray-500 font-medium">
              Routed to Owner: <strong className="text-gray-900">{escalatedCount}</strong>
              {escalatedDetail && ` (${escalatedDetail})`} · Total logs:{" "}
              <strong className="text-gray-900">{totalLoggedItems}</strong>
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-4xl md:text-5xl font-black leading-none tabular-nums" style={{ color: accent }}>
                {ratePct}%
              </span>
              {trendDir === "down" && (
                <span className="p-1 rounded-full bg-emerald-50 text-emerald-700" title="Owner dependence is decreasing">
                  <ArrowDownRight size={16} />
                </span>
              )}
              {trendDir === "up" && (
                <span className="p-1 rounded-full bg-red-50 text-red-700" title="Owner dependence is increasing">
                  <ArrowUpRight size={16} />
                </span>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1E3A5F]/[0.03] border border-[#1E3A5F]/10 flex items-start gap-2">
            <Info size={13} className="text-[#1E3A5F] shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-600 leading-normal font-medium">
              Shows how much the Director relies on the Owner. A lower number means the business runs well without the Owner.
            </p>
          </div>

          {breakdown && (
            <p className="text-[11px] text-gray-500 font-medium break-words">{breakdown}</p>
          )}

          {reasonChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reasons</span>
              {reasonChips.map((chip) => (
                <span key={chip.key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${chip.className}`}>
                  {chip.label} <span className="tabular-nums">{byReason[chip.key]}</span>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OwnerDependenceCard;
