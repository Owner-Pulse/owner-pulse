import React from "react";
import { AlertTriangle, CheckCircle2, ShoppingCart, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CategoryTag from "./CategoryTag";
import RoleBadge from "./RoleBadge";

const TODAY = new Date("2026-05-11");
const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - TODAY) / 86400000);
const daysSince = (dateStr) => -daysUntil(dateStr);

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
          <AlertTriangle size={16} className="text-amber-500" />
          Urgency Timeline
        </CardTitle>
        <CardDescription>
          Items that need attention, sorted by deadline
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-0">
              {sorted.map((item) => {
                const d = item.status === "expired" ? daysSince(item.expires) : daysUntil(item.expires);
                const isExpired = item.status === "expired";
                const isUrgent = !isExpired && d <= 30;
                const dotColor = isExpired ? "bg-red-500" : isUrgent ? "bg-amber-500" : "bg-blue-500";
                const borderColor = isExpired ? "border-red-200" : isUrgent ? "border-amber-200" : "border-gray-100";

                return (
                  <div key={item.id} className="relative flex items-start gap-4 pb-4 last:pb-0">
                    <div className="relative z-10 flex-shrink-0 mt-1">
                      <div className={`w-3 h-3 rounded-full ${dotColor} ring-2 ring-white`} />
                    </div>
                    <div className={`flex-1 p-3 rounded-xl border ${borderColor} ${
                      isExpired ? "bg-red-50" : isUrgent ? "bg-amber-50" : "bg-gray-50"
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">{item.item}</span>
                            <CategoryTag category={item.category} />
                            <RoleBadge role={item.ownerRole} />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{item.authority}</p>
                          {item.notes && (
                            <p className="text-[10px] text-gray-400 mt-0.5 italic">{item.notes}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className={`text-xs font-bold whitespace-nowrap ${
                            isExpired ? "text-red-600" : isUrgent ? "text-amber-600" : "text-gray-500"
                          }`}>
                            {isExpired ? `${d}d overdue` : `${d}d left`}
                          </span>
                        </div>
                      </div>
                      {item.shopReminder && (
                        <div className="mt-2 text-[10px] text-purple-600 font-medium flex items-center gap-1">
                          <ShoppingCart size={10} /> Shopping reminder: {new Date(item.shopReminder).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      )}
                      {item.docChecklist && (
                        <div className="mt-2 p-2 rounded-lg bg-white/60 border border-blue-200">
                          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <ClipboardList size={10} /> Document Checklist
                          </p>
                          <ul className="space-y-0.5">
                            {item.docChecklist.map((doc, i) => (
                              <li key={i} className="text-[10px] text-blue-600 flex items-center gap-1">
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
            <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-sm text-gray-500">All compliance items are up to date.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UrgencyTimelineCard;
