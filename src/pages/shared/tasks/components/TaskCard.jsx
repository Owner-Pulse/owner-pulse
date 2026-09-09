import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Trash2,
  Play,
  MessageSquare,
  Crown,
  Send,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PriorityTag from "./PriorityTag";
import StatusTag from "./StatusTag";
import AssigneeTag from "./AssigneeTag";
import EditTaskModal from "./EditTaskModal";
import { useOwnerTaskActions, useDirectorTaskActions } from "@/hooks/useTaskActions";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useGetTaskComments, usePostTaskComment } from "@/hooks/task-comment.hook";
import { useGetUser } from "@/hooks/auth/user-details.hook";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatTime = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const UserAvatar = ({ avatar, name, role }) => {
  const [imgError, setImgError] = useState(false);

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name || "User"}
        onError={() => setImgError(true)}
        className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-200 shadow-2xs"
      />
    );
  }

  const initial = (name || role || "U").charAt(0).toUpperCase();
  const bgClass = role === "owner" ? "bg-amber-600 text-white" : "bg-[#1E3A5F] text-white";

  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 shadow-2xs ${bgClass}`}>
      {initial}
    </div>
  );
};

/**
 * Facebook-style inline comment thread section
 */
const InlineTaskComments = ({ taskId, currentRole }) => {
  const { user } = useGetUser();
  const { comments, isLoading } = useGetTaskComments(taskId, true);
  const { postComment, isPending } = usePostTaskComment();
  const [newCommentText, setNewCommentText] = useState("");

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || isPending) return;

    const textToSubmit = newCommentText.trim();
    setNewCommentText("");

    try {
      await postComment({ taskId, commentText: textToSubmit });
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || "Failed to post comment");
    }
  };

  return (
    <div className="pt-3 border-t border-slate-100 mt-3 space-y-3 animate-fadeIn">
      {/* Comments List Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span className="flex items-center gap-1.5 text-slate-700 font-bold">
          <MessageSquare size={13} className="text-[#1E3A5F]" />
          Comments ({comments.length})
        </span>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-xs text-slate-400 gap-2">
          <Loader2 size={14} className="animate-spin text-[#1E3A5F]" /> Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2 pl-2">
          No comments yet. Write a comment below.
        </p>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {comments.map((item) => {
            const authorName = item.user?.name || (item.user_id === 1 ? "Director" : "Owner");
            const authorRole = item.user?.role || "user";
            const commentText = item.comment;
            const createdAt = item.created_at || item.createdAt;

            return (
              <div key={item.id || Math.random()} className="flex items-start gap-2.5">
                <UserAvatar avatar={item.user?.avatar} name={authorName} role={authorRole} />

                <div className="flex-1 min-w-0">
                  {/* Facebook-style Bubble */}
                  <div className="bg-slate-100/90 hover:bg-slate-100 rounded-2xl px-3.5 py-2 inline-block max-w-full text-xs text-gray-900 border border-slate-200/60 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-0.5">
                      <span>{authorName}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${authorRole === "owner"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                      >
                        {authorRole}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words leading-relaxed text-gray-800">
                      {commentText}
                    </p>
                  </div>

                  {/* Time display */}
                  {createdAt && (
                    <div className="text-[10px] text-slate-400 mt-0.5 pl-2 flex items-center gap-1">
                      <Clock size={9} />
                      <span>{formatTime(createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Comment Input */}
      <form onSubmit={handlePostComment} className="flex items-center gap-2 pt-1">
        <UserAvatar avatar={user?.avatar} name={user?.name} role={currentRole} />
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Write a comment..."
          disabled={isPending}
          className="flex-1 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs px-3.5 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition-all"
        />
        <Button
          type="submit"
          disabled={isPending || !newCommentText.trim()}
          className="bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-full p-2 h-8 w-8 shrink-0 flex items-center justify-center shadow-2xs disabled:opacity-40"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        </Button>
      </form>
    </div>
  );
};

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
  const [showComments, setShowComments] = useState(false);

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

  const isFromOwner = assignedByRole.includes("owner") || task.creatorId === 2 || task.raw?.created_by === 2;

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
          className={`bg-white border-none shadow-xs transition-all ${isDone ? "opacity-60" : ""
            } ${isFromOwner
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
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isForMe ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                    } ${isDone
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
                      className={`text-xs md:text-sm font-semibold leading-snug ${isDone ? "text-gray-400 line-through" : "text-gray-900"
                        }`}
                    >
                      {task.title}
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
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
                      className={`text-xs flex items-center gap-1 ${isOverdue
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

                {/* View Comments toggle button */}
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-7 text-xs border-none px-2.5 font-medium flex items-center gap-1 transition-all ${showComments
                      ? "bg-[#1E3A5F] text-white hover:bg-[#15294A]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  onClick={() => setShowComments((prev) => !prev)}
                  title={showComments ? "Hide comments" : "View comments"}
                >
                  <MessageSquare size={11} />
                  <span>{showComments ? "Hide Comments" : "View Comments"}</span>
                  {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
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

            {/* Inline Facebook-style Comments Section */}
            {showComments && (
              <InlineTaskComments
                taskId={task.id}
                currentRole={currentRole}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

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
      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Task"
          itemName={task.title}
          confirmText="Delete"
          isLoading={isDeleting}
        />
      )}
    </>
  );
};

export default TaskCard;
