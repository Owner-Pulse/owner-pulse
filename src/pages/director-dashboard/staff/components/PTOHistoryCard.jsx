import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TODAY = new Date("2026-05-11");
const fmtDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
};

const fmtRelative = (d) => {
  if (!d) return "";
  try {
    const diff = Math.ceil((new Date(d) - TODAY) / 86400000);
    if (diff === 0) return "Today";
    if (diff === -1) return "Yesterday";
    return `${Math.abs(diff)} days ago`;
  } catch {
    return d;
  }
};

const PTOHistoryCard = ({ ptoLog = [], staff = [] }) => {
  const [search, setSearch] = useState("");

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return ptoLog;
    const q = search.toLowerCase().trim();
    return ptoLog.filter((entry) => {
      const s = Array.isArray(staff) ? staff.find((st) => (st.id || st.employee_id) === (entry.staffId || entry.employee_id)) : null;
      const name = (entry.employee_name || entry.teacher_name || entry.name || s?.name || "").toLowerCase();
      const dayType = (entry.day_type || entry.dayType || "").toLowerCase();
      const formattedDate = (entry.formatted_date || entry.date || "").toLowerCase();
      const empId = String(entry.employee_id || entry.procare_employee_id || "").toLowerCase();
      return name.includes(q) || dayType.includes(q) || formattedDate.includes(q) || empId.includes(q);
    });
  }, [ptoLog, staff, search]);

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-semibold text-gray-900">PTO History</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search PTO history..."
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
        <div className="space-y-2">
          {filteredLogs && filteredLogs.length > 0 ? (
            filteredLogs.map((entry, idx) => {
              const s = Array.isArray(staff) ? staff.find((st) => (st.id || st.employee_id) === (entry.staffId || entry.employee_id)) : null;
              const name = entry.employee_name || entry.teacher_name || entry.name || s?.name || "Staff Member";
              const dayType = entry.day_type || entry.dayType || "sick";
              const days = entry.days || 1;
              const daysLabel = entry.days_label || `${days}d ${dayType}`;
              const formattedDate = entry.formatted_date || (entry.date ? fmtDate(entry.date) : "");
              const relativeDate = entry.time_ago || (entry.date ? fmtRelative(entry.date) : "");

              const initials = name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div key={entry.id || idx} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#B78A2F]/10 flex items-center justify-center text-xs font-bold text-[#8F6A1F]">
                      {initials || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{name} · {daysLabel}</p>
                      {relativeDate && <p className="text-xs text-gray-400">{relativeDate}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{formattedDate}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              {search ? `No PTO logs matching "${search}"` : "No PTO logged yet"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PTOHistoryCard;
