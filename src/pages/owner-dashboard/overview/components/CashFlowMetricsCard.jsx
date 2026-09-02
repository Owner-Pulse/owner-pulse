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

  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#3E7A54]/10 flex items-center justify-center">
            <DollarSign size={16} className="text-[#3E7A54]" />
          </div>
          Cash Flow Metrics
        </h2>
        <span className="text-xs text-gray-500 font-medium">YTD Overview</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Revenue YTD */}
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue YTD</span>
                <div className="w-7 h-7 rounded-lg bg-[#3E7A54]/10 flex items-center justify-center">
                  <TrendingUp size={15} className="text-[#3E7A54]" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-black text-gray-900">
                {revenue_ytd?.amount || "$0"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 space-y-1">
              {revenue_ytd?.yoy_change && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F6042] bg-[#3E7A54]/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight size={12} /> {revenue_ytd.yoy_change}
                </span>
              )}
              {revenue_ytd?.subtitle && (
                <p className="text-[10px] text-gray-400 truncate" title={revenue_ytd.subtitle}>
                  {revenue_ytd.subtitle}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses YTD */}
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expenses YTD</span>
                <div className="w-7 h-7 rounded-lg bg-[#AE4A3E]/10 flex items-center justify-center">
                  <TrendingDown size={15} className="text-[#AE4A3E]" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-black text-gray-900">
                {expenses_ytd?.amount || "$0"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 space-y-1">
              {expenses_ytd?.yoy_change && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A362C] bg-[#AE4A3E]/10 px-2 py-0.5 rounded-full">
                  <ArrowDownRight size={12} /> {expenses_ytd.yoy_change}
                </span>
              )}
              {expenses_ytd?.subtitle && (
                <p className="text-[10px] text-gray-400 truncate" title={expenses_ytd.subtitle}>
                  {expenses_ytd.subtitle}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Net Cash Flow */}
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Cash Flow</span>
                <div className="w-7 h-7 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center">
                  <Wallet size={15} className="text-[#1E3A5F]" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-black text-gray-900">
                {net_cash_flow?.amount || "$0"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              {net_cash_flow?.status && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F6042] bg-[#3E7A54]/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} /> {net_cash_flow.status}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Operating Margin (Donut chart) */}
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Operating Margin</span>
                <div className="w-7 h-7 rounded-lg bg-[#3E7A54]/10 flex items-center justify-center">
                  <PieChartIcon size={15} className="text-[#3E7A54]" />
                </div>
              </div>
              <div className="relative flex items-center justify-center h-[75px] my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: marginPct, fill: "#3E7A54" },
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
                <div className="absolute text-lg font-black text-[#3E7A54]">
                  {marginPct}%
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 text-center">
              {operating_margin?.status && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F6042] bg-[#3E7A54]/10 px-2 py-0.5 rounded-full">
                  {operating_margin.status}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bank Balance */}
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bank Balance</span>
                <div className="w-7 h-7 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center">
                  <Landmark size={15} className="text-[#1E3A5F]" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-black text-gray-900">
                {bank_balance?.amount || "$0"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              {bank_balance?.account_name && (
                <p className="text-[11px] font-semibold text-gray-600 truncate" title={bank_balance.account_name}>
                  {bank_balance.account_name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default CashFlowMetricsCard;
