import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserMinus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatusPill from "./StatusPill";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const AtRiskStudentsCard = ({ atRiskStudents = [] }) => {
  const [filter, setFilter] = useState("all");

  const getStatus = (r) => {
    const raw = r.status;
    if (!raw) return "active";
    const st = String(raw).toLowerCase();
    if (st === "retained") return "retained";
    if (st === "lost" || st === "withdrawn") return "lost";
    return "active";
  };

  const activeRisk = atRiskStudents.filter((r) => getStatus(r) === "active");
  const retainedRisk = atRiskStudents.filter((r) => getStatus(r) === "retained");
  const lostRisk = atRiskStudents.filter((r) => getStatus(r) === "lost");
  const staleCases = atRiskStudents.filter(
    (r) => r.daysActive > 14 && getStatus(r) === "active"
  );

  const visibleStudents = atRiskStudents.filter((r) => {
    if (filter === "active") return getStatus(r) === "active";
    if (filter === "retained") return getStatus(r) === "retained";
    if (filter === "lost") return getStatus(r) === "lost";
    return true;
  });

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserMinus size={18} className="text-[#AE4A3E]" />
                At-Risk Students
              </CardTitle>
              <CardDescription>Families signaling they may leave</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilter("all")}
                className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  filter === "all" ? "bg-[#1E3A5F] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({atRiskStudents.length})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  filter === "active" ? "bg-[#AE4A3E] text-white shadow-sm" : "bg-[#AE4A3E]/10 text-[#8A362C] hover:bg-[#AE4A3E]/20"
                }`}
              >
                {activeRisk.length} active
              </button>
              <button
                onClick={() => setFilter("retained")}
                className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  filter === "retained" ? "bg-[#3E7A54] text-white shadow-sm" : "bg-[#3E7A54]/10 text-[#2F6042] hover:bg-[#3E7A54]/20"
                }`}
              >
                {retainedRisk.length} retained
              </button>
              <button
                onClick={() => setFilter("lost")}
                className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  filter === "lost" ? "bg-gray-700 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {lostRisk.length} lost
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {staleCases.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-[#AE4A3E]/10 border border-[#AE4A3E]/25 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#8A362C] flex-shrink-0" />
              <p className="text-xs text-[#8A362C]">
                <span className="font-bold">{staleCases.length} stale case{staleCases.length > 1 ? "s" : ""}</span> · not touched in
                over 14 days. Status update needed.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {visibleStudents.map((student) => {
              const currentStatus = getStatus(student);
              const isActive = currentStatus === "active";
              const isStale = student.daysActive > 14 && isActive;

              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-xl border ${isStale ? "bg-[#AE4A3E]/[0.06] border-[#AE4A3E]/25" : currentStatus === "retained" ? "bg-[#3E7A54]/[0.04] border-[#3E7A54]/20" : currentStatus === "lost" ? "bg-gray-50 border-gray-100 opacity-75" : "bg-gray-50 border-gray-100"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{student.name}</span>
                        <StatusPill status={student.grade}>{student.grade}</StatusPill>
                        <StatusPill status={student.reason}>{student.reason}</StatusPill>
                        {isStale && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#AE4A3E]/10 text-[#8A362C] border border-[#AE4A3E]/25">
                            ⏰ {student.daysActive}d stale
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{student.detail}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Flagged {student.flagged} · {student.daysActive} days ago
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        currentStatus === "retained"
                          ? "bg-[#3E7A54]/10 text-[#2F6042]"
                          : currentStatus === "lost"
                          ? "bg-gray-200 text-gray-600"
                          : "bg-[#AE4A3E]/10 text-[#8A362C]"
                      }`}>
                        {currentStatus === "active" ? "Active" : currentStatus === "retained" ? "Retained" : "Withdrawn"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {visibleStudents.length === 0 && (
              <div className="py-8 text-center">
                <CheckCircle2 size={32} className="mx-auto text-[#3E7A54] mb-2" />
                <p className="text-sm text-gray-500">No at-risk students match filter "{filter}".</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AtRiskStudentsCard;
