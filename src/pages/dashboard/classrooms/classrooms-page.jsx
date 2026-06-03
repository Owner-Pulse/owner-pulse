import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  GraduationCap,
  AlertTriangle,
  BarChart3,
  School,
  Target,
} from "lucide-react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ─── Data Models ──────────────────────────────────────────────────

const CLASSROOMS = [
  {
    id: 1,
    name: "Age 1 — Bumblebees",
    program: "Age 1",
    tier: "preschool",
    capacity: 8,
    enrolled: 6,
    teacher: "Ms. Alvarez",
    tuitionPerSeat: 1100,
    monthlyCost: 6800,
    withdrawals: 3,
    nweaMap: null,
    lastYear: { enrolled: 7, monthlyProfit: -350, withdrawals: 2, nweaMap: null },
  },
  {
    id: 2,
    name: "Age 2 — Ladybugs",
    program: "Age 2",
    tier: "preschool",
    capacity: 10,
    enrolled: 9,
    teacher: "Ms. Soto",
    tuitionPerSeat: 1050,
    monthlyCost: 7200,
    withdrawals: 1,
    nweaMap: null,
    lastYear: { enrolled: 8, monthlyProfit: 1200, withdrawals: 2, nweaMap: null },
  },
  {
    id: 3,
    name: "PreK3 — Sunflower",
    program: "PreK3",
    tier: "preschool",
    capacity: 12,
    enrolled: 11,
    teacher: "Ms. Patel",
    tuitionPerSeat: 1000,
    monthlyCost: 7400,
    withdrawals: 0,
    nweaMap: null,
    lastYear: { enrolled: 10, monthlyProfit: 2600, withdrawals: 0, nweaMap: null },
  },
  {
    id: 4,
    name: "PreK4 — Oak",
    program: "PreK4",
    tier: "preschool",
    capacity: 16,
    enrolled: 16,
    teacher: "Ms. Rivera",
    tuitionPerSeat: 950,
    monthlyCost: 8200,
    withdrawals: 0,
    nweaMap: null,
    lastYear: { enrolled: 15, monthlyProfit: 6050, withdrawals: 1, nweaMap: null },
  },
  {
    id: 5,
    name: "VPK — Maple",
    program: "VPK",
    tier: "preschool",
    capacity: 18,
    enrolled: 17,
    teacher: "Ms. Brooks",
    tuitionPerSeat: 425,
    monthlyCost: 7600,
    withdrawals: 1,
    nweaMap: null,
    lastYear: { enrolled: 18, monthlyProfit: 50, withdrawals: 0, nweaMap: null },
  },
  {
    id: 6,
    name: "K — Sequoia",
    program: "K",
    tier: "k8",
    capacity: 20,
    enrolled: 19,
    teacher: "Mr. Nguyen",
    tuitionPerSeat: 850,
    monthlyCost: 9100,
    incidents: 1,
    nweaMap: 152,
    lastYear: { enrolled: 18, monthlyProfit: 6200, incidents: 2, nweaMap: 148 },
  },
  {
    id: 7,
    name: "1st — Cypress",
    program: "1st",
    tier: "k8",
    capacity: 20,
    enrolled: 18,
    teacher: "Ms. Cohen",
    tuitionPerSeat: 875,
    monthlyCost: 9200,
    incidents: 0,
    nweaMap: 168,
    lastYear: { enrolled: 19, monthlyProfit: 7425, incidents: 1, nweaMap: 165 },
  },
  {
    id: 8,
    name: "2nd — Willow",
    program: "2nd",
    tier: "k8",
    capacity: 22,
    enrolled: 21,
    teacher: "Ms. Diaz",
    tuitionPerSeat: 900,
    monthlyCost: 9400,
    incidents: 2,
    nweaMap: 184,
    lastYear: { enrolled: 20, monthlyProfit: 8600, incidents: 1, nweaMap: 182 },
  },
  {
    id: 9,
    name: "3rd — Birch",
    program: "3rd",
    tier: "k8",
    capacity: 22,
    enrolled: 20,
    teacher: "Mr. Park",
    tuitionPerSeat: 925,
    monthlyCost: 9600,
    incidents: 1,
    nweaMap: 195,
    lastYear: { enrolled: 21, monthlyProfit: 9825, incidents: 0, nweaMap: 192 },
  },
  {
    id: 10,
    name: "4th — Magnolia",
    program: "4th",
    tier: "k8",
    capacity: 24,
    enrolled: 22,
    teacher: "Mr. O'Brien",
    tuitionPerSeat: 950,
    monthlyCost: 9800,
    incidents: 0,
    nweaMap: 204,
    lastYear: { enrolled: 20, monthlyProfit: 9200, incidents: 1, nweaMap: 199 },
  },
  {
    id: 11,
    name: "5th — Cedar",
    program: "5th",
    tier: "k8",
    capacity: 24,
    enrolled: 19,
    teacher: "Ms. Hassan",
    tuitionPerSeat: 975,
    monthlyCost: 10000,
    incidents: 5,
    nweaMap: 198,
    lastYear: { enrolled: 22, monthlyProfit: 11450, incidents: 2, nweaMap: 207 },
  },
  {
    id: 12,
    name: "6th — Palm",
    program: "6th",
    tier: "k8",
    capacity: 24,
    enrolled: 17,
    teacher: "Mr. Levine",
    tuitionPerSeat: 1000,
    monthlyCost: 10200,
    incidents: 3,
    nweaMap: 209,
    lastYear: { enrolled: 19, monthlyProfit: 8800, incidents: 4, nweaMap: 208 },
  },
  {
    id: 13,
    name: "7th — Live Oak",
    program: "7th",
    tier: "k8",
    capacity: 24,
    enrolled: 14,
    teacher: "Ms. Foster",
    tuitionPerSeat: 1025,
    monthlyCost: 10400,
    incidents: 2,
    nweaMap: 215,
    lastYear: { enrolled: 16, monthlyProfit: 6000, incidents: 1, nweaMap: 213 },
  },
  {
    id: 14,
    name: "8th — Banyan",
    program: "8th",
    tier: "k8",
    capacity: 24,
    enrolled: 13,
    teacher: "Mr. Tate",
    tuitionPerSeat: 1050,
    monthlyCost: 10600,
    incidents: 4,
    nweaMap: 218,
    lastYear: { enrolled: 18, monthlyProfit: 8300, incidents: 2, nweaMap: 220 },
  },
];

