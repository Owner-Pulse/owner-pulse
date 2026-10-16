import React from "react";

const STYLES = {
  expired: "bg-red-100 text-red-800 ring-red-200",
  expiring_soon: "bg-amber-100 text-amber-900 ring-amber-200",
  valid: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  no_expiry: "bg-gray-100 text-gray-600 ring-gray-200",
};

const LABELS = {
  expired: "Expired",
  expiring_soon: "Expiring soon",
  valid: "Valid",
  no_expiry: "No expiry",
};

export const ExpiryBadge = ({ status }) => {
  const key = STYLES[status] ? status : "no_expiry";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${STYLES[key]}`}>
      {LABELS[key]}
    </span>
  );
};
