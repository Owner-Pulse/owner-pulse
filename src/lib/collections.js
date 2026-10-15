// Helpers for the weekly Collections balance (owner + director overview card, entry modal, history)
import { COLORS } from "@/lib/theme-tokens";
import { getFieldErrors } from "@/lib/api-errors";
import {
  addDaysYmd as nyAddDaysYmd,
  formatDate,
  formatDateTime,
  isDateOnly,
  mondayOf as nyMondayOf,
  toDate,
  todayYmd,
  ymdOf,
} from "@/lib/datetime";

// Going up is bad (more money owed), going down is good (we are collecting)
export const DIRECTION_META = {
  up: { color: COLORS.danger, text: "text-[#8A362C]", bg: "bg-[#AE4A3E]/10", label: "Up" },
  down: { color: COLORS.good, text: "text-[#2F6042]", bg: "bg-[#3E7A54]/10", label: "Down" },
  flat: { color: "#94A0B5", text: "text-gray-500", bg: "bg-gray-100", label: "Flat" },
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

// cents: true always, false never, "auto" only when the amount has them
export const fmtMoney = (value, { cents = "auto" } = {}) => {
  const n = toNumber(value);
  if (n === null) return "—";
  if (cents === "auto") cents = !Number.isInteger(Math.round(n * 100) / 100);
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
};

// "+$1,200" / "-$800" / "$0"
export const fmtSignedMoney = (value) => {
  const n = toNumber(value);
  if (n === null) return "—";
  if (n === 0) return fmtMoney(0);
  return `${n > 0 ? "+" : "-"}${fmtMoney(Math.abs(n), { cents: false })}`;
};

export const fmtSignedPct = (value) => {
  const n = toNumber(value);
  if (n === null) return null;
  const rounded = Math.round(n * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
};

// ─── Weeks (week_start is a "YYYY-MM-DD" Monday; "today" and "this week" are New York's) ──
const dayPart = (value) => (value ? String(value).slice(0, 10) : "");

// a plain day as a Date (midnight UTC, see datetime.js), or null
export const parseDay = (ymd) => (isDateOnly(dayPart(ymd)) ? toDate(dayPart(ymd)) : null);

// the New York calendar day of a moment, e.g. today: toYmd(new Date())
export const toYmd = (date) => ymdOf(date) || "";

export const thisMonday = () => nyMondayOf(todayYmd());

export const addDaysYmd = (ymd, days) => (parseDay(ymd) ? nyAddDaysYmd(dayPart(ymd), days) : "");

// any picked day → the Monday of its week
export const normalizeWeek = (ymd) => (parseDay(ymd) ? nyMondayOf(dayPart(ymd)) : "");

export const fmtWeek = (ymd, { year = false } = {}) =>
  parseDay(ymd) ? formatDate(dayPart(ymd), { month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}) }) : "—";

export const fmtUpdatedAt = (iso) => formatDateTime(iso, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

// ─── Card read-outs ──────────────────────────────────────────────

// Trend points for the chart; a missing week keeps balance null so the line shows a gap
export const trendPoints = (trend) =>
  (Array.isArray(trend) ? trend : []).map((p) => ({
    week_start: p.week_start,
    label: fmtWeek(p.week_start),
    balance: toNumber(p.balance),
  }));

// "up" when the balance rose over the period, "down" when it fell, else "flat" (null with < 2 points)
export const trendDirection = (points) => {
  const known = points.filter((p) => p.balance !== null);
  if (known.length < 2) return null;
  const first = known[0].balance;
  const last = known[known.length - 1].balance;
  if (last > first) return "up";
  if (last < first) return "down";
  return "flat";
};

export const changeComparedTo = (collections) => {
  const prevWeek = collections?.previous?.week_start;
  if (!prevWeek) return "vs last week";
  return Number(collections?.weeks_between) > 1 ? `vs week of ${fmtWeek(prevWeek)}` : "vs last week";
};

// Read a 422 response into { field: message }
export const parseFieldErrors = getFieldErrors;
