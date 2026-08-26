import React from "react";

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200/80 rounded-xl ${className}`} />
);

export const KpiCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/60 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-9 rounded-xl" />
    </div>
    <Skeleton className="h-7 w-28" />
    <Skeleton className="h-3 w-36" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60 space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
    <Skeleton className="h-[200px] w-full rounded-2xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  </div>
);

export const ApprovalPipelineSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60 space-y-5">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>
    </div>

    {/* Buckets */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>

    {/* List items */}
    <div className="space-y-2.5 pt-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  </div>
);

export const ScholarshipsPageSkeleton = () => (
  <div className="space-y-6 pb-8">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-36 rounded-xl" />
    </div>

    {/* KPIs */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>

    {/* Chart */}
    <ChartSkeleton />

    {/* Pipeline */}
    <ApprovalPipelineSkeleton />
  </div>
);

export default ScholarshipsPageSkeleton;
