import React from "react";
import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const fmtMoneyShort = (n) => n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);

const BudgetTipCard = ({ remaining, total, expenseByReason }) => {
  const hasFunds = remaining > 0;

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${hasFunds ? "bg-amber-100" : "bg-red-100"}`}>
            <Wallet size={18} className={hasFunds ? "text-amber-600" : "text-red-500"} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {hasFunds ? `${fmtMoney(remaining)} remaining in discretionary fund` : "Budget exhausted"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {hasFunds
                ? `Director's discretionary budget runs Aug through end of May. ${fmtMoney(remaining)} left for the rest of the school year.`
                : `Director's discretionary budget of ${fmtMoney(total)} has been fully spent. No more discretionary funds available until next school year.`}
            </p>
            {expenseByReason.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {expenseByReason.slice(0, 4).map((cat) => (
                  <span key={cat.name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-medium text-gray-600">
                    {cat.name}: {fmtMoneyShort(Math.round(cat.total))}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetTipCard;
