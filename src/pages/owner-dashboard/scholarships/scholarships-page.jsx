import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Award, Users, Clock, TrendingUp } from "lucide-react";
import KpiCard from "./components/KpiCard";
import ScholarshipProgramsChart from "./components/ScholarshipProgramsChart";
import ApprovalPipelineCard from "./components/ApprovalPipelineCard";

const TODAY = new Date("2026-05-11");
const daysSince = (d) => Math.floor((TODAY - new Date(d)) / 86400000);

const fmtMoney = (v) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const SCHOLARSHIP_PROGRAMS = [
  { id: 1, program: "FES-EO", students: 38, awarded: 342000, color: "#2563EB" },
  { id: 2, program: "FES-UA", students: 14, awarded: 168000, color: "#7C3AED" },
  { id: 3, program: "FTC", students: 22, awarded: 198000, color: "#059669" },
  { id: 4, program: "VPK", students: 27, awarded: 67500, color: "#D97706" },
];

const STEP_UP_APPROVALS = [
  { id: 1, parent: "R. Garcia", student: "M. Garcia", grade: "3rd", amount: 2850, sent: "2026-05-08", status: "pending", lastContact: "2026-05-10" },
  { id: 2, parent: "L. Singh", student: "A. Singh", grade: "1st", amount: 2850, sent: "2026-05-06", status: "pending", lastContact: "2026-05-09" },
  { id: 3, parent: "D. Kim", student: "J. Kim", grade: "5th", amount: 3100, sent: "2026-05-04", status: "pending", lastContact: "2026-05-09" },
  { id: 4, parent: "M. Owens", student: "T. Owens", grade: "2nd", amount: 2900, sent: "2026-04-28", status: "pending", lastContact: "2026-05-08" },
  { id: 5, parent: "S. Patel", student: "R. Patel", grade: "K", amount: 2750, sent: "2026-05-01", status: "approved", approvedOn: "2026-05-09" },
  { id: 6, parent: "J. Miller", student: "L. Miller", grade: "4th", amount: 2950, sent: "2026-04-25", status: "approved", approvedOn: "2026-05-05" },
  { id: 7, parent: "T. Brown", student: "A. Brown", grade: "7th", amount: 3050, sent: "2026-04-20", status: "approved", approvedOn: "2026-05-02" },
  { id: 8, parent: "C. Davis", student: "E. Davis", grade: "1st", amount: 2800, sent: "2026-04-15", status: "approved", approvedOn: "2026-04-28" },
];

const ScholarshipsPage = () => {
  const totalAwarded = useMemo(() => SCHOLARSHIP_PROGRAMS.reduce((a, s) => a + s.awarded, 0), []);
  const totalStudents = useMemo(() => SCHOLARSHIP_PROGRAMS.reduce((a, s) => a + s.students, 0), []);

  const pending = STEP_UP_APPROVALS.filter((s) => s.status === "pending");
  const approved = STEP_UP_APPROVALS.filter((s) => s.status === "approved");

  const pendingByAge = useMemo(() => ({
    fresh: pending.filter((s) => daysSince(s.sent) < 7).length,
    aging: pending.filter((s) => daysSince(s.sent) >= 7 && daysSince(s.sent) < 14).length,
    stale: pending.filter((s) => daysSince(s.sent) >= 14 && daysSince(s.sent) < 20).length,
    redflag: pending.filter((s) => daysSince(s.sent) >= 20).length,
  }), [pending]);

  const turnaroundTimes = approved.map((s) =>
    Math.round((new Date(s.approvedOn) - new Date(s.sent)) / 86400000)
  );
  const avgTurnaround = turnaroundTimes.length
    ? Math.round(turnaroundTimes.reduce((a, b) => a + b, 0) / turnaroundTimes.length)
    : 0;
  const turnaroundPct = turnaroundTimes.length
    ? Math.round((turnaroundTimes.filter((t) => t <= 14).length / turnaroundTimes.length) * 100)
    : 100;

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Scholarships</h1>
        <p className="text-sm text-gray-500 mt-1">{totalStudents} students · {fmtMoney(totalAwarded)} awarded YTD</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={Award} label="Total Awarded" value={fmtMoney(totalAwarded)} sub={`Across ${SCHOLARSHIP_PROGRAMS.length} programs`} iconBg="bg-amber-50 text-amber-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Users} label="Scholarship Students" value={totalStudents} sub={`${Math.round(totalStudents / 245 * 100)}% of enrollment`} iconBg="bg-purple-50 text-purple-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Clock} label="Pending Approvals" value={pending.length} sub={`Avg ${avgTurnaround}d turnaround`} iconBg={pendingByAge.redflag > 0 ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"} valueColor={pendingByAge.redflag > 0 ? "text-red-600" : "text-gray-900"} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={TrendingUp} label="Approval Rate" value={`${turnaroundPct}%`} sub={`${approved.length} approved ≤14 days`} iconBg="bg-emerald-50 text-emerald-600" />
        </motion.div>
      </div>

      {/* Scholarship Programs Chart */}
      <motion.div variants={itemVariants}>
        <ScholarshipProgramsChart programs={SCHOLARSHIP_PROGRAMS} />
      </motion.div>

      {/* Step Up Approval Pipeline */}
      <motion.div variants={itemVariants}>
        <ApprovalPipelineCard approvals={STEP_UP_APPROVALS} />
      </motion.div>
    </motion.div>
  );
};

export default ScholarshipsPage;
