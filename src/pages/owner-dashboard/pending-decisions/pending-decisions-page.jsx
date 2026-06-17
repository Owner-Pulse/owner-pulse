import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  CheckCheck,
  Send,
  UserCheck,
  FileSignature,
  Phone,
  Users,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEscalations, updateEscalationStatus } from "@/lib/escalation-store";

// ─── Action Icon Map ──────────────────────────────────────────────
const ACTION_ICONS = {
  approve_reject: { icon: CheckCircle2, label: "Approve / Reject", color: "text-blue-600", bg: "bg-blue-50" },
  decide_options: { icon: HelpCircle, label: "Decide between options", color: "text-purple-600", bg: "bg-purple-50" },
  call_vendor: { icon: Phone, label: "Call a vendor", color: "text-amber-600", bg: "bg-amber-50" },
  call_parent: { icon: Users, label: "Call a parent / family", color: "text-emerald-600", bg: "bg-emerald-50" },
  sign_document: { icon: FileSignature, label: "Sign or authorize a document", color: "text-orange-600", bg: "bg-orange-50" },
  other: { icon: Send, label: "Other", color: "text-gray-600", bg: "bg-gray-50" },
};

const WHY_LABELS = {
  approval: "Approval needed",
  outside_authority: "Outside my authority",
  financial_limit: "Financial decision above my limit",
  safety_legal: "Safety / legal / regulatory",
  other: "Other",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", {
  month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
});

const PendingDecisionsPage = () => {
  const [escalations, setEscalations] = useState(getEscalations);
  const [filterStatus, setFilterStatus] = useState("pending");

  // Refresh on mount + storage events
  useEffect(() => {
    const refresh = () => setEscalations(getEscalations());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const handleAction = (id, status) => {
    updateEscalationStatus(id, status);
    setEscalations(getEscalations());
  };

  const filtered = useMemo(() => {
    if (filterStatus === "pending") return escalations.filter((e) => e.status === "pending");
    if (filterStatus === "resolved") return escalations.filter((e) => e.status !== "pending");
    return escalations;
  }, [escalations, filterStatus]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  [filtered]);

  const stats = useMemo(() => ({
    pending: escalations.filter((e) => e.status === "pending").length,
    approved: escalations.filter((e) => e.status === "approved").length,
    rejected: escalations.filter((e) => e.status === "rejected").length,
    total: escalations.length,
  }), [escalations]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Pending Decisions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.pending > 0
              ? `${stats.pending} escalation${stats.pending > 1 ? "s" : ""} awaiting your decision`
              : stats.total > 0
                ? "All escalations resolved"
                : "No escalations yet"
            }
          </p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock size={16} className="text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-gray-500 font-medium">Pending</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">{stats.approved}</p>
              <p className="text-xs text-gray-500 font-medium">Approved</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <XCircle size={16} className="text-red-500" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-red-600">{stats.rejected}</p>
              <p className="text-xs text-gray-500 font-medium">Rejected</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ArrowUpRight size={16} className="text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-blue-600">{stats.total}</p>
              <p className="text-xs text-gray-500 font-medium">Total Escalated</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filter Chips */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        {[
          { key: "pending", label: "Pending" },
          { key: "resolved", label: "Resolved" },
          { key: "all", label: "All" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterStatus === f.key
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Escalation Cards */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <motion.div variants={itemVariants} className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCheck size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">All caught up!</p>
            <p className="text-xs text-gray-400 mt-1">
              {filterStatus === "pending"
                ? "No items currently awaiting your decision"
                : "No resolved escalations yet"}
            </p>
          </motion.div>
        ) : (
          sorted.map((item) => {
            const actionInfo = ACTION_ICONS[item.action] || ACTION_ICONS.other;
            const ActionIcon = actionInfo.icon;
            const isPending = item.status === "pending";

            return (
              <motion.div key={item.id} variants={itemVariants}>
                <Card className={`bg-white border-none shadow-sm transition-all ${
                  isPending ? "ring-2 ring-amber-200" : "opacity-75"
                }`}>
                  <CardContent className="p-5">
                    {/* Status badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === "pending" ? "bg-amber-100 text-amber-700" :
                        item.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                        item.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {item.status === "pending" ? "Pending" :
                         item.status === "approved" ? "Approved" :
                         item.status === "rejected" ? "Rejected" : "Acknowledged"}
                      </span>
                      <span className="text-[10px] text-gray-400">{fmtDate(item.createdAt)}</span>
                    </div>

                    {/* The two answers at the top (Section 5.4 requirement) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600 mb-1">Why Owner</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {WHY_LABELS[item.why] || item.why}
                        </p>
                        {item.whyOther && (
                          <p className="text-xs text-gray-500 mt-1">"{item.whyOther}"</p>
                        )}
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-purple-600 mb-1">Action needed</p>
                        <div className="flex items-center gap-2">
                          <ActionIcon size={14} className={actionInfo.color} />
                          <p className="text-sm font-semibold text-gray-900">{actionInfo.label}</p>
                        </div>
                        {item.actionOther && (
                          <p className="text-xs text-gray-500 mt-1">"{item.actionOther}"</p>
                        )}
                      </div>
                    </div>

                    {/* Item description */}
                    {item.itemDescription && (
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 mb-4">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Details</p>
                        <p className="text-xs text-gray-700">{item.itemDescription}</p>
                      </div>
                    )}

                    {/* Owner actions for pending items */}
                    {isPending && (
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleAction(item.id, "approved")}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm"
                        >
                          <CheckCircle2 size={14} className="mr-1.5" /> Approve
                        </Button>
                        <Button
                          onClick={() => handleAction(item.id, "rejected")}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs md:text-sm"
                        >
                          <XCircle size={14} className="mr-1.5" /> Reject
                        </Button>
                        <Button
                          onClick={() => handleAction(item.id, "acknowledged")}
                          variant="outline"
                          className="flex-1 text-gray-500 text-xs md:text-sm"
                        >
                          <CheckCheck size={14} className="mr-1.5" /> Acknowledge
                        </Button>
                      </div>
                    )}

                    {/* Show outcome for resolved items */}
                    {!isPending && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                        {item.status === "approved" ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : item.status === "rejected" ? (
                          <XCircle size={14} className="text-red-500" />
                        ) : (
                          <CheckCheck size={14} className="text-gray-400" />
                        )}
                        <span className="text-xs font-medium text-gray-600">
                          {item.status === "approved" ? "Approved — decision logged" :
                           item.status === "rejected" ? "Rejected — Director notified" :
                           "Acknowledged — no action needed"}
                        </span>
                        {item.updatedAt && (
                          <span className="text-[9px] text-gray-400 ml-auto">{fmtDate(item.updatedAt)}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default PendingDecisionsPage;
