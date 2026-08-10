import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CheckCircle2, ClipboardList, Trash2, AlertTriangle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PriorityTag from "./PriorityTag";
import StatusTag from "./StatusTag";
import AssigneeTag from "./AssigneeTag";
import { useInProgressTask, useCompleteTask, useDeleteTask } from "@/hooks/owner-task-assign";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const TaskCard = ({ task, status, currentRole, daysUntil, onUpdateStatus }) => {
  const { inProgressTask, isPending: isInProgressPending } = useInProgressTask();
  const { completeTask, isPending: isCompleting } = useCompleteTask();
  const { deleteTask, isPending: isDeleting } = useDeleteTask();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const days = daysUntil(task.due);
  const isDone = status === "done" || status === "completed";
  const isOverdue = days < 0 && !isDone;
  const isDueSoon = days >= 0 && days <= 3 && !isDone;

  const isForMe = task.assignee === currentRole;
  const isCreator = task.assignedBy === currentRole;
  const isActionDisabled = currentRole === "owner" && task.assignedBy === "owner";

  const handleDelete = async () => {
    await deleteTask(task.id);
    setShowDeleteModal(false);
  };

  return (
    <>
    <motion.div variants={itemVariants}>
      <Card
        className={`bg-white border-none shadow-sm transition-all ${isDone ? "opacity-60" : ""} ${isForMe ? "border-l-4 border-l-blue-400" : ""}`}
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
            <div className="shrink-0 hidden sm:flex items-center gap-2">
              {isCreator ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs bg-red-50 text-red-600 hover:bg-red-100 border-none px-2"
                  onClick={() => {
                    setDeleteInput("");
                    setShowDeleteModal(true);
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 size={12} className="mr-1" />
                  Delete
                </Button>
              ) : (
                <>
                  {status === "open" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-none px-2"
                      onClick={() => inProgressTask(task.id)}
                      disabled={isActionDisabled || isInProgressPending}
                    >
                      {isInProgressPending ? "Processing..." : "Progress"}
                    </Button>
                  )}
                  {status === "in_progress" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none px-2"
                      onClick={() => completeTask(task.id)}
                      disabled={isActionDisabled || isCompleting}
                    >
                      {isCompleting ? "Completing..." : "Done"}
                    </Button>
                  )}
                 
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>

    {/* Delete Confirmation Modal */}
    <AnimatePresence>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Task</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-700">"{task.title}"</span>? This action cannot be undone.
              </p>
              
              <div className="w-full mb-6 text-left">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Type "<strong>Delete</strong>" to confirm
                </label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  placeholder="Delete"
                />
              </div>
              
              <div className="flex items-center gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-10"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteInput("");
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 rounded-xl h-10 text-white ${deleteInput === "Delete" ? "bg-red-600 hover:bg-red-700" : "bg-red-300"}`}
                  onClick={handleDelete}
                  disabled={isDeleting || deleteInput !== "Delete"}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};

export default TaskCard;
