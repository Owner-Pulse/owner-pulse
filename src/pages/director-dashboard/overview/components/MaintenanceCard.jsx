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
            <Wrench size={16} className="text-[#1E3A5F]" />
            Open Maintenance
          </CardTitle>
          <span className="text-xs text-[#1E3A5F] cursor-pointer hover:underline" onClick={() => onNavigate("/director/maintenance")}>View all</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-[10px] font-medium text-gray-400 mb-1 flex items-center gap-2">
          <ArrowUpRight size={10} className="text-[#1E3A5F]" />
          <span>Assigned <strong className="text-gray-600">by Owner</strong> to you</span>
        </div>
        {items.filter(m => m.status !== "done" && m.priority === "critical").slice(0, 1).map((m) => (
          <div key={m.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-[#AE4A3E]/[0.06] border border-[#AE4A3E]/20">
            <div className="w-1.5 h-1.5 rounded-full mt-1 bg-[#AE4A3E] shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-900">{m.issue}</p>
              <div className="text-[9px] text-gray-400">{m.location} · critical · Owner assigned</div>
            </div>
          </div>
        ))}
        <div className="text-[10px] font-medium text-gray-400 mb-1 mt-2 flex items-center gap-2">
          <TrendingUp size={10} className="text-[#B78A2F]" />
          <span>Assigned <strong className="text-gray-600">by you</strong> to vendors</span>
        </div>
        {items.filter(m => m.status !== "done" && m.priority !== "critical").slice(0, 2).map((m) => (
          <div key={m.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-[#B78A2F]/[0.08] border border-[#B78A2F]/20">
            <div className="w-1.5 h-1.5 rounded-full mt-1 bg-[#B78A2F] shrink-0" />
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
