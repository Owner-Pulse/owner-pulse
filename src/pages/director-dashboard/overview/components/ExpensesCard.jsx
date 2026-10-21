import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";
import { formatDate } from "@/lib/datetime";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtMoney = (n, { cents = false } = {}) => {
  const value = Number(n) || 0;
  return cents
    ? "$" + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "$" + Math.round(value).toLocaleString();
};

const Stat = ({ label, value, tone = "text-gray-900" }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
    <p className={`mt-0.5 text-sm font-bold tabular-nums truncate ${tone}`}>{value}</p>
  </div>
);

const ExpensesCard = ({ pettyCashData, onNavigate }) => {
  const noData = !pettyCashData?.budget_gauge;
  const gauge = pettyCashData?.budget_gauge || {};
  const transactions = pettyCashData?.recent_transactions || [];
  const reasons = [...(pettyCashData?.spending_by_reason || [])].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 4);

  const spentVal = Number(gauge.total_spent) || 0;
  const totalVal = Number(gauge.total_budget) || 0;
  const remainingVal = Math.max(0, totalVal - spentVal);
  const usedPct = totalVal > 0 ? Math.min(100, Math.round((spentVal / totalVal) * 100)) : 0;
  const count = Number(gauge.expense_count) || transactions.length;
  const avg = gauge.avg_expense != null ? Number(gauge.avg_expense) : (count > 0 ? spentVal / count : 0);

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (usedPct / 100) * circumference;

  return (
    <motion.div variants={itemVariants}>
      <Card className="relative bg-white border-none shadow-sm hover:shadow-md transition-shadow py-0 gap-0">
        <CardAccent group={noData ? "none" : "finance"} />
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 min-w-0">
            <span className={`p-1.5 rounded-lg shrink-0 ${noData ? "bg-gray-100 text-gray-600" : ACCENTS.finance.icon}`}>
              <Wallet size={16} />
            </span>
            <span className="truncate">Expenses &amp; Director Discretionary Budget</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigate("/director/expenses")}
            className={`inline-flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${ACCENTS.finance.text} ${ACCENTS.finance.hover} transition-colors cursor-pointer`}
          >
            Manage expenses <ChevronRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 sm:px-5 pt-3 pb-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Discretionary budget{gauge.period_label ? ` · ${gauge.period_label}` : ""}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-3xl font-bold tabular-nums leading-tight ${noData ? STATUS.none.text : "text-gray-900"}`}>
                  {noData ? "No data" : fmtMoney(spentVal)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {noData ? "Budget not available" : `of ${fmtMoney(totalVal)} spent`}
                </p>
              </div>
              <div className="relative h-20 w-20 shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={radius} className={noData ? STATUS.none.track : "text-gray-200"} strokeWidth="12" stroke="currentColor" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className={`${noData ? STATUS.none.text : ACCENTS.finance.text} transition-all duration-500`}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={noData ? circumference : strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-sm font-bold tabular-nums ${noData ? STATUS.none.text : ACCENTS.finance.text}`}>{noData ? "—" : `${usedPct}%`}</span>
                  <span className="text-[8px] font-semibold uppercase text-gray-400">Used</span>
                </div>
              </div>
            </div>

            <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className={`h-full rounded-full ${noData ? "bg-gray-300" : ACCENTS.finance.bar}`} style={{ width: `${noData ? 0 : usedPct}%` }} />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <Stat label="Remaining" value={noData ? "—" : fmtMoney(remainingVal)} tone={noData ? STATUS.none.text : STATUS.good.text} />
              <Stat label="This month" value={noData ? "—" : fmtMoney(gauge.this_month_spent)} />
              <Stat label="Average" value={noData || count === 0 ? "—" : fmtMoney(avg, { cents: true })} />
            </div>

            <p className="mt-3 text-[11px] text-gray-500">
              {noData
                ? "No expense data yet."
                : `${count} ${count === 1 ? "expense" : "expenses"} · ${usedPct}% used${gauge.days_left != null ? ` · ${gauge.days_left} days left in this school year` : ""}`}
            </p>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Where it went</p>
              {reasons.length > 0 ? (
                <div className="space-y-2">
                  {reasons.map((reason) => (
                    <div key={reason.category}>
                      <div className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="font-semibold text-gray-800 truncate">{reason.category}</span>
                        <span className="shrink-0 tabular-nums text-gray-500">
                          {reason.formatted || fmtMoney(reason.amount, { cents: true })}
                          <span className="text-gray-400"> · {Math.round(reason.percentage || 0)}%</span>
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${ACCENTS.finance.bar}`} style={{ width: `${Math.min(100, reason.percentage || 0)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No spending recorded yet.</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Recent</p>
              {transactions.length > 0 ? (
                <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
                  {transactions.slice(0, 5).map((tx, i) => (
                    <div key={tx.id || i} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-gray-800 truncate">{tx.title}</span>
                        <span className="block text-[10px] text-gray-400 truncate">
                          {[tx.category, tx.date ? formatDate(tx.date, { month: "short", day: "numeric", year: "numeric" }) : null].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span className="text-sm font-bold text-gray-900 tabular-nums shrink-0">{tx.formatted || fmtMoney(tx.amount, { cents: true })}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">{noData ? "No expense data" : "No recent transactions."}</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ExpensesCard;
