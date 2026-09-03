import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Wallet, TrendingUp, Plus, Settings, PieChart } from "lucide-react";
import KpiCard from "./components/KpiCard";
import BudgetProgressBar from "./components/BudgetProgressBar";
import BudgetPieChartsCard from "./components/BudgetPieChartsCard";
import CategoryBreakdownCard from "./components/CategoryBreakdownCard";
import ExpenseListCard from "./components/ExpenseListCard";
import BudgetTipCard from "./components/BudgetTipCard";
import DirectorInsightsCard from "./components/DirectorInsightsCard";
import AddExpenseModal from "./components/AddExpenseModal";
import BudgetSettingsModal from "./components/BudgetSettingsModal";
import { Button } from "@/components/ui/button";
import { useGetBudget, useLogDirectorExpense } from "@/hooks/owner-hook/budget.hook";
import { useGetUser } from "@/hooks/auth/user-details.hook";
import toast from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────
const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const fmtMoneyShort = (n) => {
  if (typeof n === "string") return n;
  if (n === undefined || n === null) return "$0";
  return n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);
};

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
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  // Local state for School and Director budget categories fallback
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
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeType = isDirector ? "director" : view;
  const isDirectorView = view === "director" || isDirector;

  // Memoized query parameters object
  const queryParams = useMemo(
    () => ({
      type: activeType,
      page,
      per_page: perPage,
    }),
    [activeType, page, perPage]
  );

  const { isLoading, isFetching, isError, data, refetch } = useGetBudget(queryParams);
  const { logExpense, isPending: isLoggingExpense } = useLogDirectorExpense();

  const budgetData = data?.budget_vs_actual;

  useEffect(() => {
    if (isDirector) setView("director");
  }, [isDirector]);

  const handleViewChange = (newView) => {
    setView(newView);
    setPage(1);
  };

  // Extract raw categories and pagination based on view
  const rawCategories = isDirectorView
    ? (budgetData?.spending_by_reason?.items || budgetData?.budget_categories?.categories || budgetData?.categories || [])
    : (budgetData?.budget_categories?.categories || budgetData?.categories || []);

  const paginationInfo = isDirectorView
    ? (budgetData?.spending_by_reason?.pagination || budgetData?.budget_categories?.pagination || budgetData?.pagination || null)
    : (budgetData?.budget_categories?.pagination || budgetData?.pagination || null);

  // Sync School Budget from API when available
  useEffect(() => {
    if (rawCategories.length > 0 && !isDirectorView) {
      const mapped = rawCategories.map((c) => {
        const catName = c.name || c.category || c.reason;
        const apiBudget = c.budgeted_numeric ?? c.budget_limit_numeric ?? 0;
        const finalBudget = apiBudget > 0 ? apiBudget : (c.budget || 0);
        const spentVal = c.spent_numeric ?? c.numeric_amount ?? (typeof c.spent === "number" ? c.spent : 0);

        return {
          name: catName,
          spent: spentVal,
          budget: finalBudget,
          spent_formatted: c.spent ?? c.amount ?? c.spent_formatted,
          budgeted_formatted: finalBudget > 0 ? fmtMoneyShort(finalBudget) : (c.budgeted ?? c.budget_limit),
          spent_vs_budget: finalBudget > 0 ? `${c.spent ?? c.amount ?? fmtMoneyShort(spentVal)} / ${fmtMoneyShort(finalBudget)}` : c.spent_vs_budget,
          used_percentage: finalBudget > 0 ? Math.round((spentVal / finalBudget) * 100) : c.used_percentage,
          used_percentage_text: finalBudget > 0 ? `${Math.round((spentVal / finalBudget) * 100)}% used` : c.used_percentage_text,
          remaining: finalBudget > 0 ? fmtMoneyShort(finalBudget - spentVal) : (c.remaining ?? c.remaining_formatted),
          remaining_numeric: finalBudget > 0 ? (finalBudget - spentVal) : c.remaining_numeric,
        };
      });
      setLocalSchoolCategories(mapped);
    }
  }, [rawCategories, isDirectorView]);

  // Sync Director Expenses from API (excluding quickbooks_expenses)
  useEffect(() => {
    const expensesList = (budgetData?.all_expenses && budgetData.all_expenses.length > 0)
      ? budgetData.all_expenses
      : (budgetData?.recent_expenses && budgetData.recent_expenses.length > 0)
      ? budgetData.recent_expenses
      : null;

    if (expensesList) {
      const mapped = expensesList.map((e, index) => ({
        id: e.id || index,
        category: e.category || "Discretionary",
        description: e.description || e.title,
        title: e.title || e.description,
        date: e.date,
        amount: e.amount || (e.numeric_amount !== undefined ? fmtMoney(e.numeric_amount) : "$0"),
        numeric_amount: e.numeric_amount || 0,
        color: e.color || "#1E3A5F",
      }));
      setLocalDirectorExpenses(mapped);

      setLocalDirectorCategories((prev) => {
        return prev.map((cat) => {
          const matchingSpent = mapped
            .filter((e) => e.category === cat.name)
            .reduce((sum, curr) => sum + (curr.numeric_amount || 0), 0);
          return {
            ...cat,
            spent: matchingSpent,
          };
        });
      });
    } else if (budgetData) {
      setLocalDirectorExpenses([]);
      setLocalDirectorCategories((prev) =>
        prev.map((cat) => ({ ...cat, spent: 0 }))
      );
    }
  }, [budgetData]);

  // Calculated School Totals
  const schoolBudgetTotal = localSchoolCategories.reduce((sum, c) => sum + c.budget, 0);
  const schoolSpent = localSchoolCategories.reduce((sum, c) => sum + c.spent, 0);
  const schoolRemaining = schoolBudgetTotal - schoolSpent;
  const schoolBudgetPct = schoolBudgetTotal > 0 ? Math.round((schoolSpent / schoolBudgetTotal) * 100) : 0;
  const schoolAvgMonthly = budgetData?.avg_monthly_numeric || 0;

  // Formatted Top-Level Metrics for School View
  const annualBudgetDisplay = budgetData?.annual_budget || (budgetData?.annual_budget_numeric !== undefined ? fmtMoneyShort(budgetData.annual_budget_numeric) : fmtMoneyShort(schoolBudgetTotal));
  const dateRangeDisplay = budgetData?.date_range || "Jan 2026 – Dec 2026";
  const spentYtdDisplay = budgetData?.spent_ytd || (budgetData?.spent_ytd_numeric !== undefined ? fmtMoneyShort(budgetData.spent_ytd_numeric) : fmtMoneyShort(schoolSpent));
  const consumedPctDisplay = budgetData?.consumed_percentage || `${schoolBudgetPct}% consumed`;
  const remainingDisplay = budgetData?.remaining || (budgetData?.remaining_numeric !== undefined ? fmtMoneyShort(budgetData.remaining_numeric) : fmtMoneyShort(schoolRemaining));
  const remainingSubDisplay = budgetData?.remaining_subtitle || ((budgetData?.remaining_numeric ?? schoolRemaining) >= 0 ? "Available to spend" : "Over budget");
  const avgMonthlyDisplay = budgetData?.avg_monthly || (budgetData?.avg_monthly_numeric !== undefined ? fmtMoneyShort(budgetData.avg_monthly_numeric) : fmtMoneyShort(schoolAvgMonthly));
  const avgMonthlySubDisplay = budgetData?.avg_monthly_subtitle || "Spend rate";
  const formattedSummary = budgetData?.formatted_summary;

  // Calculated Director Totals
  const directorBudgetTotal = localDirectorCategories.reduce((sum, c) => sum + c.budget, 0);
  const directorSpent = localDirectorExpenses.reduce((sum, e) => sum + (e.numeric_amount || 0), 0);
  const directorRemaining = directorBudgetTotal - directorSpent;
  const directorAvgPerExpense = localDirectorExpenses.length > 0 ? directorSpent / localDirectorExpenses.length : 0;

  // Formatted Top-Level Metrics for Director View
  const directorBudgetDisplay = budgetData?.director_budget || (budgetData?.director_budget_numeric !== undefined ? fmtMoneyShort(budgetData.director_budget_numeric) : fmtMoney(directorBudgetTotal));
  const directorBudgetSub = budgetData?.director_budget_subtitle || "Discretionary fund";
  const directorSpentDisplay = budgetData?.spent_ytd || (budgetData?.spent_ytd_numeric !== undefined ? fmtMoney(budgetData.spent_ytd_numeric) : fmtMoney(directorSpent));
  const directorSpentSub = budgetData?.spent_ytd_subtitle || `${Math.round((directorSpent / (directorBudgetTotal || 1)) * 100)}% used`;
  const directorRemainingDisplay = budgetData?.remaining || (budgetData?.remaining_numeric !== undefined ? fmtMoney(budgetData.remaining_numeric) : fmtMoney(directorRemaining));
  const directorRemainingSub = budgetData?.remaining_subtitle || (directorRemaining > 0 ? "Available" : "Exhausted");
  const directorAvgExpenseDisplay = budgetData?.avg_per_expense || (budgetData?.avg_per_expense_numeric !== undefined ? fmtMoney(budgetData.avg_per_expense_numeric) : fmtMoney(directorAvgPerExpense));
  const directorAvgExpenseSub = budgetData?.avg_per_expense_subtitle || `${localDirectorExpenses.length} expenses`;
  const directorFormattedSummary = budgetData?.director_formatted_summary || budgetData?.formatted_summary;

  // Pie chart mappings
  const expenseByReason = useMemo(() => {
    return localDirectorCategories
      .map((cat) => ({
        name: cat.name,
        total: cat.spent,
      }))
      .sort((a, b) => b.total - a.total);
  }, [localDirectorCategories]);

  // Add director expense handler
  const handleAddExpense = async (expensePayload) => {
    try {
      const res = await logExpense(expensePayload);
      toast.success(res?.message || "Expense logged successfully!");
      refetch();
      return true;
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to log expense.";
      toast.error(errorMsg);
      return false;
    }
  };

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isDirector ? "Director Discretionary Budget" : (budgetData?.title || "Budget")}
          </h1>
          {isDirectorView ? (
            <p className="text-sm text-gray-500 mt-1">
              {directorFormattedSummary || (
                <>
                  {directorSpentDisplay} of {directorBudgetDisplay} spent ·{" "}
                  <span className={(budgetData?.remaining_numeric ?? directorRemaining) > 0 ? "text-[#2F6042] font-medium" : "text-[#8A362C] font-medium"}>
                    {directorRemainingDisplay} remaining
                  </span>
                </>
              )}
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              {formattedSummary || (
                <>
                  {spentYtdDisplay} of {annualBudgetDisplay} spent ({consumedPctDisplay}) ·{" "}
                  <span className={(budgetData?.remaining_numeric ?? schoolRemaining) >= 0 ? "text-[#2F6042] font-medium" : "text-[#8A362C] font-medium"}>
                    {remainingDisplay} remaining
                  </span>
                </>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isDirector && (
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => handleViewChange("school")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  view === "school" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                School Budget
              </button>
              <button
                onClick={() => handleViewChange("director")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  view === "director" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Director Expenses
              </button>
            </div>
          )}

          {!isDirector && (
            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm font-semibold transition-all px-3 py-2 rounded-xl text-xs md:text-sm flex items-center gap-1.5"
              title="Budget Settings"
            >
              <Settings size={16} className="text-[#1E3A5F]" />
              <span>Budget Settings</span>
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
                  <KpiCard
                    icon={DollarSign}
                    label="Annual Budget"
                    value={annualBudgetDisplay}
                    sub={dateRangeDisplay}
                    iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard
                    icon={DollarSign}
                    label="Spent YTD"
                    value={spentYtdDisplay}
                    sub={consumedPctDisplay}
                    iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard
                    icon={Wallet}
                    label="Remaining"
                    value={remainingDisplay}
                    sub={remainingSubDisplay}
                    iconBg={
                      (budgetData?.remaining_numeric ?? schoolRemaining) >= 0
                        ? "bg-[#3E7A54]/10 text-[#2F6042]"
                        : "bg-[#AE4A3E]/10 text-[#8A362C]"
                    }
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard
                    icon={TrendingUp}
                    label="Avg Monthly"
                    value={avgMonthlyDisplay}
                    sub={avgMonthlySubDisplay}
                    iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
                  />
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <BudgetProgressBar
                  spent={budgetData?.spent_ytd_numeric ?? schoolSpent}
                  total={budgetData?.annual_budget_numeric ?? schoolBudgetTotal}
                  label="Overall Budget Consumption"
                  overallConsumption={budgetData?.overall_budget_consumption}
                  color={
                    (budgetData?.consumed_percentage_numeric ?? schoolBudgetPct) > 85
                      ? "bg-[#AE4A3E]"
                      : (budgetData?.consumed_percentage_numeric ?? schoolBudgetPct) > 70
                      ? "bg-[#B78A2F]"
                      : "bg-[#1E3A5F]"
                  }
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <BudgetPieChartsCard
                  schoolSpent={budgetData?.spent_ytd_numeric ?? schoolSpent}
                  schoolBudgetTotal={budgetData?.annual_budget_numeric ?? schoolBudgetTotal}
                  categories={rawCategories.length > 0 ? rawCategories : localSchoolCategories}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <CategoryBreakdownCard
                  categories={rawCategories.length > 0 ? rawCategories : localSchoolCategories}
                  pagination={paginationInfo}
                  page={page}
                  perPage={perPage}
                  onPageChange={setPage}
                  onPerPageChange={(newPerPage) => {
                    setPerPage(newPerPage);
                    setPage(1);
                  }}
                  isFetching={isFetching}
                  title={budgetData?.budget_categories?.title || "Budget Categories"}
                  subtitle={budgetData?.budget_categories?.subtitle || "Annual budget vs. actual spend"}
                />
              </motion.div>
            </>
          )}

          {/* ── DIRECTOR BUDGET VIEW ────────────────────────────────── */}
          {(view === "director" || isDirector) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div variants={itemVariants}>
                  <KpiCard
                    icon={Wallet}
                    label="Director Discretionary Budget"
                    value={directorBudgetDisplay}
                    sub={directorBudgetSub}
                    iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard
                    icon={DollarSign}
                    label="Spent YTD"
                    value={directorSpentDisplay}
                    sub={directorSpentSub}
                    iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard
                    icon={Wallet}
                    label="Remaining"
                    value={directorRemainingDisplay}
                    sub={directorRemainingSub}
                    iconBg={
                      (budgetData?.remaining_numeric ?? directorRemaining) > 0
                        ? "bg-[#3E7A54]/10 text-[#2F6042]"
                        : "bg-[#AE4A3E]/10 text-[#8A362C]"
                    }
                  />
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <BudgetProgressBar
                  spent={budgetData?.spent_ytd_numeric ?? directorSpent}
                  total={budgetData?.director_budget_numeric ?? directorBudgetTotal}
                  overallConsumption={budgetData?.budget_used || budgetData?.overall_budget_consumption}
                  color="bg-[#B78A2F]"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <ExpenseListCard
                  expenses={budgetData?.all_expenses?.length > 0 ? budgetData.all_expenses : (budgetData?.recent_expenses?.length > 0 ? budgetData.recent_expenses : localDirectorExpenses)}
                  isDirector={isDirector}
                  onShowAdd={() => setIsAddExpenseOpen(true)}
                  title={budgetData?.all_expenses ? "All Expenses" : "Recent Expenses"}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <BudgetTipCard
                  remaining={budgetData?.remaining_numeric ?? directorRemaining}
                  total={budgetData?.director_budget_numeric ?? directorBudgetTotal}
                  expenseByReason={rawCategories.length > 0 ? rawCategories : expenseByReason}
                  fundInfo={budgetData?.discretionary_fund_info}
                />
              </motion.div>

              {(!isDirector || budgetData?.discretionary_fund_info?.insights) && (
                <motion.div variants={itemVariants}>
                  <DirectorInsightsCard
                    expenseCount={budgetData?.recent_expenses?.length || localDirectorExpenses.length}
                    directorSpent={budgetData?.spent_ytd_numeric ?? directorSpent}
                    expenseByReason={rawCategories.length > 0 ? rawCategories : expenseByReason}
                    directorRemaining={budgetData?.remaining_numeric ?? directorRemaining}
                    budgetTotal={budgetData?.director_budget_numeric ?? directorBudgetTotal}
                    insightsInfo={budgetData?.discretionary_fund_info?.insights}
                  />
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAdd={handleAddExpense}
        isPending={isLoggingExpense}
      />

      {/* Budget Settings Modal */}
      <BudgetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSuccessRefetch={refetch}
      />
    </motion.div>
  );
};

export default BudgetPage;

