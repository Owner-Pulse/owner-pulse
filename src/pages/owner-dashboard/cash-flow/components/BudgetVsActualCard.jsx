import React from "react";
import { motion } from "framer-motion";
import { PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtMoneyShort = (n) =>
  n >= 1000000 ? "$" + (n / 1000000).toFixed(1) + "M"
    : n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K"
      : "$" + n;

const BudgetVsActualCard = ({ categories, totalSpent, totalBudget, budgetPct }) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank size={18} className="text-amber-500" />
              Annual Budget vs Actual
            </CardTitle>
            <CardDescription>
              {fmtMoneyShort(totalSpent)} of {fmtMoneyShort(totalBudget)} spent ({budgetPct}%)
            </CardDescription>
          </div>
          <div className="hidden md:block w-48">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>$0</span>
              <span className="font-semibold text-gray-600">{budgetPct}%</span>
              <span>{fmtMoneyShort(totalBudget)}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${budgetPct}%` }} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const pct = Math.round((cat.spent / cat.budget) * 100);
            const overspent = cat.spent > cat.budget;
            const barColor = overspent ? "bg-red-400" : pct > 85 ? "bg-amber-400" : "bg-blue-500";
            return (
              <div key={cat.name} className="p-3 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 truncate mr-2">{cat.name}</span>
                  <span className={`text-xs font-bold whitespace-nowrap ${overspent ? "text-red-500" : "text-gray-500"}`}>
                    {fmtMoneyShort(cat.spent)} / {fmtMoneyShort(cat.budget)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-gray-400">{pct}% used</span>
                  {overspent ? (
                    <span className="text-[10px] text-red-500 font-semibold">Overspent by {fmtMoneyShort(cat.spent - cat.budget)}</span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-semibold">{fmtMoneyShort(cat.budget - cat.spent)} remaining</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default BudgetVsActualCard;
