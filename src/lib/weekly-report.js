// Weekly Report & Deposits — rooms, weekdays, live cash/card checks and form <-> API mapping
import { addDaysYmd, normalizeWeek, parseDay } from "@/lib/collections";
import { getFieldErrors } from "@/lib/api-errors";
import { daysBetween, formatDate } from "@/lib/datetime";

// Room columns of the paper attendance sheet (mapped to classrooms in Owner settings)
export const REPORT_ROOMS = ["Toddlers", "Two's", "Three", "VPK A", "VPK B", "K-8"];

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Same rules as the server: amounts further apart than this are a mismatch,
// and a bank deposit more than DEPOSIT_GRACE_DAYS after the week end is late
const TOLERANCE = 0.01;
export const DEPOSIT_GRACE_DAYS = 3;

const round2 = (n) => Math.round(n * 100) / 100;

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
  const a = parseDay(start) ? String(start).slice(0, 10) : null;
  const endDay = end || fridayOf(start);
  const b = parseDay(endDay) ? String(endDay).slice(0, 10) : null;
  if (!a) return "—";
  const opts = { month: "short", day: "numeric" };
  if (!b) return formatDate(a, opts);
  return `${formatDate(a, opts)} – ${formatDate(b, { ...opts, year: "numeric" })}`;
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

// status of a check: a string in list rows, { status } in the detail and overview
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

// days from the week end to the bank deposit (negative when before), or null
export const depositDaysAfter = (weekEnd, depositDate) =>
  parseDay(weekEnd) && parseDay(depositDate) ? daysBetween(String(weekEnd).slice(0, 10), String(depositDate).slice(0, 10)) : null;

/**
 * Compare every filled cash number, as the server does: mismatch when the largest minus
 * the smallest is over a cent. Per-row differences are shown against the first filled
 * number (daily cash, then receipts book, ...). status: matched | mismatch | incomplete
 */
export const liveCashCheck = (form) => {
  const values = {
    daily_cash_total: anyCashDay(form.cash_days) ? round2(sumCashDays(form.cash_days)) : null,
    receipts_book_total: toNum(form.receipts_book_total),
    procare_cash_total: toNum(form.procare_cash_total),
    deposit_slip_cash: toNum(form.deposit_slip_cash),
    bank_deposit_amount: toNum(form.bank_deposit_amount),
  };
  const filled = CASH_SOURCES.filter((s) => values[s.key] !== null);
  const lateDays = depositDaysAfter(fridayOf(form.week_start), form.bank_deposit_date);
  const late = lateDays !== null && lateDays > DEPOSIT_GRACE_DAYS;

  if (filled.length < 2)
    return { status: "incomplete", values, filled, reference: filled[0] || null, diffs: [], maxDifference: null, late, lateDays };

  const reference = filled[0];
  const refValue = values[reference.key];
  const diffs = filled
    .slice(1)
    .map((s) => ({ ...s, value: values[s.key], difference: round2(values[s.key] - refValue) }))
    .filter((d) => Math.abs(d.difference) > TOLERANCE);
  const filledValues = filled.map((s) => values[s.key]);
  const maxDifference = round2(Math.max(...filledValues) - Math.min(...filledValues));

  return {
    // green when every filled number agrees, even if some are still blank
    status: maxDifference > TOLERANCE ? "mismatch" : "matched",
    complete: filled.length === CASH_SOURCES.length,
    values,
    filled,
    reference,
    diffs,
    maxDifference,
    late,
    lateDays,
  };
};

export const liveCardCheck = (form) => {
  const cover = toNum(form.credit_card_total);
  const procare = toNum(form.procare_card_total);
  if (cover === null || procare === null) return { status: "incomplete", cover, procare, difference: null };
  const difference = round2(cover - procare);
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

  // detail shape: headcount { days[5], rooms[] { room_label, counts[5], total }, day_totals[5], total }
  const days = report?.headcount?.days || [];
  (report?.headcount?.rooms || []).forEach((room) => {
    (room.counts || []).forEach((count, i) => {
      const date = days[i] ? String(days[i]).slice(0, 10) : null;
      if (date && count !== null && count !== undefined) form.headcount[cellKey(room.room_label, date)] = str(count);
    });
  });
  return form;
};

