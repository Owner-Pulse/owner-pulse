import React, { useState, useMemo } from "react";
import { UserCheck, ArrowRight, Search, X } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const total = substitutesData?.total_subs_month ?? 0;
  const uniqueSubs = substitutesData?.unique_subs ?? 0;
  const thisWeek = substitutesData?.this_week ?? 0;
  const coverageRate = substitutesData?.coverage_rate_percentage ?? 0;
  const logs = substitutesData?.logs || [];

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase().trim();
    return logs.filter((entry) => {
      const subName = (entry.sub_name || "").toLowerCase();
      const coveringFor = (entry.covered_teacher || entry.absent_employee_name || "").toLowerCase();
      const dateStr = (entry.formatted_date || entry.date || "").toLowerCase();
      return subName.includes(q) || coveringFor.includes(q) || dateStr.includes(q);
    });
  }, [logs, search]);

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck size={16} className="text-[#1E3A5F]" /> Substitutes
            </CardTitle>
            <CardDescription className="mt-1">
              {total} substitutes this month · {uniqueSubs} unique subs · {thisWeek} this week
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search substitutes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
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
          {filteredLogs.length > 0 ? (
            filteredLogs.map((entry, idx) => {
              const subName = entry.sub_name || "Substitute";
              const coveringFor = entry.covered_teacher || entry.absent_employee_name || "Staff";
              const dateStr = fmtDateSub(entry.date, entry.formatted_date);
              const initials = subName.split(" ").slice(-1)[0] || "Sub";

              return (
                <div key={entry.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
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
            <div className="py-6 text-center text-sm text-gray-500">
              {search ? `No substitute logs matching "${search}"` : "No substitute logs recorded."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubstitutesCard;
