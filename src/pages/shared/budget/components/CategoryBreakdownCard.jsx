import React, { useMemo } from "react";
import { PieChart, ChevronLeft, ChevronRight, Loader2, Edit2, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fmtMoneyShort = (n) => {
  if (typeof n === "string") return n;
  if (n === undefined || n === null) return "$0";
  return n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);
};

const CategoryBreakdownCard = ({
  categories = [],
  pagination = null,
  page = 1,
  perPage = 10,
  onPageChange,
  onPerPageChange,
  isFetching = false,
  title = "Spending by Category",
  subtitle = "Plain spending list by category, sorted high to low",
  onEditCategory,
  onResetCategory,
  onManageBulk,
}) => {
  // Sort categories high to low by spent amount
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const spentA = a.spent_numeric ?? a.spent_amount ?? (typeof a.spent === "number" ? a.spent : 0);
      const spentB = b.spent_numeric ?? b.spent_amount ?? (typeof b.spent === "number" ? b.spent : 0);
      return spentB - spentA;
    });
  }, [categories]);

  return (
    <Card className="bg-white border-none shadow-sm relative overflow-hidden">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <PieChart size={18} className="text-[#1E3A5F]" />
              {title}
            </CardTitle>
            <CardDescription className="text-xs">{subtitle}</CardDescription>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isFetching && (
              <div className="flex items-center gap-1.5 text-xs text-[#1E3A5F] bg-[#1E3A5F]/10 px-2.5 py-1 rounded-full animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                <span>Updating...</span>
              </div>
            )}
            {onManageBulk && (
              <Button
                variant="outline"
                size="sm"
                onClick={onManageBulk}
                className="h-8 text-xs font-semibold rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <SlidersHorizontal size={13} className="text-[#1E3A5F]" />
                <span>Manage Limits</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className={`space-y-3 max-h-[520px] overflow-y-auto pr-1.5 transition-opacity duration-200 ${isFetching ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
          {sortedCategories.length > 0 ? (
            sortedCategories.map((cat, idx) => {
              const fullName = cat.category_name || cat.name || cat.category || `Category ${idx + 1}`;
              const hasColon = fullName.includes(":");
              let parentName = "";
              let childName = fullName;

              if (hasColon) {
                const parts = fullName.split(":");
                parentName = parts[0].trim();
                childName = parts.slice(1).join(":").trim();
              }

              const spentNumeric = cat.spent_numeric ?? cat.spent_amount ?? (typeof cat.spent === "number" ? cat.spent : 0);
              const budgetedNumeric = cat.budget_limit_numeric ?? cat.budgeted_numeric ?? (typeof cat.budget === "number" ? cat.budget : 0);
              const hasCustomLimit = Boolean(cat.has_custom_budget || cat.is_custom_limit || (cat.id && budgetedNumeric > 0));

              const spentFormatted = cat.spent_amount_formatted ?? cat.spent ?? cat.spent_formatted ?? fmtMoneyShort(spentNumeric);
              const budgetedFormatted = cat.budget_limit_formatted ?? cat.budgeted ?? cat.budget_limit ?? fmtMoneyShort(budgetedNumeric);
              const spentVsBudget = budgetedNumeric > 0 ? `${spentFormatted} / ${budgetedFormatted}` : `${spentFormatted} spent`;

              // Determine used percentage safely
              let pct = 0;
              if (cat.used_percentage !== undefined && cat.used_percentage !== null) {
                pct = Math.round(Number(cat.used_percentage));
              } else if (budgetedNumeric > 0) {
                pct = Math.round((spentNumeric / budgetedNumeric) * 100);
              } else if (spentNumeric > 0) {
                pct = 100;
              }

              const overspent = budgetedNumeric > 0 && spentNumeric > budgetedNumeric;
              const usedText = budgetedNumeric > 0 ? `${pct}% of budget used` : `${spentFormatted} total spend`;
              const remainingNumeric = cat.remaining_amount ?? cat.remaining_numeric ?? (budgetedNumeric - spentNumeric);
              const remainingFormatted = cat.remaining_amount_formatted || fmtMoneyShort(Math.max(0, remainingNumeric));

              const barColor = overspent ? "bg-[#AE4A3E]" : pct > 85 ? "bg-[#B78A2F]" : "bg-[#1E3A5F]";

              return (
                <div key={fullName + idx} className="p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-100/60 group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        {hasColon && (
                          <span className="inline-block text-[10px] font-semibold text-[#1E3A5F] bg-[#1E3A5F]/10 px-2 py-0.5 rounded-md">
                            {parentName}
                          </span>
                        )}
                        {hasCustomLimit && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2F6042] bg-[#3E7A54]/10 border border-[#3E7A54]/20 px-2 py-0.2 rounded-full">
                            <Sparkles size={10} /> Custom Limit
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm font-bold text-gray-900 truncate">{childName}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      <span className={`text-xs font-extrabold ${overspent ? "text-[#8A362C]" : "text-[#1E3A5F]"}`}>
                        {spentVsBudget}
                      </span>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        {onEditCategory && (
                          <button
                            type="button"
                            onClick={() => onEditCategory(cat)}
                            className="p-1.5 hover:bg-slate-200/70 rounded-lg text-gray-500 hover:text-[#1E3A5F] transition-colors"
                            title="Set or Edit Custom Budget Limit"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        {hasCustomLimit && onResetCategory && (
                          <button
                            type="button"
                            onClick={() => onResetCategory(cat)}
                            className="p-1.5 hover:bg-red-100/70 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                            title="Reset to Default"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200/80 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor} transition-all duration-300`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>

                  <div className="flex items-center justify-between mt-1.5 text-[11px]">
                    <span className="text-gray-500 font-medium">{usedText}</span>
                    {overspent ? (
                      <span className="text-[#8A362C] font-semibold">
                        Overspent by {fmtMoneyShort(spentNumeric - budgetedNumeric)}
                      </span>
                    ) : budgetedNumeric > 0 ? (
                      <span className="text-[#2F6042] font-semibold">
                        {remainingFormatted} remaining
                      </span>
                    ) : (
                      <span className="text-gray-400 font-medium">Standard Expense</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs">No categories found.</div>
          )}
        </div>

        {/* ── Pagination Controls ── */}
        {pagination && pagination.total > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>
                Showing <span className="font-semibold text-gray-800">{pagination.from ?? ((page - 1) * perPage + 1)}</span> to{" "}
                <span className="font-semibold text-gray-800">{pagination.to ?? Math.min(page * perPage, pagination.total)}</span> of{" "}
                <span className="font-semibold text-gray-800">{pagination.total}</span> categories
              </span>
              {onPerPageChange && (
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-gray-400">| Per page:</span>
                  <select
                    value={perPage}
                    onChange={(e) => onPerPageChange(Number(e.target.value))}
                    className="h-7 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange && onPageChange(page - 1)}
                disabled={page <= 1 || isFetching}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              {Array.from({ length: pagination.last_page || 1 }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => onPageChange && onPageChange(pNum)}
                  disabled={isFetching}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    pNum === page
                      ? "bg-[#1E3A5F] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <button
                onClick={() => onPageChange && onPageChange(page + 1)}
                disabled={page >= (pagination.last_page || 1) || isFetching}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdownCard;
