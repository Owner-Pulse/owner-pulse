import React from "react";
import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  if (typeof dateStr === "string" && (dateStr.includes("Jan") || dateStr.includes("Feb") || dateStr.includes("Mar") || dateStr.includes("Apr") || dateStr.includes("May") || dateStr.includes("Jun") || dateStr.includes("Jul") || dateStr.includes("Aug") || dateStr.includes("Sep") || dateStr.includes("Oct") || dateStr.includes("Nov") || dateStr.includes("Dec"))) {
    return dateStr;
  }
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (e) {
    return dateStr;
  }
};

const fmtMoney = (n) => {
  if (typeof n === "string") return n;
  if (n === undefined || n === null) return "$0";
  return "$" + Math.round(n).toLocaleString();
};

const ExpenseListCard = ({ expenses = [], isDirector, onShowAdd }) => (
  <Card className="bg-white border-none shadow-sm h-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Receipt size={16} className="text-[#1E3A5F]" />
        Recent Expenses
      </CardTitle>
      {isDirector && <CardDescription>Track what you've spent</CardDescription>}
    </CardHeader>
    <CardContent>
      <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1.5">

        {expenses.length > 0 ? (
          expenses.map((exp, idx) => {
            const rawCategory = exp.category || exp.reason || "";
            const hasColon = rawCategory.includes(":");
            const categoryBadge = hasColon ? rawCategory.split(":").pop().trim() : rawCategory;
            const amountDisplay = exp.amount ?? (exp.numeric_amount !== undefined ? fmtMoney(exp.numeric_amount) : "$0");
            const color = exp.color || "#1E3A5F";

            return (
              <div key={exp.id || idx} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs md:text-sm text-gray-900 truncate font-medium">
                        {exp.description || exp.title || "Expense"}
                      </p>
                      {categoryBadge && (
                        <span className="text-[10px] font-medium text-[#1E3A5F] bg-[#1E3A5F]/10 px-1.5 py-0.5 rounded-full shrink-0 truncate max-w-[120px]">
                          {categoryBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(exp.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs md:text-sm font-semibold text-gray-900">{amountDisplay}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center">
            <Receipt size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No expenses yet</p>
            {isDirector && (
              <button onClick={() => onShowAdd && onShowAdd()} className="mt-2 text-xs font-semibold text-[#1E3A5F] hover:text-[#15294A]">
                Add your first expense →
              </button>
            )}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default ExpenseListCard;

