import React from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const EnrollmentTargetsCard = ({ targets }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp size={18} className="text-blue-500" />
        Annual Enrollment Targets
      </CardTitle>
      <CardDescription>
        Progress toward this year's enrollment goals
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(targets).map((target) => {
          const pct = Math.round((target.actual / target.target) * 100);
          const met = pct >= 100;
          const close = pct >= 90 && pct < 100;
          const barColor = met ? "bg-emerald-500" : close ? "bg-amber-500" : "bg-blue-500";

          return (
            <div key={target.label} className="p-5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">{target.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  met ? "bg-emerald-100 text-emerald-700" : close ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {met ? "✓ Met" : `${100 - pct}% to go`}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-gray-900">{target.actual}</span>
                <span className="text-sm text-gray-500">/ {target.target}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>0</span>
                  <span className="font-semibold">{pct}%</span>
                  <span>target</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

export default EnrollmentTargetsCard;
