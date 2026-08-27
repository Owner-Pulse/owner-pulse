// Shared formatting + motion helpers for the Cash Flow dashboard.

export const fmtMoney = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "$0";
  const isNeg = n < 0;
  const abs = Math.abs(n);
  const formatted = "$" + Math.round(abs).toLocaleString();
  return isNeg ? `-${formatted}` : formatted;
};

export const fmtMoneyShort = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "$0";
  const isNeg = n < 0;
  const abs = Math.abs(n);
  let formatted = "";
  if (abs >= 1000000) {
    formatted = "$" + (abs / 1000000).toFixed(1) + "M";
  } else if (abs >= 1000) {
    formatted = "$" + (abs / 1000).toFixed(1) + "K";
  } else {
    formatted = "$" + (abs % 1 === 0 ? abs : abs.toFixed(2));
  }
  return isNeg ? `-${formatted}` : formatted;
};

export const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// Navy-family categorical shades for multi-series charts — stays
// monochromatic while keeping each series distinguishable.
export const ACTIVE_COLORS = [
  "#1E3A5F",
  "#2A4C7E",
  "#4A6B96",
  "#5B7FA6",
  "#9DB8D9",
  "#24466F",
  "#6C8EB4",
  "#7FA5CC",
  "#3F5F8C",
  "#85A3C2",
];
