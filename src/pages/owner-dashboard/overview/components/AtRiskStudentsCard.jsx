import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const AtRiskStudentsCard = ({ students, activeAtRisk, fmtDate, onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle size={16} className="text-[#AE4A3E]" />
            At-Risk Students
          </CardTitle>
          <span className="text-[10px] font-medium text-[#8A362C] bg-[#AE4A3E]/10 px-2 py-0.5 rounded-full">{activeAtRisk} active</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {students.map((r, i) => (
          <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${r.status === "lost" ? "bg-gray-50 opacity-60" : "bg-[#AE4A3E]/[0.06]"}`}>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${r.status === "lost" ? "bg-gray-400" : "bg-[#AE4A3E]"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-semibold text-gray-900">{r.name} · {r.grade}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${r.status === "lost" ? "bg-gray-200 text-gray-500" : "bg-[#AE4A3E]/10 text-[#8A362C]"}`}>{r.status}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">{r.detail}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">{r.reason} · Flagged {fmtDate(r.flagged)}</p>
            </div>
            {r.status !== "lost" && (
              <span className="text-[9px] font-semibold text-[#1E3A5F] hover:underline cursor-pointer shrink-0">Intervene</span>
            )}
          </div>
        ))}
        <Button variant="ghost" className="w-full text-xs text-[#1E3A5F] h-7 mt-1" onClick={() => onNavigate("/owner/enrollment")}>View all at-risk →</Button>
      </CardContent>
    </Card>
  </motion.div>
);

export default AtRiskStudentsCard;
