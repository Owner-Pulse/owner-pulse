// Shared formatting + motion helpers for the Cash Flow dashboard.

export const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();

export const fmtMoneyShort = (n) =>
  n >= 1000000 ? "$" + (n / 1000000).toFixed(1) + "M"
    : n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K"
      : "$" + Math.round(n);

export const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export const ACTIVE_COLORS = [
  "#2563EB",
  "#16A34A",
  "#F97316",
  "#7C3AED",
  "#DC2626",
  "#0EA5E9",
  "#D97706",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
];
