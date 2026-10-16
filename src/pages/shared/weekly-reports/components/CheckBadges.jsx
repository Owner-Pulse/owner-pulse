import React from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, Clock, CreditCard, FileCheck2, FilePen, XCircle } from "lucide-react";
import { fmtMoney } from "@/lib/collections";
import { CHECK_STYLES, checkStatus, toNum } from "@/lib/weekly-report";

const Badge = ({ className, icon: Icon, children }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap ${className}`}>
    {Icon && <Icon size={12} className="shrink-0" />}
    {children}
  </span>
);

export const StatusBadge = ({ status }) =>
  status === "confirmed" ? (
    <Badge className={CHECK_STYLES.confirmed} icon={FileCheck2}>Confirmed</Badge>
  ) : (
    <Badge className={CHECK_STYLES.draft} icon={FilePen}>Draft</Badge>
  );

// amount: the largest difference, when known
export const CashBadge = ({ check, amount }) => {
  const status = checkStatus(check);
  const diff = toNum(amount ?? check?.max_difference);
  if (status === "matched") return <Badge className={CHECK_STYLES.matched} icon={CheckCircle2}>Cash matched</Badge>;
  if (status === "mismatch")
    return (
      <Badge className={CHECK_STYLES.mismatch} icon={XCircle}>
        Cash mismatch{diff ? ` ${fmtMoney(Math.abs(diff))}` : ""}
      </Badge>
    );
  return <Badge className={CHECK_STYLES.incomplete} icon={CircleDashed}>Incomplete</Badge>;
};

export const CardBadge = ({ check, amount }) => {
  const status = checkStatus(check);
  const diff = toNum(amount ?? check?.difference);
  if (status === "matched") return <Badge className={CHECK_STYLES.matched} icon={CreditCard}>Cards matched</Badge>;
  if (status === "mismatch")
    return (
      <Badge className={CHECK_STYLES.mismatch} icon={CreditCard}>
        Card mismatch{diff ? ` ${fmtMoney(Math.abs(diff))}` : ""}
      </Badge>
    );
  return <Badge className={CHECK_STYLES.incomplete} icon={CreditCard}>Cards incomplete</Badge>;
};

export const LateBadge = ({ days }) => (
  <Badge className={CHECK_STYLES.late} icon={Clock}>
    Late deposit{days ? ` (${days}d)` : ""}
  </Badge>
);

export const MissingBadge = ({ children = "Missing" }) => (
  <Badge className={CHECK_STYLES.mismatch} icon={AlertTriangle}>{children}</Badge>
);
