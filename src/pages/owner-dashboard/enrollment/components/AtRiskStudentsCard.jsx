import React from "react";
import { motion } from "framer-motion";
import { UserMinus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatusPill from "./StatusPill";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const AtRiskStudentsCard = ({ atRiskStudents, activeRiskStatus, onUpdateRiskStatus }) => {
  const activeRisk = atRiskStudents.filter(
    (r) => (activeRiskStatus[r.id] || r.status) === "intervening"
  );
  const retainedRisk = atRiskStudents.filter(
    (r) => (activeRiskStatus[r.id] || r.status) === "retained"
  );
  const lostRisk = atRiskStudents.filter(
    (r) => (activeRiskStatus[r.id] || r.status) === "lost"
  );
  const staleCases = atRiskStudents.filter(
    (r) => r.daysActive > 14 && (activeRiskStatus[r.id] || r.status) === "intervening"
  );

  const visibleStudents = atRiskStudents.filter(
    (r) => (activeRiskStatus[r.id] || r.status) !== "lost" &&
           (activeRiskStatus[r.id] || r.status) !== "retained"
  );

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserMinus size={18} className="text-red-500" />
                At-Risk Students
              </CardTitle>
              <CardDescription>Families signaling they may leave</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] md:text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-semibold">
                {activeRisk.length} active
              </span>
              <span className="text-[10px] md:text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-semibold">
                {retainedRisk.length} retained
              </span>
              <span className="text-[10px] md:text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-full font-semibold">
                {lostRisk.length} lost
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {staleCases.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-800">
                <span className="font-bold">{staleCases.length} stale case{staleCases.length > 1 ? "s" : ""}</span> · not touched in
                over 14 days. Status update needed.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {visibleStudents.map((student) => {
              const currentStatus = activeRiskStatus[student.id] || student.status;
              const isActive = currentStatus === "intervening";
              const isStale = student.daysActive > 14 && isActive;

              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-xl border ${isStale ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{student.name}</span>
                        <StatusPill status={student.grade}>{student.grade}</StatusPill>
                        <StatusPill status={student.reason}>{student.reason}</StatusPill>
                        {isStale && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">
                            ⏰ {student.daysActive}d stale
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{student.detail}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Flagged {student.flagged} · {student.daysActive} days ago
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {["intervening", "retained"].map((status) => (
                        <button
                          key={status}
                          onClick={() => onUpdateRiskStatus(student.id, status)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            currentStatus === status
                              ? "bg-red-500 text-white shadow-sm"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                      <button
                        onClick={() => onUpdateRiskStatus(student.id, "lost")}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all bg-white text-red-500 border border-red-200 hover:bg-red-50"
                      >
                        lost
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeRisk.length === 0 && (
              <div className="py-8 text-center">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                <p className="text-sm text-gray-500">No active at-risk students. All families current.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AtRiskStudentsCard;
