export const fmtMoneyShort = (n) => {
  const abs = Math.abs(n);
  const fmt = abs >= 1_000_000
    ? "$" + (abs / 1_000_000).toFixed(1) + "M"
    : abs >= 1000
      ? "$" + (abs / 1000).toFixed(1) + "K"
      : "$" + Math.round(abs);
  return n < 0 ? `-${fmt}` : fmt;
};
