import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, ClipboardList, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PriorityTag from "./PriorityTag";
import StatusTag from "./StatusTag";
import AssigneeTag from "./AssigneeTag";
import { useOwnerTaskActions, useDirectorTaskActions } from "@/hooks/useTaskActions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// Wrapper that calls owner hooks
const OwnerTaskCard = (props) => {
  const actions = useOwnerTaskActions();
  return <TaskCardInner {...props} {...actions} />;
};

// Wrapper that calls director hooks
const DirectorTaskCard = (props) => {
  const actions = useDirectorTaskActions();
  return <TaskCardInner {...props} {...actions} />;
};

// Main export: picks the right wrapper based on role
const TaskCard = (props) => {
  if (props.currentRole === "director") return <DirectorTaskCard {...props} />;
  return <OwnerTaskCard {...props} />;
};

const TaskCardInner = ({ task, status, currentRole, daysUntil, onUpdateStatus, inProgressTask, isInProgressPending, completeTask, isCompleting, deleteTask, isDeleting }) => {

  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        className={`bg-white border-none shadow-sm transition-all ${isDone ? "opacity-60" : ""} ${isForMe ? "border-l-4 border-l-[#1E3A5F]" : ""}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Status checkbox */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isDone ? "bg-[#3E7A54] border-[#3E7A54]" : isOverdue ? "border-[#AE4A3E]" : isDueSoon ? "border-[#B78A2F]" : "border-gray-300"}`}>
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
                  {isForMe && <span className="text-[9px] md:text-[10px] font-bold text-[#1E3A5F] bg-[#1E3A5F]/10 px-1.5 py-0.5 rounded-full">Mine</span>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-[#8A362C] font-semibold" : isDueSoon ? "text-[#8F6A1F] font-semibold" : "text-gray-400"}`}>
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
                  className="h-7 text-xs bg-[#AE4A3E]/10 text-[#8A362C] hover:bg-[#AE4A3E]/20 border-none px-2"
                  onClick={() => setShowDeleteModal(true)}
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
                      className="h-7 text-xs bg-[#1E3A5F]/10 text-[#1E3A5F] hover:bg-[#1E3A5F]/20 border-none px-2"
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
                      className="h-7 text-xs bg-[#3E7A54]/10 text-[#2F6042] hover:bg-[#3E7A54]/20 border-none px-2"
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
    <DeleteConfirmationModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={handleDelete}
      title="Delete Task"
      itemName={task.title}
      confirmText="Delete"
      isLoading={isDeleting}
    />
    </>
  );
};

export default TaskCard;
