import React from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ExpensesCard = ({ pettyCashData, onNavigate }) => {
  const gauge = pettyCashData?.budget_gauge || { total_budget: 0, total_spent: 0, remaining: 0, used_pct: 0 };
  const transactions = pettyCashData?.recent_transactions || [];

  const fmtMoney = (n) => "$" + Math.round(n || 0).toLocaleString();

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Wallet size={16} className="text-[#1E3A5F]" />
              Expenses &amp; Director Discretionary Budget
            </CardTitle>
            <span className="text-xs text-[#1E3A5F] cursor-pointer hover:underline font-semibold" onClick={() => onNavigate("/director/expenses")}>
              Manage expenses
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gauge */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Monthly Budget</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-[#1E3A5F]">{fmtMoney(gauge.total_spent)}</span>
                  <span className="text-xs text-gray-400">/ {fmtMoney(gauge.total_budget)}</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${gauge.used_pct > 90 ? "bg-[#AE4A3E]" : gauge.used_pct > 75 ? "bg-[#B78A2F]" : "bg-[#1E3A5F]"}`}
                    style={{ width: `${Math.min(100, Math.round(gauge.used_pct))}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                {fmtMoney(gauge.remaining)} remaining ({Math.round(gauge.used_pct)}% used)
              </p>
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
