import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PiggyBank, Search, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { itemVariants, fmtMoneyShort } from "../cashflow.utils";

const BudgetVsActualCard = ({ categories = [], totalSpent = 0, totalBudget = 0, budgetPct = 0 }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.spent - a.spent); // Highest spent first
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, page]);

  const hasBudgetLimit = totalBudget > 0;

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank size={18} className="text-[#1E3A5F]" />
                Annual Budget vs Actual
              </CardTitle>
              <CardDescription>
                {hasBudgetLimit ? (
                  `${fmtMoneyShort(totalSpent)} of ${fmtMoneyShort(totalBudget)} spent (${budgetPct}%)`
                ) : (
                  `${fmtMoneyShort(totalSpent)} total spent across ${categories.length} categories · No budget limit set in QuickBooks`
                )}
              </CardDescription>
            </div>

            {/* Overall budget progress or total indicator */}
            {hasBudgetLimit ? (
              <div className="w-full md:w-52 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>$0</span>
                  <span className="font-bold text-gray-800">{budgetPct}%</span>
                  <span>{fmtMoneyShort(totalBudget)}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#B78A2F] transition-all"
                    style={{ width: `${Math.min(budgetPct, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 text-xs font-semibold">
                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                Unbudgeted Expense Stream
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Search bar & pagination controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search expense category..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
              />
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 self-end sm:self-center">
                <span>
                  Showing {paginatedCategories.length} of {filteredCategories.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-white bg-white shadow-2xs"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <span className="px-1.5 py-0.5 font-semibold text-gray-700">
                    {page}/{totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-white bg-white shadow-2xs"
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Grid of category progress items */}
          {paginatedCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {paginatedCategories.map((cat) => {
                const categoryHasBudget = cat.budget > 0;
                const pct = categoryHasBudget ? Math.round((cat.spent / cat.budget) * 100) : 0;
                const overspent = categoryHasBudget && cat.spent > cat.budget;
                const barColor = categoryHasBudget
                  ? overspent
                    ? "bg-[#AE4A3E]"
                    : pct > 85
                    ? "bg-[#B78A2F]"
                    : "bg-[#1E3A5F]"
                  : "bg-[#1E3A5F]/40";

                return (
                  <div key={cat.name} className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/60 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-800 truncate mr-2" title={cat.name}>
                        {cat.name}
                      </span>
                      <span className={`text-xs font-bold whitespace-nowrap ${overspent ? "text-[#8A362C]" : "text-gray-900"}`}>
                        {categoryHasBudget
                          ? `${fmtMoneyShort(cat.spent)} / ${fmtMoneyShort(cat.budget)}`
                          : fmtMoneyShort(cat.spent)}
                      </span>
                    </div>

                    <div className="h-2 bg-gray-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all`}
                        style={{ width: categoryHasBudget ? `${Math.min(pct, 100)}%` : "100%" }}
                      />
                    </div>

                    <div className="flex justify-between mt-1 text-[10px]">
                      {categoryHasBudget ? (
                        <>
                          <span className="text-gray-500 font-medium">{pct}% used</span>
                          {overspent ? (
                            <span className="text-[#8A362C] font-semibold">Overspent by {fmtMoneyShort(cat.spent - cat.budget)}</span>
                          ) : (
                            <span className="text-[#2F6042] font-semibold">{fmtMoneyShort(cat.budget - cat.spent)} remaining</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-gray-400 font-medium">Unbudgeted Category</span>
                          <span className="text-gray-500 font-medium">{fmtMoneyShort(cat.spent)} YTD</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">
              No categories matching "{searchTerm}"
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BudgetVsActualCard;
