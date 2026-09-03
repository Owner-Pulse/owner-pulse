import React from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ProgramBadge from "./ProgramBadge";
import SourceTag from "./SourceTag";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ProgramBreakdownCard = ({ byProgram = [], bySource = {}, classroomWiseWaitlist = [] }) => {
  // Use classroom_wise_waitlist directly if provided from backend API payload
  const hasClassroomWise = Array.isArray(classroomWiseWaitlist) && classroomWiseWaitlist.length > 0;

  const items = hasClassroomWise
    ? classroomWiseWaitlist.map((item) => ({
        id: item.classroom_id,
        program: item.classroom_name,
        count: Number(item.waitlist_count) || 0,
        procareId: item.procare_classroom_id,
      }))
    : byProgram;

  const maxCount = items.length ? Math.max(...items.map((x) => x.count)) : 0;

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Building2 size={16} className="text-[#1E3A5F]" /> Waitlist by Classroom / Program
          </CardTitle>
          <CardDescription>
            {hasClassroomWise ? "Real-time count of children waiting per classroom" : "Demand breakdown per program"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {items.map((p, idx) => (
              <div key={p.id || idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-colors">
                <div className="flex items-center gap-3">
                  <ProgramBadge program={p.program} />
                  {p.procareId && (
                    <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                      Procare #{p.procareId}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${p.count > 0 ? "text-[#1E3A5F]" : "text-gray-400"}`}>
                    {p.count} {p.count === 1 ? "waiting" : "waiting"}
                  </span>
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden shrink-0">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${p.count > 0 ? "bg-[#1E3A5F]" : "bg-gray-300"}`}
                      style={{ width: `${maxCount ? Math.min(100, (p.count / maxCount) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No classroom waitlist records found.</p>
            )}
          </div>

          {/* Source breakdown */}
          {bySource && Object.keys(bySource).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">By Lead Source</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(bySource).map(([source, count]) => (
                  <span key={source} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-full text-xs font-medium text-gray-700">
                    <SourceTag source={source} /> {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgramBreakdownCard;
