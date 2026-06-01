import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Plus,
  PieChart,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ─── Data ─────────────────────────────────────────────────────────

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

const DIRECTOR_BUDGET_TOTAL = 9000;

const DIRECTOR_EXPENSES = [
  { id: 1, amount: 47.50, description: "Pizza for parent meeting", date: "2026-04-12" },
  { id: 2, amount: 124.00, description: "Crayons and markers — PreK3", date: "2026-04-15" },
  { id: 3, amount: 38.00, description: "Coffee and donuts for staff PD", date: "2026-04-22" },
  { id: 4, amount: 89.00, description: "Cleaning wipes restock", date: "2026-04-28" },
  { id: 5, amount: 215.00, description: "Construction paper bulk order", date: "2026-05-01" },
  { id: 6, amount: 65.00, description: "Birthday cake for office party", date: "2026-05-04" },
  { id: 7, amount: 180.00, description: "Printer ink cartridges", date: "2026-05-06" },
  { id: 8, amount: 42.00, description: "Gift cards for teacher appreciation", date: "2026-05-08" },
];

// Expense auto-categorization
const CATEGORIES = {
  "Classroom Supplies": ["pencil", "crayon", "paper", "glue", "scissor", "book", "art", "craft", "marker", "construction"],
  "Events & Food": ["pizza", "cake", "food", "snack", "coffee", "donut", "party", "celebration", "birthday"],
  "Cleaning & Sanitation": ["cleaning", "wipe", "soap", "sanitizer", "disinfectant"],
  "Office Supplies": ["printer", "ink", "cartridge", "stapler", "tape", "pen"],
  "Faculty Appreciation": ["gift card", "teacher appreciation", "flowers"],
  "Uncategorized": [],
};

const categorize = (description) => {
  const desc = (description || "").toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some((k) => desc.includes(k))) return cat;
  }
  return "Uncategorized";
};

const CATEGORY_COLORS = {
  "Classroom Supplies": "#2563EB",
  "Events & Food": "#F97316",
  "Cleaning & Sanitation": "#16A34A",
  "Office Supplies": "#0EA5E9",
  "Faculty Appreciation": "#EC4899",
  "Uncategorized": "#94A0B5",
};

const totalSchoolSpent = SCHOOL_BUDGET_CATEGORIES.reduce((a, c) => a + c.spent, 0);
const budgetPct = Math.round((totalSchoolSpent / SCHOOL_BUDGET_TOTAL) * 100);
const directorSpent = DIRECTOR_EXPENSES.reduce((a, e) => a + e.amount, 0);

