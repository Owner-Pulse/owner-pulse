import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const fmtMoneyShort = (n) => n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);

const BudgetProgressBar = ({ spent, total, label = "Budget Used", color = "bg-amber-400" }) => {
  const pct = Math.round((spent / total) * 100);

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-semibold text-gray-700">{label}</span>
          <span className={`font-bold ${spent > total ? "text-red-500" : pct > 85 ? "text-red-500" : "text-amber-600"}`}>
            {pct}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$0</span>
          <span>{fmtMoneyShort(spent)} spent</span>
          <span>{fmtMoneyShort(total)} total</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetProgressBar;
