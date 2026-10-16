// ─── Semantic color tokens ─────────────────────────────────────────
// Single source of truth for the app's palette. Colors are used
// *semantically* — the same hue always means the same thing, so
// owners and directors can read status at a glance:
//
//   green → good
//   amber → watch
//   red   → problem
//   gray  → no data
//
// Card accents identify groups and stay separate from status colors.
// For Tailwind classes use the static class tokens below; for JS contexts
// (Recharts, inline styles) import the corresponding hex values.
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
  warnText: "#7A5A16",
  danger: "#AE4A3E",
  dangerText: "#8A362C",
  noData: "#9CA3AF",

  // Pulse monitor — brighter variants for the dark ECG background
  pulseGood: "#3E9B67",
  pulseHealthy: "#5BB57E",
  pulseWarn: "#C89B3C",
  pulseDanger: "#C33B2E",
  pulseDark: "#0A0F1E",
};

// ─── Dashboard cards ───────────────────────────────────────────────
// Status: the same meaning on every card. Tailwind class strings are
// written out in full so Tailwind finds them. Text colours are at least
// 4.5:1 on white and on their own 10% tint.
export const STATUS = {
  good: {
    hex: COLORS.good,
    text: "text-[#2F6042]",
    badge: "bg-[#3E7A54]/10 text-[#2F6042] border-[#3E7A54]/25",
    soft: "bg-[#3E7A54]/10",
    border: "border-[#3E7A54]/25",
    track: "text-[#3E7A54]/15",
    dot: "bg-[#3E7A54]",
  },
  watch: {
    hex: COLORS.warn,
    text: "text-[#7A5A16]",
    badge: "bg-[#B78A2F]/12 text-[#7A5A16] border-[#B78A2F]/30",
    soft: "bg-[#B78A2F]/12",
    border: "border-[#B78A2F]/30",
    ring: "ring-1 ring-[#B78A2F]/20",
    track: "text-[#B78A2F]/15",
    dot: "bg-[#B78A2F]",
  },
  problem: {
    hex: COLORS.danger,
    text: "text-[#8A362C]",
    badge: "bg-[#AE4A3E]/10 text-[#8A362C] border-[#AE4A3E]/25",
    soft: "bg-[#AE4A3E]/10",
    border: "border-[#AE4A3E]/25",
    track: "text-[#AE4A3E]/15",
    dot: "bg-[#AE4A3E]",
  },
  none: {
    hex: COLORS.noData,
    text: "text-gray-600",
    badge: "bg-gray-100 text-gray-600 border-gray-300",
    soft: "bg-gray-100",
    border: "border-gray-300",
    track: "text-gray-200",
    dot: "bg-gray-500",
  },
};

export const PULSE_STATUS_COLORS = {
  good: COLORS.pulseHealthy,
  watch: COLORS.pulseWarn,
  problem: COLORS.pulseDanger,
  none: COLORS.noData,
};

export const statusFromPulseLabel = (label) => {
  const value = String(label || "").toLowerCase();
  if (/thriving|healthy|normal|good/.test(value)) return "good";
  if (/elevated|warning|watch/.test(value)) return "watch";
  if (/stressed|critical|danger|problem/.test(value)) return "problem";
  return "none";
};

// good / watch / problem from a percentage; null or no total → none
export const statusFromPct = (pct, options = {}) => {
  if (pct === null || pct === undefined || pct === "" || !Number.isFinite(Number(pct))) return "none";
  const higherIsBetter = options.higherIsBetter ?? true;
  const good = options.good ?? (higherIsBetter ? 80 : 20);
  const watch = options.watch ?? (higherIsBetter ? 50 : 40);
  const p = Number(pct);
  if (higherIsBetter) return p >= good ? "good" : p >= watch ? "watch" : "problem";
  return p <= good ? "good" : p <= watch ? "watch" : "problem";
};

// One accent per card group, so cards are easy to tell apart. None of
// them is green, amber, red or gray, so they never read as a status.
export const ACCENTS = {
  finance: { hex: "#4F46E5", bar: "bg-[#4F46E5]", soft: "bg-[#4F46E5]/10", border: "border-[#4F46E5]/20", badge: "bg-[#4F46E5]/10 text-[#4338CA] border-[#4F46E5]/20", icon: "bg-[#4F46E5]/10 text-[#4338CA]", text: "text-[#4338CA]", hover: "hover:bg-[#4F46E5]/10" },
  collections: { hex: "#0E7490", bar: "bg-[#0E7490]", soft: "bg-[#0E7490]/10", border: "border-[#0E7490]/20", badge: "bg-[#0E7490]/10 text-[#0E7490] border-[#0E7490]/20", icon: "bg-[#0E7490]/10 text-[#0E7490]", text: "text-[#0E7490]", hover: "hover:bg-[#0E7490]/10" },
  students: { hex: "#7C3AED", bar: "bg-[#7C3AED]", soft: "bg-[#7C3AED]/10", border: "border-[#7C3AED]/20", badge: "bg-[#7C3AED]/10 text-[#6D28D9] border-[#7C3AED]/20", icon: "bg-[#7C3AED]/10 text-[#6D28D9]", text: "text-[#6D28D9]", hover: "hover:bg-[#7C3AED]/10" },
  operations: { hex: "#1E3A5F", bar: "bg-[#1E3A5F]", soft: "bg-[#1E3A5F]/10", border: "border-[#1E3A5F]/20", badge: "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/20", icon: "bg-[#1E3A5F]/10 text-[#1E3A5F]", text: "text-[#1E3A5F]", hover: "hover:bg-[#1E3A5F]/10" },
  staff: { hex: "#DB2777", bar: "bg-[#DB2777]", soft: "bg-[#DB2777]/10", border: "border-[#DB2777]/20", badge: "bg-[#DB2777]/10 text-[#BE185D] border-[#DB2777]/20", icon: "bg-[#DB2777]/10 text-[#BE185D]", text: "text-[#BE185D]", hover: "hover:bg-[#DB2777]/10" },
};

// Categorical expense series reuse card-group accents, not status colors.
export const EXPENSE_REASON_COLORS = {
  "Classroom Supplies": ACCENTS.finance.hex,
  "Events & Food": ACCENTS.collections.hex,
  "Staff Appreciation": ACCENTS.staff.hex,
  "Cleaning Supplies": ACCENTS.students.hex,
  "Office Supplies": ACCENTS.operations.hex,
  "Teacher Appreciation": ACCENTS.staff.hex,
  "Professional Dev.": ACCENTS.students.hex,
  "Tech & Software": ACCENTS.collections.hex,
  Facilities: ACCENTS.finance.hex,
  Other: ACCENTS.operations.hex,
};