// NWEA MAP grade-level RIT benchmarks
const NWEA_BENCHMARK = {
  K: 159, "1st": 177, "2nd": 188, "3rd": 199,
  "4th": 208, "5th": 215, "6th": 220, "7th": 224, "8th": 228,
};

// ─── Helpers ──────────────────────────────────────────────────────

const classroomEconomics = (c) => {
  const monthlyRevenue = c.tuitionPerSeat * c.enrolled;
  const monthlyProfit = monthlyRevenue - c.monthlyCost;
  const margin = monthlyRevenue > 0 ? Math.round((monthlyProfit / monthlyRevenue) * 100) : 0;
  return { monthlyRevenue, monthlyProfit, margin };
};

const yoyDelta = (current, lastYear, goodWhenUp = true) => {
  if (current === null || current === undefined || lastYear === null || lastYear === undefined) return null;
  const delta = current - lastYear;
  if (delta === 0) return { arrow: "→", color: "text-gray-400", text: "flat" };
  const isImprovement = goodWhenUp ? delta > 0 : delta < 0;
  return {
    arrow: delta > 0 ? "▲" : "▼",
    color: isImprovement ? "text-emerald-600" : "text-red-500",
    text: `${delta > 0 ? "+" : ""}${delta}`,
  };
};

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const fmtMoneyShort = (n) => (n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + n);

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── KPI Card ─────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, accent, iconBg }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${iconBg || "bg-blue-50 text-blue-600"}`}>
          <Icon size={18} />
        </div>
      </div>
      {sub && (
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">{sub}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

// ─── YoY Badge ────────────────────────────────────────────────────

const YoYBadge = ({ delta }) => {
  if (!delta) return null;
  const bgColor = delta.color.includes("emerald") ? "bg-emerald-50" : delta.color.includes("red") ? "bg-red-50" : "bg-gray-50";
  const textColor = delta.color;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${bgColor} ${textColor}`}>
      {delta.arrow} {delta.text}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────

