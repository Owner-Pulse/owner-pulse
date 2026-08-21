import React from "react";
import { TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

const DirectorInsightsCard = ({ expenseCount, directorSpent, expenseByReason, directorRemaining, budgetTotal }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp size={16} className="text-[#1E3A5F]" />
        Director Expense Insights
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="p-3 rounded-xl bg-[#1E3A5F]/[0.05] border border-[#1E3A5F]/15 flex items-start gap-2">
        <CheckCircle2 size={14} className="text-[#1E3A5F] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#1E3A5F]">
          <span className="font-bold">{expenseCount} expenses</span> recorded from director's discretionary fund totaling {fmtMoney(directorSpent)}.{" "}
          Top reason: <span className="font-medium">{expenseByReason[0]?.name || "N/A"}</span> at {fmtMoney(Math.round(expenseByReason[0]?.total || 0))}.
        </p>
      </div>
      <div className="p-3 rounded-xl bg-[#B78A2F]/10 border border-[#B78A2F]/25 flex items-start gap-2">
        <AlertTriangle size={14} className="text-[#8F6A1F] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#8F6A1F]">
          <span className="font-bold">{directorRemaining > 0 ? `${fmtMoney(directorRemaining)} remaining` : "Budget exhausted"}</span>{" "}
          of the ${budgetTotal.toLocaleString()} discretionary fund.
          {directorRemaining < 2000 && directorRemaining > 0 ? " Consider discussing budget reallocation with director." : ""}
          {directorRemaining <= 0 ? " No more discretionary funds available this year." : ""}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default DirectorInsightsCard;
