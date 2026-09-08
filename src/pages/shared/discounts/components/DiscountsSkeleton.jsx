import React from "react";

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200/80 rounded-xl ${className}`} />
);

export const DiscountsSkeleton = () => (
  <div className="space-y-4 sm:space-y-6 pb-8 animate-fade-in">
    {/* Header skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 sm:h-8 w-48 sm:w-56 rounded-xl" />
        <Skeleton className="h-3.5 sm:h-4 w-60 sm:w-72 rounded-lg" />
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Skeleton className="h-9 sm:h-10 w-9 sm:w-10 rounded-xl" />
        <Skeleton className="h-9 sm:h-10 w-32 sm:w-36 rounded-xl" />
        <Skeleton className="h-9 sm:h-10 w-36 sm:w-44 rounded-xl" />
      </div>
    </div>

    {/* KPI Row skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-sm border border-gray-100 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 sm:h-3.5 w-16 sm:w-24" />
            <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl" />
          </div>
          <Skeleton className="h-6 sm:h-7 w-20 sm:w-28" />
          <Skeleton className="h-2.5 sm:h-3.5 w-24 sm:w-36" />
        </div>
      ))}
    </div>

    {/* Table container skeleton */}
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Skeleton className="h-9 sm:h-10 w-full sm:w-72 rounded-xl" />
        <div className="flex gap-2 overflow-x-auto">
          <Skeleton className="h-9 sm:h-10 w-24 shrink-0 rounded-xl" />
          <Skeleton className="h-9 sm:h-10 w-24 shrink-0 rounded-xl" />
          <Skeleton className="h-9 sm:h-10 w-24 shrink-0 rounded-xl" />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 sm:h-20 w-full rounded-xl sm:rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

export default DiscountsSkeleton;
