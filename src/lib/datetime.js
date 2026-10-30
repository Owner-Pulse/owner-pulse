// Every date and time is shown in US Eastern time, whatever the computer's timezone is.
export const APP_TIME_ZONE = "America/New_York";

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
// "2026-09-28 21:00:00" or "2026-09-28T21:00" with no zone: New York wall-clock time (the backend runs on New York time)
const NAIVE = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/;

const pad = (n) => String(n).padStart(2, "0");

// { year, month, day, hour, minute, second, weekday (0 = Sunday) } of an instant, in New York
const NY_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  weekday: "short",
});
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const nyParts = (date = new Date()) => {
  const p = Object.fromEntries(NY_PARTS.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
    weekday: WEEKDAYS.indexOf(p.weekday),
  };
};

// New York wall-clock time -> the instant
const fromNyWallTime = (y, mo, d, h = 0, mi = 0, s = 0) => {
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  const offset = (t) => {
    const p = nyParts(new Date(t));
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - t;
  };
  let t = guess - offset(guess);
  const second = guess - offset(t);
  if (second !== t) t = second;
  return new Date(t);
};

export const isDateOnly = (value) => typeof value === "string" && DATE_ONLY.test(value.trim());

/**
 * Any date value -> Date (or null). Date-only strings become midnight UTC of that day,
 * and are always formatted in UTC so they never move to another day.
 */
export const toDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return isNaN(value) ? null : value;
  if (typeof value === "number") return new Date(value);
  const str = String(value).trim();
  let m = str.match(DATE_ONLY);
  if (m) {
    const date = new Date(0);
    date.setUTCFullYear(+m[1], +m[2] - 1, +m[3]);
    date.setUTCHours(0, 0, 0, 0);
    if (
      date.getUTCFullYear() !== +m[1] ||
      date.getUTCMonth() !== +m[2] - 1 ||
      date.getUTCDate() !== +m[3]
    ) return null;
    return date;
  }
  m = str.match(NAIVE);
  if (m) {
    const [, year, month, day, hour, minute, second = "0"] = m;
    const parts = [+year, +month, +day, +hour, +minute, +second];
    const [y, mo, d, h, mi, s] = parts;
    const check = new Date(0);
    check.setUTCFullYear(y, mo - 1, d);
    check.setUTCHours(h, mi, s, 0);
    if (
      check.getUTCFullYear() !== y ||
      check.getUTCMonth() !== mo - 1 ||
      check.getUTCDate() !== d ||
      check.getUTCHours() !== h ||
      check.getUTCMinutes() !== mi ||
      check.getUTCSeconds() !== s
    ) return null;
    return fromNyWallTime(y, mo, d, h, mi, s);
  }
  if (!/(?:Z|GMT|[+-]\d{2}:?\d{2})$/i.test(str)) return null;
  const d = new Date(str);
  return isNaN(d) ? null : d;
};

// dev only: one warning per calling line (in practice one per field) for a value that could not be read
const warned = new Set();
const warnUnreadable = (value) => {
  if (!import.meta.env.DEV) return;
  // frames 4-5: the caller and the line that calls it (a local fmtDate wrapper is often in between)
  const frames = (new Error().stack || "").split("\n").slice(4, 6).map((f) => f.trim());
  const caller = frames.join(" <- ") || String(value).replace(/\d/g, "9");
  if (warned.has(caller)) return;
  warned.add(caller);
  console.warn(`[datetime] unrecognised date format, shown as sent: ${JSON.stringify(value)} (${caller})`);
};

// an unreadable value is shown as it came, never as a blank
const format = (value, options) => {
  if (value === null || value === undefined || value === "") return "";
  const d = toDate(value);
  if (!d) {
    warnUnreadable(value);
    return String(value);
  }
  const timeZone = isDateOnly(String(value)) ? "UTC" : APP_TIME_ZONE;
  return d.toLocaleString("en-US", { ...options, timeZone });
};

// "Sep 28, 2026" by default
export const formatDate = (value, options = { month: "short", day: "numeric", year: "numeric" }) => format(value, options);

// "10/30/2026" — month/day/year used for vault and compliance expiry
export const formatExpiryDate = (value) => formatDate(value, { month: "2-digit", day: "2-digit", year: "numeric" });

// Duration beside an expiry, written as month/day/year.
// The span runs from when the record was added through the expiry date.
// Without a start date, it runs from today through the expiry date.
export const formatExpiryDuration = (expiry, start) => {
  const end = formatExpiryDate(expiry);
  if (!end) return "";
  const from = formatExpiryDate(start || todayYmd());
  if (!from || from === end) return end;
  const span = daysBetween(start || todayYmd(), expiry);
  if (span != null && span < 0) return `${end} – ${from}`;
  return `${from} – ${end}`;
};

// "9:00 PM" by default
export const formatTime = (value, options = { hour: "numeric", minute: "2-digit" }) => format(value, options);

// "Sep 28, 2026, 9:00 PM" by default
export const formatDateTime = (
  value,
  options = { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
) => format(value, options);

// ─── Calendar days ("YYYY-MM-DD") ────────────────────────────────

// today in New York
export const todayYmd = () => {
  const p = nyParts();
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
};

// the New York calendar day of a value; date-only strings stay as they are
export const ymdOf = (value) => {
  if (isDateOnly(value)) return value.trim();
  const d = toDate(value);
  if (!d) return null;
  const p = nyParts(d);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
};

export const addDaysYmd = (ymd, days) => {
  const d = toDate(ymd);
  if (!d) return null;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const addMonthsYmd = (ymd, months) => {
  const d = toDate(ymd);
  if (!d) return null;
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d.toISOString().slice(0, 10);
};

// whole calendar days from a to b (both read as New York days)
export const daysBetween = (a, b) => {
  const from = toDate(ymdOf(a));
  const to = toDate(ymdOf(b));
  if (!from || !to) return null;
  return Math.round((to - from) / 86400000);
};

// days from today (New York) to the value's day: 0 today, 1 tomorrow, -1 yesterday
export const daysFromToday = (value) => daysBetween(todayYmd(), value);

// Monday of the week containing the value, in New York
export const mondayOf = (value = todayYmd()) => {
  const ymd = ymdOf(value);
  if (!ymd) return null;
  const weekday = toDate(ymd).getUTCDay();
  return addDaysYmd(ymd, weekday === 0 ? -6 : 1 - weekday);
};
