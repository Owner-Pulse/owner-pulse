import React, { useState, useMemo, useRef } from "react";
import { Users, Edit2, Trash2, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RosterSkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-3 px-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-200" />
        <div className="w-28 h-4 bg-gray-200 rounded" />
      </div>
    </td>
    <td className="py-3 px-2">
      <div className="w-20 h-4 bg-gray-200 rounded" />
    </td>
    <td className="py-3 px-2 text-center">
      <div className="w-8 h-4 bg-gray-200 rounded mx-auto" />
    </td>
    <td className="py-3 px-2 text-center">
      <div className="w-8 h-4 bg-gray-200 rounded mx-auto" />
    </td>
    <td className="py-3 px-2">
      <div className="flex items-center gap-2 justify-center">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full" />
        <div className="w-6 h-3 bg-gray-200 rounded" />
      </div>
    </td>
    <td className="py-3 px-2">
      <div className="w-10 h-4 bg-gray-200 rounded ml-auto" />
    </td>
  </tr>
);

const StaffRosterTable = ({
  staffRoster = [],
  sortBy = "ptoUsed",
  onSortChange,
  pagination,
  onLoadMore,
  isLoading = false,
  isLoadingMore,
  onEdit,
  onDelete
}) => {
  const [search, setSearch] = useState("");

  const hasMore = pagination ? Number(pagination.current_page) < Number(pagination.last_page) : false;
  const listContainerRef = useRef(null);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight <= 50) {
      if (hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore();
      }
    }
  };

  const filtered = useMemo(() => {
    let list = staffRoster;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((s) => {
        const name = (s.name || "").toLowerCase();
        const role = (s.role || "").toLowerCase();
        const empId = String(s.employee_id || s.procare_employee_id || s.id || "").toLowerCase();
        return name.includes(q) || role.includes(q) || empId.includes(q);
      });
    }
    return [...list].sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "ptoRemaining") return (a.remaining ?? 0) - (b.remaining ?? 0);
      // Default: sort by PTO usage, highest first per D-11
      const ptoA = a.pto_used ?? a.ptoUsed ?? 0;
      const ptoB = b.pto_used ?? b.ptoUsed ?? 0;
      return ptoB - ptoA;
    });
  }, [staffRoster, search, sortBy]);

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Users size={16} /> Staff Roster
          </CardTitle>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff by name, ID, role..."
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
            {pagination?.total && (
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {filtered.length} of {pagination.total}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">PTO Used</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Remaining</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usage</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <RosterSkeletonRow />
                <RosterSkeletonRow />
                <RosterSkeletonRow />
                <RosterSkeletonRow />
                <RosterSkeletonRow />
              </tbody>
            </table>
          </div>
        ) : filtered.length > 0 ? (
          <div
            ref={listContainerRef}
            onScroll={handleScroll}
            className="overflow-x-auto max-h-105 overflow-y-auto pr-1"
          >
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10 shadow-xs">
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
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s, idx) => {
                  const ptoUsed = s.pto_used ?? s.ptoUsed ?? 0;
                  const remaining = s.remaining ?? (s.ptoAllowance ? s.ptoAllowance - ptoUsed : s.remaining_pto ?? 0);
                  const usagePct = s.usage_percentage ?? (s.ptoAllowance ? Math.round((ptoUsed / s.ptoAllowance) * 100) : 0);
                  const isHigh = usagePct >= 70;
                  const name = s.name || "Staff Member";
                  const initials = name
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const key = s.employee_id ? `${s.employee_id}-${idx}` : idx;

                  return (
                    <tr key={key} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1E3A5F] flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 block">{name}</span>
                            {(s.employee_id || s.procare_employee_id) && (
                              <span className="text-[10px] text-gray-400 font-mono">ID: {s.employee_id || s.procare_employee_id}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-500">{s.role || "Teacher"}</td>
                      <td className="py-3 px-2 text-center font-medium text-gray-900">{ptoUsed}</td>
                      <td className={`py-3 px-2 text-center font-medium ${isHigh ? "text-red-600" : "text-gray-900"}`}>{remaining}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isHigh ? "bg-red-500" : "bg-[#1E3A5F]"}`} style={{ width: `${Math.min(usagePct, 100)}%` }} />
                          </div>
                          <span className={`text-[10px] font-bold ${isHigh ? "text-red-600" : "text-gray-400"}`}>{usagePct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => onEdit(s)}
                            className="p-1 hover:bg-slate-100 rounded text-gray-400 hover:text-[#1E3A5F] transition-colors"
                            title="Edit Staff"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => onDelete(s.procare_employee_id || s.employee_id || s.id)}
                            className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-650 transition-colors"
                            title="Remove Staff"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {isLoadingMore && (
                  <>
                    <RosterSkeletonRow />
                    <RosterSkeletonRow />
                    <RosterSkeletonRow />
                  </>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            {search ? `No staff roster records matching "${search}"` : "No staff found in roster."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffRosterTable;
