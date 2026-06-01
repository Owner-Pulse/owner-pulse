import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const TODAY = new Date("2026-05-11");

const fmtMoney = (v) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

const daysSince = (d) =>
  Math.floor((TODAY - new Date(d)) / 86400000);

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

const KpiCard = ({ icon: Icon, label, value, sub, iconBg, valueColor }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className={`text-2xl font-bold ${valueColor || "text-gray-900"}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${iconBg || "bg-blue-50 text-blue-600"}`}><Icon size={18} /></div>
      </div>
      {sub && <div className="mt-2 text-xs text-gray-500">{sub}</div>}
    </CardContent>
  </Card>
);

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

  const sortedPending = [...pending].sort((a, b) => daysSince(b.sent) - daysSince(a.sent));

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
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Award size={16} /> Scholarship Programs
            </CardTitle>
            <CardDescription>Award amounts by program type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCHOLARSHIP_PROGRAMS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="program" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} tickFormatter={(v) => "$" + v / 1000 + "K"} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value) => [fmtMoney(value), "Awarded"]}
                  />
                  <Bar dataKey="awarded" radius={[6, 6, 0, 0]}>
                    {SCHOLARSHIP_PROGRAMS.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Program breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {SCHOLARSHIP_PROGRAMS.map((p) => (
                <div key={p.id} className="p-3 bg-gray-50 rounded-xl text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: p.color }} />
                  <p className="text-sm font-bold text-gray-900">{p.program}</p>
                  <p className="text-xs text-gray-500">{p.students} students</p>
                  <p className="text-xs font-semibold text-gray-700">{fmtMoney(p.awarded)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Step Up Approval Pipeline */}
      <motion.div variants={itemVariants}>
        <Card className={`bg-white border-none shadow-sm ${pendingByAge.redflag > 0 ? "border-l-4 border-l-red-400" : pendingByAge.stale > 0 ? "border-l-4 border-l-amber-400" : ""}`}>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={16} /> Step Up Payment Approvals
            </CardTitle>
            <CardDescription>
              {pendingByAge.redflag > 0
                ? `${pendingByAge.redflag} approvals stuck over 20 days — needs immediate attention`
                : `${pending.length} pending · tracking aging pipeline`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Pipeline visualization */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { key: "fresh", label: "Fresh (<7d)", count: pendingByAge.fresh, color: "bg-emerald-500" },
                { key: "aging", label: "Aging (7-13d)", count: pendingByAge.aging, color: "bg-amber-500" },
                { key: "stale", label: "Stale (14-19d)", count: pendingByAge.stale, color: "bg-orange-500" },
                { key: "redflag", label: "Red Flag (20d+)", count: pendingByAge.redflag, color: "bg-red-500" },
              ].map((bucket) => (
                <div key={bucket.key} className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className={`text-2xl font-bold ${bucket.count > 0 ? bucket.color.replace("bg-", "text-") : "text-gray-400"}`}>{bucket.count}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{bucket.label}</p>
                </div>
              ))}
            </div>

            {/* Pending approvals table */}
            {sortedPending.length > 0 ? (
              <div className="space-y-2">
                {sortedPending.map((a) => {
                  const age = daysSince(a.sent);
                  const isRed = age >= 20;
                  const isStale = age >= 14 && age < 20;
                  const isAging = age >= 7 && age < 14;
                  return (
                    <div key={a.id} className={`flex items-center justify-between p-3 rounded-xl ${isRed ? "bg-red-50" : isStale ? "bg-orange-50" : isAging ? "bg-amber-50" : "bg-gray-50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isRed ? "bg-red-500" : isStale ? "bg-orange-500" : isAging ? "bg-amber-500" : "bg-emerald-500"}`} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{a.parent} → {a.student}</p>
                          <p className="text-xs text-gray-500">{a.grade} · Last contact: {a.lastContact}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{fmtMoney(a.amount)}</p>
                        <p className={`text-xs font-medium ${isRed ? "text-red-600" : isStale ? "text-orange-600" : "text-gray-500"}`}>{age}d pending</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center">
                <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-2" />
                <p className="text-sm text-gray-500">No pending approvals — all caught up!</p>
              </div>
            )}

            {/* Approved turnaround stats */}
            {approved.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{approved.length}</span> approved this year · Avg turnaround{" "}
                  <span className="font-semibold text-gray-700">{avgTurnaround}d</span> ·{" "}
                  <span className="font-semibold text-emerald-600">{turnaroundPct}%</span> within 14 days
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ScholarshipsPage;
