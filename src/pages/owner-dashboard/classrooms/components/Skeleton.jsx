import React from "react";

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export const KpiSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-28" />
  </div>
);

export const ClassroomCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
    <div className="flex justify-between">
      <div className="flex gap-3 items-center">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-lg" />
      ))}
    </div>
  </div>
);

export const PnLChartSkeleton = () => (
  <>
    <Skeleton className="h-52 rounded-xl" />
    <Skeleton className="h-52 rounded-xl lg:col-span-2" />
  </>
);

export default Skeleton;
