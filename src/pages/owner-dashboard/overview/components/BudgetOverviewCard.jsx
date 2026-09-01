import React from "react";
import { motion } from "framer-motion";
import { Landmark, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EXPENSE_REASON_COLORS } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const BudgetOverviewCard = ({ budgetData, budgetPercent, schoolBudgetRemaining, DIRECTOR_BUDGET_TOTAL,
  directorSpent, directorRemaining, pettyCashPercent, recentExpenses, expenseByReason, fmtMoney, fmtDate, onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Landmark size={16} className="text-[#1E3A5F]" />
          Budget Overview
        </CardTitle>
        <CardDescription className="text-[10px]">School budget &amp; Director's discretionary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-xl bg-[#1E3A5F]/[0.05] border border-[#1E3A5F]/15">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center">
                <Landmark size={14} className="text-[#1E3A5F]" />
              </div>
              <span className="text-xs font-bold text-gray-800">School Budget</span>
            </div>
            <span className="text-xs font-bold text-[#1E3A5F]">${(budgetData.total / 1000000).toFixed(1)}M</span>
          </div>
          <div className="h-2 bg-[#1E3A5F]/10 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-[#1E3A5F] rounded-full" style={{ width: `${budgetPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">{budgetPercent}% used</span>
            <span className="text-[#2F6042] font-medium">${schoolBudgetRemaining.toLocaleString()} left</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#B78A2F]/[0.06] border border-[#B78A2F]/15">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#B78A2F]/10 flex items-center justify-center">
                <Wallet size={14} className="text-[#8F6A1F]" />
              </div>
              <span className="text-xs font-bold text-gray-800">Director's Petty Cash</span>
            </div>
            <span className="text-xs font-bold text-[#8F6A1F]">${DIRECTOR_BUDGET_TOTAL.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-[#B78A2F]/15 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-[#B78A2F] rounded-full" style={{ width: `${pettyCashPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">{pettyCashPercent}% used</span>
            <span className={`font-medium ${directorRemaining > 0 ? "text-[#2F6042]" : "text-[#8A362C]"}`}>
              {fmtMoney(directorRemaining)} left
            </span>
          </div>

          {recentExpenses.length > 0 && (
            <div className="mt-3 pt-2 border-t border-[#B78A2F]/20">
              <p className="text-[9px] font-semibold text-[#8F6A1F] uppercase tracking-wider mb-1.5">Recent Expenses</p>
              <div className="space-y-1.5">
                {recentExpenses.slice(0, 3).map((exp) => {
                  const title = exp.reason || exp.title || exp.description || exp.category || "Expense";
                  return (
                    <div key={exp.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_REASON_COLORS[exp.category] || "#94A0B5" }} />
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium text-gray-700 truncate">{title}</p>
                          <p className="text-[8px] text-gray-400">{fmtDate(exp.date)}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-800 shrink-0 ml-2">{fmtMoney(exp.amount)}</span>
                    </div>
                  );
                })}
              </div>
              {expenseByReason.length > 0 && (
                <div className="mt-2 pt-1">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Spending by Reason</p>
                  <div className="flex flex-wrap gap-2">
                    {expenseByReason.slice(0, 3).map((cat) => (
                      <div key={cat.name} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: EXPENSE_REASON_COLORS[cat.name] || "#94A0B5" }} />
                        <span className="text-[9px] text-gray-600">{cat.name}</span>
                        <span className="text-[9px] font-medium text-gray-700">{fmtMoney(Math.round(cat.total))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Button variant="ghost" className="w-full text-xs text-[#1E3A5F] h-8 hover:bg-[#1E3A5F]/5" onClick={() => onNavigate("/owner/budget")}>
          View full budget →
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

export default BudgetOverviewCard;
