import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { AlertTriangle, ChevronRight, ReceiptText } from "lucide-react";
import { Card } from "@/components/ui/card";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";
import { fmtMoney, fmtWeek } from "@/lib/collections";
import { checkStatus, fmtRange, toNum } from "@/lib/weekly-report";
import { CardBadge, CashBadge, LateBadge, StatusBadge } from "./CheckBadges";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

/**
 * Owner and Director overview — latest weekly report and its deposit checks (overview.weekly_report)
 */
const WeeklyDepositsCard = ({ data, role = "owner" }) => {
  const navigate = useNavigate();
  const open = () => navigate(`/${role}/weekly-reports`);

  const latest = data?.latest_week;
  const cashStatus = checkStatus(data?.cash_check);
  const cardStatus = checkStatus(data?.card_check);
  const late = !!data?.cash_check?.late_deposit;
  const hasMismatch = cashStatus === "mismatch" || cardStatus === "mismatch";
  const warningTone = hasMismatch ? STATUS.problem : STATUS.watch;
  const cashDiff = toNum(data?.cash_check?.max_difference);
  const cardDiff = toNum(data?.card_check?.difference);

  const warnings = [];
  if (data?.missing_this_week)
    warnings.push(
      `No weekly report yet for the week of ${data.expected_week_start ? fmtWeek(data.expected_week_start) : "this week"}.`
    );
  if (latest && cashStatus === "mismatch")
    warnings.push(`Cash does not match${cashDiff ? `: off by ${fmtMoney(Math.abs(cashDiff), { cents: true })}` : ""}.`);
  if (latest && cardStatus === "mismatch")
    warnings.push(`Card payments do not match Procare${cardDiff ? `: off by ${fmtMoney(Math.abs(cardDiff), { cents: true })}` : ""}.`);

  return (
    <motion.div variants={itemVariants}>
      <Card className="relative bg-white border-none shadow-sm hover:shadow-md transition-shadow py-0 gap-0">
        <CardAccent group={latest ? "finance" : "none"} />
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span className={`p-1.5 rounded-lg shrink-0 ${latest ? ACCENTS.finance.icon : "bg-gray-100 text-gray-600"}`}>
              <ReceiptText size={16} />
            </span>
            Weekly deposits
          </h3>
          <button
            type="button"
            onClick={open}
            className={`inline-flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs font-semibold ${ACCENTS.finance.text} ${ACCENTS.finance.hover} transition-colors cursor-pointer`}
          >
            All reports <ChevronRight size={13} />
          </button>
        </div>

        <div className="px-4 sm:px-5 pt-3 pb-4 space-y-3">
          {warnings.length > 0 && (
            <div className={`p-3 rounded-xl border ${warningTone.soft} ${warningTone.border}`}>
              {warnings.map((w) => (
                <p key={w} className={`flex items-start gap-1.5 text-xs font-semibold ${warningTone.text}`}>
                  <AlertTriangle size={13} className={`shrink-0 mt-0.5 ${warningTone.text}`} /> {w}
                </p>
              ))}
            </div>
          )}

          {latest ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Latest week</p>
                <p className="text-base font-bold text-gray-900">{fmtRange(latest.week_start, latest.week_end)}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:justify-end">
                <StatusBadge status={data.status} />
                <CashBadge check={data.cash_check} />
                <CardBadge check={data.card_check} />
                {late && <LateBadge days={data?.cash_check?.deposit_days_after_week} />}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No weekly reports yet.</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default WeeklyDepositsCard;
