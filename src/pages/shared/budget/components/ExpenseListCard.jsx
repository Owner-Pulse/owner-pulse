import React from "react";
import { Receipt, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const fmtDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

// const CATEGORY_COLORS = {
//   "Classroom Supplies": "#2563EB",
//   "Events & Food": "#F97316",
//   "Cleaning & Sanitation": "#16A34A",
//   "Office Supplies": "#0EA5E9",
//   "Faculty Appreciation": "#EC4899",
//   "Uncategorized": "#94A0B5",
// };

// const categorize = (description) => {
//   const CATEGORIES = {
//     "Classroom Supplies": ["pencil", "crayon", "paper", "glue", "scissor", "book", "art", "craft", "marker", "construction"],
//     "Events & Food": ["pizza", "cake", "food", "snack", "coffee", "donut", "party", "celebration", "birthday"],
//     "Cleaning & Sanitation": ["cleaning", "wipe", "soap", "sanitizer", "disinfectant"],
//     "Office Supplies": ["printer", "ink", "cartridge", "stapler", "tape", "pen"],
//     "Faculty Appreciation": ["gift card", "teacher appreciation", "flowers"],
//     "Uncategorized": [],
//   };
//   const desc = (description || "").toLowerCase();
//   for (const [cat, keywords] of Object.entries(CATEGORIES)) {
//     if (keywords.some((k) => desc.includes(k))) return cat;
//   }
//   return "Uncategorized";
// };

const ExpenseListCard = ({ expenses, isDirector, onShowAdd }) => (
  <Card className="bg-white border-none shadow-sm h-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Receipt size={16} className="text-gray-500" />
        Recent Expenses
      </CardTitle>
      {isDirector && <CardDescription>Track what you've spent</CardDescription>}
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        {expenses.length > 0 ? (
          [...expenses].reverse().map((exp) => {
            const reason = exp.category
            const color = exp.color
            return (
              <div key={exp.id} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-900 truncate font-medium">{exp.description}</p>
                      {exp.reason && (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
                          {exp.reason}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">{fmtDate(exp.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-sm font-semibold text-gray-900">{fmtMoney(exp.amount)}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center">
            <Receipt size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No expenses yet</p>
            {isDirector && (
              <button onClick={() => onShowAdd && onShowAdd()} className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700">
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
