import React from "react";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const dotColor = (priority) => {
  if (priority === "critical") return STATUS.problem.dot;
  if (priority === "high") return STATUS.watch.dot;
  if (priority === "medium") return ACCENTS.operations.bar;
  return STATUS.none.dot;
};

const badgeColor = (priority) => {
  if (priority === "critical") return STATUS.problem.badge;
  if (priority === "high") return STATUS.watch.badge;
  if (priority === "medium") return ACCENTS.operations.icon;
  return STATUS.none.badge;
};

const MaintenanceCard = ({ requests = [], openCount, criticalCount, noData = false, onNavigate }) => {
  const activeRequests = requests.filter((m) => m.status !== "done" && m.status !== "completed");

  return (
    <motion.div variants={itemVariants}>
      <Card className="relative bg-white border-none shadow-sm h-full flex flex-col justify-between">
        <CardAccent group={noData ? "none" : "operations"} />
        <div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Wrench size={16} className={noData ? STATUS.none.text : ACCENTS.operations.text} />
                Open Maintenance
              </CardTitle>
              <div className="flex items-center gap-2">
                {criticalCount > 0 && (
                  <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded-full ${STATUS.problem.badge}`}>
                    {criticalCount} critical
                  </span>
                )}
                <span className="text-[10px] text-gray-400">{openCount || requests.length} total</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {activeRequests.length > 0 ? (
              activeRequests.slice(0, 4).map((m) => {
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
              <p className={`text-xs italic py-4 text-center ${STATUS.none.text}`}>{noData ? "No maintenance data" : "No open maintenance requests."}</p>
            )}
          </CardContent>
        </div>
        <CardContent className="pt-0">
          <Button
            variant="ghost"
            className={`w-full text-xs h-7 mt-1 cursor-pointer font-semibold ${ACCENTS.operations.text} hover:bg-[#1E3A5F]/10`}
            onClick={() => onNavigate("/owner/maintenance")}
          >
            View all maintenance →
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MaintenanceCard;
