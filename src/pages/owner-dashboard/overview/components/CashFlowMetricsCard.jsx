import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer } from "recharts";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS, statusFromPct } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const CashFlowMetricsCard = ({ cashFlowMetrics }) => {
  if (!cashFlowMetrics) return null;

  const {
    revenue_ytd,
    expenses_ytd,
    net_cash_flow,
    operating_margin,
    bank_balance,
  } = cashFlowMetrics;

  const marginPct = Math.round(operating_margin?.percentage ?? 0);
  const revenueHasData = revenue_ytd?.amount != null;
  const expensesHaveData = expenses_ytd?.amount != null;
  const netCashFlowHasData = net_cash_flow?.amount != null;
  const marginHasData = operating_margin?.percentage != null;
  const bankBalanceHasData = bank_balance?.amount != null;
  const marginStatus = marginHasData ? statusFromPct(marginPct, { good: 20, watch: 10 }) : "none";
  const changeStatus = (value, inverse = false) => {
    const amount = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ""));
    if (!Number.isFinite(amount)) return STATUS.none;
    if (amount === 0) return STATUS.watch;
    return (amount > 0) !== inverse ? STATUS.good : STATUS.problem;
  };
  const netStatusText = String(net_cash_flow?.status || "").toLowerCase();
  const netStatus = /positive|surplus|healthy/.test(netStatusText)
    ? STATUS.good
    : /negative|deficit|loss|problem/.test(netStatusText)
    ? STATUS.problem
    : STATUS.watch;

  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${ACCENTS.finance.icon}`}>
            <DollarSign size={16} />
          </div>
          Cash Flow Metrics
        </h2>
        <span className="text-xs text-gray-500 font-medium">YTD Overview</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Revenue YTD */}
        <Card className="relative bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between">
          <CardAccent group={revenueHasData ? "finance" : "none"} />
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue YTD</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${revenueHasData ? ACCENTS.finance.icon : STATUS.none.soft}`}>
                  <TrendingUp size={15} className={revenueHasData ? ACCENTS.finance.text : STATUS.none.text} />
                </div>
              </div>
              <p className={`text-xl md:text-2xl font-black ${revenueHasData ? "text-gray-900" : STATUS.none.text}`}>
                {revenueHasData ? revenue_ytd.amount : "No data"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 space-y-1">
              {revenue_ytd?.yoy_change && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold border px-2 py-0.5 rounded-full ${changeStatus(revenue_ytd.yoy_change).badge}`}>
                  <ArrowUpRight size={12} /> {revenue_ytd.yoy_change}
                </span>
              )}
              {!revenueHasData && <span className={`text-[10px] ${STATUS.none.text}`}>No data</span>}
              {revenue_ytd?.subtitle && (
                <p className="text-[10px] text-gray-400 truncate" title={revenue_ytd.subtitle}>
                  {revenue_ytd.subtitle}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses YTD */}
        <Card className="relative bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between">
          <CardAccent group={expensesHaveData ? "finance" : "none"} />
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expenses YTD</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${expensesHaveData ? ACCENTS.finance.icon : STATUS.none.soft}`}>
                  <TrendingDown size={15} className={expensesHaveData ? ACCENTS.finance.text : STATUS.none.text} />
                </div>
              </div>
              <p className={`text-xl md:text-2xl font-black ${expensesHaveData ? "text-gray-900" : STATUS.none.text}`}>
                {expensesHaveData ? expenses_ytd.amount : "No data"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 space-y-1">
              {expenses_ytd?.yoy_change && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold border px-2 py-0.5 rounded-full ${changeStatus(expenses_ytd.yoy_change, true).badge}`}>
                  <ArrowDownRight size={12} /> {expenses_ytd.yoy_change}
                </span>
              )}
              {!expensesHaveData && <span className={`text-[10px] ${STATUS.none.text}`}>No data</span>}
              {expenses_ytd?.subtitle && (
                <p className="text-[10px] text-gray-400 truncate" title={expenses_ytd.subtitle}>
                  {expenses_ytd.subtitle}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Net Cash Flow */}
        <Card className="relative bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between">
          <CardAccent group={netCashFlowHasData ? "finance" : "none"} />
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Cash Flow</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${netCashFlowHasData ? ACCENTS.finance.icon : STATUS.none.soft}`}>
                  <Wallet size={15} className={netCashFlowHasData ? ACCENTS.finance.text : STATUS.none.text} />
                </div>
              </div>
              <p className={`text-xl md:text-2xl font-black ${netCashFlowHasData ? "text-gray-900" : STATUS.none.text}`}>
                {netCashFlowHasData ? net_cash_flow.amount : "No data"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              {net_cash_flow?.status && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold border px-2 py-0.5 rounded-full ${netStatus.badge}`}>
                  <CheckCircle2 size={12} /> {net_cash_flow.status}
                </span>
              )}
              {!netCashFlowHasData && <span className={`text-[10px] ${STATUS.none.text}`}>No data</span>}
            </div>
          </CardContent>
        </Card>

        {/* Operating Margin (Donut chart) */}
        <Card className="relative bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between">
          <CardAccent group={marginHasData ? "finance" : "none"} />
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Operating Margin</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${marginHasData ? ACCENTS.finance.icon : STATUS.none.soft}`}>
                  <PieChartIcon size={15} className={marginHasData ? ACCENTS.finance.text : STATUS.none.text} />
                </div>
              </div>
              <div className="relative flex items-center justify-center h-[110px] my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: marginHasData ? marginPct : 0, fill: marginHasData ? STATUS[marginStatus].hex : STATUS.none.hex },
                        { value: Math.max(0, 100 - marginPct), fill: "#F1F5F9" },
                      ]}
                      dataKey="value"
                      innerRadius="65%"
                      outerRadius="100%"
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className={`absolute text-2xl font-black ${marginHasData ? STATUS[marginStatus].text : STATUS.none.text}`}>
                  {marginHasData ? `${marginPct}%` : "—"}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 text-center">
              {marginHasData && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold border px-2 py-0.5 rounded-full ${STATUS[marginStatus].badge}`}>
                  {operating_margin.status || marginStatus}
                </span>
              )}
              {!marginHasData && <span className={`text-[10px] ${STATUS.none.text}`}>No data</span>}
            </div>
          </CardContent>
        </Card>

        {/* Bank Balance */}
        <Card className="relative bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between">
          <CardAccent group={bankBalanceHasData ? "finance" : "none"} />
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bank Balance</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${bankBalanceHasData ? ACCENTS.finance.icon : STATUS.none.soft}`}>
                  <Landmark size={15} className={bankBalanceHasData ? ACCENTS.finance.text : STATUS.none.text} />
                </div>
              </div>
              <p className={`text-xl md:text-2xl font-black ${bankBalanceHasData ? "text-gray-900" : STATUS.none.text}`}>
                {bankBalanceHasData ? bank_balance.amount : "No data"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              {bank_balance?.account_name && (
                <p className="text-[11px] font-semibold text-gray-600 truncate" title={bank_balance.account_name}>
                  {bank_balance.account_name}
                </p>
              )}
              {!bankBalanceHasData && <p className={`text-[10px] ${STATUS.none.text}`}>No data</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default CashFlowMetricsCard;
