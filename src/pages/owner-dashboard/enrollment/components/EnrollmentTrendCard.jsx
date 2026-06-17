import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const EnrollmentTrendCard = ({ trend }) => {
  const maxVal = Math.max(...trend.map((e) => e.students));

  return (
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle>Enrollment Trend</CardTitle>
        <CardDescription>Monthly growth this school year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {trend.map((entry, idx) => {
            const widthPct = Math.round((entry.students / maxVal) * 100);
            const isUp = entry.students > (trend[idx - 1]?.students || 0);

            return (
              <div key={entry.month} className="flex items-center gap-3 py-1">
                <span className="text-xs font-medium text-gray-500 w-8">{entry.month}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isUp ? "bg-emerald-400" : "bg-blue-400"}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-10 text-right">{entry.students}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnrollmentTrendCard;
