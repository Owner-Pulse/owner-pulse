import React from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, RefreshCw, ClipboardList, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import StatusPill from "./StatusPill";
import CategoryTag from "./CategoryTag";
import RoleBadge from "./RoleBadge";

const TODAY = new Date("2026-05-11");
const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - TODAY) / 86400000);
const daysSince = (dateStr) => -daysUntil(dateStr);

const fmtDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ComplianceItemCard = ({ item, preWarningDays = 60 }) => {
  const d = item.status === "expired" ? daysSince(item.expires) : daysUntil(item.expires);
  const isExpired = item.status === "expired";
  const isUrgent = !isExpired && d <= 30;
  const progressPct = item.status === "expired"
    ? 100
    : item.status === "expiring"
      ? Math.min(100, Math.round((1 - d / 365) * 100))
      : Math.round((1 - d / 365) * 100);
  const barColor = isExpired ? "bg-red-400" : isUrgent ? "bg-amber-400" : "bg-emerald-400";

  return (
    <motion.div variants={itemVariants}>
      <Card className={`bg-white border-none shadow-sm hover:shadow-md transition-shadow border-l-4 ${
        isExpired ? "border-l-red-500" : isUrgent ? "border-l-amber-500" : "border-l-emerald-500"
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">{item.item}</h3>
                <CategoryTag category={item.category} />
                <RoleBadge role={item.ownerRole} />
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={12} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500">{item.authority}</span>
              </div>
              {item.notes && (
                <div className="mt-1 text-[10px] text-gray-400 italic">{item.notes}</div>
              )}
            </div>
            <StatusPill status={item.status} />
          </div>

          {/* Expiration progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Expires: {fmtDate(item.expires)}</span>
              <span className={`font-semibold ${
                isExpired ? "text-red-600" : isUrgent ? "text-amber-600" : "text-gray-500"
              }`}>
                {isExpired ? `${d}d overdue` : `${d} days`}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${Math.min(progressPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Insurance shopping reminder */}
          {item.shopReminder && (
            <div className="mt-3 p-2 rounded-lg bg-purple-50 border border-purple-100 flex items-center gap-2">
              <RefreshCw size={12} className="text-purple-500 flex-shrink-0" />
              <p className="text-[10px] text-purple-700">
                <span className="font-bold">Shop reminder:</span>{" "}
                {daysUntil(item.shopReminder) > 0
                  ? `Quote renewal rates by ${fmtDate(item.shopReminder)}`
                  : `Rates should have been quoted by ${fmtDate(item.shopReminder)}`}
              </p>
            </div>
          )}

          {/* DCF Annual Renewal document checklist */}
          {item.docChecklist && (
            <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ClipboardList size={12} /> DCF Document Checklist — Prepare these before renewal
              </p>
              <ul className="space-y-1">
                {item.docChecklist.map((doc, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[10px] text-blue-600">
                    <CheckCircle2 size={10} className="text-blue-400 flex-shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pre-warning indicator */}
          {!isExpired && item.expires && daysUntil(item.expires) <= preWarningDays && daysUntil(item.expires) > 0 && (
            <div className={`mt-2 p-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 ${
              daysUntil(item.expires) <= 14 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
            }`}>
              <Clock size={10} /> {daysUntil(item.expires)} days until deadline — prepare now
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ComplianceItemCard;
