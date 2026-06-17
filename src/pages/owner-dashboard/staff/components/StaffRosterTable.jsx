import React from "react";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "./StatusBadge";

const StaffRosterTable = ({ staff, sorted, filterStatus, sortBy, onFilterChange, onSortChange }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardHeader>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Users size={16} /> Staff Roster
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Status:</span>
          {["all", "present", "late", "callout"].map((s) => (
            <button key={s} onClick={() => onFilterChange(s)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${filterStatus === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {sorted.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => onSortChange("ptoUsed")}>
                  PTO Used {sortBy === "ptoUsed" && "↓"}
                </th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => onSortChange("ptoRemaining")}>
                  Remaining {sortBy === "ptoRemaining" && "↓"}
                </th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((s) => {
                const remaining = s.ptoAllowance - s.ptoUsed;
                const usagePct = Math.round((s.ptoUsed / s.ptoAllowance) * 100);
                const isHigh = usagePct >= 70;
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${s.today === "present" ? "bg-emerald-500" : s.today === "late" ? "bg-amber-500" : "bg-red-500"}`}>
                          {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-medium text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-500">{s.role}</td>
                    <td className="py-3 px-2"><StatusBadge status={s.today} /></td>
                    <td className="py-3 px-2 text-center font-medium text-gray-900">{s.ptoUsed}</td>
                    <td className={`py-3 px-2 text-center font-medium ${isHigh ? "text-red-600" : "text-gray-900"}`}>{remaining}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isHigh ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${usagePct}%` }} />
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
        <div className="py-8 text-center text-sm text-gray-500">No staff match the selected filter.</div>
      )}
    </CardContent>
  </Card>
);

export default StaffRosterTable;
