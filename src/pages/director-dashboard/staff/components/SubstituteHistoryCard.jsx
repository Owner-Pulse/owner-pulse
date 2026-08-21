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

const SubstituteHistoryCard = ({ substitutes }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardHeader><CardTitle className="text-base font-semibold">Substitute History</CardTitle></CardHeader>
    <CardContent>
      <div className="space-y-2">
        {substitutes.length > 0 ? substitutes.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center text-xs font-bold text-[#1E3A5F]">
                {entry.subName.split(" ").slice(-1)[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{entry.subName} → {entry.coveringFor}</p>
                <p className="text-xs text-gray-400">{fmtRelative(entry.date)}</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">{fmtDate(entry.date)}</span>
          </div>
        )) : <p className="text-sm text-gray-400 text-center py-4">No substitutes logged yet</p>}
      </div>
    </CardContent>
  </Card>
);

export default SubstituteHistoryCard;
