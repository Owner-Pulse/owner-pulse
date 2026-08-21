import React from "react";
import { AlertTriangle, Clock, ArrowRight, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { daysSince } from "@/hooks/waitlist/useWaitlistStore";

const StaleLeadAlertCard = ({ staleItems, onSelectLead }) => {
  if (!staleItems || staleItems.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
        <span className="font-semibold flex items-center gap-2">
          ✓ All waitlist leads are active! No stale inquiries (30d+).
        </span>
        <span className="text-[10px] text-emerald-600 font-bold uppercase">Healthy Pipeline</span>
      </div>
    );
  }

  return (
    <Card className="bg-[#AE4A3E]/[0.06] border border-[#AE4A3E]/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[#8A362C]">
            <AlertTriangle size={18} />
            <h3 className="font-bold text-sm">
              Stale Waitlist Leads Warning ({staleItems.length} families waiting &gt;30 days)
            </h3>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#AE4A3E]/15 text-[#8A362C]">
            Action Required
          </span>
        </div>

        <p className="text-xs text-[#8A362C]/80 mb-3">
          These leads have been in the pipeline over 30 days without advancing to enrollment or being resolved. Director follow-up recommended:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {staleItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectLead && onSelectLead(item)}
              className="p-2.5 rounded-lg bg-white border border-[#AE4A3E]/20 hover:border-[#AE4A3E] transition-all cursor-pointer flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-gray-900">{item.childName}</p>
                <p className="text-[10px] text-gray-500">{item.program} · Parent: {item.parentName}</p>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-[#8A362C]">{daysSince(item.addedDate)}d</span>
                <p className="text-[9px] text-[#1E3A5F] font-semibold">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StaleLeadAlertCard;
