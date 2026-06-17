import React from "react";
import { PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const fmtMoneyShort = (n) => n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);

const CategoryBreakdownCard = ({ categories }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <PieChart size={16} className="text-gray-500" />
        Budget Categories
      </CardTitle>
      <CardDescription>Annual budget vs. actual spend</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {categories.map((cat) => {
          const pct = Math.round((cat.spent / cat.budget) * 100);
          const overspent = cat.spent > cat.budget;
          const barColor = overspent ? "bg-red-400" : pct > 85 ? "bg-amber-400" : "bg-blue-500";

          return (
            <div key={cat.name} className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                <span className={`text-xs font-bold ${overspent ? "text-red-500" : "text-gray-500"}`}>
                  {fmtMoneyShort(cat.spent)} / {fmtMoneyShort(cat.budget)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-400">{pct}% used</span>
                {overspent ? (
                  <span className="text-[10px] text-red-500 font-semibold">
                    Overspent by {fmtMoneyShort(cat.spent - cat.budget)}
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {fmtMoneyShort(cat.budget - cat.spent)} remaining
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

export default CategoryBreakdownCard;
