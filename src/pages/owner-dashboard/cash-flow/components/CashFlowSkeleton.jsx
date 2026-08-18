import React from "react";
import { motion } from "framer-motion";
import { containerVariants } from "../cashflow.utils";

// ─── Skeleton UI ──────────────────────────────────────────────────
const CashFlowSkeleton = () => (
  <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
    {/* Header Skeleton */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="space-y-2">
        <div className="w-40 h-7 bg-gray-200 rounded animate-pulse" />
        <div className="w-72 h-4 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="w-20 h-9 bg-gray-100 rounded animate-pulse" />
        <div className="w-20 h-9 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>

    {/* KPI Row Skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
            <div className="w-20 h-4 bg-gray-200 rounded" />
          </div>
          <div className="w-24 h-6 bg-gray-200 rounded" />
          <div className="w-32 h-3 bg-gray-100 rounded" />
        </div>
      ))}
    </div>

    {/* Chart Skeleton */}
    <div className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse">
      <div className="w-48 h-6 bg-gray-200 rounded mb-2" />
      <div className="w-72 h-4 bg-gray-100 rounded mb-6" />
      <div className="flex flex-wrap gap-2 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-24 h-7 bg-gray-100 rounded-full" />
        ))}
      </div>
      <div className="h-64 bg-gray-50 rounded-lg" />
    </div>

    {/* Insights + QuickBooks Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6 animate-pulse flex flex-col gap-4">
        <div className="w-48 h-6 bg-gray-200 rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg" />
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse flex flex-col gap-4">
        <div className="w-32 h-6 bg-gray-200 rounded mb-4" />
        <div className="h-12 bg-gray-100 rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
        <div className="h-8 bg-gray-100 rounded-lg" />
      </div>
    </div>

    {/* Budget vs Actual Skeleton */}
    <div className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse">
      <div className="w-48 h-6 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>

    {/* Full Year Table Skeleton */}
    <div className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse">
      <div className="w-48 h-6 bg-gray-200 rounded mb-6" />
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-1/3 h-4 bg-gray-100 rounded" />
            {[...Array(5)].map((_, j) => (
              <div key={j} className="flex-1 h-4 bg-gray-100 rounded" />
            ))}
            <div className="w-16 h-4 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

export default CashFlowSkeleton;
