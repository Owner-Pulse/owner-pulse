import React from "react";
import { motion } from "framer-motion";
import { Wrench, ArrowUpRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const MaintenanceCard = ({ items, onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wrench size={16} className="text-amber-500" />
            Open Maintenance
          </CardTitle>
          <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => onNavigate("/director/maintenance")}>View all</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-[10px] font-medium text-gray-400 mb-1 flex items-center gap-2">
          <ArrowUpRight size={10} className="text-red-400" />
          <span>Assigned <strong className="text-gray-600">by Owner</strong> to you</span>
        </div>
        {items.filter(m => m.status !== "done" && m.priority === "critical").slice(0, 1).map((m) => (
          <div key={m.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-red-50 border border-red-100">
            <div className="w-1.5 h-1.5 rounded-full mt-1 bg-red-500 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-900">{m.issue}</p>
              <div className="text-[9px] text-gray-400">{m.location} · critical · Owner assigned</div>
            </div>
          </div>
        ))}
        <div className="text-[10px] font-medium text-gray-400 mb-1 mt-2 flex items-center gap-2">
          <TrendingUp size={10} className="text-amber-400" />
          <span>Assigned <strong className="text-gray-600">by you</strong> to vendors</span>
        </div>
        {items.filter(m => m.status !== "done" && m.priority !== "critical").slice(0, 2).map((m) => (
          <div key={m.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-amber-50 border border-amber-100">
            <div className="w-1.5 h-1.5 rounded-full mt-1 bg-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-900">{m.issue}</p>
              <div className="text-[9px] text-gray-400">{m.location} · {m.priority}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </motion.div>
);

export default MaintenanceCard;
