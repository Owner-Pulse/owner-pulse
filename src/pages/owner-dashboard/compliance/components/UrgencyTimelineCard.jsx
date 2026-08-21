import React from "react";
import { AlertTriangle, CheckCircle2, ShoppingCart, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CategoryTag from "./CategoryTag";
import RoleBadge from "./RoleBadge";

const TODAY = new Date("2026-05-11");
const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - TODAY) / 86400000);
const daysSince = (dateStr) => -daysUntil(dateStr);

// Harmonized status tokens — muted tones that sit well with the navy theme
const statusOf = (isExpired, isUrgent) => {
  if (isExpired) {
    return {
      dot: "bg-[#AE4A3E]",
      rail: "border-l-[#AE4A3E]",
      badge: "bg-[#AE4A3E]/10 text-[#8A362C] border-[#AE4A3E]/25",
      days: "text-[#8A362C]",
      label: "Expired",
    };
  }
  if (isUrgent) {
    return {
      dot: "bg-[#B78A2F]",
      rail: "border-l-[#B78A2F]",
      badge: "bg-[#B78A2F]/10 text-[#8F6A1F] border-[#B78A2F]/25",
      days: "text-[#8F6A1F]",
      label: "Expiring",
    };
  }
  return {
    dot: "bg-[#1E3A5F]",
    rail: "border-l-[#1E3A5F]",
    badge: "bg-[#1E3A5F]/5 text-[#1E3A5F] border-[#1E3A5F]/15",
    days: "text-gray-500",
    label: "Expiring",
  };
};

const UrgencyTimelineCard = ({ items }) => {
  const nonCompliant = items.filter((c) => c.status !== "compliant");
  const sorted = [...nonCompliant].sort((a, b) => {
    const aDays = a.status === "expired" ? -999 : daysUntil(a.expires);
    const bDays = b.status === "expired" ? -999 : daysUntil(b.expires);
    return aDays - bDays;
  });

  return (
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-[#1E3A5F]" />
          Urgency Timeline
          {sorted.length > 0 && (
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1E3A5F]/10 text-[#1E3A5F]">
              {sorted.length} pending
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Items that need attention, sorted by deadline
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length > 0 ? (
          <div className="relative">
            <div className="absolute left-[6px] top-1 bottom-1 w-0.5 bg-[#1E3A5F]/10 rounded-full" />
            <div className="space-y-2.5">
              {sorted.map((item) => {
                const d = item.status === "expired" ? daysSince(item.expires) : daysUntil(item.expires);
                const isExpired = item.status === "expired";
                const isUrgent = !isExpired && d <= 30;
                const s = statusOf(isExpired, isUrgent);

                return (
                  <div key={item.id} className="relative flex items-start gap-3">
                    {/* timeline dot */}
                    <div className="relative z-10 flex-shrink-0 mt-[18px]">
                      <span className={`block h-2.5 w-2.5 rounded-full ${s.dot} ring-4 ring-white`} />
                    </div>

                    {/* row card — white, clean, status shown via slim rail + badge only */}
                    <div className={`flex-1 min-w-0 rounded-xl bg-white border border-gray-100 border-l-4 ${s.rail} p-3 shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">{item.item}</span>
                            <CategoryTag category={item.category} />
                            <RoleBadge role={item.ownerRole} />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{item.authority}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.badge}`}>
                            {isExpired ? `${d}d overdue` : `${d}d left`}
                          </span>
                          <span className={`text-[10px] font-semibold ${s.days}`}>
                            {new Date(item.expires).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                      {item.notes && (
                        <p className="text-[10px] text-gray-400 mt-1 italic">{item.notes}</p>
                      )}
                      {item.shopReminder && (
                        <div className="mt-2 text-[10px] text-[#1E3A5F]/75 font-medium flex items-center gap-1">
                          <ShoppingCart size={10} /> Shopping reminder: {new Date(item.shopReminder).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      )}
                      {item.docChecklist && (
                        <div className="mt-2 p-2 rounded-lg bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/15">
                          <p className="text-[10px] font-bold text-[#1E3A5F] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <ClipboardList size={10} /> Document Checklist
                          </p>
                          <ul className="space-y-0.5">
                            {item.docChecklist.map((doc, i) => (
                              <li key={i} className="text-[10px] text-[#1E3A5F]/75 flex items-center gap-1">
                                <CheckCircle2 size={8} /> {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center">
            <CheckCircle2 size={32} className="mx-auto text-[#3E7A54] mb-2" />
            <p className="text-sm text-gray-500">All compliance items are up to date.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UrgencyTimelineCard;
