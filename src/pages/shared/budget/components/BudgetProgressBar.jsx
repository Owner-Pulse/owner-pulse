import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const fmtMoneyShort = (n) => {
  if (typeof n === "string") return n;
  if (n === undefined || n === null) return "$0";
  return n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);
};

const BudgetProgressBar = ({ spent, total, label = "Budget Used", color = "bg-[#B78A2F]", overallConsumption = null }) => {
  const title = overallConsumption?.title || label;
  const pct = overallConsumption?.consumed_percentage ?? (total > 0 ? Math.round((spent / total) * 100) : 0);
  const spentText = overallConsumption?.spent_text || `${fmtMoneyShort(spent)} spent`;
  const totalText = overallConsumption?.total_text || `${fmtMoneyShort(total)} total`;
  const minText = overallConsumption?.min || "$0";

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-semibold text-gray-700">{title}</span>
          <span className={`font-bold ${pct > 85 ? "text-[#8A362C]" : "text-[#8F6A1F]"}`}>
            {pct}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{minText}</span>
          <span>{spentText}</span>
          <span>{totalText}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetProgressBar;

