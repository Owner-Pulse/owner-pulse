import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  AlertTriangle,
  Percent,
  ArrowRight,
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const STAFF = [
  { id: 1, name: "Ms. Alvarez", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 3, birthdayUsedThisYear: false },
  { id: 2, name: "Ms. Soto", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 2, birthdayUsedThisYear: true },
  { id: 3, name: "Ms. Patel", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 5, birthdayUsedThisYear: false },
  { id: 4, name: "Ms. Rivera", role: "Teacher", today: "late", ptoAllowance: 10, ptoUsed: 1, birthdayUsedThisYear: false },
  { id: 5, name: "Ms. Brooks", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 4, birthdayUsedThisYear: false },
  { id: 6, name: "Mr. Nguyen", role: "Teacher", today: "callout", ptoAllowance: 10, ptoUsed: 6, birthdayUsedThisYear: false },
  { id: 7, name: "Ms. Cohen", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 7, birthdayUsedThisYear: false },
  { id: 8, name: "Ms. Diaz", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 0, birthdayUsedThisYear: true },
  { id: 9, name: "Mr. Park", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 3, birthdayUsedThisYear: false },
  { id: 10, name: "Mr. O'Brien", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 2, birthdayUsedThisYear: false },
  { id: 11, name: "Ms. Hassan", role: "Teacher", today: "present", ptoAllowance: 10, ptoUsed: 8, birthdayUsedThisYear: false },
];

