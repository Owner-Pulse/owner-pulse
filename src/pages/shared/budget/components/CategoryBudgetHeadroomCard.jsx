import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Layers, ShieldCheck, Sparkles, SlidersHorizontal, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmtMoney = (n) => "$" + Math.round(n ?? 0).toLocaleString();

const CategoryBudgetHeadroomCard = ({
  summary,
  schoolBudgetTotal,
  onManageBulk,
}) => {
  const schoolLimit = Number(summary?.school_budget_limit ?? schoolBudgetTotal ?? 0);
  const totalAllocated = Number(summary?.total_allocated_category_budget ?? 0);
  const unallocated = Number(summary?.unallocated_budget ?? Math.max(0, schoolLimit - totalAllocated));
  const categoriesCount = summary?.categories_count ?? 0;

  const allocatedPct = schoolLimit > 0 ? Math.min(100, Math.round((totalAllocated / schoolLimit) * 100)) : 0;
  const isFullyAllocated = totalAllocated >= schoolLimit && schoolLimit > 0;
  const isOverAllocated = totalAllocated > schoolLimit && schoolLimit > 0;

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-[#15294A] text-white border-none shadow-md overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      <CardContent className="p-5 md:p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Category Budget Allocations</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-blue-100 border border-white/20">
                  {categoriesCount} Categories
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Expense caps enforced against the master school budget ceiling
              </p>
            </div>
          </div>

          {onManageBulk && (
            <Button
              onClick={onManageBulk}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold rounded-xl h-9 px-3.5 backdrop-blur-sm self-start md:self-auto flex items-center gap-1.5 transition-all shadow-sm"
            >
              <SlidersHorizontal size={14} />
              <span>Bulk Manage Limits</span>
            </Button>
          )}
        </div>

        {/* Master Ceiling & Allocation Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <span className="text-[11px] font-medium text-blue-200 block mb-1">Master School Ceiling</span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-white">{summary?.school_budget_limit_formatted || fmtMoney(schoolLimit)}</span>
              <ShieldCheck size={14} className="text-blue-300" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <span className="text-[11px] font-medium text-blue-200 block mb-1">Allocated to Categories</span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-emerald-300">{summary?.total_allocated_category_budget_formatted || fmtMoney(totalAllocated)}</span>
              <span className="text-xs font-bold text-emerald-200">{allocatedPct}% cap</span>
            </div>
          </div>

          <div className={`backdrop-blur-sm rounded-xl p-3.5 border ${
            isOverAllocated 
              ? "bg-red-500/20 border-red-400/40 text-red-100" 
              : "bg-white/10 border-white/10 text-white"
          }`}>
            <span className="text-[11px] font-medium text-blue-200 block mb-1">Unallocated Headroom</span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-white">{summary?.unallocated_budget_formatted || fmtMoney(unallocated)}</span>
              {isOverAllocated ? (
                <AlertCircle size={14} className="text-red-300" />
              ) : (
                <Sparkles size={14} className="text-amber-300" />
              )}
            </div>
          </div>
        </div>

        {/* Allocation Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-blue-100">
            <span>Allocation Progress ({allocatedPct}% allocated)</span>
            <span>
              {isOverAllocated 
                ? "Exceeded ceiling" 
                : isFullyAllocated 
                ? "100% Allocated" 
                : `${fmtMoney(unallocated)} available to allocate`}
            </span>
          </div>
          <div className="h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverAllocated ? "bg-red-500" : allocatedPct > 85 ? "bg-amber-400" : "bg-emerald-400"
              }`}
              style={{ width: `${Math.min(allocatedPct, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryBudgetHeadroomCard;
