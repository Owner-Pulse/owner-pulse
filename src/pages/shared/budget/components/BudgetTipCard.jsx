import React from "react";
import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
const fmtMoneyShort = (n) => {
  if (typeof n === "string") return n;
  if (n === undefined || n === null) return "$0";
  return n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);
};

const BudgetTipCard = ({ remaining = 0, total = 0, expenseByReason = [], fundInfo = null }) => {
  const title = fundInfo?.remaining_text || (remaining > 0 ? `${fmtMoney(remaining)} remaining in discretionary fund` : "Budget exhausted");
  const notice = fundInfo?.notice || (remaining > 0
    ? `Director's discretionary budget runs Jan through end of Dec. ${fmtMoney(remaining)} left for the rest of the school year.`
    : `Director's discretionary budget of ${fmtMoney(total)} has been fully spent. No more discretionary funds available until next school year.`);
  const hasFunds = fundInfo ? (!notice.includes("$0.00 left") && !title.includes("$0.00 remaining")) : remaining > 0;

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${hasFunds ? "bg-[#B78A2F]/10" : "bg-[#AE4A3E]/10"}`}>
            <Wallet size={18} className={hasFunds ? "text-[#8F6A1F]" : "text-[#8A362C]"} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{notice}</p>
            {expenseByReason.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {expenseByReason.slice(0, 4).map((cat) => (
                  <span key={cat.name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-medium text-gray-600">
                    {cat.name}: {cat.amount || fmtMoneyShort(Math.round(cat.total || cat.numeric_amount || 0))}
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

