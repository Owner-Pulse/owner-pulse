import { motion } from "framer-motion";
import { TrendingUp, PiggyBank, Wallet, Percent, Building2, ArrowUpRight } from "lucide-react";
import { containerVariants } from "./cashflow.utils";
import CashFlowSkeleton from "./components/CashFlowSkeleton";
import CashFlowHeader from "./components/CashFlowHeader";
import KpiRow from "./components/KpiRow";
import YearOverYearCard from "./components/YearOverYearCard";
import AiInsightsCard from "./components/AiInsightsCard";
import QuickBooksCard from "./components/QuickBooksCard";
import BudgetVsActualCard from "./components/BudgetVsActualCard";
import FullYearTable from "./components/FullYearTable";
import { useGetCashflow } from "@/hooks/owner-hook/cashflow.hook";

const DEFAULT_YEARS = [2022, 2023, 2024, 2025, 2026];

const CashFlowPage = () => {
  const { data, isLoading, isError } = useGetCashflow();
  const cf = data?.cash_flow;

  // ── Derived values from API 
  const metrics = cf?.metrics || {};
  const qbStatus = cf?.quickbooks_status || {};
  const yoyData = cf?.year_over_year_comparison || {};
  const aiObservations = cf?.ai_generated_observations || {};
  const budgetVsActual = cf?.annual_budget_vs_actual || {};
  const fullYearTrend = cf?.full_year_comparison_trend?.categories || [];

  const availableCategories = yoyData.categories_available || [];
  const years = yoyData.years || DEFAULT_YEARS;
  const currentYear = years[years.length - 1] || DEFAULT_YEARS[DEFAULT_YEARS.length - 1];
  const individualData = yoyData.individual_data || [];

  const netCashFlow = metrics.net_cash_flow?.amount_numeric || 0;

  // ── KPI cards 
  const kpiItems = [
    {
      icon: TrendingUp,
      label: "Revenue (YTD)",
      value: metrics.revenue_ytd?.amount || "—",
      sub: metrics.revenue_ytd?.subtitle || "",
      iconBg: "bg-[#3E7A54]/10 text-[#2F6042]",
      trend: (
        <span className="flex items-center text-[#2F6042] font-medium">
          <ArrowUpRight size={12} className="mr-1" />
          {metrics.revenue_ytd?.yoy_change}
        </span>
      ),
    },
    {
      icon: PiggyBank,
      label: "Expenses (YTD)",
      value: metrics.expenses_ytd?.amount || "—",
      sub: metrics.expenses_ytd?.subtitle || "",
      iconBg: "bg-[#AE4A3E]/10 text-[#8A362C]",
      trend: (
        <span className="flex items-center text-[#8F6A1F] font-medium">
          <ArrowUpRight size={12} className="mr-1" />
          {metrics.expenses_ytd?.yoy_change}
        </span>
      ),
    },
    {
      icon: Wallet,
      label: "Net Cash Flow",
      value: metrics.net_cash_flow?.amount || "—",
      sub: metrics.net_cash_flow?.status || "",
      iconBg: netCashFlow >= 0 ? "bg-[#3E7A54]/10 text-[#2F6042]" : "bg-[#AE4A3E]/10 text-[#8A362C]",
    },
    {
      icon: Percent,
      label: "Operating Margin",
      value: `${metrics.operating_margin?.percentage ?? "—"}%`,
      sub: metrics.operating_margin?.status || "",
      iconBg: (metrics.operating_margin?.percentage || 0) >= 30 ? "bg-[#3E7A54]/10 text-[#2F6042]" : "bg-[#B78A2F]/10 text-[#8F6A1F]",
    },
    {
      icon: Building2,
      label: "Bank Balance",
      value: metrics.bank_balance?.amount || "—",
      sub: metrics.bank_balance?.account_name || "",
      iconBg: "bg-[#1E3A5F]/10 text-[#1E3A5F]",
    },
  ];

  // ── QuickBooks status mapping
  const qbForCard = {
    connected: qbStatus.is_connected || false,
    lastSync: qbStatus.last_sync_at || "—",
    pendingTransactions: qbStatus.pending_transactions || 0,
    reconciled: qbStatus.reconciled || false,
    bankBalance: qbStatus.bank_balance_numeric || 0,
    bankAccount: qbStatus.bank_account || "—",
    creditBalance: qbStatus.credit_balance_numeric || 0,
    receivable: qbStatus.receivables_numeric || 0,
    payable: qbStatus.payables_numeric || 0,
  };

  // AI insights mapping
  const insights = (aiObservations.insights || []).map((text) => ({
    tone: "amber",
    icon: "ArrowRight",
    text,
  }));

  // Budget vs Actual
  const budgetCategories = (budgetVsActual.categories || []).map((c) => ({
    name: c.name,
    spent: c.spent_numeric,
    budget: c.budgeted_numeric,
  }));
  const budgetPct = budgetVsActual.consumed_percentage || 0;

  // Full Year Table
  const fullYearTableData = fullYearTrend.map((cat) => ({
    category: cat.category,
    values: {
      2022: cat.y2022_numeric,
      2023: cat.y2023_numeric,
      2024: cat.y2024_numeric,
      2025: cat.y2025_numeric,
      2026: cat.y2026_numeric,
    },
    trend: cat.trend,
  }));

  if (isLoading) {
    return <CashFlowSkeleton />;
  }

  if (isError) {
    return (
      <div className="py-20 text-center text-[#8A362C]">Failed to load Cash Flow data.</div>
    );
  }

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      <CashFlowHeader
        title={cf?.title}
        syncStatus={cf?.sync_status || "Synced"}
        bannerSummary={cf?.banner_summary || ""}
        metrics={metrics}
        netCashFlow={netCashFlow}
      />

      <KpiRow items={kpiItems} />

      <YearOverYearCard
        title={yoyData.title}
        subtitle={yoyData.subtitle}
        availableCategories={availableCategories}
        individualData={individualData}
        years={years}
        currentYear={currentYear}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AiInsightsCard
          title={aiObservations.title}
          subtitle={aiObservations.subtitle}
          insights={insights}
        />
        <QuickBooksCard status={qbForCard} />
      </div>

      {budgetCategories.length > 0 && (
        <BudgetVsActualCard
          categories={budgetCategories}
          totalSpent={budgetCategories.reduce((a, c) => a + c.spent, 0)}
          totalBudget={budgetCategories.reduce((a, c) => a + c.budget, 0)}
          budgetPct={budgetPct}
        />
      )}

      {fullYearTableData.length > 0 && (
        <FullYearTable data={fullYearTableData} years={years} currentYear={currentYear} />
      )}
    </motion.div>
  );
};
export default CashFlowPage;