import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  PiggyBank,
  Wallet,
  Percent,
  Building2,
  LineChart,
  ArrowUpRight,
  BarChart3,
  RefreshCw,
  Calendar,
  Lightbulb,
  Users,
  Shield,
  Home,
  Zap,
  Apple,
  Landmark,
  BookOpen,
  Monitor,
  Megaphone,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import InsightCard from "./components/InsightCard";
import QuickBooksCard from "./components/QuickBooksCard";
import BudgetVsActualCard from "./components/BudgetVsActualCard";
import FullYearTable from "./components/FullYearTable";

// ─── Data ─────────────────────────────────────────────────────────
// Structured as if coming from QuickBooks API + AI analysis layer

const CASHFLOW_YEARS = [2022, 2023, 2024, 2025, 2026];
const CURRENT_YEAR = 2026;

// ─── Icon map for cashflow categories ─────────────────────────
const CATEGORY_ICONS = {
  Payroll: Users,
  Insurance: Shield,
  Mortgage: Home,
  Utilities: Zap,
  "Food Service": Apple,
  "Bank Fees": Landmark,
  "Accounting & CPA": BarChart3,
  "Curriculum & Books": BookOpen,
  "Tech & Equipment": Monitor,
  Marketing: Megaphone,
};

const CASHFLOW_DATA = [
  {
    category: "Payroll",
    values: { 2022: 798000, 2023: 845000, 2024: 882000, 2025: 920000, 2026: 365000 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Insurance",
    values: { 2022: 28000, 2023: 31000, 2024: 34000, 2025: 38000, 2026: 16500 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Mortgage",
    values: { 2022: 138000, 2023: 138000, 2024: 138000, 2025: 142000, 2026: 56800 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Utilities",
    values: { 2022: 19000, 2023: 22000, 2024: 24000, 2025: 26000, 2026: 9200 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Food Service",
    values: { 2022: 42000, 2023: 48000, 2024: 51000, 2025: 49000, 2026: 18800 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Bank Fees",
    values: { 2022: 2400, 2023: 2800, 2024: 3100, 2025: 3500, 2026: 1300 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Accounting & CPA",
    values: { 2022: 8000, 2023: 8500, 2024: 9200, 2025: 10000, 2026: 4500 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Curriculum & Books",
    values: { 2022: 45000, 2023: 52000, 2024: 56000, 2025: 58000, 2026: 22500 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Tech & Equipment",
    values: { 2022: 22000, 2023: 28000, 2024: 35000, 2025: 31000, 2026: 12500 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Marketing",
    values: { 2022: 14000, 2023: 18000, 2024: 21000, 2025: 22000, 2026: 8800 },
    ytdNote: "Jan–Apr",
  },
];

const CASHFLOW_INSIGHTS = [
  {
    tone: "red",
    icon: "ArrowUp",
    text: "Insurance up 12% YoY — biggest jump in 5 years. Liability renewal July 1 — shop rates by May 2 (60 days out).",
  },
  {
    tone: "red",
    icon: "ArrowUp",
    text: "Payroll grew 4.3% YoY in 2025 — pace matches prior years but is now the biggest single line by far.",
  },
  {
    tone: "amber",
    icon: "ArrowRight",
    text: "Mortgage payment increased 2.9% in 2025 — first change in 3 years. Check if escrow recalc needed.",
  },
  {
    tone: "green",
    icon: "ArrowDown",
    text: "Food costs down 4% YoY — switched vendors in March 2025. Holding the savings.",
  },
  {
    tone: "green",
    icon: "ArrowDown",
    text: "Tech & Equipment down 11% in 2025 vs 2024 spike — last year was Chromebook refresh, this year normal.",
  },
  {
    tone: "amber",
    icon: "ArrowUp",
    text: "Bank Fees up 13% YoY — review accounts, may be opportunity to consolidate.",
  },
];

const QUICKBOOKS_STATUS = {
  connected: true,
  lastSync: "2026-05-11 02:34 AM",
  pendingTransactions: 3,
  reconciled: true,
  bankBalance: 487200,
  bankAccount: "Chase Business Checking · 4832",
  creditBalance: 12400,
  receivable: 89200,
  payable: 23100,
};

const SCHOOL_BUDGET_TOTAL = 1850000;
const SCHOOL_BUDGET_CATEGORIES = [
  { name: "Payroll & Benefits", spent: 920000, budget: 1200000 },
  { name: "Facilities & Rent", spent: 142000, budget: 180000 },
  { name: "Curriculum & Books", spent: 58000, budget: 75000 },
  { name: "Insurance", spent: 38000, budget: 45000 },
  { name: "Marketing & Admissions", spent: 22000, budget: 35000 },
  { name: "Tech & Equipment", spent: 31000, budget: 50000 },
  { name: "Utilities", spent: 26000, budget: 38000 },
  { name: "Director's Discretionary", spent: 7200, budget: 9000 },
];

const totalBudgetSpent = SCHOOL_BUDGET_CATEGORIES.reduce((a, c) => a + c.spent, 0);
const budgetPct = Math.round((totalBudgetSpent / SCHOOL_BUDGET_TOTAL) * 100);

// Revenue estimates (from tuition + scholarships)
const REVENUE_YTD = 1245200;
const EXPENSES_YTD = totalBudgetSpent;
const NET_CASHFLOW = REVENUE_YTD - EXPENSES_YTD;
const OP_MARGIN = REVENUE_YTD > 0 ? Math.round((NET_CASHFLOW / REVENUE_YTD) * 100) : 0;

// ─── Helpers ──────────────────────────────────────────────────────

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const fmtMoneyShort = (n) =>
  n >= 1000000 ? "$" + (n / 1000000).toFixed(1) + "M"
    : n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K"
      : "$" + n;

const getYoYChange = (category, year) => {
  const prevYear = year - 1;
  const current = category.values[year];
  const previous = category.values[prevYear];
  if (!current || !previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// Category color map
const CATEGORY_COLORS = {
  Payroll: "#2563EB",
  Insurance: "#F97316",
  Mortgage: "#7C3AED",
  Utilities: "#0EA5E9",
  "Food Service": "#16A34A",
  "Bank Fees": "#DC2626",
  "Accounting & CPA": "#D97706",
  "Curriculum & Books": "#EC4899",
  "Tech & Equipment": "#6366F1",
  Marketing: "#14B8A6",
};

const ACTIVE_COLORS = ["#2563EB", "#16A34A", "#F97316", "#7C3AED", "#DC2626", "#0EA5E9"];

// Components imported from ./components/

// ─── Main Component ───────────────────────────────────────────────

const CashFlowPage = () => {
  const [selectedCategories, setSelectedCategories] = useState(
    CASHFLOW_DATA.slice(0, 5).map((c) => c.category)
  );
  const [viewMode, setViewMode] = useState("individual"); // individual | stacked
  const [compareYear, setCompareYear] = useState(CURRENT_YEAR);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Chart data: for each year, show values for selected categories
  const chartData = CASHFLOW_YEARS.map((year) => {
    const entry = { year: String(year) };
    selectedCategories.forEach((cat) => {
      const data = CASHFLOW_DATA.find((c) => c.category === cat);
      entry[cat] = data ? data.values[year] || 0 : 0;
    });
    return entry;
  });

  // Selected categories data for comparison table
  const selectedData = CASHFLOW_DATA.filter((c) => selectedCategories.includes(c.category));

  // Previous year comparison
  const prevYear = compareYear - 1;

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
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
              Cash Flow
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Synced
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            YTD {fmtMoneyShort(EXPENSES_YTD)} expenses · {fmtMoneyShort(REVENUE_YTD)} revenue ·{" "}
            <span className={NET_CASHFLOW >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
              {fmtMoneyShort(NET_CASHFLOW)} net
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" className="bg-white text-xs md:text-sm px-2.5 md:px-3">
            <RefreshCw size={14} className="mr-1.5" /> Sync
          </Button>
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm px-2.5 md:px-3">
            <BarChart3 size={14} className="mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={TrendingUp}
            label="Revenue (YTD)"
            value={fmtMoneyShort(REVENUE_YTD)}
            sub="Tuition + Scholarships"
            iconBg="bg-emerald-50 text-emerald-600"
            trend={<span className="flex items-center text-emerald-600 font-medium">                <ArrowUpRight size={12} className="mr-1" /> +6.2% vs last year</span>}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={PiggyBank}
            label="Expenses (YTD)"
            value={fmtMoneyShort(EXPENSES_YTD)}
            sub={`${budgetPct}% of annual budget`}
            iconBg="bg-red-50 text-red-500"
            trend={<span className="flex items-center text-amber-600 font-medium"><ArrowUpRight size={12} className="mr-1" /> +4.1% vs last year</span>}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Wallet}
            label="Net Cash Flow"
            value={fmtMoneyShort(NET_CASHFLOW)}
            sub={`YTD ${NET_CASHFLOW >= 0 ? "positive" : "negative"}`}
            iconBg={NET_CASHFLOW >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Percent}
            label="Operating Margin"
            value={`${OP_MARGIN}%`}
            sub={OP_MARGIN >= 30 ? "Healthy" : OP_MARGIN >= 15 ? "Monitoring" : "Critical"}
            iconBg={OP_MARGIN >= 30 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Building2}
            label="Bank Balance"
            value={fmtMoneyShort(QUICKBOOKS_STATUS.bankBalance)}
            sub={QUICKBOOKS_STATUS.bankAccount}
            iconBg="bg-purple-50 text-purple-600"
          />
        </motion.div>
      </div>

      {/* ── Year-over-Year Comparison ────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LineChart size={18} className="text-blue-500" />
                  Year-over-Year Comparison
                </CardTitle>
                <CardDescription>
                  Select categories to compare across {CASHFLOW_YEARS[0]}–{CURRENT_YEAR}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("individual")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      viewMode === "individual" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    onClick={() => setViewMode("stacked")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      viewMode === "stacked" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                    }`}
                  >
                    Stacked
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Category selector chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {CASHFLOW_DATA.map((cat) => {
                const on = selectedCategories.includes(cat.category);
                return (
                  <button
                    key={cat.category}
                    onClick={() => toggleCategory(cat.category)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                      on
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {(() => {
                      const CatIcon = CATEGORY_ICONS[cat.category];
                      return CatIcon ? <CatIcon size={12} /> : null;
                    })()}
                    {cat.category}
                  </button>
                );
              })}
            </div>

            {selectedCategories.length > 0 ? (
              <div className="h-[200px] md:h-[280px] w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%">
                  {viewMode === "individual" ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        dy={6}
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
                      <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        iconType="circle"
                        iconSize={8}
                      />
                      {selectedCategories.map((cat, i) => (
                        <Bar
                          key={cat}
                          dataKey={cat}
                          fill={ACTIVE_COLORS[i % ACTIVE_COLORS.length]}
                          radius={[4, 4, 0, 0]}
                          barSize={18}
                          name={cat}
                        />
                      ))}
                    </BarChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        dy={6}
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
                      <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        iconType="circle"
                        iconSize={8}
                      />
                      {selectedCategories.map((cat, i) => (
                        <Bar
                          key={cat}
                          dataKey={cat}
                          stackId="a"
                          fill={ACTIVE_COLORS[i % ACTIVE_COLORS.length]}
                          radius={[0, 0, 0, 0]}
                          name={cat}
                        />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-10 text-center">
                <BarChart3 size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Select categories above to view comparison</p>
              </div>
            )}

            {/* Comparison table */}
            {selectedData.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {compareYear} vs {prevYear} comparison
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left pb-2 font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="text-right pb-2 font-semibold text-gray-400 uppercase tracking-wider">{prevYear}</th>
                        <th className="text-right pb-2 font-semibold text-gray-400 uppercase tracking-wider">{compareYear}</th>
                        <th className="text-right pb-2 font-semibold text-gray-400 uppercase tracking-wider">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedData.map((cat) => {
                        const prev = cat.values[prevYear] || 0;
                        const curr = cat.values[compareYear] || 0;
                        const change = prev > 0 ? ((curr - prev) / prev) * 100 : 0;
                        const isUp = change > 0;
                        const isDown = change < 0;
                        return (
                          <tr key={cat.category} className="border-b border-gray-50">
                            <td className="py-2 font-medium text-gray-700">
                              <span className="inline-flex items-center gap-1.5">
                                {(() => {
                                  const CatIcon = CATEGORY_ICONS[cat.category];
                                  return CatIcon ? <CatIcon size={12} className="text-gray-400" /> : null;
                                })()}
                                {cat.category}
                              </span>
                            </td>
                            <td className="py-2 text-right text-gray-500">{fmtMoneyShort(prev)}</td>
                            <td className="py-2 text-right font-medium text-gray-900">{fmtMoneyShort(curr)}</td>
                            <td className={`py-2 text-right font-semibold ${
                              isUp ? "text-red-500" : isDown ? "text-emerald-600" : "text-gray-400"
                            }`}>
                              {isUp ? "↑" : isDown ? "↓" : "→"} {Math.abs(change).toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── AI Insights + QuickBooks Sync ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Insights */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500" />
                AI-Generated Observations
              </CardTitle>
              <CardDescription>
                Auto-detected from QuickBooks data · {CASHFLOW_INSIGHTS.length} insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {CASHFLOW_INSIGHTS.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <QuickBooksCard status={QUICKBOOKS_STATUS} />
      </div>

      <BudgetVsActualCard categories={SCHOOL_BUDGET_CATEGORIES} totalSpent={totalBudgetSpent} totalBudget={SCHOOL_BUDGET_TOTAL} budgetPct={budgetPct} />

      <FullYearTable data={CASHFLOW_DATA} years={CASHFLOW_YEARS} currentYear={CURRENT_YEAR} />
    </motion.div>
  );
};

export default CashFlowPage;