const SUBSTITUTES = [
  { id: 1, date: "2026-05-11", coveringFor: "Ms. Cohen", subName: "Ms. Hart", calledBy: "Director" },
  { id: 2, date: "2026-05-05", coveringFor: "Mr. Levine", subName: "Mr. Owens", calledBy: "Director" },
  { id: 3, date: "2026-04-28", coveringFor: "Ms. Diaz", subName: "Ms. Hart", calledBy: "Director" },
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

const StatusBadge = ({ status }) => {
  const config = {
    present: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Present" },
    late: { bg: "bg-amber-50", text: "text-amber-700", label: "Late" },
    callout: { bg: "bg-red-50", text: "text-red-700", label: "Call-out" },
  }[status] || { bg: "bg-gray-50", text: "text-gray-600", label: status };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${config.bg} ${config.text}`}>{config.label}</span>;
};

const StaffPage = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const counts = useMemo(() => ({
    present: STAFF.filter((s) => s.today === "present").length,
    late: STAFF.filter((s) => s.today === "late").length,
    callout: STAFF.filter((s) => s.today === "callout").length,
  }), []);

  const chartData = [
    { name: "Present", value: counts.present, color: "#059669" },
    { name: "Late", value: counts.late, color: "#D97706" },
    { name: "Call-out", value: counts.callout, color: "#DC2626" },
  ];

  const totalPtoUsed = useMemo(() => STAFF.reduce((a, s) => a + s.ptoUsed, 0), []);
  const totalPtoAllowance = useMemo(() => STAFF.reduce((a, s) => a + s.ptoAllowance, 0), []);
  const ptoPercent = Math.round((totalPtoUsed / totalPtoAllowance) * 100);

  const filtered = useMemo(() => {
    if (filterStatus === "all") return STAFF;
    return STAFF.filter((s) => s.today === filterStatus);
  }, [filterStatus]);

  const sorted = useMemo(() => {
    const order = { name: 0, ptoUsed: 1, ptoRemaining: 2 };
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "ptoUsed") return b.ptoUsed - a.ptoUsed;
      if (sortBy === "ptoRemaining") return (a.ptoAllowance - a.ptoUsed) - (b.ptoAllowance - b.ptoUsed);
      return 0;
    });
  }, [filtered, sortBy]);

  const highPtoUsers = useMemo(() => STAFF.filter((s) => s.ptoUsed >= 7), []);

  const subStats = useMemo(() => ({
    total: SUBSTITUTES.length,
    thisWeek: SUBSTITUTES.filter((r) => {
      const diff = Math.ceil((new Date() - new Date(r.date)) / 86400000);
      return diff >= 0 && diff <= 7;
    }).length,
    uniqueSubs: [...new Set(SUBSTITUTES.map((r) => r.subName))].length,
  }), []);

  const fmtDateSub = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500 mt-1">{STAFF.length} total · {counts.present} present today</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={Users} label="Total Staff" value={STAFF.length} iconBg="bg-blue-50 text-blue-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={UserCheck} label={counts.present === STAFF.length ? "All Present" : "Present Today"} value={counts.present} sub={counts.late > 0 || counts.callout > 0 ? `${counts.late} late · ${counts.callout} out` : "Full attendance"} iconBg="bg-emerald-50 text-emerald-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Percent} label="PTO Used" value={`${ptoPercent}%`} sub={`${totalPtoUsed}/${totalPtoAllowance} days`} iconBg="bg-purple-50 text-purple-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={AlertTriangle} label="High PTO Usage" value={highPtoUsers.length} sub={highPtoUsers.length > 0 ? "Staff using ≥70% allowance" : "All within healthy range"} iconBg={highPtoUsers.length > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"} valueColor={highPtoUsers.length > 0 ? "text-red-600" : "text-gray-900"} />
        </motion.div>
      </div>

      {/* Attendance Chart + PTO Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="md:col-span-1">
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2"><Clock size={16} /> Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} width={80} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2"><Calendar size={16} /> PTO Summary</CardTitle>
              <CardDescription>{ptoPercent}% of total PTO allowance used YTD</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STAFF.map((s) => {
                  const remaining = s.ptoAllowance - s.ptoUsed;
                  const usagePct = Math.round((s.ptoUsed / s.ptoAllowance) * 100);
                  const isHigh = usagePct >= 70;
                  return (
                    <div key={s.id} className={`p-3 rounded-xl ${isHigh ? "bg-red-50" : "bg-gray-50"}`}>
                      <p className="text-xs font-semibold text-gray-900 truncate">{s.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isHigh ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${usagePct}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold ${isHigh ? "text-red-600" : "text-gray-500"}`}>{s.ptoUsed}/{s.ptoAllowance}</span>
                      </div>
                      {isHigh && <p className="text-[10px] text-red-500 mt-0.5">{remaining} days remaining</p>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Substitutes Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck size={16} className="text-purple-500" /> Substitutes
            </CardTitle>
            <CardDescription>
              {subStats.total} substitutes this month · {subStats.uniqueSubs} unique subs · {subStats.thisWeek} this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-purple-50">
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Total</p>
                <p className="text-xl font-bold text-gray-900">{subStats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <p className="text-[10px] font-semibold text-gray-400 uppercase">This Week</p>
                <p className="text-xl font-bold text-blue-600">{subStats.thisWeek}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Unique Subs</p>
                <p className="text-xl font-bold text-gray-900">{subStats.uniqueSubs}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50">
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Coverage Rate</p>
                <p className="text-xl font-bold text-emerald-600">{subStats.thisWeek > 0 ? `${Math.round((subStats.thisWeek / subStats.total) * 100)}%` : "0%"}</p>
              </div>
            </div>
            <div className="space-y-2">
              {SUBSTITUTES.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                      {entry.subName.split(" ").slice(-1)[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                        {entry.subName} <ArrowRight size={12} className="text-gray-400" /> {entry.coveringFor}
                      </p>
                      <p className="text-xs text-gray-400">{fmtDateSub(entry.date)} · Recorded by {entry.calledBy}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{entry.subName.split(" ")[0]} covered</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Staff Roster */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2"><Users size={16} /> Staff Roster</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Status:</span>
                {["all", "present", "late", "callout"].map((s) => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${filterStatus === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sorted.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => setSortBy("ptoUsed")}>
                        PTO Used {sortBy === "ptoUsed" && "↓"}
                      </th>
                      <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => setSortBy("ptoRemaining")}>
                        Remaining {sortBy === "ptoRemaining" && "↓"}
                      </th>
                      <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sorted.map((s) => {
                      const remaining = s.ptoAllowance - s.ptoUsed;
                      const usagePct = Math.round((s.ptoUsed / s.ptoAllowance) * 100);
                      const isHigh = usagePct >= 70;
                      return (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${s.today === "present" ? "bg-emerald-500" : s.today === "late" ? "bg-amber-500" : "bg-red-500"}`}>
                                {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <span className="font-medium text-gray-900">{s.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-gray-500">{s.role}</td>
                          <td className="py-3 px-2"><StatusBadge status={s.today} /></td>
                          <td className="py-3 px-2 text-center font-medium text-gray-900">{s.ptoUsed}</td>
                          <td className={`py-3 px-2 text-center font-medium ${isHigh ? "text-red-600" : "text-gray-900"}`}>{remaining}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${isHigh ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${usagePct}%` }} />
                              </div>
                              <span className={`text-[10px] font-bold ${isHigh ? "text-red-600" : "text-gray-400"}`}>{usagePct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">No staff match the selected filter.</div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StaffPage;
