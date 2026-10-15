import React from "react";
import { motion } from "framer-motion";
import { Landmark, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, EXPENSE_REASON_COLORS, STATUS } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const BudgetOverviewCard = ({ budgetData, budgetPercent, schoolBudgetRemaining, DIRECTOR_BUDGET_TOTAL,
  directorSpent, directorRemaining, pettyCashPercent, recentExpenses, expenseByReason, fmtMoney, fmtDate, onNavigate, noData = false }) => (
  <motion.div variants={itemVariants}>
    <Card className="relative bg-white border-none shadow-sm h-full overflow-hidden">
      <CardAccent group={noData ? "none" : "finance"} />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Landmark size={16} className={noData ? STATUS.none.text : ACCENTS.finance.text} />
          Budget Overview
        </CardTitle>
        <CardDescription className="text-[10px]">School budget &amp; Director's discretionary budget</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-3 rounded-xl border ${noData ? `${STATUS.none.soft} ${STATUS.none.border}` : `${ACCENTS.finance.soft} ${ACCENTS.finance.border}`}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${noData ? STATUS.none.soft : ACCENTS.finance.soft}`}>
                <Landmark size={14} className={noData ? STATUS.none.text : ACCENTS.finance.text} />
              </div>
              <span className="text-xs font-bold text-gray-800">School Budget</span>
            </div>
            <span className={`text-xs font-bold ${noData ? STATUS.none.text : ACCENTS.finance.text}`}>{noData ? "No data" : `$${(budgetData.total / 1000000).toFixed(1)}M`}</span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden mb-1.5 ${noData ? STATUS.none.soft : ACCENTS.finance.soft}`}>
            <div className={`h-full ${noData ? STATUS.none.dot : ACCENTS.finance.bar}`} style={{ width: `${noData ? 0 : budgetPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className={noData ? STATUS.none.text : "text-gray-600"}>{noData ? "No data" : `${budgetPercent}% used`}</span>
            <span className={`font-medium ${noData ? STATUS.none.text : STATUS.good.text}`}>{noData ? "No data" : `$${schoolBudgetRemaining.toLocaleString()} left`}</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl border ${noData ? `${STATUS.none.soft} ${STATUS.none.border}` : `${ACCENTS.finance.soft} ${ACCENTS.finance.border}`}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${noData ? STATUS.none.soft : ACCENTS.finance.soft}`}>
                <Wallet size={14} className={noData ? STATUS.none.text : ACCENTS.finance.text} />
              </div>
              <span className="text-xs font-bold text-gray-800">Director Discretionary Budget</span>
            </div>
            <span className={`text-xs font-bold ${noData ? STATUS.none.text : ACCENTS.finance.text}`}>{noData ? "No data" : `$${DIRECTOR_BUDGET_TOTAL.toLocaleString()}`}</span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden mb-1.5 ${noData ? STATUS.none.soft : ACCENTS.finance.soft}`}>
            <div className={`h-full rounded-full ${noData ? STATUS.none.dot : ACCENTS.finance.bar}`} style={{ width: `${noData ? 0 : pettyCashPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className={noData ? STATUS.none.text : "text-gray-600"}>{noData ? "No data" : `${pettyCashPercent}% used`}</span>
            <span className={`font-medium ${noData ? STATUS.none.text : directorRemaining > 0 ? STATUS.good.text : STATUS.problem.text}`}>
              {noData ? "No data" : `${fmtMoney(directorRemaining)} left`}
            </span>
          </div>

          {recentExpenses.length > 0 && (
            <div className={`mt-3 pt-2 border-t ${ACCENTS.finance.border}`}>
              <p className={`text-[9px] font-semibold uppercase tracking-wider mb-1.5 ${ACCENTS.finance.text}`}>Recent Expenses</p>
              <div className="space-y-1.5">
                {recentExpenses.slice(0, 3).map((exp) => {
                  const title = exp.reason || exp.title || exp.description || exp.category || "Expense";
                  return (
                    <div key={exp.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_REASON_COLORS[exp.category] || ACCENTS.operations.hex }} />
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
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: EXPENSE_REASON_COLORS[cat.name] || ACCENTS.operations.hex }} />
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

        <Button variant="ghost" className={`w-full text-xs h-8 cursor-pointer ${ACCENTS.finance.text} ${ACCENTS.finance.hover}`} onClick={() => onNavigate("/owner/budget")}>
          View full budget →
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

export default BudgetOverviewCard;
