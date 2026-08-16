import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, PiggyBank, Wallet, TrendingUp } from "lucide-react";
import KpiCard from "./components/KpiCard";
import BudgetProgressBar from "./components/BudgetProgressBar";
import CategoryBreakdownCard from "./components/CategoryBreakdownCard";
import SpendingByReasonCard from "./components/SpendingByReasonCard";
import ExpenseListCard from "./components/ExpenseListCard";
import BudgetTipCard from "./components/BudgetTipCard";
import DirectorInsightsCard from "./components/DirectorInsightsCard";
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

  const activeType = isDirector ? "director" : view;
  const { isLoading, isError, data } = useGetBudget(activeType);

  const budgetData = data?.budget_vs_actual;
  console.log("Budget API data", budgetData);

  useEffect(() => { if (isDirector) setView("director"); }, [isDirector]);

  // School Data Mappings
  const schoolBudgetTotal = budgetData?.annual_budget_numeric || 0;
  const schoolSpent = budgetData?.spent_ytd_numeric || 0;
  const schoolBudgetPct = budgetData?.consumed_percentage_numeric || 0;
  const schoolRemaining = budgetData?.remaining_numeric || 0;
  const schoolAvgMonthly = budgetData?.avg_monthly_numeric || 0;

  const schoolCategories = useMemo(() => {
    if (!budgetData?.budget_categories?.categories) return [];
    return budgetData.budget_categories.categories.map((c) => ({
      name: c.name,
      spent: c.spent_numeric,
      budget: c.budgeted_numeric
    }));
  }, [budgetData]);

  // Director Data Mappings
  const directorBudgetTotal = budgetData?.director_budget_numeric || 0;
  const directorSpent = budgetData?.spent_ytd_numeric || 0;
  const directorRemaining = budgetData?.remaining_numeric || 0;
  const directorAvgPerExpense = budgetData?.avg_per_expense_numeric || 0;

  const directorExpenses = useMemo(() => {
    if (!budgetData?.recent_expenses) return [];
    return budgetData.recent_expenses.map((e, index) => ({
      id: index,
      reason: e.category,
      description: e.description || e.title,
      date: e.date,
      amount: e.numeric_amount
    }));
  }, [budgetData]);

  const expenseByReason = useMemo(() => {
    if (!budgetData?.spending_by_reason?.items) return [];
    return budgetData.spending_by_reason.items.map((i) => ({
      name: i.name,
      total: i.numeric_amount
    })).sort((a, b) => b.total - a.total);
  }, [budgetData]);

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
              <span className={directorRemaining > 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                {fmtMoney(directorRemaining)} remaining
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              {fmtMoneyShort(schoolSpent)} of {fmtMoneyShort(schoolBudgetTotal)} spent ({schoolBudgetPct}%) ·{" "}
              <span className={schoolRemaining > 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
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
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {/* KPI Skeletons */}
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

          {/* Progress Bar Skeleton */}
          <div className="h-25 bg-white border border-gray-100 rounded-xl p-5 animate-pulse flex flex-col justify-center space-y-4">
            <div className="flex justify-between">
              <div className="w-48 h-5 bg-gray-200 rounded" />
              <div className="w-24 h-5 bg-gray-200 rounded" />
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full" />
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-75 bg-white border border-gray-100 rounded-xl p-6 animate-pulse flex flex-col gap-4">
              <div className="w-40 h-6 bg-gray-200 rounded mb-4" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="w-1/2 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
            <div className="h-75 bg-white border border-gray-100 rounded-xl p-6 animate-pulse flex flex-col gap-4">
              <div className="w-40 h-6 bg-gray-200 rounded mb-4" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div className="w-2/3 h-8 bg-gray-100 rounded" />
                  <div className="w-10 h-8 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-red-500">Error loading budget data.</div>
      ) : (
        <>
          {/* SCHOOL BUDGET VIEW  */}
          {!isDirector && view === "school" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                  <KpiCard icon={DollarSign} label="Annual Budget" value={fmtMoneyShort(schoolBudgetTotal)} sub="Aug 2025 – May 2026" iconBg="bg-blue-50 text-blue-600" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={PiggyBank} label="Spent YTD" value={fmtMoneyShort(schoolSpent)} sub={`${schoolBudgetPct}% consumed`} iconBg="bg-amber-50 text-amber-600" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={Wallet} label="Remaining" value={fmtMoneyShort(schoolRemaining)} sub={schoolRemaining > 0 ? "Available to spend" : "Over budget"} iconBg={schoolRemaining > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={TrendingUp} label="Avg Monthly" value={fmtMoneyShort(schoolAvgMonthly)} sub="Spend rate · Sep–May" iconBg="bg-purple-50 text-purple-600" />
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <BudgetProgressBar spent={schoolSpent} total={schoolBudgetTotal} label="Overall Budget Consumption" color={schoolBudgetPct > 85 ? "bg-red-400" : schoolBudgetPct > 70 ? "bg-amber-400" : "bg-blue-500"} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <CategoryBreakdownCard categories={schoolCategories} />
              </motion.div>
            </>
          )}

          {/* ── DIRECTOR BUDGET VIEW ────────────────────────────────── */}
          {(view === "director" || isDirector) && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                  <KpiCard icon={Wallet} label={isDirector ? "My Budget" : "Director Budget"} value={fmtMoney(directorBudgetTotal)} sub="Discretionary fund" iconBg="bg-blue-50 text-blue-600" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={PiggyBank} label="Spent YTD" value={fmtMoney(directorSpent)} sub={`${Math.round((directorSpent / (directorBudgetTotal || 1)) * 100)}% used`} iconBg="bg-amber-50 text-amber-600" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={Wallet} label="Remaining" value={fmtMoney(directorRemaining)} sub={directorRemaining > 0 ? "Available" : "Exhausted"} iconBg={directorRemaining > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={DollarSign} label="Avg per Expense" value={fmtMoney(directorAvgPerExpense)} sub={`${directorExpenses.length} expenses`} iconBg="bg-purple-50 text-purple-600" />
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <BudgetProgressBar spent={directorSpent} total={directorBudgetTotal} color="bg-amber-400" />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <SpendingByReasonCard expenses={expenseByReason} total={directorSpent} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <ExpenseListCard expenses={directorExpenses} isDirector={isDirector} onShowAdd={() => { }} />
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <BudgetTipCard remaining={directorRemaining} total={directorBudgetTotal} expenseByReason={expenseByReason} />
              </motion.div>

              {!isDirector && directorExpenses.length > 0 && (
                <motion.div variants={itemVariants}>
                  <DirectorInsightsCard
                    expenseCount={directorExpenses.length}
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
    </motion.div>
  );
};

export default BudgetPage;