// ─── Helpers ──────────────────────────────────────────────────────

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const fmtMoneyShort = (n) => n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);
const fmtDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── KPI Card ─────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, iconBg }) => (
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
      {sub && <div className="mt-2 text-xs text-gray-500">{sub}</div>}
    </CardContent>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────

const BudgetPage = () => {
  const [view, setView] = useState("school"); // school | director
  const schoolRemaining = SCHOOL_BUDGET_TOTAL - totalSchoolSpent;
  const directorRemaining = DIRECTOR_BUDGET_TOTAL - directorSpent;

  // Expense breakdown by category
  const expenseByCategory = useMemo(() => {
    const map = {};
    DIRECTOR_EXPENSES.forEach((e) => {
      const cat = categorize(e.description);
      map[cat] = (map[cat] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, total]) => ({ name, total }));
  }, []);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Budget</h1>
          <p className="text-sm text-gray-500 mt-1">
            {fmtMoneyShort(totalSchoolSpent)} of {fmtMoneyShort(SCHOOL_BUDGET_TOTAL)} spent ({budgetPct}%) ·{" "}
            <span className={schoolRemaining > 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
              {fmtMoneyShort(schoolRemaining)} remaining
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView("school")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "school" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              School Budget
            </button>
            <button onClick={() => setView("director")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "director" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              Director Budget
            </button>
          </div>
          <Button className="bg-[#0A0F1E] hover:bg-black text-white">
            <Plus size={16} className="mr-2" /> {view === "director" ? "Add Expense" : "Adjust Budget"}
          </Button>
        </div>
      </div>

      {/* ── SCHOOL BUDGET VIEW ──────────────────────────────────── */}
      {view === "school" && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <KpiCard icon={DollarSign} label="Annual Budget" value={fmtMoneyShort(SCHOOL_BUDGET_TOTAL)} sub="Aug 2025 – May 2026" iconBg="bg-blue-50 text-blue-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={PiggyBank} label="Spent YTD" value={fmtMoneyShort(totalSchoolSpent)} sub={`${budgetPct}% consumed`} iconBg="bg-amber-50 text-amber-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={Wallet} label="Remaining" value={fmtMoneyShort(schoolRemaining)} sub={schoolRemaining > 0 ? "Available to spend" : "Over budget"} iconBg={schoolRemaining > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={TrendingUp} label="Avg Monthly" value={fmtMoneyShort(Math.round(totalSchoolSpent / 9))} sub="Spend rate · Sep–May" iconBg="bg-purple-50 text-purple-600" />
            </motion.div>
          </div>

          {/* Overall progress */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-gray-700">Overall Budget Consumption</span>
                  <span className={`font-bold ${budgetPct > 85 ? "text-red-500" : budgetPct > 70 ? "text-amber-600" : "text-emerald-600"}`}>
                    {budgetPct}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${budgetPct > 85 ? "bg-red-400" : budgetPct > 70 ? "bg-amber-400" : "bg-blue-500"}`}
                    style={{ width: `${budgetPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$0</span>
                  <span>{fmtMoneyShort(totalSchoolSpent)} spent</span>
                  <span>{fmtMoneyShort(SCHOOL_BUDGET_TOTAL)} total</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category breakdown */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart size={16} className="text-gray-500" />
                  Budget Categories
                </CardTitle>
                <CardDescription>Annual budget vs. actual spend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SCHOOL_BUDGET_CATEGORIES.map((cat) => {
                    const pct = Math.round((cat.spent / cat.budget) * 100);
                    const overspent = cat.spent > cat.budget;
                    const barColor = overspent ? "bg-red-400" : pct > 85 ? "bg-amber-400" : "bg-blue-500";

                    return (
                      <div key={cat.name} className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                          <span className={`text-xs font-bold ${overspent ? "text-red-500" : "text-gray-500"}`}>
                            {fmtMoneyShort(cat.spent)} / {fmtMoneyShort(cat.budget)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-gray-400">{pct}% used</span>
                          {overspent ? (
                            <span className="text-[10px] text-red-500 font-semibold">
                              Overspent by {fmtMoneyShort(cat.spent - cat.budget)}
                            </span>
                          ) : (
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

          {/* Insights */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-amber-500" />
                  Budget Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    <span className="font-bold">Payroll</span> is the largest category at 77% of total budget. 
                    At {fmtMoneyShort(920000)} of {fmtMoneyShort(1200000)}, it's on track but leaves little room 
                    for mid-year hires or bonuses.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800">
                    <span className="font-bold">Tech & Equipment</span> at 62% spent — under budget due to deferred 
                    Chromebook refresh. Plan remaining {fmtMoneyShort(19000)} for EOY tech upgrades.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    <span className="font-bold">Utilities</span> at 68% — favorable rates locked in through November. 
                    Seasonal HVAC usage expected to increase in summer months.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* ── DIRECTOR BUDGET VIEW ────────────────────────────────── */}
      {view === "director" && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <KpiCard icon={Wallet} label="Director Budget" value={fmtMoney(DIRECTOR_BUDGET_TOTAL)} sub="Discretionary fund" iconBg="bg-blue-50 text-blue-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={Receipt} label="Spent YTD" value={fmtMoney(directorSpent)} sub={`${Math.round((directorSpent / DIRECTOR_BUDGET_TOTAL) * 100)}% used`} iconBg="bg-amber-50 text-amber-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={PiggyBank} label="Remaining" value={fmtMoney(directorRemaining)} sub={directorRemaining > 0 ? "Available" : "Exhausted"} iconBg={directorRemaining > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={DollarSign} label="Avg per Expense" value={fmtMoney(Math.round(directorSpent / DIRECTOR_EXPENSES.length))} sub={`${DIRECTOR_EXPENSES.length} expenses`} iconBg="bg-purple-50 text-purple-600" />
            </motion.div>
          </div>

          {/* Progress */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-gray-700">Budget Used</span>
                  <span className={`font-bold ${directorRemaining < 1000 ? "text-red-500" : "text-amber-600"}`}>
                    {Math.round((directorSpent / DIRECTOR_BUDGET_TOTAL) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min((directorSpent / DIRECTOR_BUDGET_TOTAL) * 100, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$0</span>
                  <span>{fmtMoney(directorSpent)} spent</span>
                  <span>{fmtMoney(DIRECTOR_BUDGET_TOTAL)} total</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Grid: Spending by category + Recent expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By category */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart size={16} className="text-gray-500" />
                    Spending by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {expenseByCategory.map((cat) => {
                    const pct = Math.round((cat.total / directorSpent) * 100);
                    const color = CATEGORY_COLORS[cat.name] || "#94A0B5";
                    return (
                      <div key={cat.name} className="p-2.5 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                            <span className="text-sm text-gray-700">{cat.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{fmtMoney(cat.total)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent expenses */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt size={16} className="text-gray-500" />
                    Recent Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {[...DIRECTOR_EXPENSES].reverse().map((exp) => {
                      const cat = categorize(exp.description);
                      const color = CATEGORY_COLORS[cat] || "#94A0B5";
                      return (
                        <div key={exp.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                            <div className="min-w-0">
                              <p className="text-sm text-gray-900 truncate">{exp.description}</p>
                              <p className="text-[10px] text-gray-400">{fmtDate(exp.date)} · {cat}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-2">{fmtMoney(exp.amount)}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Budget tip */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Wallet size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{directorRemaining > 0 ? `${fmtMoney(directorRemaining)} remaining` : "Budget exhausted"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {directorRemaining > 0
                        ? `Director's discretionary budget runs Aug through end of May. ${fmtMoney(directorRemaining)} left for the rest of the school year.`
                        : `Director's discretionary budget of ${fmtMoney(DIRECTOR_BUDGET_TOTAL)} has been fully spent. No more discretionary funds available until next school year.`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default BudgetPage;
