import React from "react";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const TasksCard = ({ tasks, highPriorityCount, fmtDate, daysUntil, onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ClipboardList size={16} className="text-[#1E3A5F]" />
            Active Tasks
          </CardTitle>
          <span className="text-[10px] font-medium text-[#8F6A1F] bg-[#B78A2F]/10 px-2 py-0.5 rounded-full">{highPriorityCount} high priority</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {tasks.filter(t => t.status !== "done").slice(0, 4).map((t) => {
          const d = daysUntil(t.due_date);
          return (
            <div key={t.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.priority === "high" ? "bg-[#B78A2F]" : t.priority === "medium" ? "bg-[#1E3A5F]" : "bg-gray-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-medium text-gray-900 truncate">{t.title}</p>
                  <span className={`text-[9px] font-semibold shrink-0 ml-1 ${d <= 3 ? "text-[#8A362C]" : d <= 7 ? "text-[#8F6A1F]" : "text-gray-400"}`}>
                    {d <= 0 ? "Overdue" : `${d}d`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-0.5">
                  <span className="capitalize">{t.assigned_role}</span>
                  <span>·</span>
                  <span className="capitalize">{t.status.replace("_", " ")}</span>
                  <span>·</span>
                  <span>Due {fmtDate(t.due_date)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <Button variant="ghost" className="w-full text-xs text-[#1E3A5F] h-7 mt-1" onClick={() => onNavigate("/owner/tasks")}>View all tasks →</Button>
      </CardContent>
    </Card>
  </motion.div>
);

export default TasksCard;
