import React from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PriorityTag from "./PriorityTag";
import StatusTag from "./StatusTag";
import AssigneeTag from "./AssigneeTag";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const TaskCard = ({ task, status, currentRole, daysUntil, onToggle }) => {
  const days = daysUntil(task.due);
  const isOverdue = days < 0 && status !== "done";
  const isDueSoon = days >= 0 && days <= 3 && status !== "done";
  const isDone = status === "done";
  const isForMe = task.assignee === currentRole;

  return (
    <motion.div variants={itemVariants}>
      <Card
        className={`bg-white border-none shadow-sm hover:shadow-md transition-all cursor-pointer ${isDone ? "opacity-60" : ""} ${isForMe ? "border-l-4 border-l-blue-400" : ""}`}
        onClick={onToggle}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Status checkbox */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isDone ? "bg-emerald-500 border-emerald-500" : isOverdue ? "border-red-400" : isDueSoon ? "border-amber-400" : "border-gray-300"}`}>
              {isDone && <CheckCircle2 size={14} className="text-white" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-1.5 flex-wrap">
                <span className={`text-xs md:text-sm font-semibold leading-snug ${isDone ? "text-gray-400 line-through" : "text-gray-900"}`}>{task.title}</span>
                <div className="flex flex-wrap items-center gap-1">
                  <PriorityTag priority={task.priority} />
                  <StatusTag status={status} />
                  <AssigneeTag assignee={task.assignee} />
                  {isForMe && <span className="text-[9px] md:text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Mine</span>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-500 font-semibold" : isDueSoon ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                  <Calendar size={10} /> Due {fmtDate(task.due)}
                  {isOverdue && ` · ${Math.abs(days)}d overdue`}
                  {isDueSoon && ` · ${days}d left`}
                </span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">By {task.assignedBy}</span>
              </div>
            </div>
            <div className="text-[9px] md:text-[10px] text-gray-300 shrink-0 hidden sm:block">
              {!isDone ? "Click to progress" : "↺"}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskCard;
