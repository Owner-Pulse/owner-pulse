import React from "react";
import { ShieldCheck, UserCheck, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SegmentedBarRow = ({ title, icon: Icon, stats }) => {
  const total = stats.total > 0 ? stats.total : 1;
  const compliantPct = Math.round((stats.compliant / total) * 100);
  const expiringPct = Math.round((stats.expiring / total) * 100);
  const expiredPct = Math.min(100 - compliantPct - expiringPct, Math.round((stats.expired / total) * 100));

  return (
    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F]">
            <Icon size={14} />
          </div>
          <span className="text-xs font-bold text-gray-900">{title}</span>
        </div>
        <span className="text-xs font-extrabold text-gray-700">{stats.total} items</span>
      </div>

      {/* Segmented Horizontal Bar */}
      <div className="h-3 bg-gray-200/80 rounded-full overflow-hidden flex w-full">
        {stats.compliant > 0 && (
          <div
            className="h-full bg-[#3E7A54] transition-all duration-300"
            style={{ width: `${compliantPct}%` }}
            title={`Compliant: ${stats.compliant}`}
          />
        )}
        {stats.expiring > 0 && (
          <div
            className="h-full bg-[#7C3AED] transition-all duration-300"
            style={{ width: `${expiringPct}%` }}
            title={`Expiring Soon: ${stats.expiring}`}
          />
        )}
        {stats.expired > 0 && (
          <div
            className="h-full bg-[#AE4A3E] transition-all duration-300"
            style={{ width: `${expiredPct}%` }}
            title={`Expired: ${stats.expired}`}
          />
        )}
      </div>

      {/* Legend & Count Badges */}
      <div className="flex flex-wrap items-center justify-between text-[11px] pt-0.5">
        <div className="flex items-center gap-1.5 text-[#2F6042] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#3E7A54]" />
          <span>{stats.compliant} Compliant</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6D28D9] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
          <span>{stats.expiring} Expiring</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#8A362C] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#AE4A3E]" />
          <span>{stats.expired} Expired</span>
        </div>
      </div>
    </div>
  );
};

const OverviewCard = ({ items = [] }) => {
  // Compute Owner-owned vs Director-owned status breakdowns
  const ownerStats = items
    .filter((i) => (i.ownerRole || i.responsible_role || "").toLowerCase() === "owner")
    .reduce(
      (acc, i) => {
        acc.total += 1;
        if (i.status === "expired" || (i.days_left !== undefined && i.days_left <= 0)) acc.expired += 1;
        else if (i.status === "expiring" || (i.days_left !== undefined && i.days_left <= 60)) acc.expiring += 1;
        else acc.compliant += 1;
        return acc;
      },
      { total: 0, compliant: 0, expiring: 0, expired: 0 }
    );

  const directorStats = items
    .filter((i) => (i.ownerRole || i.responsible_role || "").toLowerCase() !== "owner")
    .reduce(
      (acc, i) => {
        acc.total += 1;
        if (i.status === "expired" || (i.days_left !== undefined && i.days_left <= 0)) acc.expired += 1;
        else if (i.status === "expiring" || (i.days_left !== undefined && i.days_left <= 60)) acc.expiring += 1;
        else acc.compliant += 1;
        return acc;
      },
      { total: 0, compliant: 0, expiring: 0, expired: 0 }
    );

  return (
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <ShieldCheck size={16} className="text-[#1E3A5F]" />
          Ownership Breakdown ("Who Owns What")
        </CardTitle>
        <CardDescription className="text-xs">
          Segmented compliance status for Owner &amp; Director responsibilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <SegmentedBarRow
          title="Owner-owned Items"
          icon={Building2}
          stats={ownerStats}
        />
        <SegmentedBarRow
          title="Director-owned Items"
          icon={UserCheck}
          stats={directorStats}
        />
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
