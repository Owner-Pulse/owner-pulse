import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, User, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PriorityTag from "./PriorityTag";
import StatusTag from "./StatusTag";

const TODAY = new Date("2026-05-11");
const fmtDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const daysSince = (dateStr) => Math.floor((TODAY - new Date(dateStr)) / 86400000);
const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const RequestCard = ({ req, status, onUpdateStatus, isOwner }) => {
  const days = daysSince(req.logged);
  const isDone = status === "done";
  const borderColor = isDone ? "border-l-emerald-500"
    : req.priority === "critical" ? "border-l-red-500"
    : req.priority === "high" ? "border-l-orange-500"
    : req.priority === "medium" ? "border-l-amber-500"
    : "border-l-gray-400";

  return (
    <motion.div variants={itemVariants}>
      <Card className={`bg-white border-none shadow-sm hover:shadow-md transition-all border-l-4 ${borderColor} ${isDone ? "opacity-60" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">{req.issue}</h3>
                <PriorityTag priority={req.priority} />
                <StatusTag status={status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={10} /> {req.location}</span>
                <span className="flex items-center gap-1"><Calendar size={10} /> {fmtDate(req.logged)} ({days}d ago)</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                <User size={10} /> Submitted by {req.submittedBy}
              </div>
              {req.assignedLabel && (
                <div className="flex items-center gap-1 mt-0.5 text-[10px] font-medium" style={{ color: "#6B7280" }}>
                  <span>→ Assigned to: {req.assignedLabel}</span>
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              {req.estCost > 0 && (
                <>
                  <span className="text-sm font-bold text-gray-900">{fmtMoney(req.estCost)}</span>
                  <p className="text-[10px] text-gray-400">estimated</p>
                </>
              )}
            </div>
          </div>

          {isOwner && !isDone && (
            <div className="mt-3 flex gap-1.5">
              {["open", "in_progress", "done"].map((s) => (
                <button key={s} onClick={() => onUpdateStatus(req.id, s)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                    status === s
                      ? s === "done" ? "bg-emerald-500 text-white"
                        : s === "in_progress" ? "bg-blue-500 text-white"
                        : "bg-gray-500 text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                  }`}>
                  {s === "done" ? "✓ Complete" : s === "in_progress" ? "⟳ In Progress" : "○ Open"}
                </button>
              ))}
            </div>
          )}
          {isDone && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle2 size={12} />
              <span className="font-medium">Completed</span>
              {isOwner && (
                <button onClick={() => onUpdateStatus(req.id, "open")} className="text-gray-400 hover:text-gray-600 ml-auto">Reopen</button>
              )}
            </div>
          )}
          {!isOwner && status === "open" && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-400">
              <Clock size={10} /> Awaiting owner review
            </div>
          )}
          {!isOwner && status === "in_progress" && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-500 font-medium">
              <Clock size={10} /> Being worked on
            </div>
          )}
          {!isOwner && status === "done" && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium">
              <CheckCircle2 size={10} /> Resolved by owner
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RequestCard;
