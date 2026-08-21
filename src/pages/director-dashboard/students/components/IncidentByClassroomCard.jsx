import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const IncidentByClassroomCard = ({ incidentByClassroom = [] }) => {
  const safeList = Array.isArray(incidentByClassroom) ? incidentByClassroom : [];
  const maxCount = Math.max(...safeList.map(([, c]) => Number(c) || 0), 1);

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm overflow-hidden border-l-3 border-l-[#B78A2F]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={14} className="text-[#B78A2F]" /> Incidents by Classroom
          </CardTitle>
        </CardHeader>
        <CardContent>
          {safeList.length > 0 ? (
            <div className="space-y-3">
              {safeList.map(([cls, count], i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 truncate">{cls}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${count >= 2 ? "bg-[#AE4A3E]" : "bg-[#B78A2F]"}`}
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${count >= 2 ? "text-[#8A362C]" : "text-[#8F6A1F]"}`}>
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-6">No incidents recorded</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IncidentByClassroomCard;
