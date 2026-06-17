import React from "react";
import { PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const CATEGORY_COLORS = {
  "Classroom Supplies": "#2563EB",
  "Events & Food": "#F97316",
  "Cleaning & Sanitation": "#16A34A",
  "Office Supplies": "#0EA5E9",
  "Faculty Appreciation": "#EC4899",
  "Uncategorized": "#94A0B5",
};

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

const SpendingByReasonCard = ({ expenses, total }) => (
  <Card className="bg-white border-none shadow-sm h-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <PieChart size={16} className="text-gray-500" />
        Spending by Reason
      </CardTitle>
      <CardDescription>How the discretionary fund is being used</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      {expenses.length > 0 ? (
        expenses.map((cat) => {
          const pct = Math.round((cat.total / total) * 100);
          const color = CATEGORY_COLORS[cat.name] || "#94A0B5";
          return (
            <div key={cat.name} className="p-2.5 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-sm text-gray-700">{cat.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{fmtMoney(cat.total)}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-6 text-center text-sm text-gray-400">No expenses yet.</div>
      )}
    </CardContent>
  </Card>
);

export default SpendingByReasonCard;
