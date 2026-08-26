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

const SubstituteHistoryCard = ({ substitutes = [], isLoading = false }) => {
  const [search, setSearch] = useState("");

  const filteredSubs = useMemo(() => {
    if (!search.trim()) return substitutes;
    const q = search.toLowerCase().trim();
    return substitutes.filter((entry) => {
      const subName = (entry.sub_name || entry.subName || entry.substitute_name || "").toLowerCase();
      const coveringFor = (entry.covered_teacher || entry.absent_employee_name || entry.coveringFor || entry.covering_for || entry.covered_teacher_name || "").toLowerCase();
      const formattedDate = (entry.formatted_date || entry.date || "").toLowerCase();
      return subName.includes(q) || coveringFor.includes(q) || formattedDate.includes(q);
    });
  }, [substitutes, search]);

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-semibold text-gray-900">Substitute History</CardTitle>
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
        <div className="space-y-2">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="w-36 h-3.5 bg-gray-200 rounded" />
                    <div className="w-24 h-3 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="w-16 h-3 bg-gray-200 rounded" />
              </div>
            ))
          ) : filteredSubs && filteredSubs.length > 0 ? (
            filteredSubs.map((entry, idx) => {
              const subName = entry.sub_name || entry.subName || entry.substitute_name || "Substitute";
              const coveringFor = entry.covered_teacher || entry.absent_employee_name || entry.coveringFor || entry.covering_for || entry.covered_teacher_name || "Staff Member";
              const formattedDate = entry.formatted_date || (entry.date ? fmtDate(entry.date) : "");
              const relativeDate = entry.time_ago || (entry.date ? fmtRelative(entry.date) : "");
              
              const initials = subName
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div key={entry.id || idx} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center text-xs font-bold text-[#1E3A5F]">
                      {initials || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{subName} → {coveringFor}</p>
                      {relativeDate && <p className="text-xs text-gray-400">{relativeDate}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{formattedDate}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              {search ? `No substitute records matching "${search}"` : "No substitutes logged yet"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubstituteHistoryCard;
