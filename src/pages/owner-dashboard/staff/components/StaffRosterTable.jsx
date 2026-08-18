import React from "react";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StaffRosterTable = ({ staffRoster = [], sortBy, onSortChange, pagination, onPageChange }) => {
  const sorted = React.useMemo(() => {
    return [...staffRoster].sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "ptoUsed") return (b.pto_used ?? 0) - (a.pto_used ?? 0);
      if (sortBy === "ptoRemaining") return (a.remaining ?? 0) - (b.remaining ?? 0);
      return 0;
    });
  }, [staffRoster, sortBy]);

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Users size={16} /> Staff Roster
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {sorted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th
                    className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600"
                    onClick={() => onSortChange && onSortChange("name")}
                  >
                    Name {sortBy === "name" && "↓"}
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th
                    className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600"
                    onClick={() => onSortChange && onSortChange("ptoUsed")}
                  >
                    PTO Used {sortBy === "ptoUsed" && "↓"}
                  </th>
                  <th
                    className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600"
                    onClick={() => onSortChange && onSortChange("ptoRemaining")}
                  >
                    Remaining {sortBy === "ptoRemaining" && "↓"}
                  </th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((s) => {
                  const ptoUsed = s.pto_used ?? s.ptoUsed ?? 0;
                  const remaining = s.remaining ?? (s.ptoAllowance ? s.ptoAllowance - ptoUsed : 0);
                  const usagePct = s.usage_percentage ?? (s.ptoAllowance ? Math.round((ptoUsed / s.ptoAllowance) * 100) : 0);
                  const isHigh = usagePct >= 70;
                  const name = s.name || "Staff Member";
                  const initials = name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const key = s.employee_id || s.id;

                  return (
                    <tr key={key} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                            {initials}
                          </div>
                          <span className="font-medium text-gray-900">{name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-500">{s.role || "Teacher"}</td>
                      <td className="py-3 px-2 text-center font-medium text-gray-900">{ptoUsed}</td>
                      <td className={`py-3 px-2 text-center font-medium ${isHigh ? "text-red-600" : "text-gray-900"}`}>{remaining}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isHigh ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${Math.min(usagePct, 100)}%` }} />
                          </div>
                          <span className={`text-[10px] font-bold ${isHigh ? "text-red-600" : "text-gray-400"}`}>{usagePct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">No staff found in roster.</div>
        )}

        {pagination && pagination.last_page > 1 && (
          <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100 text-xs">
            <span className="text-gray-500">
              Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total staff)
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => onPageChange && onPageChange(pagination.current_page - 1)}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
              >
                Previous
              </button>
              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => onPageChange && onPageChange(pagination.current_page + 1)}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffRosterTable;
