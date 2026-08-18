// ─── Semantic color tokens ─────────────────────────────────────────
// Single source of truth for the app's palette. Colors are used
// *semantically* — the same hue always means the same thing, so
// owners and directors can read status at a glance:
//
//   navy  → neutral / informational / on-track
//   sage  → good / healthy
//   gold  → warning / needs attention
//   brick → critical / action required
//
// For Tailwind classes use the hex directly (e.g. text-[#1E3A5F]).
// For JS contexts (recharts, inline styles) import from here.
export const COLORS = {
  // Navy theme
  navy: "#1E3A5F",
  navyDark: "#15294A",
  navyMid: "#2A4C7E",
  navySoft: "#4A6B96",
  navyFaint: "#9DB8D9",

  // Semantic status
  good: "#3E7A54",
  goodText: "#2F6042",
  warn: "#B78A2F",
  warnText: "#8F6A1F",
  danger: "#AE4A3E",
  dangerText: "#8A362C",

  // Pulse monitor — brighter variants for the dark ECG background
  pulseGood: "#3E9B67",
  pulseHealthy: "#5BB57E",
  pulseWarn: "#C89B3C",
  pulseDanger: "#C33B2E",
  pulseDark: "#0A0F1E",
};

// Categorical shades for expense-reason dots — all navy-family so
// charts stay monochromatic while categories remain distinguishable.
export const EXPENSE_REASON_COLORS = {
  "Classroom Supplies": COLORS.navy,
  "Events & Food": COLORS.navyMid,
  "Staff Appreciation": COLORS.navySoft,
  "Cleaning Supplies": "#5B7FA6",
  "Office Supplies": COLORS.navyFaint,
  "Teacher Appreciation": "#24466F",
  "Professional Dev.": "#6C8EB4",
  "Tech & Software": "#7FA5CC",
  Facilities: "#3F5F8C",
  Other: "#94A0B5",
};
