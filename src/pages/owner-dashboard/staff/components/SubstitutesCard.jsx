import React from "react";
import { UserCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const fmtDateSub = (d, formattedDate) => {
  if (formattedDate) return formattedDate;
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return d;
  }
};

const SubstitutesCard = ({ substitutesData }) => {
  const total = substitutesData?.total_subs_month ?? 0;
  const uniqueSubs = substitutesData?.unique_subs ?? 0;
  const thisWeek = substitutesData?.this_week ?? 0;
  const coverageRate = substitutesData?.coverage_rate_percentage ?? 0;
  const logs = substitutesData?.logs || [];

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <UserCheck size={16} className="text-[#1E3A5F]" /> Substitutes
        </CardTitle>
        <CardDescription>
          {total} substitutes this month · {uniqueSubs} unique subs · {thisWeek} this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-[#1E3A5F]/5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Total</p>
            <p className="text-xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#1E3A5F]/5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">This Week</p>
            <p className="text-xl font-bold text-[#1E3A5F]">{thisWeek}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Unique Subs</p>
            <p className="text-xl font-bold text-gray-900">{uniqueSubs}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#3E7A54]/10">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">Coverage Rate</p>
            <p className="text-xl font-bold text-[#2F6042]">{coverageRate}%</p>
          </div>
        </div>
        <div className="space-y-2">
          {logs.length > 0 ? (
            logs.map((entry) => {
              const subName = entry.sub_name || "Substitute";
              const coveringFor = entry.covered_teacher || entry.absent_employee_name || "Staff";
              const dateStr = fmtDateSub(entry.date, entry.formatted_date);
              const initials = subName.split(" ").slice(-1)[0] || "Sub";

              return (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center text-xs font-bold text-[#1E3A5F]">
                      {initials[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                        {subName} <ArrowRight size={12} className="text-gray-400" /> {coveringFor}
                      </p>
                      <p className="text-xs text-gray-400">
                        {dateStr} {entry.classroom_name ? `· ${entry.classroom_name}` : ""} · Recorded by {entry.recorded_by || "Director"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{subName.split(" ")[0]} covered</span>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-sm text-gray-500">No substitute logs recorded.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubstitutesCard;
