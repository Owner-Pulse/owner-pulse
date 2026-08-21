import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const fmtMoneyShort = (n) => n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);

const BudgetProgressBar = ({ spent, total, label = "Budget Used", color = "bg-[#B78A2F]" }) => {
  const pct = Math.round((spent / total) * 100);

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-semibold text-gray-700">{label}</span>
          <span className={`font-bold ${spent > total ? "text-[#8A362C]" : pct > 85 ? "text-[#8A362C]" : "text-[#8F6A1F]"}`}>
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
