import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, PiggyBank, Wallet, TrendingUp, Plus } from "lucide-react";
import KpiCard from "./components/KpiCard";
import BudgetProgressBar from "./components/BudgetProgressBar";
import CategoryBreakdownCard from "./components/CategoryBreakdownCard";
import SpendingByReasonCard from "./components/SpendingByReasonCard";
import ExpenseListCard from "./components/ExpenseListCard";
import BudgetTipCard from "./components/BudgetTipCard";
import DirectorInsightsCard from "./components/DirectorInsightsCard";
import DeclareBudgetModal from "./components/DeclareBudgetModal";
import AddExpenseModal from "./components/AddExpenseModal";
import { Button } from "@/components/ui/button";
import { useGetBudget } from "@/hooks/budget";
import { useGetUser } from "@/hooks";

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

// ─── Main Component
const BudgetPage = () => {
  const { user } = useGetUser();
  const isDirector = user?.role === "director";
  const [view, setView] = useState("school");

  // Local state for School and Director budget categories
  const [localSchoolCategories, setLocalSchoolCategories] = useState([]);
  const [localDirectorCategories, setLocalDirectorCategories] = useState([
    { name: "Discretionary", budget: 3000, spent: 0 },
    { name: "Curriculum & Supplies", budget: 2500, spent: 0 },
    { name: "Minor Repairs", budget: 1500, spent: 0 },
    { name: "Staff Appreciation", budget: 1200, spent: 0 },
    { name: "Office Supplies", budget: 800, spent: 0 },
  ]);
  const [localDirectorExpenses, setLocalDirectorExpenses] = useState([]);

  // Modals state
  const [isDeclareSchoolBudgetOpen, setIsDeclareSchoolBudgetOpen] = useState(false);
  const [isDeclareDirectorBudgetOpen, setIsDeclareDirectorBudgetOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const activeType = isDirector ? "director" : view;
  const { isLoading, isError, data } = useGetBudget(activeType);

  const budgetData = data?.budget_vs_actual;

  useEffect(() => {
    if (isDirector) setView("director");
  }, [isDirector]);

  // Sync School Budget from API
  useEffect(() => {
    if (budgetData?.budget_categories?.categories) {
      const mapped = budgetData.budget_categories.categories.map((c) => ({
        name: c.name,
        spent: c.spent_numeric || 0,
        budget: c.budgeted_numeric || 0
      }));
      setLocalSchoolCategories(mapped);
    }
  }, [budgetData]);

  // Sync Director Expenses from API
  useEffect(() => {
    if (budgetData?.recent_expenses) {
      const mapped = budgetData.recent_expenses.map((e, index) => ({
        id: index,
        category: e.category || "Discretionary",
        description: e.description || e.title,
        date: e.date,
        amount: e.numeric_amount || 0,
        color: e.color || "#1E3A5F"
      }));
      setLocalDirectorExpenses(mapped);

      // Distribute spent across Director categories based on loaded expenses
      setLocalDirectorCategories(prev => {
        return prev.map(cat => {
          const matchingSpent = mapped
            .filter(e => e.category === cat.name)
            .reduce((sum, curr) => sum + curr.amount, 0);
          return {
            ...cat,
            spent: matchingSpent
          };
        });
      });
    }
  }, [budgetData]);

  // Calculated School Totals
  const schoolBudgetTotal = localSchoolCategories.reduce((sum, c) => sum + c.budget, 0);
  const schoolSpent = localSchoolCategories.reduce((sum, c) => sum + c.spent, 0);
  const schoolRemaining = schoolBudgetTotal - schoolSpent;
  const schoolBudgetPct = schoolBudgetTotal > 0 ? Math.round((schoolSpent / schoolBudgetTotal) * 100) : 0;
  const schoolAvgMonthly = budgetData?.avg_monthly_numeric || 0;

  // Calculated Director Totals
  const directorBudgetTotal = localDirectorCategories.reduce((sum, c) => sum + c.budget, 0);
  const directorSpent = localDirectorExpenses.reduce((sum, e) => sum + e.amount, 0);
  const directorRemaining = directorBudgetTotal - directorSpent;
  const directorAvgPerExpense = localDirectorExpenses.length > 0 ? directorSpent / localDirectorExpenses.length : 0;

  // Pie chart mappings
  const expenseByReason = useMemo(() => {
    return localDirectorCategories.map(cat => ({
      name: cat.name,
      total: cat.spent
    })).sort((a, b) => b.total - a.total);
  }, [localDirectorCategories]);

  // Save budget handlers
  const handleSaveSchoolBudget = (updatedCategories) => {
    setLocalSchoolCategories(updatedCategories);
  };

  const handleSaveDirectorBudget = (updatedCategories) => {
    setLocalDirectorCategories(updatedCategories);
  };

  // Add director expense handler
  const handleAddExpense = (expense) => {
    const categoryColors = {
      "Discretionary": "#1E3A5F",
      "Curriculum & Supplies": "#2A4C7E",
      "Minor Repairs": "#4A6B96",
      "Staff Appreciation": "#5B7FA6",
      "Office Supplies": "#9DB8D9",
    };

    const newExpense = {
      id: Math.floor(Math.random() * 1000) + 500,
      category: expense.reason,
      description: expense.description,
      date: expense.date,
      amount: expense.amount,
      color: categoryColors[expense.reason] || "#94A0B5"
    };

    setLocalDirectorExpenses(prev => [...prev, newExpense]);

    // Add spent to local category
    setLocalDirectorCategories(prev =>
      prev.map(c =>
        c.name === expense.reason
          ? { ...c, spent: c.spent + expense.amount }
          : c
      )
    );
  };

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
              {fmtMoney(directorSpent)} of {fmtMoney(directorBudgetTotal)} spent ·{" "}
              <span className={directorRemaining > 0 ? "text-[#2F6042] font-medium" : "text-[#8A362C] font-medium"}>
                {fmtMoney(directorRemaining)} remaining
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              {fmtMoneyShort(schoolSpent)} of {fmtMoneyShort(schoolBudgetTotal)} spent ({schoolBudgetPct}%) ·{" "}
              <span className={schoolRemaining > 0 ? "text-[#2F6042] font-medium" : "text-[#8A362C] font-medium"}>
                {fmtMoneyShort(schoolRemaining)} remaining
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
          {!isDirector && view === "school" && (
            <Button
              onClick={() => setIsDeclareSchoolBudgetOpen(true)}
              className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold transition-all px-4 py-2.5 rounded-xl text-xs md:text-sm flex items-center gap-1.5"
            >
              Declare School Budget
            </Button>
          )}
          {!isDirector && view === "director" && (
            <Button
              onClick={() => setIsDeclareDirectorBudgetOpen(true)}
              className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold transition-all px-4 py-2.5 rounded-xl text-xs md:text-sm flex items-center gap-1.5"
            >
              Declare Director Budget
            </Button>
          )}
          {isDirector && (
            <Button
              onClick={() => setIsAddExpenseOpen(true)}
              className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold transition-all px-4 py-2.5 rounded-xl text-xs md:text-sm flex items-center gap-1.5"
            >
              <Plus size={16} /> Log Expense
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {/* Skeletons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-37.5 bg-white border border-gray-100 rounded-xl p-5 animate-pulse flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200" />
                  <div className="w-20 h-4 bg-gray-200 rounded" />
                </div>
                <div className="space-y-2 mt-4">
                  <div className="w-24 h-6 bg-gray-200 rounded" />
                  <div className="w-32 h-3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-[#8A362C]">Error loading budget data.</div>
      ) : (
        <>
          {/* SCHOOL BUDGET VIEW  */}
          {!isDirector && view === "school" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                  <KpiCard icon={DollarSign} label="Annual Budget" value={fmtMoneyShort(schoolBudgetTotal)} sub="Aug 2025 – May 2026" iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={PiggyBank} label="Spent YTD" value={fmtMoneyShort(schoolSpent)} sub={`${schoolBudgetPct}% consumed`} iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={Wallet} label="Remaining" value={fmtMoneyShort(schoolRemaining)} sub={schoolRemaining > 0 ? "Available to spend" : "Over budget"} iconBg={schoolRemaining > 0 ? "bg-[#3E7A54]/10 text-[#2F6042]" : "bg-[#AE4A3E]/10 text-[#8A362C]"} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={TrendingUp} label="Avg Monthly" value={fmtMoneyShort(schoolAvgMonthly)} sub="Spend rate · Sep–May" iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <BudgetProgressBar spent={schoolSpent} total={schoolBudgetTotal} label="Overall Budget Consumption" color={schoolBudgetPct > 85 ? "bg-[#AE4A3E]" : schoolBudgetPct > 70 ? "bg-[#B78A2F]" : "bg-[#1E3A5F]"} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <CategoryBreakdownCard categories={localSchoolCategories} />
              </motion.div>
            </>
          )}

          {/* ── DIRECTOR BUDGET VIEW ────────────────────────────────── */}
          {(view === "director" || isDirector) && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                  <KpiCard icon={Wallet} label={isDirector ? "My Budget" : "Director Budget"} value={fmtMoney(directorBudgetTotal)} sub="Discretionary fund" iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={PiggyBank} label="Spent YTD" value={fmtMoney(directorSpent)} sub={`${Math.round((directorSpent / (directorBudgetTotal || 1)) * 100)}% used`} iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={Wallet} label="Remaining" value={fmtMoney(directorRemaining)} sub={directorRemaining > 0 ? "Available" : "Exhausted"} iconBg={directorRemaining > 0 ? "bg-[#3E7A54]/10 text-[#2F6042]" : "bg-[#AE4A3E]/10 text-[#8A362C]"} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={DollarSign} label="Avg per Expense" value={fmtMoney(directorAvgPerExpense)} sub={`${localDirectorExpenses.length} expenses`} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <BudgetProgressBar spent={directorSpent} total={directorBudgetTotal} color="bg-[#B78A2F]" />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <CategoryBreakdownCard categories={localDirectorCategories} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <ExpenseListCard expenses={localDirectorExpenses} isDirector={isDirector} onShowAdd={() => setIsAddExpenseOpen(true)} />
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <BudgetTipCard remaining={directorRemaining} total={directorBudgetTotal} expenseByReason={expenseByReason} />
              </motion.div>

              {!isDirector && localDirectorExpenses.length > 0 && (
                <motion.div variants={itemVariants}>
                  <DirectorInsightsCard
                    expenseCount={localDirectorExpenses.length}
                    directorSpent={directorSpent}
                    expenseByReason={expenseByReason}
                    directorRemaining={directorRemaining}
                    budgetTotal={directorBudgetTotal}
                  />
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* Declare School Budget Modal */}
      <DeclareBudgetModal
        isOpen={isDeclareSchoolBudgetOpen}
        onClose={() => setIsDeclareSchoolBudgetOpen(false)}
        categories={localSchoolCategories}
        onSave={handleSaveSchoolBudget}
        title="Declare School Budget"
        subtitle="Specify the annual spending targets for all major operations categories."
      />

      {/* Declare Director Budget Modal */}
      <DeclareBudgetModal
        isOpen={isDeclareDirectorBudgetOpen}
        onClose={() => setIsDeclareDirectorBudgetOpen(false)}
        categories={localDirectorCategories}
        onSave={handleSaveDirectorBudget}
        title="Declare Director Budget Categories"
        subtitle="Allocate specific budget portions for each director-managed category."
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAdd={handleAddExpense}
        categories={localDirectorCategories}
      />
    </motion.div>
  );
};

export default BudgetPage;
