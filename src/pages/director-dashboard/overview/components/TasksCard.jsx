import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const TasksCard = ({ data, onNavigate }) => {
  const fromOwner = data?.from_owner || [];
  const escalatedToOwner = data?.escalated_to_owner || [];

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList size={16} className="text-[#1E3A5F]" />
              Pending Tasks & Escalations
            </CardTitle>
            <span className="text-xs text-[#1E3A5F] cursor-pointer hover:underline" onClick={() => onNavigate("/director/tasks")}>View all</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ArrowUpRight size={10} className="text-[#1E3A5F]" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">From Owner</span>
              </div>
              <div className="space-y-1.5">
                {fromOwner.length > 0 ? (
                  fromOwner.map((t, idx) => (
                    <div key={t.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-[#1E3A5F]/[0.05]">
                      <p className="text-xs font-medium text-gray-900 truncate">{t.title}</p>
                      <span className="text-[9px] font-bold text-[#8F6A1F] shrink-0 ml-1">{t.days_left}d left</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 italic p-2">No pending tasks from Owner</p>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ArrowUpRight size={10} className="text-[#B78A2F]" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Escalated to Owner</span>
              </div>
              <div className="space-y-1.5">
                {escalatedToOwner.length > 0 ? (
                  escalatedToOwner.map((t, idx) => (
                    <div key={t.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-[#B78A2F]/[0.08]">
                      <p className="text-xs font-medium text-gray-900 truncate">{t.title}</p>
                      <span className="text-[9px] font-bold text-[#8F6A1F] shrink-0 ml-1">Awaiting Owner</span>
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
};

export default TasksCard;
