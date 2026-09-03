import React from "react";
import { motion } from "framer-motion";
import { Wallet, PieChart as PieIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ExpensesCard = ({ pettyCashData, onNavigate }) => {
  const gauge = pettyCashData?.budget_gauge || { total_budget: 9000, total_spent: 0, remaining: 9000, used_pct: 0 };
  const transactions = pettyCashData?.recent_transactions || [];

  const fmtMoney = (n) => "$" + Math.round(n || 0).toLocaleString();

  const spentVal = gauge.total_spent || 0;
  const totalVal = gauge.total_budget || 9000;
  const remainingVal = Math.max(0, totalVal - spentVal);
  const usedPct = totalVal > 0 ? Math.min(100, Math.round((spentVal / totalVal) * 100)) : 0;

  // SVG Pie calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (usedPct / 100) * circumference;

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <PieIcon size={16} className="text-[#1E3A5F]" />
              Expenses &amp; Director Discretionary Budget
            </CardTitle>
            <span className="text-xs text-[#1E3A5F] cursor-pointer hover:underline font-semibold" onClick={() => onNavigate("/director/expenses")}>
              Manage expenses
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Donut / Pie Chart Box */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Annual Budget Breakdown</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-extrabold text-[#1E3A5F]">{fmtMoney(spentVal)}</span>
                  <span className="text-xs text-gray-400">/ {fmtMoney(totalVal)}</span>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A5F] shrink-0" />
                    <span className="text-gray-600 font-medium">Spent:</span>
                    <span className="font-bold text-gray-900">{usedPct}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-gray-600 font-medium">Remaining:</span>
                    <span className="font-bold text-emerald-700">{fmtMoney(remainingVal)}</span>
                  </div>
                </div>
              </div>

              {/* Visual SVG Donut Pie Chart */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background remaining circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-emerald-100"
                    strokeWidth="14"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Spent arc overlay */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-[#1E3A5F] transition-all duration-500"
                    strokeWidth="14"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-extrabold text-[#1E3A5F]">{usedPct}%</span>
                  <span className="text-[8px] text-gray-400 uppercase font-semibold">Used</span>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Transactions</p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {transactions.length > 0 ? (
                  transactions.slice(0, 3).map((tx, i) => (
                    <div key={tx.id || i} className="flex items-center justify-between text-xs p-1.5 rounded bg-white">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{tx.title}</p>
                        <p className="text-[9px] text-gray-400">{tx.date}</p>
                      </div>
                      <span className="font-bold text-[#1E3A5F] shrink-0 ml-1">{tx.formatted || fmtMoney(tx.amount)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 italic">No recent transactions recorded.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExpensesCard;
