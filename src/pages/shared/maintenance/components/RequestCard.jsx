import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, User, CheckCircle2, Clock, Trash2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PriorityTag from "./PriorityTag";
import StatusTag from "./StatusTag";

const fmtDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const daysSince = (dateStr) => {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 86400000);
  return diff < 0 ? 0 : diff;
};
const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const RequestCard = ({ req, status, onUpdateStatus, onDelete, onEdit, isOwner }) => {
  const days = daysSince(req.logged);
  const isDone = status === "done";
  const borderColor = isDone ? "border-l-[#3E7A54]"
    : req.priority === "critical" ? "border-l-[#AE4A3E]"
      : req.priority === "high" ? "border-l-[#B78A2F]"
        : req.priority === "medium" ? "border-l-[#1E3A5F]"
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
            <div className="text-right shrink-0 flex flex-col items-end gap-1">
              {req.estCost > 0 && (
                <div>
                  <span className="text-sm font-bold text-gray-900">{fmtMoney(req.estCost)}</span>
                  <p className="text-[10px] text-gray-400">estimated</p>
                </div>
              )}
              <div className="flex items-center gap-1">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(req);
                    }}
                    className="text-gray-400 hover:text-[#1E3A5F] transition-colors p-1.5 rounded-lg hover:bg-[#1E3A5F]/10"
                    title="Edit Request"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(req);
                    }}
                    className="text-gray-400 hover:text-[#8A362C] transition-colors p-1.5 rounded-lg hover:bg-[#AE4A3E]/10"
                    title="Delete Request"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {isOwner && !isDone && (
            <div className="mt-3 flex gap-1.5">
              {["open", "in_progress", "done"].map((s) => (
                <button key={s} onClick={() => onUpdateStatus(req.id, s)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                    status === s
                      ? s === "done" ? "bg-[#3E7A54] text-white"
                        : s === "in_progress" ? "bg-[#1E3A5F] text-white"
                        : "bg-gray-500 text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                  }`}>
                  {s === "done" ? "✓ Complete" : s === "in_progress" ? "⟳ In Progress" : "○ Open"}
                </button>
              ))}
            </div>
          )}
          
          {!isOwner && status === "open" && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-400">
              <Clock size={10} /> Awaiting owner review
            </div>
          )}
          {!isOwner && status === "in_progress" && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#1E3A5F] font-medium">
              <Clock size={10} /> Being worked on
            </div>
          )}
          {!isOwner && status === "done" && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#2F6042] font-medium">
              <CheckCircle2 size={10} /> Resolved by owner
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RequestCard;
