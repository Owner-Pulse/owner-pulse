import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const IncidentByClassroomCard = ({ incidentByClassroom }) => {
  const maxCount = Math.max(...incidentByClassroom.map(([, c]) => c), 1);

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Incidents by Classroom</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {incidentByClassroom.map(([cls, count], i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs font-medium text-gray-900 truncate">{cls}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${count >= 2 ? "bg-red-500" : "bg-amber-500"}`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${count >= 2 ? "text-red-600" : "text-amber-600"}`}>
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IncidentByClassroomCard;
