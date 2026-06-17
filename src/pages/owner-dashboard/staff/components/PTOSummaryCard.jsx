import React from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const PTOSummaryCard = ({ staff, ptoPercent }) => (
  <Card className="bg-white border-none shadow-sm h-full">
    <CardHeader>
      <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <Calendar size={16} /> PTO Summary
      </CardTitle>
      <CardDescription>{ptoPercent}% of total PTO allowance used YTD</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {staff.map((s) => {
          const remaining = s.ptoAllowance - s.ptoUsed;
          const usagePct = Math.round((s.ptoUsed / s.ptoAllowance) * 100);
          const isHigh = usagePct >= 70;
          return (
            <div key={s.id} className={`p-3 rounded-xl ${isHigh ? "bg-red-50" : "bg-gray-50"}`}>
              <p className="text-xs font-semibold text-gray-900 truncate">{s.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isHigh ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${usagePct}%` }} />
                </div>
                <span className={`text-[10px] font-bold ${isHigh ? "text-red-600" : "text-gray-500"}`}>{s.ptoUsed}/{s.ptoAllowance}</span>
              </div>
              {isHigh && <p className="text-[10px] text-red-500 mt-0.5">{remaining} days remaining</p>}
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

export default PTOSummaryCard;
