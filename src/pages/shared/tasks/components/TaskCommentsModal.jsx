import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Send, Clock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const TaskCommentsModal = ({
  isOpen,
  task,
  currentRole = "director",
  comments = [],
  onAddComment,
  onClose
}) => {
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState(
    comments.length > 0
      ? comments
      : [
          {
            id: 1,
            author: task?.assignedBy === "owner" || task?.creatorId === 2 ? "School Owner" : "Director",
            role: task?.assignedBy === "owner" || task?.creatorId === 2 ? "owner" : "director",
            text: `Assigned task: "${task?.title || "Task"}". Please complete by ${task?.due || "due date"}.`,
            createdAt: task?.createdAt || new Date().toISOString(),
          }
        ]
  );

  if (!isOpen || !task) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added = {
      id: Date.now(),
      author: currentRole === "owner" ? "School Owner" : "Director",
      role: currentRole,
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    setLocalComments((prev) => [...prev, added]);
    if (onAddComment) {
      onAddComment(task.id, newComment.trim());
    }
    setNewComment("");
  };

  const fmtTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? "Recently" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-2xl bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F] shrink-0">
                <MessageSquare size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">{task.title}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <span className="capitalize font-medium text-[#1E3A5F]">{task.assignedBy || "Owner"}</span> → <span className="capitalize font-medium text-[#1E3A5F]">{task.assignee || "Director"}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200/60 rounded-xl transition-colors">
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Comment Thread */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4 max-h-[400px]">
            {localComments.map((c) => {
              const isOwner = c.role === "owner" || (c.author || "").toLowerCase().includes("owner");
              return (
                <div key={c.id} className={`flex flex-col ${c.role === currentRole ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-gray-800">{c.author}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${isOwner ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                      {isOwner ? "Owner" : "Director"}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5 ml-1">
                      <Clock size={10} /> {fmtTime(c.createdAt)}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      c.role === currentRole
                        ? "bg-[#1E3A5F] text-white rounded-tr-none shadow-xs"
                        : "bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200/60"
                    }`}
                  >
                    {c.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Comment Input Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment or update..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white"
            />
            <Button type="submit" disabled={!newComment.trim()} className="bg-[#1E3A5F] hover:bg-[#15294A] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0">
              <Send size={13} /> Post
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskCommentsModal;
