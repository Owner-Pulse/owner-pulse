import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Building2,
  Wallet,
  Percent,
  ArrowUpRight,
  Lightbulb,
  LineChart,
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

// ─── Data ─────────────────────────────────────────────────────────
// Structured as if coming from QuickBooks API + AI analysis layer

const CASHFLOW_YEARS = [2022, 2023, 2024, 2025, 2026];
const CURRENT_YEAR = 2026;

const CASHFLOW_DATA = [
  {
    category: "Payroll",
    icon: "👥",
    values: { 2022: 798000, 2023: 845000, 2024: 882000, 2025: 920000, 2026: 365000 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Insurance",
    icon: "🛡",
    values: { 2022: 28000, 2023: 31000, 2024: 34000, 2025: 38000, 2026: 16500 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Mortgage",
    icon: "🏠",
    values: { 2022: 138000, 2023: 138000, 2024: 138000, 2025: 142000, 2026: 56800 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Utilities",
    icon: "⚡",
    values: { 2022: 19000, 2023: 22000, 2024: 24000, 2025: 26000, 2026: 9200 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Food Service",
    icon: "🍎",
    values: { 2022: 42000, 2023: 48000, 2024: 51000, 2025: 49000, 2026: 18800 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Bank Fees",
    icon: "🏦",
    values: { 2022: 2400, 2023: 2800, 2024: 3100, 2025: 3500, 2026: 1300 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Accounting & CPA",
    icon: "📊",
    values: { 2022: 8000, 2023: 8500, 2024: 9200, 2025: 10000, 2026: 4500 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Curriculum & Books",
    icon: "📚",
    values: { 2022: 45000, 2023: 52000, 2024: 56000, 2025: 58000, 2026: 22500 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Tech & Equipment",
    icon: "💻",
    values: { 2022: 22000, 2023: 28000, 2024: 35000, 2025: 31000, 2026: 12500 },
    ytdNote: "Jan–Apr",
  },
  {
    category: "Marketing",
    icon: "📣",
    values: { 2022: 14000, 2023: 18000, 2024: 21000, 2025: 22000, 2026: 8800 },
    ytdNote: "Jan–Apr",
  },
];

const CASHFLOW_INSIGHTS = [
  {
    tone: "red",
    icon: "↑",
    text: "Insurance up 12% YoY — biggest jump in 5 years. Liability renewal July 1 — shop rates by May 2 (60 days out).",
  },
  {
    tone: "red",
    icon: "↑",
    text: "Payroll grew 4.3% YoY in 2025 — pace matches prior years but is now the biggest single line by far.",
  },
  {
    tone: "amber",
    icon: "→",
    text: "Mortgage payment increased 2.9% in 2025 — first change in 3 years. Check if escrow recalc needed.",
  },
  {
    tone: "green",
    icon: "↓",
    text: "Food costs down 4% YoY — switched vendors in March 2025. Holding the savings.",
  },
  {
    tone: "green",
    icon: "↓",
    text: "Tech & Equipment down 11% in 2025 vs 2024 spike — last year was Chromebook refresh, this year normal.",
  },
  {
    tone: "amber",
    icon: "↑",
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

// ─── KPI Card ─────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, iconBg, trend }) => (
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
      {trend && <div className="mt-2 text-xs">{trend}</div>}
    </CardContent>
  </Card>
);

// ─── Insight Card ─────────────────────────────────────────────────

const InsightCard = ({ insight }) => {
  const styles = {
    red: { border: "border-red-200", bg: "bg-red-50", icon: "text-red-500", text: "text-red-800" },
    amber: { border: "border-amber-200", bg: "bg-amber-50", icon: "text-amber-500", text: "text-amber-800" },
    green: { border: "border-emerald-200", bg: "bg-emerald-50", icon: "text-emerald-500", text: "text-emerald-800" },
  };
  const s = styles[insight.tone] || styles.amber;

  return (
    <div className={`p-3 rounded-xl border ${s.border} ${s.bg} flex items-start gap-2.5`}>
      <span className={`text-sm font-bold flex-shrink-0 mt-0.5 ${s.icon}`}>{insight.icon}</span>
      <p className={`text-xs leading-relaxed ${s.text}`}>{insight.text}</p>
    </div>
  );
};

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Cash Flow
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              QuickBooks synced
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            YTD {fmtMoneyShort(EXPENSES_YTD)} expenses · {fmtMoneyShort(REVENUE_YTD)} revenue ·{" "}
            <span className={NET_CASHFLOW >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
              {fmtMoneyShort(NET_CASHFLOW)} net
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">
            <RefreshCw size={16} className="mr-2" /> Sync with QuickBooks
          </Button>
          <Button className="bg-[#0A0F1E] hover:bg-black text-white">
            <BarChart3 size={16} className="mr-2" /> Export Report
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
            trend={<span className="flex items-center text-emerald-600 font-medium"><ArrowUpRight size={12} className="mr-1" /> +6.2% vs last year</span>}
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
                    <span>{cat.icon}</span>
                    {cat.category}
                  </button>
                );
              })}
            </div>

            {selectedCategories.length > 0 ? (
              <div className="h-[280px] w-full">
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
                              <span className="mr-1.5">{cat.icon}</span> {cat.category}
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

        {/* QuickBooks Sync Panel */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 size={16} className="text-blue-500" />
                  QuickBooks
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  QUICKBOOKS_STATUS.connected
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    QUICKBOOKS_STATUS.connected ? "bg-emerald-500" : "bg-red-500"
                  }`} />
                  {QUICKBOOKS_STATUS.connected ? "Connected" : "Disconnected"}
                </span>
              </CardTitle>
              <CardDescription>
                {QUICKBOOKS_STATUS.bankAccount}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Bank Balance</span>
                <span className="text-xl font-bold text-gray-900">
                  {fmtMoney(QUICKBOOKS_STATUS.bankBalance)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Receivables
                  </span>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {fmtMoneyShort(QUICKBOOKS_STATUS.receivable)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Payables
                  </span>
                  <p className="text-lg font-bold text-amber-600 mt-1">
                    {fmtMoneyShort(QUICKBOOKS_STATUS.payable)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Credit Balance
                  </span>
                  <p className="text-lg font-bold text-purple-600 mt-1">
                    {fmtMoneyShort(QUICKBOOKS_STATUS.creditBalance)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Pending
                  </span>
                  <p className="text-lg font-bold text-amber-600 mt-1">
                    {QUICKBOOKS_STATUS.pendingTransactions}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Reconciled</span>
                <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                  QUICKBOOKS_STATUS.reconciled ? "text-emerald-600" : "text-red-500"
                }`}>
                  {QUICKBOOKS_STATUS.reconciled ? (
                    <><CheckCircle2 size={14} /> Yes</>
                  ) : (
                    <><AlertTriangle size={14} /> No</>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Last Sync</span>
                <span className="text-xs text-gray-400">{QUICKBOOKS_STATUS.lastSync}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50">
                  <RefreshCw size={14} className="mr-1.5" /> Sync
                </Button>
                <Button variant="outline" className="flex-1">
                  <BarChart3 size={14} className="mr-1.5" /> Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Annual Budget vs Actual ──────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank size={18} className="text-amber-500" />
                  Annual Budget vs Actual
                </CardTitle>
                <CardDescription>
                  {fmtMoneyShort(totalBudgetSpent)} of {fmtMoneyShort(SCHOOL_BUDGET_TOTAL)} spent ({budgetPct}%)
                </CardDescription>
              </div>
              <div className="hidden md:block w-48">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>$0</span>
                  <span className="font-semibold text-gray-600">{budgetPct}%</span>
                  <span>{fmtMoneyShort(SCHOOL_BUDGET_TOTAL)}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SCHOOL_BUDGET_CATEGORIES.map((cat) => {
                const pct = Math.round((cat.spent / cat.budget) * 100);
                const overspent = cat.spent > cat.budget;
                const barColor = overspent ? "bg-red-400" : pct > 85 ? "bg-amber-400" : "bg-blue-500";
                return (
                  <div key={cat.name} className="p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700 truncate mr-2">
                        {cat.name}
                      </span>
                      <span className={`text-xs font-bold whitespace-nowrap ${
                        overspent ? "text-red-500" : "text-gray-500"
                      }`}>
                        {fmtMoneyShort(cat.spent)} / {fmtMoneyShort(cat.budget)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-400">{pct}% used</span>
                      {overspent && (
                        <span className="text-[10px] text-red-500 font-semibold">
                          Overspent by {fmtMoneyShort(cat.spent - cat.budget)}
                        </span>
                      )}
                      {!overspent && (
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          {fmtMoneyShort(cat.budget - cat.spent)} remaining
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── All Categories Table ──────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 size={16} className="text-gray-400" />
              Full Year Comparison
            </CardTitle>
            <CardDescription>
              All expense categories · 5-year trend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2.5 font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                    {CASHFLOW_YEARS.map((y) => (
                      <th key={y} className={`text-right pb-2.5 font-semibold uppercase tracking-wider ${
                        y === CURRENT_YEAR ? "text-blue-600" : "text-gray-400"
                      }`}>
                        {y}{y === CURRENT_YEAR ? " · YTD" : ""}
                      </th>
                    ))}
                    <th className="text-right pb-2.5 font-semibold text-gray-400 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {CASHFLOW_DATA.map((cat) => {
                    const values = CASHFLOW_YEARS.map((y) => cat.values[y] || 0);
                    const first = values[0];
                    const last = values[values.length - 1];
                    const totalGrowth = first > 0 ? ((last - first) / first) * 100 : 0;
                    const isUp = totalGrowth > 2;
                    const isDown = totalGrowth < -2;
                    return (
                      <tr key={cat.category} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 font-medium text-gray-700">
                          <span className="mr-1.5">{cat.icon}</span> {cat.category}
                        </td>
                        {values.map((v, i) => (
                          <td key={i} className={`py-2.5 text-right font-medium ${
                            CASHFLOW_YEARS[i] === CURRENT_YEAR ? "text-gray-900" : "text-gray-500"
                          }`}>
                            {fmtMoneyShort(v)}
                          </td>
                        ))}
                        <td className={`py-2.5 text-right font-semibold ${
                          isUp ? "text-red-500" : isDown ? "text-emerald-600" : "text-gray-400"
                        }`}>
                          {isUp ? "↑" : isDown ? "↓" : "→"} {Math.abs(totalGrowth).toFixed(0)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CashFlowPage;
