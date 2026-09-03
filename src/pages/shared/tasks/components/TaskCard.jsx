import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, ClipboardList, Trash2, Pencil, Play, MessageSquare, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PriorityTag from "./PriorityTag";
import StatusTag from "./StatusTag";
import AssigneeTag from "./AssigneeTag";
import EditTaskModal from "./EditTaskModal";
import TaskCommentsModal from "./TaskCommentsModal";
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

const TaskCardInner = ({
  task,
  status,
  currentRole,
  daysUntil,
  inProgressTask,
  isInProgressPending,
  completeTask,
  isCompleting,
  updateTask,
  isUpdating,
  deleteTask,
  isDeleting,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState(task.comments || []);

  const days = daysUntil(task.due);
  const isDone = status === "done" || status === "completed";
  const isOverdue = days < 0 && !isDone;
  const isDueSoon = days >= 0 && days <= 3 && !isDone;

  const assigneeRole = (typeof task.assignee === "string" ? task.assignee : task.assignee?.role || "").toLowerCase();
  const userRole = (currentRole || "").toLowerCase();
  const isForMe = assigneeRole === userRole;
  const assignedByRole = (typeof task.assignedBy === "string" ? task.assignedBy : task.assignedBy?.role || "").toLowerCase();
  const isCreator = assignedByRole === userRole;
  const canEditOrDelete = isCreator || userRole === "owner" || isForMe;

  // Requirement B-06: FROM OWNER identification
  const isFromOwner = assignedByRole.includes("owner") || task.creatorId === 2 || task.raw?.created_by === 2;

  const handleAddComment = (taskId, text) => {
    const newComm = {
      id: Date.now(),
      author: userRole === "owner" ? "School Owner" : "Director",
      role: userRole,
      text,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComm]);
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    setShowDeleteModal(false);
  };

  const handleToggleStatus = () => {
    if (!isForMe || isInProgressPending || isCompleting) return;
    if (isDone) {
      inProgressTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  return (
    <>
      <motion.div variants={itemVariants}>
        <Card
          className={`bg-white border-none shadow-sm transition-all ${
            isDone ? "opacity-60" : ""
          } ${
            isFromOwner
              ? "border-l-4 border-l-[#B78A2F] bg-gradient-to-r from-amber-50/30 via-white to-white"
              : isForMe
              ? "border-l-4 border-l-[#1E3A5F]"
              : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Status checkbox */}
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={!isForMe || isInProgressPending || isCompleting}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isForMe ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  } ${
                    isDone
                      ? "bg-[#3E7A54] border-[#3E7A54]"
                      : isOverdue
                      ? "border-[#AE4A3E] hover:bg-[#AE4A3E]/10"
                      : isDueSoon
                      ? "border-[#B78A2F] hover:bg-[#B78A2F]/10"
                      : "border-gray-300 hover:border-[#1E3A5F]"
                  }`}
                  title={!isForMe ? "Only assigned role can update status" : isDone ? "Re-open Task" : "Complete Task"}
                >
                  {isCompleting || isInProgressPending ? (
                    <div className="w-2.5 h-2.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    isDone && <CheckCircle2 size={14} className="text-white" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5 flex-wrap">
                    <span
                      className={`text-xs md:text-sm font-semibold leading-snug ${
                        isDone ? "text-gray-400 line-through" : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      {/* B-06: Distinct FROM OWNER Badge */}
                      {isFromOwner && (
                        <span className="text-[9px] md:text-[10px] font-extrabold text-[#8F6A1F] bg-[#B78A2F]/15 border border-[#B78A2F]/30 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Crown size={10} className="text-[#8F6A1F]" />
                          FROM OWNER
                        </span>
                      )}
                      <PriorityTag priority={task.priority} />
                      <StatusTag status={status} />
                      <AssigneeTag assignee={task.assignee} />
                      {isForMe && !isFromOwner && (
                        <span className="text-[9px] md:text-[10px] font-bold text-[#1E3A5F] bg-[#1E3A5F]/10 px-1.5 py-0.5 rounded-full">
                          Mine
                        </span>
                      )}
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span
                      className={`text-xs flex items-center gap-1 ${
                        isOverdue
                          ? "text-[#8A362C] font-semibold"
                          : isDueSoon
                          ? "text-[#8F6A1F] font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      <Calendar size={10} /> Due {fmtDate(task.due)}
                      {isOverdue && ` · ${Math.abs(days)}d overdue`}
                      {isDueSoon && ` · ${days}d left`}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">By {task.assignedBy}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-center">
                {/* Status action buttons */}
                {isForMe && (status === "open" || status === "pending") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs bg-[#1E3A5F]/10 text-[#1E3A5F] hover:bg-[#1E3A5F]/20 border-none px-2 font-medium"
                    onClick={() => inProgressTask(task.id)}
                    disabled={isInProgressPending}
                  >
                    <Play size={11} className="mr-1" />
                    {isInProgressPending ? "Updating..." : "In Progress"}
                  </Button>
                )}
                {isForMe && (status === "in_progress" || status === "delayed") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs bg-[#3E7A54]/10 text-[#2F6042] hover:bg-[#3E7A54]/20 border-none px-2 font-medium"
                    onClick={() => completeTask(task.id)}
                    disabled={isCompleting}
                  >
                    <CheckCircle2 size={11} className="mr-1" />
                    {isCompleting ? "Completing..." : "Complete"}
                  </Button>
                )}

                {/* B-05: Discussion / Comments button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-none px-2 font-medium flex items-center gap-1"
                  onClick={() => setShowCommentsModal(true)}
                  title="Open task comments & updates"
                >
                  <MessageSquare size={11} />
                  <span>Comments</span>
                  {comments.length > 0 && (
                    <span className="bg-[#1E3A5F] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                      {comments.length}
                    </span>
                  )}
                </Button>

                {/* Delete Task button */}
                {canEditOrDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs bg-[#AE4A3E]/10 text-[#8A362C] hover:bg-[#AE4A3E]/20 border-none px-2 font-medium"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 size={11} className="mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comments Thread Modal */}
      <TaskCommentsModal
        isOpen={showCommentsModal}
        task={task}
        currentRole={currentRole}
        comments={comments}
        onAddComment={handleAddComment}
        onClose={() => setShowCommentsModal(false)}
      />

      {/* Edit Task Modal */}
      {showEditModal && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          currentRole={currentRole}
          updateTask={updateTask}
          isUpdating={isUpdating}
        />
      )}

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
