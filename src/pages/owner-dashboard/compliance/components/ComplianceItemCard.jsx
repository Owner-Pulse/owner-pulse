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

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ComplianceItemCard = ({ item, preWarningDays = 60 }) => {
  const d = item.status === "expired" ? daysSince(item.expires) : daysUntil(item.expires);
  const isExpired = item.status === "expired";
  const isUrgent = !isExpired && d <= 30;
  const progressPct = item.status === "expired"
    ? 100
    : Math.min(100, Math.round((1 - d / 365) * 100));
  // Single source of truth — number, fill width and globe position all use the same value
  const pct = clamp(progressPct, 0, 100);

  return (
    <motion.div variants={itemVariants}>
      <Card className={`bg-white border-none shadow-sm hover:shadow-md transition-shadow border-l-4 group ${
        isExpired ? "border-l-[#AE4A3E]" : isUrgent ? "border-l-[#B78A2F]" : "border-l-[#1E3A5F]"
      }`}>
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{item.item}</h3>
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

          {/* Expiration progress — globe marks the current peak on the timeline */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">Expires {fmtDate(item.expires)}</span>
              <span className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-[#1E3A5F] via-[#5B7FA6] to-[#9DB8D9] bg-clip-text text-transparent">
                  {pct}%
                </span>
                <span className={`font-semibold ${isExpired ? "text-[#8A362C]" : isUrgent ? "text-[#8F6A1F]" : "text-gray-500"}`}>
                  {isExpired ? `${d}d overdue` : `${d} days left`}
                </span>
              </span>
            </div>
            <div className="relative h-2.5 bg-[#1E3A5F]/10 ring-1 ring-inset ring-[#1E3A5F]/10 rounded-full">
              {/* quarter tick marks */}
              <div className="absolute inset-y-0 left-1/4 w-px bg-white/80" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-white/80" />
              <div className="absolute inset-y-0 left-3/4 w-px bg-white/80" />
              {/* gradient fill */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#1E3A5F] via-[#5B7FA6] to-[#9DB8D9] transition-[width] duration-700 ease-out"
                style={{ width: `${clamp(pct, 2, 100)}%` }}
              />
              {/* world image at the peak — same pct as the fill edge */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-[left] duration-700 ease-out"
                style={{ left: `${clamp(pct, 4, 96)}%` }}
              >
                <img
                  src="/world.png"
                  alt="World"
                  draggable={false}
                  className="w-7 h-7 rounded-full object-cover shadow-[0_1px_5px_rgba(30,58,95,0.4)] ring-1 ring-[#1E3A5F]/30 group-hover:scale-110 transition-transform"
                />
              </div>
            </div>
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
          {item.docChecklist && (
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
