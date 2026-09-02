import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

const fmtMoneyShort = (n) => {
  if (typeof n === "string") return n;
  if (n === undefined || n === null) return "$0";
  return n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);
};

const SinglePieChart = ({ title, spent, total, color = "#1E3A5F" }) => {
  const safeTotal = total > 0 ? total : spent > 0 ? spent : 1;
  const spentPct = Math.min(100, Math.round((spent / safeTotal) * 100));
  const remaining = Math.max(0, safeTotal - spent);

  // SVG arc calculation (strokeDasharray circumference = 2 * PI * r = 264 for r=42)
  const strokeDash = (spentPct / 100) * 264;

  return (
    <div className="flex flex-col items-center p-4 rounded-xl bg-gray-50 border border-gray-100/80">
      <h4 className="text-xs font-bold text-gray-700 mb-3">{title}</h4>
      <div className="relative w-28 h-28 mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} 264`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold text-gray-900">{spentPct}%</span>
          <span className="text-[9px] font-semibold text-gray-400">USED</span>
        </div>
      </div>
      <div className="w-full space-y-1 text-center">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
            Spent:
          </span>
          <span className="font-bold text-gray-800">{fmtMoneyShort(spent)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block bg-gray-300" />
            Remaining:
          </span>
          <span className="font-medium text-[#2F6042]">{fmtMoneyShort(remaining)}</span>
        </div>
      </div>
    </div>
  );
};

const BudgetPieChartsCard = ({ schoolSpent, schoolBudgetTotal, categories = [] }) => {
  // Find Payroll category
  const payrollCategory = categories.find((c) => {
    const name = (c.name || c.category || "").toLowerCase();
    return name.includes("payroll") || name.includes("salary") || name.includes("benefit");
  }) || {
    spent: Math.round(schoolSpent * 0.65),
    budget: Math.round(schoolBudgetTotal * 0.65),
  };

  const payrollSpent = payrollCategory.spent_numeric ?? (typeof payrollCategory.spent === "number" ? payrollCategory.spent : Math.round(schoolSpent * 0.65));
  const payrollBudget = payrollCategory.budgeted_numeric ?? (typeof payrollCategory.budget === "number" ? payrollCategory.budget : Math.round(schoolBudgetTotal * 0.65));

  return (
    <Card className="bg-white border-none shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm md:text-base font-bold text-gray-900">
          <PieChartIcon size={18} className="text-[#1E3A5F]" />
          Annual Budget vs. Actual (Pie Chart Breakdown)
        </CardTitle>
        <CardDescription className="text-xs">
          Overall budget and payroll budget consumption at a glance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SinglePieChart
            title="Overall Budget (Spent vs. Remaining)"
            spent={schoolSpent}
            total={schoolBudgetTotal}
            color="#1E3A5F"
          />
          <SinglePieChart
            title="Payroll Budget (Spent vs. Remaining)"
            spent={payrollSpent}
            total={payrollBudget}
            color="#B78A2F"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetPieChartsCard;
