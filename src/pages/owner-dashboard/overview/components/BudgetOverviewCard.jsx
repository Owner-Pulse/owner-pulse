import React from "react";
import { motion } from "framer-motion";
import { Landmark, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const EXPENSE_REASON_COLORS = {
  "Classroom Supplies": "#2563EB", "Events & Food": "#F97316", "Staff Appreciation": "#EC4899",
  "Cleaning Supplies": "#16A34A", "Office Supplies": "#0EA5E9", "Teacher Appreciation": "#8B5CF6",
  "Professional Dev.": "#D97706", "Tech & Software": "#7C3AED", "Facilities": "#64748B", "Other": "#94A0B5",
};

const BudgetOverviewCard = ({ budgetData, budgetPercent, schoolBudgetRemaining, DIRECTOR_BUDGET_TOTAL,
  directorSpent, directorRemaining, pettyCashPercent, recentExpenses, expenseByReason, fmtMoney, fmtDate, onNavigate }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Landmark size={16} className="text-amber-500" />
          Budget Overview
        </CardTitle>
        <CardDescription className="text-[10px]">School budget &amp; Director's discretionary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Landmark size={14} className="text-blue-600" />
              </div>
              <span className="text-xs font-bold text-gray-800">School Budget</span>
            </div>
            <span className="text-xs font-bold text-blue-600">${(budgetData.total / 1000000).toFixed(1)}M</span>
          </div>
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${budgetPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">{budgetPercent}% used</span>
            <span className="text-emerald-600 font-medium">${schoolBudgetRemaining.toLocaleString()} left</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Wallet size={14} className="text-pink-600" />
              </div>
              <span className="text-xs font-bold text-gray-800">Director's Petty Cash</span>
            </div>
            <span className="text-xs font-bold text-pink-600">${DIRECTOR_BUDGET_TOTAL.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-pink-100 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-pink-500 rounded-full" style={{ width: `${pettyCashPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">{pettyCashPercent}% used</span>
            <span className={`font-medium ${directorRemaining > 0 ? "text-pink-600" : "text-red-500"}`}>
              {fmtMoney(directorRemaining)} left
            </span>
          </div>

          {recentExpenses.length > 0 && (
            <div className="mt-3 pt-2 border-t border-pink-200/50">
              <p className="text-[9px] font-semibold text-pink-700 uppercase tracking-wider mb-1.5">Recent Expenses</p>
              <div className="space-y-1.5">
                {recentExpenses.slice(0, 3).map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_REASON_COLORS[exp.reason] || "#94A0B5" }} />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-700 truncate">{exp.description}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-medium text-gray-400">{exp.reason}</span>
                          <span className="text-[8px] text-gray-400">· {fmtDate(exp.date)}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-800 shrink-0 ml-2">{fmtMoney(exp.amount)}</span>
                  </div>
                ))}
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

        <Button variant="ghost" className="w-full text-xs text-blue-600 h-8 hover:bg-blue-50" onClick={() => onNavigate("/owner/budget")}>
          View full budget →
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

export default BudgetOverviewCard;
