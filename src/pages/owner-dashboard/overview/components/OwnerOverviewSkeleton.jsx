import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const OwnerOverviewSkeleton = () => {
  return (
    <div className="space-y-6 pb-8 max-w-400 mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>

      {/* Pulse Card Skeleton */}
      <Skeleton className="h-44 w-full rounded-2xl bg-slate-900/60" />

      {/* Cash Flow Metrics Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      {/* KPI Cards Row 3 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      {/* Middle Row Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      {/* Bottom Section Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
};

export default OwnerOverviewSkeleton;