const ClassroomsPage = () => {
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState("profit"); // profit, margin, enrolled

  const filtered = tierFilter === "all"
    ? CLASSROOMS
    : CLASSROOMS.filter((c) => c.tier === tierFilter);

  const sorted = [...filtered].sort((a, b) => {
    const aEcon = classroomEconomics(a);
    const bEcon = classroomEconomics(b);
    if (sortBy === "profit") return bEcon.monthlyProfit - aEcon.monthlyProfit;
    if (sortBy === "margin") return bEcon.margin - aEcon.margin;
    return b.enrolled - a.enrolled;
  });

  const totalEnrolled = CLASSROOMS.reduce((a, c) => a + c.enrolled, 0);
  const totalCapacity = CLASSROOMS.reduce((a, c) => a + c.capacity, 0);
  const totalRevenue = CLASSROOMS.reduce((a, c) => a + classroomEconomics(c).monthlyRevenue, 0);
  const totalCost = CLASSROOMS.reduce((a, c) => a + c.monthlyCost, 0);
  const totalProfit = CLASSROOMS.reduce((a, c) => a + classroomEconomics(c).monthlyProfit, 0);
  const profitable = CLASSROOMS.filter((c) => classroomEconomics(c).monthlyProfit > 0).length;
  const losing = CLASSROOMS.length - profitable;
  const overallMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
  const avgFillRate = Math.round((totalEnrolled / totalCapacity) * 100);

  // Chart data
  const profitChartData = CLASSROOMS.map((c) => {
    const econ = classroomEconomics(c);
    return { name: c.program, profit: econ.monthlyProfit, revenue: econ.monthlyRevenue };
  });

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Classrooms <span className="text-sm md:text-base font-normal text-gray-500 hidden sm:inline">— P&amp;L + Performance</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            {CLASSROOMS.length} classrooms · {totalEnrolled} students · {fmtMoneyShort(totalProfit)}/mo
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" className="bg-white text-xs md:text-sm px-2.5 md:px-3">
            <BarChart3 size={14} className="mr-1.5" /> Reports
          </Button>
          <Button className="bg-[#0A0F1E] hover:bg-black text-white text-xs md:text-sm px-2.5 md:px-3">
            <School size={14} className="mr-1.5" /> Manage
          </Button>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={DollarSign}
            label="Net Monthly Profit"
            value={totalProfit >= 0 ? fmtMoneyShort(totalProfit) : `-${fmtMoneyShort(Math.abs(totalProfit))}`}
            sub={`${overallMargin}% margin overall`}
            iconBg={totalProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={BookOpen}
            label="Classrooms"
            value={`${profitable}/${CLASSROOMS.length}`}
            sub={`${profitable} profitable · ${losing} losing`}
            iconBg="bg-blue-50 text-blue-600"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Users}
            label="Total Students"
            value={totalEnrolled}
            sub={`out of ${totalCapacity} capacity`}
            iconBg="bg-purple-50 text-purple-600"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Target}
            label="Avg Fill Rate"
            value={`${avgFillRate}%`}
            sub={`${totalCapacity - totalEnrolled} open seats`}
            iconBg="bg-amber-50 text-amber-600"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={TrendingUp}
            label="Monthly Revenue"
            value={fmtMoneyShort(totalRevenue)}
            sub={`vs ${fmtMoneyShort(totalCost)} costs`}
            iconBg="bg-emerald-50 text-emerald-600"
          />
        </motion.div>
      </div>

      {/* ── P&L Summary + Filters ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall P&L */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign size={16} className="text-emerald-500" />
                P&L Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Monthly Tuition Revenue</span>
                <span className="text-sm font-bold text-gray-900">{fmtMoney(totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Monthly Operating Costs</span>
                <span className="text-sm font-bold text-red-500">{fmtMoney(totalCost)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Gross Margin</span>
                <span className={`text-sm font-bold ${totalProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {overallMargin}%
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-semibold text-gray-700">Net Monthly Profit</span>
                <span className={`text-lg font-extrabold ${totalProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {totalProfit >= 0 ? "" : "-"}{fmtMoneyShort(Math.abs(totalProfit))}
                </span>
              </div>

              <div className="mt-3 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(Math.max(overallMargin + 50, 5), 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center">
                Margin benchmark: healthy &gt; 30% · monitoring &gt; 15% · critical &lt; 15%
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profit by Classroom Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Monthly Profit by Classroom</CardTitle>
                  <CardDescription>Sorted by profitability</CardDescription>
                </div>
                <div className="flex items-center gap-1.5">
                  {["profit", "margin", "enrolled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                        sortBy === s
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[160px] md:h-[200px] w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 10 }}
                      dy={4}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 10 }}
                      tickFormatter={(v) => `${v / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        fontSize: 12,
                      }}
                      formatter={(value) => [fmtMoney(value), ""]}
                    />
                    <Bar dataKey="profit" radius={[4, 4, 0, 0]} barSize={22} name="Monthly Profit">
                      {profitChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.profit >= 0 ? "#16A34A" : "#DC2626"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Tier + Sort Filters ──────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filter:</span>
          {[
            { id: "all", label: "All Classrooms" },
            { id: "preschool", label: "Preschool" },
            { id: "k8", label: "K–8" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTierFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                tierFilter === f.id
                  ? "bg-[#0A0F1E] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">
          {sorted.length} classroom{sorted.length !== 1 ? "s" : ""}
        </span>
      </motion.div>

      {/* ── Classroom Detail Cards ───────────────────────────────── */}
      <div className="space-y-3">
        {sorted.map((classroom, index) => {
          const econ = classroomEconomics(classroom);
          const isPreschool = classroom.tier === "preschool";
          const isK8 = classroom.tier === "k8";
          const fillRate = Math.round((classroom.enrolled / classroom.capacity) * 100);
          const isFull = classroom.enrolled >= classroom.capacity;
          const isLowFill = fillRate < 70;
          const nweaBench = isK8 ? NWEA_BENCHMARK[classroom.program] : null;
          const nweaDelta = isK8 && classroom.nweaMap && nweaBench ? yoyDelta(classroom.nweaMap, nweaBench) : null;
          const nweaYoY = isK8 && classroom.nweaMap && classroom.lastYear.nweaMap
            ? yoyDelta(classroom.nweaMap, classroom.lastYear.nweaMap)
            : null;
          const profitYoY = yoyDelta(econ.monthlyProfit, classroom.lastYear.monthlyProfit);
          const enrolledYoY = yoyDelta(classroom.enrolled, classroom.lastYear.enrolled);
          const incidentsYoY = isK8 ? yoyDelta(classroom.incidents || 0, classroom.lastYear.incidents, false) : null;
          const withdrawalsYoY = isPreschool ? yoyDelta(classroom.withdrawals || 0, classroom.lastYear.withdrawals, false) : null;

          return (
            <motion.div key={classroom.id} variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  {/* Row 1: Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          econ.monthlyProfit > 0 ? "bg-emerald-50" : "bg-red-50"
                        }`}
                      >
                        {isPreschool ? (
                          <span className="text-base">🧸</span>
                        ) : (
                          <GraduationCap
                            size={18}
                            className={econ.monthlyProfit > 0 ? "text-emerald-600" : "text-red-500"}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-sm md:text-base">
                            {classroom.name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isPreschool
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}>
                            {isPreschool ? "Preschool" : "K–8"}
                          </span>
                          <span className="text-xs text-gray-400">{classroom.teacher}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-lg font-extrabold ${
                        econ.monthlyProfit > 0 ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {econ.monthlyProfit < 0 ? "-" : ""}
                        {fmtMoneyShort(Math.abs(econ.monthlyProfit))}/mo
                      </span>
                      <YoYBadge delta={profitYoY} />
                    </div>
                  </div>

                  {/* Row 2: Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                    {/* Enrolled / Capacity */}
                    <div className="p-2.5 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Enrollment
                        </span>
                        <YoYBadge delta={enrolledYoY} />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-extrabold text-gray-900">{classroom.enrolled}</span>
                        <span className="text-xs text-gray-400">/ {classroom.capacity}</span>
                      </div>
                      <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isFull ? "bg-amber-500" : isLowFill ? "bg-red-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${fillRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="p-2.5 rounded-lg bg-gray-50">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                        Revenue
                      </span>
                      <span className="text-base font-extrabold text-gray-900">
                        {fmtMoneyShort(econ.monthlyRevenue)}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        ${classroom.tuitionPerSeat}/seat
                      </p>
                    </div>

                    {/* Cost */}
                    <div className="p-2.5 rounded-lg bg-gray-50">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                        Cost
                      </span>
                      <span className="text-base font-extrabold text-gray-900">
                        {fmtMoneyShort(classroom.monthlyCost)}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {fmtMoneyShort(Math.round(classroom.monthlyCost / classroom.capacity))}/seat
                      </p>
                    </div>

                    {/* Margin */}
                    <div className="p-2.5 rounded-lg bg-gray-50">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                        Margin
                      </span>
                      <span className={`text-base font-extrabold ${
                        econ.margin >= 30
                          ? "text-emerald-600"
                          : econ.margin >= 15
                            ? "text-amber-600"
                            : "text-red-500"
                      }`}>
                        {econ.margin}%
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {econ.margin >= 30 ? "Healthy" : econ.margin >= 15 ? "Monitoring" : "Critical"}
                      </p>
                    </div>

                    {/* K-8: NWEA MAP */}
                    {isK8 && (
                      <div className="p-2.5 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            NWEA MAP
                          </span>
                          {nweaYoY && <YoYBadge delta={nweaYoY} />}
                        </div>
                        <span className={`text-base font-extrabold ${
                          nweaDelta && nweaDelta.color.includes("emerald")
                            ? "text-emerald-600"
                            : nweaDelta && nweaDelta.color.includes("red")
                              ? "text-amber-600"
                              : "text-gray-900"
                        }`}>
                          {classroom.nweaMap || "—"}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Benchmark: {nweaBench || "—"}
                        </p>
                      </div>
                    )}

                    {/* K-8: Incidents YTD */}
                    {isK8 && (
                      <div className="p-2.5 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Incidents
                          </span>
                          {incidentsYoY && <YoYBadge delta={incidentsYoY} />}
                        </div>
                        <span className={`text-base font-extrabold ${
                          (classroom.incidents || 0) > 3
                            ? "text-red-500"
                            : (classroom.incidents || 0) > 1
                              ? "text-amber-600"
                              : "text-gray-900"
                        }`}>
                          {classroom.incidents || 0}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">YTD</p>
                      </div>
                    )}

                    {/* Preschool: Withdrawals YTD */}
                    {isPreschool && (
                      <div className="p-2.5 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Withdrawals
                          </span>
                          {withdrawalsYoY && <YoYBadge delta={withdrawalsYoY} />}
                        </div>
                        <span className={`text-base font-extrabold ${
                          (classroom.withdrawals || 0) > 2
                            ? "text-red-500"
                            : (classroom.withdrawals || 0) > 0
                              ? "text-amber-600"
                              : "text-gray-900"
                        }`}>
                          {classroom.withdrawals || 0}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">YTD</p>
                      </div>
                    )}

                    {/* Preschool: Fill Rate */}
                    {isPreschool && (
                      <div className="p-2.5 rounded-lg bg-gray-50">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                          Fill Rate
                        </span>
                        <span className={`text-base font-extrabold ${
                          isFull ? "text-amber-600" : isLowFill ? "text-red-500" : "text-emerald-600"
                        }`}>
                          {fillRate}%
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {isFull ? "At capacity" : `${classroom.capacity - classroom.enrolled} open`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Warning if losing money */}
                  {econ.monthlyProfit <= 0 && (
                    <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                      <p className="text-xs text-red-700">
                        <span className="font-bold">Loss-making classroom.</span>{" "}
                        Operating costs of {fmtMoneyShort(classroom.monthlyCost)} exceed revenue of{" "}
                        {fmtMoneyShort(econ.monthlyRevenue)}. Review pricing or enrollment strategy.
                      </p>
                    </div>
                  )}
                  {isLowFill && econ.monthlyProfit > 0 && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
                      <TrendingDown size={14} className="text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-amber-700">
                        <span className="font-bold">Low enrollment.</span>{" "}
                        {classroom.enrolled}/{classroom.capacity} enrolled ({fillRate}% fill rate).
                        {classroom.capacity - classroom.enrolled} empty seat{classroom.capacity - classroom.enrolled > 1 ? "s" : ""}.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {sorted.length === 0 && (
          <div className="py-12 text-center">
            <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No classrooms match this filter.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClassroomsPage;
