import React, { useState } from "react";
import { AlertTriangle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import RoleBadge from "./RoleBadge";
import { daysUntil } from "@/hooks/compliance/useCompliance";

const UrgencyTimelineCard = ({ items = [] }) => {
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Filter & sort items by urgency based on days_left / days_overdue
  const sortedItems = [...items].sort((a, b) => {
    const aDays = a.status === "expired" ? -(a.days_overdue || 1) : (a.days_left ?? daysUntil(a.expires || a.expiration_date));
    const bDays = b.status === "expired" ? -(b.days_overdue || 1) : (b.days_left ?? daysUntil(b.expires || b.expiration_date));
    return aDays - bDays;
  });

  // Calculate timeline position percentage (90d max at left, 0d expiry at right, expired on far right)
  const getTimelinePosPct = (daysLeft) => {
    const clamped = Math.max(-15, Math.min(90, daysLeft));
    return ((90 - clamped) / 105) * 100;
  };

  // 60, 30, 0 days hard-stop line positions
  const pos60 = getTimelinePosPct(60); // ~28.5%
  const pos30 = getTimelinePosPct(30); // ~57.1%
  const pos0 = getTimelinePosPct(0);   // ~85.7%

  const getItemColor = (daysLeft, isExpired, statusColor) => {
    if (statusColor === "danger" || isExpired || daysLeft <= 0) {
      return { bg: "bg-[#AE4A3E]", text: "text-[#8A362C]", border: "border-[#AE4A3E]", lightBg: "bg-[#AE4A3E]/10" };
    }
    if (statusColor === "warning" || daysLeft <= 60) {
      if (daysLeft <= 30) {
        return { bg: "bg-[#AE4A3E]", text: "text-[#8A362C]", border: "border-[#AE4A3E]", lightBg: "bg-[#AE4A3E]/10" };
      }
      return { bg: "bg-[#B78A2F]", text: "text-[#8F6A1F]", border: "border-[#B78A2F]", lightBg: "bg-[#B78A2F]/10" };
    }
    return { bg: "bg-[#3E7A54]", text: "text-[#2F6042]", border: "border-[#3E7A54]", lightBg: "bg-[#3E7A54]/10" };
  };

  return (
    <Card className="bg-white border-none shadow-sm h-full overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <AlertTriangle size={18} className="text-[#1E3A5F]" />
              Compliance Horizontal Timeline Chart
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">
              Horizontal timeline axis with hard-stop lines at 60d, 30d, and 0d expiry (Item B-04)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3E7A54]/10 text-[#2F6042]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3E7A54]" /> &gt;60d Safe
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B78A2F]/10 text-[#8F6A1F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B78A2F]" /> 30-60d Notice
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#AE4A3E]/10 text-[#8A362C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#AE4A3E]" /> &lt;30d Urgent / Expired
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {/* ── Single Horizontal Timeline Chart Canvas ── */}
        <div className="pt-6 pb-4 px-2 bg-gradient-to-b from-gray-50/50 to-white rounded-xl border border-gray-100">
          <div className="relative h-16 w-full flex items-center">
            {/* Zone background shading */}
            <div className="absolute inset-y-2 left-0 rounded-l-lg bg-[#3E7A54]/[0.06]" style={{ right: `${100 - pos60}%` }} />
            <div className="absolute inset-y-2 bg-[#B78A2F]/[0.06]" style={{ left: `${pos60}%`, right: `${100 - pos30}%` }} />
            <div className="absolute inset-y-2 rounded-r-lg bg-[#AE4A3E]/[0.08]" style={{ left: `${pos30}%`, right: "0%" }} />

            {/* Base Horizontal Axis Track */}
            <div className="absolute inset-x-0 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#3E7A54] via-[#B78A2F] to-[#AE4A3E]"
                style={{ width: "100%" }}
              />
            </div>

            {/* Hard-Stop Line: 60 Days */}
            <div
              className="absolute top-0 bottom-0 z-10 flex flex-col items-center pointer-events-none"
              style={{ left: `${pos60}%`, transform: "translateX(-50%)" }}
            >
              <span className="text-[9px] font-extrabold text-[#B78A2F] uppercase tracking-wider bg-white px-1 py-0.5 rounded shadow-xs border border-[#B78A2F]/30 mb-1">
                60d Line
              </span>
              <div className="w-0.5 flex-1 bg-dashed border-l-2 border-dashed border-[#B78A2F]" />
            </div>

            {/* Hard-Stop Line: 30 Days */}
            <div
              className="absolute top-0 bottom-0 z-10 flex flex-col items-center pointer-events-none"
              style={{ left: `${pos30}%`, transform: "translateX(-50%)" }}
            >
              <span className="text-[9px] font-extrabold text-[#AE4A3E] uppercase tracking-wider bg-white px-1 py-0.5 rounded shadow-xs border border-[#AE4A3E]/30 mb-1">
                30d Line
              </span>
              <div className="w-0.5 flex-1 border-l-2 border-dashed border-[#AE4A3E]" />
            </div>

            {/* Hard-Stop Line: 0 Days (Expiry Hard Stop) */}
            <div
              className="absolute top-0 bottom-0 z-10 flex flex-col items-center pointer-events-none"
              style={{ left: `${pos0}%`, transform: "translateX(-50%)" }}
            >
              <span className="text-[9px] font-black text-white bg-[#AE4A3E] px-1.5 py-0.5 rounded shadow-sm mb-1">
                0d EXPIRY
              </span>
              <div className="w-1 flex-1 bg-[#AE4A3E]" />
            </div>

            {/* Item Markers Placed on Horizontal Timeline Axis */}
            {sortedItems.map((item) => {
              const itemName = item.name || item.item || "Compliance Item";
              const authority = item.authority_agency || item.authority || "Regulatory Body";
              const expirationDate = item.expiration_date || item.expires || "";
              const isExpired = item.status === "expired" || (item.days_left !== undefined && item.days_left <= 0);
              const daysLeft = isExpired ? -(item.days_overdue || Math.abs(item.days_left || 1)) : (item.days_left ?? daysUntil(expirationDate));
              const posPct = getTimelinePosPct(daysLeft);
              const colorInfo = getItemColor(daysLeft, isExpired, item.status_color);
              const isSelected = selectedItemId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                  style={{ left: `${posPct}%`, transform: "translateX(-50%)" }}
                  className="absolute z-20 top-1/2 -translate-y-1/2 cursor-pointer group"
                >
                  <div
                    className={`w-6 h-6 rounded-full ${colorInfo.bg} text-white flex items-center justify-center font-black text-[10px] shadow-md ring-4 ring-white transition-all duration-300 group-hover:scale-125 ${
                      isSelected ? "scale-125 ring-[#1E3A5F]" : ""
                    }`}
                  >
                    {isExpired ? "!" : daysLeft <= 0 ? "0" : daysLeft}
                  </div>

                  {/* Marker Tooltip on Hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-slate-900 text-white text-[10px] rounded-lg p-2 shadow-xl whitespace-nowrap space-y-0.5">
                      <p className="font-bold">{itemName}</p>
                      <p className="text-gray-300">{authority}</p>
                      <p className={`font-semibold ${isExpired ? "text-red-400" : daysLeft <= 30 ? "text-amber-300" : "text-emerald-300"}`}>
                        {isExpired ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft} days remaining`} ({expirationDate})
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Footer Labels */}
          <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold mt-2 px-1">
            <span>90+ Days (Safe)</span>
            <span className="text-[#B78A2F]">60 Days Notice Line</span>
            <span className="text-[#AE4A3E]">30 Days Urgent Line</span>
            <span className="text-red-600 font-bold">0 Days (Expiry Hard Stop)</span>
          </div>
        </div>

        {/* ── Item Markers Details Roster ── */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
            <span>Active Compliance Items Timeline Status</span>
            <span className="text-[10px] font-normal text-gray-500">{sortedItems.length} tracked items</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {sortedItems.map((item) => {
              const itemName = item.name || item.item || "Compliance Item";
              const authority = item.authority_agency || item.authority || "Regulatory Body";
              const expirationDate = item.expiration_date || item.expires || "";
              const isExpired = item.status === "expired" || (item.days_left !== undefined && item.days_left <= 0);
              const daysLeft = isExpired ? -(item.days_overdue || Math.abs(item.days_left || 1)) : (item.days_left ?? daysUntil(expirationDate));
              const colorInfo = getItemColor(daysLeft, isExpired, item.status_color);
              const isSelected = selectedItemId === item.id;
              const role = item.responsible_role || item.ownerRole;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected ? "bg-[#1E3A5F]/[0.05] border-[#1E3A5F] ring-1 ring-[#1E3A5F]/30" : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`w-2 h-2 rounded-full ${colorInfo.bg}`} />
                        <span className="text-xs font-bold text-gray-900 truncate">{itemName}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate">{authority}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorInfo.lightBg} ${colorInfo.text} ${colorInfo.border}`}>
                      {item.status_badge || (isExpired ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`)}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-gray-400" /> Expires: {expirationDate}
                    </span>
                    <RoleBadge role={role} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UrgencyTimelineCard;
