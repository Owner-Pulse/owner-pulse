import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, PiggyBank, Wallet, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import BudgetProgressBar from "./components/BudgetProgressBar";
import CategoryBreakdownCard from "./components/CategoryBreakdownCard";
import AddExpenseModal from "./components/AddExpenseModal";
import SpendingByReasonCard from "./components/SpendingByReasonCard";
import ExpenseListCard from "./components/ExpenseListCard";
import BudgetTipCard from "./components/BudgetTipCard";
import DirectorInsightsCard from "./components/DirectorInsightsCard";

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

// ─── Helpers ──────────────────────────────────────────────────────

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const fmtMoneyShort = (n) => n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── Main Component ───────────────────────────────────────────────

const BudgetPage = () => {
  const [view, setView] = useState("school");
  const [showAddModal, setShowAddModal] = useState(false);

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem("directorExpenses");
      return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
    } catch { return DEFAULT_EXPENSES; }
  });

  useEffect(() => { localStorage.setItem("directorExpenses", JSON.stringify(expenses)); }, [expenses]);

  const user = JSON.parse(localStorage.getItem("user") || '{"role":"owner"}');
  const isDirector = user.role === "director";
  useEffect(() => { if (isDirector) setView("director"); }, [isDirector]);

  const directorSpent = expenses.reduce((a, e) => a + e.amount, 0);
  const directorRemaining = DIRECTOR_BUDGET_TOTAL - directorSpent;

  const expenseByReason = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const reason = e.reason || "Other";
      map[reason] = (map[reason] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const handleAddExpense = (newExpense) => {
    setExpenses((prev) => [...prev, { id: Date.now(), ...newExpense }]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updatedSchoolCategories = SCHOOL_BUDGET_CATEGORIES.map((cat) =>
    cat.name === "Director's Discretionary" ? { ...cat, spent: directorSpent } : cat
  );
  const updatedTotalSchoolSpent = updatedSchoolCategories.reduce((a, c) => a + c.spent, 0);
  const updatedBudgetPct = Math.round((updatedTotalSchoolSpent / SCHOOL_BUDGET_TOTAL) * 100);
  const updatedSchoolRemaining = SCHOOL_BUDGET_TOTAL - updatedTotalSchoolSpent;
  const avgMonthly = Math.round(updatedTotalSchoolSpent / 9);

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
          {(isDirector || (!isDirector && view === "director")) && (
            <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white" onClick={() => setShowAddModal(true)}>
              <Plus size={16} className="mr-2" /> Add Expense
            </Button>
          )}
        </div>
      </div>

      {/* ── SCHOOL BUDGET VIEW ──────────────────────────────────── */}
      {!isDirector && view === "school" && (
        <>
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
              <KpiCard icon={TrendingUp} label="Avg Monthly" value={fmtMoneyShort(avgMonthly)} sub="Spend rate · Sep–May" iconBg="bg-purple-50 text-purple-600" />
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <BudgetProgressBar spent={updatedTotalSchoolSpent} total={SCHOOL_BUDGET_TOTAL} label="Overall Budget Consumption" color={updatedBudgetPct > 85 ? "bg-red-400" : updatedBudgetPct > 70 ? "bg-amber-400" : "bg-blue-500"} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CategoryBreakdownCard categories={updatedSchoolCategories} />
          </motion.div>
        </>
      )}

      {/* ── DIRECTOR BUDGET VIEW ────────────────────────────────── */}
      {(view === "director" || isDirector) && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <KpiCard icon={Wallet} label={isDirector ? "My Budget" : "Director Budget"} value={fmtMoney(DIRECTOR_BUDGET_TOTAL)} sub="Discretionary fund" iconBg="bg-blue-50 text-blue-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={PiggyBank} label="Spent YTD" value={fmtMoney(directorSpent)} sub={`${Math.round((directorSpent / DIRECTOR_BUDGET_TOTAL) * 100)}% used`} iconBg="bg-amber-50 text-amber-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={Wallet} label="Remaining" value={fmtMoney(directorRemaining)} sub={directorRemaining > 0 ? "Available" : "Exhausted"} iconBg={directorRemaining > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={DollarSign} label="Avg per Expense" value={fmtMoney(Math.round(directorSpent / (expenses.length || 1)))} sub={`${expenses.length} expenses`} iconBg="bg-purple-50 text-purple-600" />
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <BudgetProgressBar spent={directorSpent} total={DIRECTOR_BUDGET_TOTAL} color="bg-amber-400" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <SpendingByReasonCard expenses={expenseByReason} total={directorSpent} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <ExpenseListCard expenses={expenses} isDirector={isDirector} onDelete={handleDeleteExpense} onShowAdd={() => setShowAddModal(true)} />
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <BudgetTipCard remaining={directorRemaining} total={DIRECTOR_BUDGET_TOTAL} expenseByReason={expenseByReason} />
          </motion.div>

          {!isDirector && expenses.length > 0 && (
            <motion.div variants={itemVariants}>
              <DirectorInsightsCard
                expenseCount={expenses.length}
                directorSpent={directorSpent}
                expenseByReason={expenseByReason}
                directorRemaining={directorRemaining}
                budgetTotal={DIRECTOR_BUDGET_TOTAL}
              />
            </motion.div>
          )}
        </>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddExpense} />
    </motion.div>
  );
};

export default BudgetPage;
