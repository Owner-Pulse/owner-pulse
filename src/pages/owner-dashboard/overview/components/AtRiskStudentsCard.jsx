import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const AtRiskStudentsCard = ({ students, activeAtRisk, noData = false, fmtDate, onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="relative bg-white border-none shadow-sm h-full">
      <CardAccent group={noData ? "none" : "students"} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle size={16} className={noData ? STATUS.none.text : STATUS.problem.text} />
            At-Risk Students
          </CardTitle>
          <span className={`text-[10px] font-medium border px-2 py-0.5 rounded-full ${noData ? STATUS.none.badge : activeAtRisk > 0 ? STATUS.problem.badge : STATUS.good.badge}`}>
            {noData ? "No data" : `${activeAtRisk} active`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {noData ? (
          <p className={`text-xs italic text-center py-4 ${STATUS.none.text}`}>No at-risk student data.</p>
        ) : students.length === 0 ? (
          <p className={`text-xs italic text-center py-4 ${STATUS.good.text}`}>No students currently at risk.</p>
        ) : students.map((r, i) => (
          <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${STATUS.problem.soft}`}>
            <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${STATUS.problem.dot}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-semibold text-gray-900">{r.name} · {r.grade}</p>
                <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full ${STATUS.problem.badge}`}>{r.status}</span>
              </div>
              <p className="text-[9px] text-gray-400 mt-0.5">{r.category} · {r.reason} · Flagged {fmtDate(r.flagged_date)}</p>
            </div>
            {r.status !== "lost" && (
              <span className={`text-[9px] font-semibold hover:underline cursor-pointer shrink-0 ${ACCENTS.students.text}`}>Intervene</span>
            )}
          </div>
        ))}
        <Button variant="ghost" className={`w-full text-xs h-7 mt-1 ${ACCENTS.students.text}`} onClick={() => onNavigate("/owner/enrollment")}>View all at-risk →</Button>
      </CardContent>
    </Card>
  </motion.div>
);

export default AtRiskStudentsCard;
