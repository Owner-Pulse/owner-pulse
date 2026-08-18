import React from "react";
import { motion } from "framer-motion";
import { Receipt, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXPENSE_REASON_COLORS } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ExpensesCard = ({ directorSpent, directorRemaining, pettyCashPercent, recentExpenses, expenseByReason,
  DIRECTOR_BUDGET_TOTAL, fmtMoney, fmtDate, onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Receipt size={16} className="text-[#1E3A5F]" />
            Recent Expenses &amp; Petty Cash
          </CardTitle>
          <span className="text-xs text-[#1E3A5F] cursor-pointer hover:underline" onClick={() => onNavigate("/director/budget")}>View all</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#B78A2F]/[0.06] border border-[#B78A2F]/15">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#B78A2F]/10 flex items-center justify-center">
                  <Wallet size={16} className="text-[#8F6A1F]" />
                </div>
                <span className="text-xs font-bold text-gray-800">Petty Cash</span>
              </div>
              <span className="text-xs font-bold text-[#8F6A1F]">${DIRECTOR_BUDGET_TOTAL.toLocaleString()}</span>
            </div>
            <div className="h-2.5 bg-[#B78A2F]/15 rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-[#B78A2F] rounded-full" style={{ width: `${pettyCashPercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500">{pettyCashPercent}% used</span>
              <span className={`font-medium ${directorRemaining > 0 ? "text-[#2F6042]" : "text-[#8A362C]"}`}>
                {fmtMoney(directorRemaining)} left
              </span>
            </div>
            <p className="text-[9px] text-gray-400 mt-2">{recentExpenses.length > 0 ? `${recentExpenses.length}+` : "0"} total transactions</p>
          </div>

          <div className="md:col-span-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Transactions</p>
            <div className="space-y-1.5">
              {recentExpenses.length > 0 ? recentExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_REASON_COLORS[exp.reason] || "#94A0B5" }} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{exp.description}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-gray-400">{exp.reason}</span>
                        <span className="text-[9px] text-gray-300">·</span>
                        <span className="text-[9px] text-gray-400">{fmtDate(exp.date)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-800 shrink-0 ml-2">{fmtMoney(exp.amount)}</span>
                </div>
              )) : (
                <div className="text-center py-4 text-sm text-gray-400">No expenses recorded yet</div>
              )}
            </div>

            {expenseByReason.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Spending by Reason</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {expenseByReason.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: EXPENSE_REASON_COLORS[cat.name] || "#94A0B5" }} />
                      <span className="text-[10px] text-gray-600">{cat.name}</span>
                      <span className="text-[10px] font-semibold text-gray-700">{fmtMoney(Math.round(cat.total))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default ExpensesCard;
