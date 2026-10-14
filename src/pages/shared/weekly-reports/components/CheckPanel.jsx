import React from "react";
import { CheckCircle2, CircleDashed, Clock, CreditCard, Banknote, XCircle } from "lucide-react";
import { fmtMoney, fmtSignedMoney } from "@/lib/collections";
import { CASH_SOURCES, checkStatus, liveCardCheck, liveCashCheck, toNum } from "@/lib/weekly-report";

const TONE = {
  matched: { box: "bg-[#3E7A54]/[0.07] border-[#3E7A54]/30", text: "text-[#2F6042]", icon: CheckCircle2 },
  mismatch: { box: "bg-[#AE4A3E]/[0.07] border-[#AE4A3E]/30", text: "text-[#8A362C]", icon: XCircle },
  incomplete: { box: "bg-gray-50 border-gray-200", text: "text-gray-500", icon: CircleDashed },
};

// ─── Normalizers: live form values and the server's checks share one shape ──
export const cashFromForm = (form) => {
  const live = liveCashCheck(form);
  const diffKeys = Object.fromEntries(live.diffs.map((d) => [d.key, d.difference]));
  return {
    status: live.status,
    reference: live.reference?.label,
    rows: CASH_SOURCES.map((s) => ({ ...s, value: live.values[s.key], difference: diffKeys[s.key] ?? null })),
    messages: [],
  };
};

export const cardFromForm = (form) => {
  const live = liveCardCheck(form);
  return { status: live.status, cover: live.cover, procare: live.procare, difference: live.difference, message: null };
};

export const cashFromReport = (report) => {
  const check = report?.cash_check || {};
  const values = check.values || {};
  const status = checkStatus(check);
  const filled = CASH_SOURCES.filter((s) => toNum(values[s.key]) !== null);
  const ref = filled[0];
  return {
    status,
    reference: ref?.label,
    rows: CASH_SOURCES.map((s) => {
      const value = toNum(values[s.key]);
      const difference = ref && value !== null && s.key !== ref.key ? value - toNum(values[ref.key]) : null;
      return { ...s, value, difference: difference && Math.abs(difference) > 0.005 ? difference : null };
    }),
    messages: check.messages || [],
    maxDifference: check.max_difference,
    late: !!(check.late_deposit ?? report?.late_deposit),
    lateDays: check.deposit_days_after_week,
  };
};

export const cardFromReport = (report) => {
  const check = report?.card_check || {};
  return {
    status: checkStatus(check),
    cover: toNum(report?.credit_card_total),
    procare: toNum(report?.procare_card_total),
    difference: toNum(check.difference),
    message: check.message,
  };
};

const CashSummary = ({ cash }) => {
  const tone = TONE[cash.status] || TONE.incomplete;
  const Icon = tone.icon;
  const title =
    cash.status === "matched" ? "Cash matches" : cash.status === "mismatch" ? "Cash does not match" : "Cash check incomplete";

  return (
    <div className={`rounded-xl border p-3 ${tone.box}`}>
      <p className={`text-sm font-bold flex items-center gap-1.5 ${tone.text}`}>
        <Banknote size={15} /> {title}
        <Icon size={15} className="ml-auto shrink-0" />
      </p>
      {cash.status === "incomplete" && <p className="text-[11px] text-gray-500 mt-1">Fill in at least two cash numbers to compare them.</p>}
      <ul className="mt-2 space-y-1">
        {cash.rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-2 text-xs">
            <span className={row.value === null ? "text-gray-400" : "text-gray-700"}>{row.label}</span>
            <span className="flex items-center gap-1.5 tabular-nums">
              {row.difference !== null && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#AE4A3E]/10 text-[#8A362C]">
                  {fmtSignedMoney(row.difference)}
                </span>
              )}
              <span className={`font-semibold ${row.value === null ? "text-gray-300" : row.difference !== null ? "text-[#8A362C]" : "text-gray-900"}`}>
                {row.value === null ? "—" : fmtMoney(row.value, { cents: true })}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {cash.status === "mismatch" && cash.reference && (
        <p className="text-[10px] text-[#8A362C]/80 mt-2">Differences are compared to {cash.reference.toLowerCase()}.</p>
      )}
      {cash.messages?.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {cash.messages.map((m, i) => (
            <li key={i} className={`text-[11px] ${tone.text}`}>• {m}</li>
          ))}
        </ul>
      )}
      {cash.late && (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#8F6A1F]">
          <Clock size={12} /> Late deposit{cash.lateDays ? `: ${cash.lateDays} days after the week` : ""}
        </p>
      )}
    </div>
  );
};

const CardSummary = ({ card }) => {
  const tone = TONE[card.status] || TONE.incomplete;
  const Icon = tone.icon;
  const title =
    card.status === "matched" ? "Cards match" : card.status === "mismatch" ? "Cards do not match" : "Card check incomplete";

  return (
    <div className={`rounded-xl border p-3 ${tone.box}`}>
      <p className={`text-sm font-bold flex items-center gap-1.5 ${tone.text}`}>
        <CreditCard size={15} /> {title}
        <Icon size={15} className="ml-auto shrink-0" />
      </p>
      <ul className="mt-2 space-y-1 text-xs">
        <li className="flex justify-between gap-2">
          <span className={card.cover === null ? "text-gray-400" : "text-gray-700"}>Card payments (cover sheet)</span>
          <span className="font-semibold tabular-nums">{card.cover === null ? "—" : fmtMoney(card.cover, { cents: true })}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span className={card.procare === null ? "text-gray-400" : "text-gray-700"}>Procare card total</span>
          <span className="font-semibold tabular-nums">{card.procare === null ? "—" : fmtMoney(card.procare, { cents: true })}</span>
        </li>
      </ul>
      {card.status === "mismatch" && card.difference !== null && (
        <p className="text-[11px] font-semibold text-[#8A362C] mt-2">Off by {fmtMoney(Math.abs(card.difference), { cents: true })}</p>
      )}
      {card.message && <p className={`text-[11px] mt-1 ${tone.text}`}>{card.message}</p>}
    </div>
  );
};

const CheckPanel = ({ cash, card, title = "Live check", className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{title}</p>
    <CashSummary cash={cash} />
    <CardSummary card={card} />
  </div>
);

export default CheckPanel;
