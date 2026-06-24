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
  if (priority === "critical") return "bg-red-500";
  if (priority === "high") return "bg-orange-500";
  if (priority === "medium") return "bg-amber-500";
  return "bg-gray-400";
};

const badgeColor = (priority) => {
  if (priority === "critical") return "bg-red-100 text-red-600";
  if (priority === "high") return "bg-orange-100 text-orange-600";
  if (priority === "medium") return "bg-amber-100 text-amber-600";
  return "bg-gray-100 text-gray-500";
};

const MaintenanceCard = ({ requests, openCount, criticalCount, onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wrench size={16} className="text-amber-500" />
            Open Maintenance
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">{criticalCount} critical</span>}
            <span className="text-[10px] text-gray-400">{openCount} total</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {requests.filter(m => m.status !== "done").slice(0, 4).map((m) => (
          <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(m.priority)}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{m.issue}</p>
              <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-0.5 flex-wrap">
                <span>{m.location}</span>
                <span>·</span>
                <span className={`px-1 py-0.5 rounded-full font-medium ${badgeColor(m.priority)}`}>{m.priority}</span>
              </div>
            </div>
          </div>
        ))}
        <Button variant="ghost" className="w-full text-xs text-blue-600 h-7 mt-1" onClick={() => onNavigate("/owner/maintenance")}>View all maintenance →</Button>
      </CardContent>
    </Card>
  </motion.div>
);

export default MaintenanceCard;
