// Weekly Report & Deposits — rooms, weekdays, live cash/card checks and form <-> API mapping
import { addDaysYmd, normalizeWeek, parseDay } from "@/lib/collections";

// Room columns of the paper attendance sheet (mapped to classrooms in Owner settings)
export const REPORT_ROOMS = ["Toddlers", "Two's", "Three", "VPK A", "VPK B", "K-8"];

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Two amounts closer than a cent are the same
const TOLERANCE = 0.005;

export const MAX_PDF_MB = 20;

export const toNum = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

// Mon..Fri dates ("YYYY-MM-DD") of the report week
export const weekDays = (weekStart) => {
  const monday = normalizeWeek(weekStart);
  if (!monday) return [];
  return DAY_NAMES.map((name, i) => ({ name, date: addDaysYmd(monday, i) }));
};

export const fridayOf = (weekStart) => {
  const monday = normalizeWeek(weekStart);
  return monday ? addDaysYmd(monday, 4) : "";
};

export const fmtRange = (start, end) => {
  const a = parseDay(start);
  const b = parseDay(end || fridayOf(start));
  if (!a) return "—";
  const opts = { month: "short", day: "numeric" };
  if (!b) return a.toLocaleDateString("en-US", opts);
  return `${a.toLocaleDateString("en-US", opts)} – ${b.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
};

// ─── Check badges ────────────────────────────────────────────────
export const CHECK_STYLES = {
  matched: "bg-[#3E7A54]/10 text-[#2F6042] border-[#3E7A54]/30",
  mismatch: "bg-[#AE4A3E]/10 text-[#8A362C] border-[#AE4A3E]/30",
  incomplete: "bg-gray-100 text-gray-500 border-gray-200",
  late: "bg-[#B78A2F]/15 text-[#8F6A1F] border-[#B78A2F]/30",
  draft: "bg-[#B78A2F]/10 text-[#8F6A1F] border-[#B78A2F]/30",
  confirmed: "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/25",
};

// status of a check that may arrive as a string or as { status }
export const checkStatus = (check) => (typeof check === "string" ? check : check?.status) || "incomplete";

// ─── Live checks (form) ──────────────────────────────────────────
export const CASH_SOURCES = [
  { key: "daily_cash_total", label: "Cash per day (Mon–Fri)" },
  { key: "receipts_book_total", label: "Receipts book" },
  { key: "procare_cash_total", label: "Procare cash" },
  { key: "deposit_slip_cash", label: "Deposit slip cash" },
  { key: "bank_deposit_amount", label: "Bank deposit" },
];

export const sumCashDays = (cashDays) =>
  Object.values(cashDays || {}).reduce((sum, v) => sum + (toNum(v) ?? 0), 0);

export const anyCashDay = (cashDays) => Object.values(cashDays || {}).some((v) => toNum(v) !== null);

/**
 * Compare every filled cash number. The reference is the first filled one
 * (daily cash, then receipts book, ...). status: matched | mismatch | incomplete
 */
export const liveCashCheck = (form) => {
  const values = {
    daily_cash_total: anyCashDay(form.cash_days) ? sumCashDays(form.cash_days) : null,
    receipts_book_total: toNum(form.receipts_book_total),
    procare_cash_total: toNum(form.procare_cash_total),
    deposit_slip_cash: toNum(form.deposit_slip_cash),
    bank_deposit_amount: toNum(form.bank_deposit_amount),
  };
  const filled = CASH_SOURCES.filter((s) => values[s.key] !== null);
  if (filled.length < 2) return { status: "incomplete", values, filled, reference: filled[0] || null, diffs: [] };

  const reference = filled[0];
  const refValue = values[reference.key];
  const diffs = filled
    .slice(1)
    .map((s) => ({ ...s, value: values[s.key], difference: values[s.key] - refValue }))
    .filter((d) => Math.abs(d.difference) > TOLERANCE);

  return {
    // green when every filled number agrees, even if some are still blank
    status: diffs.length ? "mismatch" : "matched",
    complete: filled.length === CASH_SOURCES.length,
    values,
    filled,
    reference,
    diffs,
    maxDifference: diffs.reduce((m, d) => Math.max(m, Math.abs(d.difference)), 0),
  };
};

export const liveCardCheck = (form) => {
  const cover = toNum(form.credit_card_total);
  const procare = toNum(form.procare_card_total);
  if (cover === null || procare === null) return { status: "incomplete", cover, procare, difference: null };
  const difference = cover - procare;
  return { status: Math.abs(difference) > TOLERANCE ? "mismatch" : "matched", cover, procare, difference };
};

// ─── Form <-> API ────────────────────────────────────────────────
export const MONEY_FIELDS = [
  "receipts_book_total",
  "deposit_slip_cash",
  "credit_card_total",
  "total_deposited",
  "procare_cash_total",
  "procare_card_total",
  "bank_deposit_amount",
  "collections_balance",
];

export const COUNT_FIELDS = ["enrolled_preschool", "enrolled_k8", "enrolled_this_week", "lost_this_week"];

export const TEXT_FIELDS = ["receipts_book_start", "receipts_book_end", "bank_deposit_date", "absent_staff", "notes"];

const str = (v) => (v === null || v === undefined ? "" : String(v));

export const emptyForm = (weekStart = "") => {
  const form = { week_start: weekStart, cash_days: {}, headcount: {} };
  [...MONEY_FIELDS, ...COUNT_FIELDS, ...TEXT_FIELDS].forEach((f) => (form[f] = ""));
  return form;
};

// headcount key for a cell
export const cellKey = (room, date) => `${room}|${date}`;

export const formFromReport = (report) => {
  const form = emptyForm(normalizeWeek(report?.week_start));
  [...MONEY_FIELDS, ...COUNT_FIELDS, ...TEXT_FIELDS].forEach((f) => (form[f] = str(report?.[f])));
  if (form.bank_deposit_date) form.bank_deposit_date = form.bank_deposit_date.slice(0, 10);

  (report?.cash_days || []).forEach((d) => {
    if (d?.day) form.cash_days[String(d.day).slice(0, 10)] = str(d.amount);
  });

  // detail shape: headcount { days[], rooms[] { room_label, counts[5] } }
  const days = report?.headcount?.days?.length ? report.headcount.days : weekDays(form.week_start).map((d) => d.date);
  (report?.headcount?.rooms || []).forEach((room) => {
    (room.counts || []).forEach((count, i) => {
      const date = days[i] ? String(days[i]).slice(0, 10) : null;
      if (date && count !== null && count !== undefined) form.headcount[cellKey(room.room_label, date)] = str(count);
    });
  });
  return form;
};

/**
 * The draft payload. Lists are sent whole (they replace the previous list).
 * Returns { payload, listIndex } — listIndex maps "cash_days.N" / "headcount.N" back to a form key for 422s.
 */
export const buildPayload = (form, file = null) => {
  const body = { week_start: form.week_start, week_end: fridayOf(form.week_start) };
  MONEY_FIELDS.forEach((f) => (body[f] = toNum(form[f])));
  COUNT_FIELDS.forEach((f) => (body[f] = form[f] === "" ? null : toNum(form[f])));
  TEXT_FIELDS.forEach((f) => (body[f] = form[f].trim() === "" ? null : form[f].trim()));

  const listIndex = {};
  const days = weekDays(form.week_start).map((d) => d.date);

  body.cash_days = [];
  days.forEach((date) => {
    const amount = toNum(form.cash_days[date]);
    if (amount === null) return;
    listIndex[`cash_days.${body.cash_days.length}`] = date;
    body.cash_days.push({ day: date, amount });
  });

  body.headcount = [];
  REPORT_ROOMS.forEach((room) =>
    days.forEach((date) => {
      const count = toNum(form.headcount[cellKey(room, date)]);
      if (count === null) return;
      listIndex[`headcount.${body.headcount.length}`] = cellKey(room, date);
      body.headcount.push({ room_label: room, day: date, count });
    })
  );

  if (!file) return { payload: body, listIndex };

  // multipart: nested lists as cash_days[0][day]; empty values as "" (null on the server)
  const fd = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((row, i) => Object.entries(row).forEach(([k, v]) => fd.append(`${key}[${i}][${k}]`, v ?? "")));
    } else {
      fd.append(key, value ?? "");
    }
  });
  fd.append("file", file);
  return { payload: fd, listIndex };
};

/**
 * 422 → { field: message } with list errors moved to their form key:
 * "cash_days.2.amount" → errors["cash_days|2026-10-14"], "headcount.5.count" → errors["headcount|VPK A|2026-10-13"]
 */
export const mapReportErrors = (error, listIndex = {}) => {
  if (error?.response?.status !== 422) return {};
  const raw = error.response.data?.errors || {};
  const out = {};
  Object.entries(raw).forEach(([key, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : String(messages);
    const m = key.match(/^(cash_days|headcount)\.(\d+)/);
    if (m && listIndex[`${m[1]}.${m[2]}`]) out[`${m[1]}|${listIndex[`${m[1]}.${m[2]}`]}`] = message;
    else out[key] = message;
  });
  return out;
};

// Attendance totals for a grid of { [cellKey]: value }
export const gridTotals = (cells, days) => {
  const rowTotals = {};
  const colTotals = {};
  let total = 0;
  days.forEach((d) => (rowTotals[d.date] = 0));
  REPORT_ROOMS.forEach((r) => (colTotals[r] = 0));
  REPORT_ROOMS.forEach((room) =>
    days.forEach((d) => {
      const n = toNum(cells[cellKey(room, d.date)]) ?? 0;
      rowTotals[d.date] += n;
      colTotals[room] += n;
      total += n;
    })
  );
  return { rowTotals, colTotals, total };
};
