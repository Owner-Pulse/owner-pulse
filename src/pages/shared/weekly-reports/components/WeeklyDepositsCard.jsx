import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { AlertTriangle, ChevronRight, ReceiptText } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";
import { fmtMoney, fmtWeek } from "@/lib/collections";
import { checkStatus, fmtRange, toNum } from "@/lib/weekly-report";
import { CardBadge, CashBadge, LateBadge, StatusBadge } from "./CheckBadges";

const CASH_COLOR = "#2F6042";
const CARD_COLOR = "#1E3A5F";

const DepositsPie = ({ cash, cards }) => {
  const cashValue = toNum(cash);
  const cardValue = toNum(cards);
  const slices = [
    cashValue > 0 ? { name: "Cash deposited", value: cashValue, fill: CASH_COLOR } : null,
    cardValue > 0 ? { name: "Card payments", value: cardValue, fill: CARD_COLOR } : null,
  ].filter(Boolean);
  const total = (cashValue || 0) + (cardValue || 0);
  const chart = slices.length > 0 ? slices : [{ name: "No deposits", value: 1, fill: "#E6EEF2" }];

  return (
    <div className="flex w-full flex-col items-center self-start">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 text-center">Deposits</p>
      <div className="relative mt-2 h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chart} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
              {chart.map((slice) => (
                <Cell key={slice.name} fill={slice.fill} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-lg font-bold tabular-nums text-gray-900">{fmtMoney(total)}</p>
        </div>
      </div>
      {slices.length === 0 ? (
        <p className="text-[11px] text-gray-500 text-center mt-2">No deposit amounts yet</p>
      ) : (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: CASH_COLOR }} /> Cash {fmtMoney(cashValue || 0)}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: CARD_COLOR }} /> Cards {fmtMoney(cardValue || 0)}</span>
        </div>
      )}
    </div>
  );
};

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
    <motion.div variants={itemVariants} className="h-full">
      <Card className="relative h-full bg-white border-none shadow-sm hover:shadow-md transition-shadow py-0 gap-0">
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

        <div className="flex-1 flex flex-col px-4 sm:px-5 pt-3 pb-4 space-y-3">
          {latest ? (
            <div className={role === "owner" ? "grid grid-cols-1 sm:grid-cols-2 gap-4 items-start" : "flex flex-col sm:flex-row sm:items-center justify-between gap-3"}>
              <div className={role === "owner" ? "min-w-0 space-y-3" : "contents"}>
                <div className={role === "owner" ? "" : "min-w-0"}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Latest week</p>
                  <p className="text-2xl font-bold text-gray-900 leading-tight">{fmtRange(latest.week_start, latest.week_end)}</p>
                </div>
                <div className={`flex flex-wrap gap-1.5 ${role === "owner" ? "" : "sm:justify-end"}`}>
                  <StatusBadge status={data.status} />
                  <CashBadge check={data.cash_check} />
                  <CardBadge check={data.card_check} />
                  {late && <LateBadge days={data?.cash_check?.deposit_days_after_week} />}
                </div>
              </div>
              {role === "owner" && <DepositsPie cash={data?.deposits?.cash} cards={data?.deposits?.cards} />}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No weekly reports yet.</p>
          )}

          {(data?.recent || []).length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Recent</p>
              <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
                {data.recent.map((report) => {
                  const cash = toNum(report.cash);
                  const cards = toNum(report.cards);
                  const total = cash == null && cards == null ? null : (cash || 0) + (cards || 0);
                  const part = (value) => (value == null ? "—" : fmtMoney(value));

                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => navigate(`/${role}/weekly-reports/${report.id}`)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-[#1E3A5F]/[0.04] transition-colors cursor-pointer"
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-gray-800 truncate">Week of {fmtWeek(report.week_start, { year: true })}</span>
                        <span className="block text-[10px] text-gray-400">Cash {part(cash)} · Cards {part(cards)}</span>
                      </span>
                      <span className="text-sm font-bold text-gray-900 tabular-nums shrink-0">{total == null ? "—" : fmtMoney(total)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className={`p-3 rounded-xl border ${warningTone.soft} ${warningTone.border}`}>
              {warnings.map((w) => (
                <p key={w} className={`flex items-start gap-1.5 text-xs font-semibold ${warningTone.text}`}>
                  <AlertTriangle size={13} className={`shrink-0 mt-0.5 ${warningTone.text}`} /> {w}
                </p>
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default WeeklyDepositsCard;
