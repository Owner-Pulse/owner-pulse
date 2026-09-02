import React from "react";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const dotColor = (priority) => {
  if (priority === "critical") return "bg-[#AE4A3E]";
  if (priority === "high") return "bg-[#B78A2F]";
  if (priority === "medium") return "bg-[#1E3A5F]";
  return "bg-gray-400";
};

const badgeColor = (priority) => {
  if (priority === "critical") return "bg-[#AE4A3E]/10 text-[#8A362C]";
  if (priority === "high") return "bg-[#B78A2F]/10 text-[#8F6A1F]";
  if (priority === "medium") return "bg-[#1E3A5F]/5 text-[#1E3A5F]";
  return "bg-gray-100 text-gray-500";
};

const MaintenanceCard = ({ items = [], openCount, criticalCount, onNavigate }) => {
  const activeItems = items.filter((m) => m.status !== "done" && m.status !== "completed");

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm h-full flex flex-col justify-between">
        <div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Wrench size={16} className="text-[#1E3A5F]" />
                Open Maintenance
              </CardTitle>
              <div className="flex items-center gap-2">
                {criticalCount > 0 && (
                  <span className="text-[10px] font-medium text-[#8A362C] bg-[#AE4A3E]/10 px-1.5 py-0.5 rounded-full">
                    {criticalCount} critical
                  </span>
                )}
                <span className="text-[10px] text-gray-400">{openCount || items.length} total</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {activeItems.length > 0 ? (
              activeItems.slice(0, 4).map((m) => {
                const title = m.title || m.issue || m.description || m.name || "Maintenance Request";
                const location = m.room_location || m.location || m.room || "";
                const priority = m.priority || "medium";
                const assignedTo = m.assigned_to;
                const cost = m.cost;

                return (
                  <div
                    key={m.id || Math.random()}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 hover:bg-gray-100/80 transition-colors"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(priority)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate" title={title}>
                        {title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5 flex-wrap">
                        {location && (
                          <>
                            <span className="truncate max-w-[130px]" title={location}>{location}</span>
                            <span>·</span>
                          </>
                        )}
                        <span className={`px-1.5 py-0.5 rounded-full font-bold text-[9px] ${badgeColor(priority)}`}>
                          {priority}
                        </span>
                        {assignedTo && (
                          <>
                            <span>·</span>
                            <span>{assignedTo}</span>
                          </>
                        )}
                        {cost && (
                          <>
                            <span>·</span>
                            <span className="font-bold text-gray-700">${cost}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 italic py-4 text-center">No open maintenance requests.</p>
            )}
          </CardContent>
        </div>
        <CardContent className="pt-0">
          <Button
            variant="ghost"
            className="w-full text-xs text-[#1E3A5F] h-7 mt-1 cursor-pointer hover:bg-[#1E3A5F]/10 font-semibold"
            onClick={() => onNavigate("/director/maintenance")}
          >
            View all maintenance →
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MaintenanceCard;
