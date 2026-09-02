import React from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, RefreshCw, ClipboardList, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import StatusPill from "./StatusPill";
import CategoryTag from "./CategoryTag";
import RoleBadge from "./RoleBadge";
import { daysUntil, daysSince } from "@/hooks/compliance/useCompliance";

const fmtDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ComplianceItemCard = ({ item, preWarningDays = 60 }) => {
  const d = item.status === "expired"
    ? (item.days_overdue ?? daysSince(item.expires))
    : (item.days_left ?? daysUntil(item.expires));
  const isExpired = item.status === "expired";
  const isUrgent = !isExpired && d <= 30;

  return (
    <motion.div variants={itemVariants}>
      <Card className={`bg-white border-none shadow-sm hover:shadow-md transition-shadow border-l-4 group ${
        isExpired ? "border-l-[#AE4A3E]" : isUrgent ? "border-l-[#B78A2F]" : "border-l-[#1E3A5F]"
      }`}>
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-gray-900 text-sm md:text-base">{item.item}</h3>
                <CategoryTag category={item.category} />
                <RoleBadge role={item.ownerRole} />
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={12} className="text-[#1E3A5F]/40 flex-shrink-0" />
                <span className="text-xs text-gray-500">{item.authority}</span>
              </div>
              {item.notes && (
                <div className="mt-1 text-[10px] text-gray-400 italic">{item.notes}</div>
              )}
            </div>
            <StatusPill status={item.status} />
          </div>

          {/* Clean Expiration & Days Left Badge (Replaced circle-on-a-line per D-08) */}
          <div className="mt-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Expires {fmtDate(item.expires)}</span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
              isExpired
                ? "bg-[#AE4A3E]/10 text-[#8A362C]"
                : isUrgent
                ? "bg-[#B78A2F]/10 text-[#8F6A1F]"
                : "bg-[#1E3A5F]/10 text-[#1E3A5F]"
            }`}>
              {isExpired ? `${d}d overdue` : `${d} days remaining`}
            </span>
          </div>

          {/* Insurance shopping reminder */}
          {item.shopReminder && (
            <div className="mt-3 p-2 rounded-lg bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/10 flex items-center gap-2">
              <RefreshCw size={12} className="text-[#1E3A5F] flex-shrink-0" />
              <p className="text-[10px] text-[#1E3A5F]/80">
                <span className="font-bold">Shop reminder:</span>{" "}
                {daysUntil(item.shopReminder) > 0
                  ? `Quote renewal rates by ${fmtDate(item.shopReminder)}`
                  : `Rates should have been quoted by ${fmtDate(item.shopReminder)}`}
              </p>
            </div>
          )}

          {/* DCF Annual Renewal document checklist */}
          {item.docChecklist && item.docChecklist.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/15">
              <p className="text-[10px] font-bold text-[#1E3A5F] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ClipboardList size={12} /> DCF Document Checklist — Prepare these before renewal
              </p>
              <ul className="space-y-1">
                {item.docChecklist.map((doc, i) => {
                  const text = typeof doc === "string" ? doc : (doc?.text || doc?.title || "");
                  return (
                    <li key={i} className="flex items-center gap-1.5 text-[10px] text-[#1E3A5F]/75">
                      <CheckCircle2 size={10} className="text-[#1E3A5F]/50 flex-shrink-0" />
                      {text}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Pre-warning indicator */}
          {!isExpired && item.expires && daysUntil(item.expires) <= preWarningDays && daysUntil(item.expires) > 0 && (
            <div className={`mt-2 p-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 ${
              daysUntil(item.expires) <= 14 ? "bg-[#AE4A3E]/10 text-[#8A362C]" : "bg-[#B78A2F]/10 text-[#8F6A1F]"
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
