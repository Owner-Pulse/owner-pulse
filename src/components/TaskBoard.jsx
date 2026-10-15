import React, { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, MessageSquare, MapPin, Wrench, Calendar } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PriorityTag from "@/pages/shared/tasks/components/PriorityTag";
import TaskCommentsModal from "@/pages/shared/tasks/components/TaskCommentsModal";
import { useGetTaskComments, usePostTaskComment } from "@/hooks/task-comment.hook";
import { useGetUser } from "@/hooks/auth/user-details.hook";
import { formatDate, toDate } from "@/lib/datetime";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const COMMENT_PREVIEW_LENGTH = 140;

const fmtDate = (value) => {
  return formatDate(value, { month: "short", day: "numeric" });
};

const timeAgo = (value) => {
  const date = toDate(value);
  if (!date) return "";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(value, { month: "short", day: "numeric" });
};

// ─── Latest comment preview ──────────────────────────────────────
const CommentPreview = ({ comment, unread }) => {
  const [expanded, setExpanded] = useState(false);
  const text = comment.text || "";
  const isLong = text.length > COMMENT_PREVIEW_LENGTH;
  const shown = isLong && !expanded ? `${text.slice(0, COMMENT_PREVIEW_LENGTH).trimEnd()}…` : text;

  return (
    <div
      className={`mt-2 p-2 rounded-lg border text-[11px] leading-relaxed ${
        unread ? "bg-amber-50 border-amber-300 ring-1 ring-amber-200" : "bg-gray-50 border-gray-100"
      }`}
    >
      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
        <MessageSquare size={10} className={unread ? "text-amber-600" : "text-gray-400"} />
        <span className="font-bold text-gray-800 break-words min-w-0">{comment.author_name || "Unknown"}</span>
        <span className="text-gray-400">· {timeAgo(comment.created_at)}</span>
      </div>
      <p className="mt-0.5 text-gray-700 whitespace-pre-wrap break-words">
        {shown}
        {isLong && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="ml-1 font-bold text-[#1E3A5F] hover:underline cursor-pointer"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </p>
    </div>
  );
};

// ─── Task card ───────────────────────────────────────────────────
const TaskItem = ({ task, fromLabel, onOpen }) => {
  const hasUnread = (task.unread_comments || 0) > 0;
  const open = () => onOpen(task);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          open();
        }
      }}
      className={`p-2.5 rounded-xl bg-white border shadow-2xs cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
        hasUnread ? "border-amber-400" : "border-gray-200/70"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-gray-900 break-words min-w-0">{task.title}</p>
        {hasUnread && (
          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase text-white bg-rose-500 px-1.5 py-0.5 rounded-full shrink-0 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            New comment
          </span>
        )}
      </div>

      <div className="mt-1.5 flex items-center gap-x-2 gap-y-1 flex-wrap text-[10px] text-gray-500">
        <PriorityTag priority={task.priority} />
        {task.is_overdue ? (
          <span className="font-extrabold text-red-600">Overdue</span>
        ) : task.due_date ? (
          <span className="inline-flex items-center gap-1 font-medium">
            <Calendar size={10} /> Due {fmtDate(task.due_date)}
          </span>
        ) : null}
        {fromLabel && <span className="font-semibold text-gray-600 break-words min-w-0">{fromLabel}</span>}
        <span className="break-words min-w-0">→ {task.assigned_to?.name || "All Directors"}</span>
        {task.comments_count > 0 && (
          <span className="inline-flex items-center gap-0.5 ml-auto shrink-0">
            <MessageSquare size={10} /> {task.comments_count}
          </span>
        )}
      </div>

      {task.latest_comment && <CommentPreview comment={task.latest_comment} unread={hasUnread} />}
    </div>
  );
};

// ─── Maintenance card ────────────────────────────────────────────
const MaintenanceItem = ({ item, tone = "gold", showAssignee = false }) => (
  <div className="p-2.5 rounded-xl bg-white border border-gray-200/70 shadow-2xs">
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs font-semibold text-gray-900 break-words min-w-0">{item.title}</p>
      <span
        className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0 ${
          tone === "navy" ? "text-[#1E3A5F] bg-[#1E3A5F]/10" : "text-[#8F6A1F] bg-[#B78A2F]/15"
        }`}
      >
        <Wrench size={9} /> Maintenance
      </span>
    </div>
    <div className="mt-1.5 flex items-center gap-x-2 gap-y-1 flex-wrap text-[10px] text-gray-500">
      <PriorityTag priority={item.priority} />
      {item.location && (
        <span className="inline-flex items-center gap-1 font-medium break-words min-w-0">
          <MapPin size={10} className="shrink-0" /> {item.location}
        </span>
      )}
      {showAssignee && (
        <span className="font-semibold text-gray-600 break-words min-w-0">To: {item.assigned_to?.name || "All Directors"}</span>
      )}
    </div>
  </div>
);

