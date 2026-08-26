import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const DirectorOverviewSkeleton = () => {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Pulse Card Skeleton */}
      <Skeleton className="h-48 w-full rounded-2xl bg-slate-900/60" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>

      {/* Enrollment + Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>

      {/* Compliance + Billing + Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      {/* Expenses */}
      <Skeleton className="h-64 w-full rounded-xl" />

      {/* Tasks + Over-Escalation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-60 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    </div>
  );
};

export default DirectorOverviewSkeleton;
