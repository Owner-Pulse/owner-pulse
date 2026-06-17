import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const TasksCard = ({ tasks, daysUntil, onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardList size={16} className="text-purple-500" />
            Pending Tasks
          </CardTitle>
          <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => onNavigate("/director/tasks")}>View all</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ArrowUpRight size={10} className="text-blue-400" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">From Owner</span>
            </div>
            <div className="space-y-1.5">
              {tasks.filter(t => t.priority === "high" && t.status !== "done").slice(0, 2).map((t) => {
                const d = daysUntil(t.due);
                return (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                    <p className="text-xs font-medium text-gray-900 truncate">{t.title}</p>
                    <span className={`text-[9px] font-bold shrink-0 ml-1 ${d <= 3 ? "text-red-500" : "text-amber-500"}`}>{d}d</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ArrowUpRight size={10} className="text-amber-400" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Escalated to Owner</span>
            </div>
            <div className="space-y-1.5">
              {tasks.filter(t => t.assignee === "owner" && t.status !== "done").length > 0 ? (
                tasks.filter(t => t.assignee === "owner" && t.status !== "done").map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50">
                    <p className="text-xs font-medium text-gray-900 truncate">{t.title}</p>
                    <span className="text-[9px] font-bold text-amber-600 shrink-0 ml-1">Waiting</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-400 italic p-2">No items currently escalated</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default TasksCard;
