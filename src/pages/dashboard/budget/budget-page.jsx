import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  Trash2,
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

const DEFAULT_EXPENSES = [
  { id: 1, amount: 47.50, reason: "Parent Meeting", description: "Pizza for parent meeting", date: "2026-04-12" },
  { id: 2, amount: 124.00, reason: "Classroom Supplies", description: "Crayons and markers — PreK3", date: "2026-04-15" },
  { id: 3, amount: 38.00, reason: "Staff Appreciation", description: "Coffee and donuts for staff PD", date: "2026-04-22" },
  { id: 4, amount: 89.00, reason: "Cleaning Supplies", description: "Cleaning wipes restock", date: "2026-04-28" },
  { id: 5, amount: 215.00, reason: "Classroom Supplies", description: "Construction paper bulk order", date: "2026-05-01" },
  { id: 6, amount: 65.00, reason: "Staff Appreciation", description: "Birthday cake for office party", date: "2026-05-04" },
  { id: 7, amount: 180.00, reason: "Office Supplies", description: "Printer ink cartridges", date: "2026-05-06" },
  { id: 8, amount: 42.00, reason: "Teacher Appreciation", description: "Gift cards for teacher appreciation", date: "2026-05-08" },
];

const EXPENSE_REASONS = [
  "Classroom Supplies",
  "Events & Food",
  "Staff Appreciation",
  "Cleaning Supplies",
  "Office Supplies",
  "Teacher Appreciation",
  "Professional Dev.",
  "Tech & Software",
  "Facilities",
  "Other",
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

// ─── Add Expense Modal ────────────────────────────────────────────

const AddExpenseModal = ({ isOpen, onClose, onAdd }) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("Other");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      return;
    }

    onAdd({
      amount: numAmount,
      reason,
      description: description.trim(),
      date,
    });

    // Reset form
    setAmount("");
    setReason("Other");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Expense</h2>
                <p className="text-xs text-gray-500 mt-0.5">Director's discretionary fund</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-10 pl-7 pr-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                >
                  {EXPENSE_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was this for?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-xs font-medium text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#0A0F1E] text-white text-sm font-semibold hover:bg-black transition-colors"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─── Main Component ───────────────────────────────────────────────

const BudgetPage = () => {
  const [view, setView] = useState("school");
  const [showAddModal, setShowAddModal] = useState(false);

  // Load expenses from localStorage or use defaults
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem("directorExpenses");
      return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
    } catch {
      return DEFAULT_EXPENSES;
    }
  });

  // Persist expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("directorExpenses", JSON.stringify(expenses));
  }, [expenses]);

  // Detect user role
  const user = JSON.parse(localStorage.getItem("user") || '{"role":"owner"}');
  const isDirector = user.role === "director";

  // If director, force director view
  useEffect(() => {
    if (isDirector) setView("director");
  }, [isDirector]);

  const directorSpent = expenses.reduce((a, e) => a + e.amount, 0);
  const schoolRemaining = SCHOOL_BUDGET_TOTAL - totalSchoolSpent;
  const directorRemaining = DIRECTOR_BUDGET_TOTAL - directorSpent;

  // Expense breakdown by category (using reason as the grouping key)
  const expenseByCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const cat = e.reason || categorize(e.description);
      map[cat] = (map[cat] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, total]) => ({ name, total }));
  }, [expenses]);

  // Expense breakdown by reason for the owner view
  const expenseByReason = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const reason = e.reason || "Other";
      map[reason] = (map[reason] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const handleAddExpense = (newExpense) => {
    const id = Date.now();
    setExpenses((prev) => [...prev, { id, ...newExpense }]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Update director's discretionary spent to reflect real expenses
  const updatedSchoolCategories = SCHOOL_BUDGET_CATEGORIES.map((cat) =>
    cat.name === "Director's Discretionary"
      ? { ...cat, spent: directorSpent }
      : cat
  );
  const updatedTotalSchoolSpent = updatedSchoolCategories.reduce((a, c) => a + c.spent, 0);
  const updatedBudgetPct = Math.round((updatedTotalSchoolSpent / SCHOOL_BUDGET_TOTAL) * 100);
  const updatedSchoolRemaining = SCHOOL_BUDGET_TOTAL - updatedTotalSchoolSpent;

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isDirector ? "My Budget" : "Budget"}
          </h1>
          {isDirector ? (
            <p className="text-sm text-gray-500 mt-1">
              {fmtMoney(directorSpent)} of {fmtMoney(DIRECTOR_BUDGET_TOTAL)} spent ·{" "}
              <span className={directorRemaining > 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                {fmtMoney(directorRemaining)} remaining
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              {fmtMoneyShort(updatedTotalSchoolSpent)} of {fmtMoneyShort(SCHOOL_BUDGET_TOTAL)} spent ({updatedBudgetPct}%) ·{" "}
              <span className={updatedSchoolRemaining > 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                {fmtMoneyShort(updatedSchoolRemaining)} remaining
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle — only show for owner */}
          {!isDirector && (
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setView("school")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "school" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
                School Budget
              </button>
              <button onClick={() => setView("director")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "director" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
                Director Expenses
              </button>
            </div>
          )}
          {isDirector && (
            <Button className="bg-[#0A0F1E] hover:bg-black text-white" onClick={() => setShowAddModal(true)}>
              <Plus size={16} className="mr-2" /> Add Expense
            </Button>
          )}
          {!isDirector && view === "director" && (
            <Button className="bg-[#0A0F1E] hover:bg-black text-white" onClick={() => setShowAddModal(true)}>
              <Plus size={16} className="mr-2" /> Add Expense
            </Button>
          )}
        </div>
      </div>

      {/* ── SCHOOL BUDGET VIEW (Owner only) ────────────────────── */}
      {!isDirector && view === "school" && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <KpiCard icon={DollarSign} label="Annual Budget" value={fmtMoneyShort(SCHOOL_BUDGET_TOTAL)} sub="Aug 2025 – May 2026" iconBg="bg-blue-50 text-blue-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={PiggyBank} label="Spent YTD" value={fmtMoneyShort(updatedTotalSchoolSpent)} sub={`${updatedBudgetPct}% consumed`} iconBg="bg-amber-50 text-amber-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={Wallet} label="Remaining" value={fmtMoneyShort(updatedSchoolRemaining)} sub={updatedSchoolRemaining > 0 ? "Available to spend" : "Over budget"} iconBg={updatedSchoolRemaining > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={TrendingUp} label="Avg Monthly" value={fmtMoneyShort(Math.round(updatedTotalSchoolSpent / 9))} sub="Spend rate · Sep–May" iconBg="bg-purple-50 text-purple-600" />
            </motion.div>
          </div>

          {/* Overall progress */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-gray-700">Overall Budget Consumption</span>
                  <span className={`font-bold ${updatedBudgetPct > 85 ? "text-red-500" : updatedBudgetPct > 70 ? "text-amber-600" : "text-emerald-600"}`}>
                    {updatedBudgetPct}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${updatedBudgetPct > 85 ? "bg-red-400" : updatedBudgetPct > 70 ? "bg-amber-400" : "bg-blue-500"}`}
                    style={{ width: `${updatedBudgetPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$0</span>
                  <span>{fmtMoneyShort(updatedTotalSchoolSpent)} spent</span>
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
                  {updatedSchoolCategories.map((cat) => {
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
        </>
      )}

      {/* ── DIRECTOR BUDGET / EXPENSES VIEW ────────────────────── */}
      {(view === "director" || isDirector) && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <KpiCard icon={Wallet} label={isDirector ? "My Budget" : "Director Budget"} value={fmtMoney(DIRECTOR_BUDGET_TOTAL)} sub="Discretionary fund" iconBg="bg-blue-50 text-blue-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={Receipt} label="Spent YTD" value={fmtMoney(directorSpent)} sub={`${Math.round((directorSpent / DIRECTOR_BUDGET_TOTAL) * 100)}% used`} iconBg="bg-amber-50 text-amber-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={PiggyBank} label="Remaining" value={fmtMoney(directorRemaining)} sub={directorRemaining > 0 ? "Available" : "Exhausted"} iconBg={directorRemaining > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={DollarSign} label="Avg per Expense" value={fmtMoney(Math.round(directorSpent / (expenses.length || 1)))} sub={`${expenses.length} expenses`} iconBg="bg-purple-50 text-purple-600" />
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

          {/* Grid: Spending by reason + Recent expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By reason/category */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart size={16} className="text-gray-500" />
                    Spending by Reason
                  </CardTitle>
                  <CardDescription>How the discretionary fund is being used</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {expenseByReason.length > 0 ? (
                    expenseByReason.map((cat) => {
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
                    })
                  ) : (
                    <div className="py-6 text-center text-sm text-gray-400">No expenses yet.</div>
                  )}
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
                  {isDirector && (
                    <CardDescription>Track what you've spent</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {expenses.length > 0 ? (
                      [...expenses].reverse().map((exp) => {
                        const reason = exp.reason || categorize(exp.description);
                        const color = CATEGORY_COLORS[reason] || "#94A0B5";
                        return (
                          <div key={exp.id} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-gray-900 truncate font-medium">{exp.description}</p>
                                  {exp.reason && (
                                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
                                      {exp.reason}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-400">{fmtDate(exp.date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="text-sm font-semibold text-gray-900">{fmtMoney(exp.amount)}</span>
                              {isDirector && (
                                <button
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                                >
                                  <Trash2 size={13} className="text-red-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center">
                        <Receipt size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">No expenses yet</p>
                        {isDirector && (
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Add your first expense →
                          </button>
                        )}
                      </div>
                    )}
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${directorRemaining > 0 ? "bg-amber-100" : "bg-red-100"}`}>
                    <Wallet size={18} className={directorRemaining > 0 ? "text-amber-600" : "text-red-500"} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {directorRemaining > 0
                        ? `${fmtMoney(directorRemaining)} remaining in discretionary fund`
                        : "Budget exhausted"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {directorRemaining > 0
                        ? `Director's discretionary budget runs Aug through end of May. ${fmtMoney(directorRemaining)} left for the rest of the school year.`
                        : `Director's discretionary budget of ${fmtMoney(DIRECTOR_BUDGET_TOTAL)} has been fully spent. No more discretionary funds available until next school year.`}
                    </p>
                    {expenses.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {expenseByReason.slice(0, 4).map((cat) => (
                          <span key={cat.name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-medium text-gray-600">
                            {cat.name}: {fmtMoney(Math.round(cat.total))}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Insights section for owners (showing summary) */}
          {!isDirector && expenses.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-amber-500" />
                    Director Expense Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">
                      <span className="font-bold">{expenses.length} expenses</span> recorded from director's discretionary fund totaling {fmtMoney(directorSpent)}. 
                      Top reason: <span className="font-medium">{expenseByReason[0]?.name || "N/A"}</span> at {fmtMoney(Math.round(expenseByReason[0]?.total || 0))}.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      <span className="font-bold">{directorRemaining > 0 ? `${fmtMoney(directorRemaining)} remaining` : "Budget exhausted"}</span> 
                      {" "}of the ${DIRECTOR_BUDGET_TOTAL.toLocaleString()} discretionary fund.
                      {directorRemaining < 2000 && directorRemaining > 0 ? " Consider discussing budget reallocation with director." : ""}
                      {directorRemaining <= 0 ? " No more discretionary funds available this year." : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddExpense}
      />
    </motion.div>
  );
};

export default BudgetPage;