// ─── Comments modal wired to the comment endpoints ───────────────
const TaskCommentsDialog = ({ task, role, userId, onClose }) => {
  const { comments, isLoading } = useGetTaskComments(task.id, true);
  const { postComment, isPending } = usePostTaskComment();

  const thread = comments.map((c) => {
    const mine = userId != null && c.user_id === userId;
    return {
      id: c.id,
      author: c.user?.name || "Unknown",
      // The comment list has no role; the Owner only ever talks to Directors
      role: mine ? role : role === "owner" ? "director" : null,
      mine,
      text: c.comment,
      createdAt: c.created_at,
    };
  });

  return (
    <TaskCommentsModal
      isOpen
      task={{
        id: task.id,
        title: task.title,
        assignedBy: task.created_by?.name,
        assignee: task.assigned_to?.name || "All Directors",
      }}
      currentRole={role}
      comments={thread}
      isLoading={isLoading}
      isPosting={isPending}
      onAddComment={(taskId, commentText) => postComment({ taskId, commentText }).catch(() => {})}
      onClose={onClose}
    />
  );
};

/**
 * TaskBoard — task ownership board shared by the Owner and Director overviews
 *
 * Props:
 * - data: { director_owned, director_maintenance, owner_owned, owner_maintenance, totals, unread_comments_total }
 * - role: "owner" | "director"
 * - onNavigate: (path) => void
 * - onRefresh: refetches the overview after the comments modal closes
 */