const isEmpty = (v) => v === undefined || v === null || String(v).trim() === "";

/**
 * Fill the form from the values read out of the PDF. Only empty fields are filled;
 * returns { form, filled } where filled lists the form keys that came from the PDF
 * (field names, "cash_days|<date>", "headcount|<room>|<date>").
 * The week is taken from the PDF only when setWeek is true.
 */
export const fillFromExtraction = (form, values, { setWeek = false } = {}) => {
  const next = { ...form, cash_days: { ...form.cash_days }, headcount: { ...form.headcount } };
  const filled = [];

  const pdfWeek = normalizeWeek(values?.week_start);
  if (setWeek && pdfWeek && pdfWeek !== form.week_start) {
    next.week_start = pdfWeek;
    filled.push("week_start");
  }

  [...MONEY_FIELDS, ...COUNT_FIELDS, ...TEXT_FIELDS].forEach((f) => {
    if (isEmpty(values?.[f]) || !isEmpty(next[f])) return;
    next[f] = f === "bank_deposit_date" ? String(values[f]).slice(0, 10) : String(values[f]);
    filled.push(f);
  });

  // rows dated in another week (the user kept a different week) are left out
  const days = weekDays(next.week_start).map((d) => d.date);
  (values?.cash_days || []).forEach(({ day, amount }) => {
    const date = String(day).slice(0, 10);
    if (!days.includes(date) || isEmpty(amount) || !isEmpty(next.cash_days[date])) return;
    next.cash_days[date] = String(amount);
    filled.push(`cash_days|${date}`);
  });

  (values?.headcount || []).forEach(({ room_label, day, count }) => {
    const key = cellKey(room_label, String(day).slice(0, 10));
    if (!days.includes(String(day).slice(0, 10)) || isEmpty(count) || !isEmpty(next.headcount[key])) return;
    next.headcount[key] = String(count);
    filled.push(`headcount|${key}`);
  });

  return { form: next, filled };
};

/**
 * The draft payload. Lists are sent whole (they replace the previous list).
 * Returns { payload, listIndex } — listIndex maps "cash_days.N" / "headcount.N" back to a form key for 422s.
 * extractionId attaches the PDF that was already uploaded to be read, instead of sending it again.
 */
export const buildPayload = (form, file = null, extractionId = null) => {
  const body = { week_start: form.week_start, week_end: fridayOf(form.week_start) };
  if (extractionId) body.extraction_id = extractionId;
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

  // multipart: nested lists as cash_days[0][day]; empty values as "" (null on the server).
  // An empty list is sent as "" too, so the server still clears the old rows.
  const fd = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length === 0) fd.append(key, "");
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
  const out = {};
  Object.entries(getFieldErrors(error)).forEach(([key, message]) => {
    const m = key.match(/^(cash_days|headcount)\.(\d+)/);
    if (m && listIndex[`${m[1]}.${m[2]}`]) out[`${m[1]}|${listIndex[`${m[1]}.${m[2]}`]}`] = message;
    else out[key] = message;
  });
  return out;
};

// The server's attendance totals (detail headcount) in gridTotals' shape
export const serverGridTotals = (headcount) => {
  if (!headcount?.days) return null;
  const rowTotals = {};
  const colTotals = {};
  headcount.days.forEach((date, i) => (rowTotals[String(date).slice(0, 10)] = headcount.day_totals?.[i] ?? null));
  (headcount.rooms || []).forEach((room) => (colTotals[room.room_label] = room.total));
  return { rowTotals, colTotals, total: headcount.total };
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
