import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  CheckCheck,
  ClipboardList,
  Wrench,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EscalationSummary, { EscalationStatusTag } from "@/components/EscalationSummary";
import { useGetEscalations, useResolveEscalation } from "@/hooks/escalation.hook";
import { formatDateTime } from "@/lib/datetime";

const ITEM_TYPES = {
  task: { label: "Task", icon: ClipboardList },
  maintenance: { label: "Maintenance", icon: Wrench },
  standalone: { label: "Standalone", icon: ArrowUpRight },
};

const FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => formatDateTime(d, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const StatCard = ({ icon: Icon, value, label, iconClass, valueClass }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm">
      <CardContent className="p-4 text-center">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${iconClass}`}>
          <Icon size={16} />
        </div>
        <p className={`text-2xl font-extrabold ${valueClass}`}>{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const DecisionCard = ({ escalation, onResolve, isSaving }) => {
  const [note, setNote] = useState("");
  const isPending = escalation.status === "pending";
  const type = ITEM_TYPES[escalation.item?.type] || ITEM_TYPES.standalone;
  const TypeIcon = type.icon;

  const resolve = (status) => onResolve({ id: escalation.id, status, owner_note: note.trim() });

  return (
    <Card className={`bg-white border-none shadow-sm ${isPending ? "ring-2 ring-[#B78A2F]/30" : ""}`}>
      <CardContent className="p-4 md:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] text-[9px] font-extrabold uppercase">
                <TypeIcon size={9} /> {type.label}
              </span>
              <EscalationStatusTag status={escalation.status} />
            </div>
            <h3 className="text-sm md:text-base font-bold text-gray-900 break-words">
              {escalation.item?.title || "Untitled"}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 min-w-0">
              <User size={11} className="shrink-0" />
              <span className="break-words min-w-0">From {escalation.director?.name || "Director"}</span>
            </p>
          </div>
          <span className="text-[10px] text-gray-400 shrink-0 text-right">{fmtDate(escalation.created_at)}</span>
        </div>

        {escalation.context && (
          <p className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 break-words whitespace-pre-wrap">
            {escalation.context}
          </p>
        )}

        <EscalationSummary escalation={escalation} showStatus={false} />

        {isPending ? (
          <div className="space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note for the Director (optional)"
              rows={2}
              disabled={isSaving}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] resize-none"
            />
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => resolve("approved")}
                disabled={isSaving}
                className="bg-[#3E7A54] hover:bg-[#2F6042] text-white text-xs md:text-sm px-2"
              >
                <CheckCircle2 size={14} className="mr-1 shrink-0" /> Approve
              </Button>
              <Button
                onClick={() => resolve("rejected")}
                disabled={isSaving}
                variant="outline"
                className="border-[#AE4A3E]/40 text-[#8A362C] hover:bg-[#AE4A3E]/10 text-xs md:text-sm px-2"
              >
                <XCircle size={14} className="mr-1 shrink-0" /> Reject
              </Button>
              <Button
                onClick={() => resolve("acknowledged")}
                disabled={isSaving}
                variant="outline"
                className="text-gray-600 text-xs md:text-sm px-2"
              >
                <CheckCheck size={14} className="mr-1 shrink-0" /> Acknowledge
              </Button>
            </div>
          </div>
        ) : (
          escalation.resolved_at && (
            <p className="text-[10px] text-gray-400">Resolved {fmtDate(escalation.resolved_at)}</p>
          )
        )}
      </CardContent>
    </Card>
  );
};

const PendingDecisionsPage = () => {
  const [filterStatus, setFilterStatus] = useState("pending");
  const { escalations, counts, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetEscalations("owner", filterStatus);
  const { resolveEscalation, pendingId } = useResolveEscalation();

  const total = counts.pending + counts.approved + counts.rejected + counts.acknowledged;

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Pending Decisions</h1>
        <p className="text-sm text-gray-500 mt-1">
          {counts.pending > 0
            ? `${counts.pending} ${counts.pending === 1 ? "item is" : "items are"} waiting for your decision`
            : total > 0
              ? "Nothing is waiting for your decision"
              : "Directors have not sent anything yet"}
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Clock} value={counts.pending} label="Pending" iconClass="bg-[#B78A2F]/10 text-[#8F6A1F]" valueClass="text-[#8F6A1F]" />
        <StatCard icon={CheckCircle2} value={counts.approved} label="Approved" iconClass="bg-[#3E7A54]/10 text-[#2F6042]" valueClass="text-[#2F6042]" />
        <StatCard icon={XCircle} value={counts.rejected} label="Rejected" iconClass="bg-[#AE4A3E]/10 text-[#8A362C]" valueClass="text-[#8A362C]" />
        <StatCard icon={CheckCheck} value={counts.acknowledged} label="Acknowledged" iconClass="bg-gray-100 text-gray-500" valueClass="text-gray-700" />
      </div>

      {/* Filter Chips */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === f.key ? "bg-[#1E3A5F] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Escalation Cards */}
      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white shadow-sm rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
              <div className="h-16 bg-gray-100 rounded" />
            </div>
          ))
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-gray-500">Could not load decisions.</p>
            <button onClick={() => refetch()} className="mt-2 text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer">
              Try again
            </button>
          </div>
        ) : escalations.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCheck size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {filterStatus === "pending" ? "All caught up" : "Nothing here yet"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {filterStatus === "pending"
                ? "No items are waiting for your decision"
                : filterStatus === "resolved"
                  ? "Decisions you make will be listed here"
                  : "Items sent by Directors will be listed here"}
            </p>
          </div>
        ) : (
          escalations.map((escalation) => (
            <DecisionCard
              key={escalation.id}
              escalation={escalation}
              onResolve={resolveEscalation}
              isSaving={pendingId === escalation.id}
            />
          ))
        )}

        {hasNextPage && (
          <div className="flex justify-center pt-1">
            <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="bg-white text-xs">
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PendingDecisionsPage;
