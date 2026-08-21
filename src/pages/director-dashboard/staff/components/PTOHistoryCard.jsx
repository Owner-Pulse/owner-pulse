import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TODAY = new Date("2026-05-11");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtRelative = (d) => {
  const diff = Math.ceil((new Date(d) - TODAY) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return `${Math.abs(diff)} days ago`;
};

const PTOHistoryCard = ({ ptoLog, staff }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardHeader><CardTitle className="text-base font-semibold">PTO History</CardTitle></CardHeader>
    <CardContent>
      <div className="space-y-2">
        {ptoLog.length > 0 ? ptoLog.map((entry) => {
          const s = staff.find((st) => st.id === entry.staffId);
          return (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#B78A2F]/10 flex items-center justify-center text-xs font-bold text-[#8F6A1F]">
                  {s?.name.split(" ").slice(-1)[0] || "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s?.name || "Unknown"} · {entry.days}d {entry.dayType}</p>
                  <p className="text-xs text-gray-400">{fmtRelative(entry.date)}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{fmtDate(entry.date)}</span>
            </div>
          );
        }) : <p className="text-sm text-gray-400 text-center py-4">No PTO logged yet</p>}
      </div>
    </CardContent>
  </Card>
);

export default PTOHistoryCard;