const TaskBoard = ({ data, role = "director", onNavigate = () => {}, onRefresh = () => {} }) => {
  const queryClient = useQueryClient();
  const { user } = useGetUser();
  const [openTask, setOpenTask] = useState(null);

  const directorOwned = data?.director_owned || [];
  const ownerOwned = data?.owner_owned || [];
  const ownerMaintenance = data?.owner_maintenance || [];
  const directorMaintenance = data?.director_maintenance || [];
  const totals = data?.totals || {};
  const directorTotal =
    (totals.director_owned ?? directorOwned.length) + (totals.director_maintenance ?? directorMaintenance.length);
  const ownerTotal =
    (totals.owner_owned ?? ownerOwned.length) + (totals.owner_maintenance ?? ownerMaintenance.length);

  // created_by has no role, so work it out from what the board already tells us
  const ownerIds = new Set(ownerOwned.map((t) => t.assigned_to?.id).filter((id) => id != null));
  if (role === "owner" && user?.id != null) ownerIds.add(user.id);

  const fromLabel = (task) => {
    const creator = task.created_by;
    if (!creator) return null;
    if (creator.role === "owner") return "From Owner";
    if (creator.role === "director") return "From Director";
    if (ownerIds.has(creator.id)) return "From Owner";
    if (role === "owner" || creator.id === user?.id) return "From Director";
    // Only the Owner can assign a task to all directors
    if (task.assigned_to == null) return "From Owner";
    return creator.name ? `From ${creator.name}` : null;
  };

  const closeComments = () => {
    const taskId = openTask?.id;
    setOpenTask(null);
    // Drop the cached thread so the next open hits the server and marks comments read again
    queryClient.removeQueries({ queryKey: ["task-comments", taskId] });
    onRefresh();
  };

  const hiddenCount = (total, shown) => (total > shown ? total - shown : 0);
  const directorHidden = hiddenCount(directorTotal, directorOwned.length + directorMaintenance.length);
  const ownerHidden = hiddenCount(ownerTotal, ownerOwned.length + ownerMaintenance.length);
  const tasksPath = `/${role}/tasks`;

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList size={16} className="text-[#1E3A5F] shrink-0" />
              Task &amp; Maintenance Operations Hub
            </CardTitle>
            <span
              className="text-xs font-semibold text-[#1E3A5F] cursor-pointer hover:underline shrink-0"
              onClick={() => onNavigate(tasksPath)}
            >
              View all tasks →
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* LEFT COLUMN: Director owned + owner-assigned maintenance (Navy Blue Theme) */}
            <div className="rounded-2xl bg-[#1E3A5F] overflow-hidden min-w-0">
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-[#2F5482]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0" />
                  <span className="text-xs font-extrabold text-white uppercase break-words">
                    Director Owned &amp; Followed Items
                  </span>
                </div>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full shrink-0">
                  {directorTotal} items
                </span>
              </div>

              <div className="p-3.5 space-y-2">
                {directorOwned.map((t) => (
                  <TaskItem key={`task-${t.id}`} task={t} fromLabel={fromLabel(t)} onOpen={setOpenTask} />
                ))}
                {directorMaintenance.map((m) => (
                  <MaintenanceItem key={`maintenance-${m.id}`} item={m} tone="navy" showAssignee />
                ))}
                {directorOwned.length === 0 && directorMaintenance.length === 0 && (
                  <p className="text-xs text-white/85 italic py-3 text-center">No open items currently owned by Director.</p>
                )}
                {directorHidden > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigate(tasksPath)}
                    className="w-full text-[10px] font-semibold text-white/85 hover:text-white hover:underline cursor-pointer pt-1"
                  >
                    +{directorHidden} more in all tasks
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Owner owned + maintenance (Gold/Amber Theme) */}
            <div className="rounded-2xl bg-[#B78A2F]/15 border border-[#B78A2F]/25 overflow-hidden min-w-0">
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-[#B78A2F]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0" />
                  <span className="text-xs font-extrabold text-white uppercase break-words">
                    Owner Assigned &amp; Comments
                  </span>
                </div>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full shrink-0">
                  {ownerTotal} items
                </span>
              </div>

              <div className="p-3.5 space-y-2">
                {ownerOwned.map((t) => (
                  <TaskItem key={`task-${t.id}`} task={t} fromLabel={fromLabel(t)} onOpen={setOpenTask} />
                ))}
                {ownerMaintenance.map((m) => (
                  <MaintenanceItem key={`maintenance-${m.id}`} item={m} />
                ))}
                {ownerOwned.length === 0 && ownerMaintenance.length === 0 && (
                  <div className="p-3 rounded-xl bg-white border border-amber-100 text-center">
                    <p className="text-xs font-medium text-gray-700">No items currently awaiting Owner comments.</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Escalated items will display here with Owner feedback.</p>
                  </div>
                )}
                {ownerHidden > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigate(tasksPath)}
                    className="w-full text-[10px] font-semibold text-[#8F6A1F] hover:underline cursor-pointer pt-1"
                  >
                    +{ownerHidden} more in all tasks
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {openTask && (
        <TaskCommentsDialog task={openTask} role={role} userId={user?.id} onClose={closeComments} />
      )}
    </motion.div>
  );
};

export default TaskBoard;
