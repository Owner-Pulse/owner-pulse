import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Save, AlertTriangle, RotateCcw, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateCategoryBudgets, useDeleteCategoryBudget } from "@/hooks/owner-hook/budget.hook";

const fmtMoney = (n) => "$" + Math.round(n ?? 0).toLocaleString();
const fmtMoneyDetailed = (n) => {
  if (n === undefined || n === null) return "$0.00";
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const EditCategoryBudgetModal = ({
  isOpen,
  onClose,
  category,
  summary,
  categories = [],
  onSuccess,
}) => {
  const { updateCategoryBudget, isPending: isUpdating } = useUpdateCategoryBudgets();
  const { deleteCategoryBudget, isPending: isDeleting } = useDeleteCategoryBudget();

  const [budgetLimit, setBudgetLimit] = useState("");
  const [notes, setNotes] = useState("");
  const [apiError, setApiError] = useState("");

  const catName = category?.category_name || category?.name || "";
  const currentBudget = category?.budget_limit_numeric ?? category?.budgeted_numeric ?? (typeof category?.budget === "number" ? category.budget : 0);
  const spentAmount = category?.spent_amount ?? category?.spent_numeric ?? (typeof category?.spent === "number" ? category.spent : 0);
  const hasCustomBudget = Boolean(category?.has_custom_budget || category?.is_custom_limit || (category?.id && currentBudget > 0));

  const schoolBudgetLimit = Number(summary?.school_budget_limit ?? 100000);
  const totalAllocated = Number(summary?.total_allocated_category_budget ?? categories.reduce((sum, c) => sum + (c.budget_limit_numeric ?? c.budgeted_numeric ?? c.budget ?? 0), 0));

  useEffect(() => {
    if (category && isOpen) {
      setBudgetLimit(currentBudget > 0 ? String(currentBudget) : "");
      setNotes(category?.notes || "");
      setApiError("");
    }
  }, [category, isOpen, currentBudget]);

  const newLimitNum = parseFloat(budgetLimit) || 0;
  const oldLimitNum = currentBudget;

  // Potential total if this category is changed
  const potentialTotal = useMemo(() => {
    return Math.max(0, totalAllocated - oldLimitNum + newLimitNum);
  }, [totalAllocated, oldLimitNum, newLimitNum]);

  const isExceeded = potentialTotal > schoolBudgetLimit;
  const exceededBy = Math.max(0, potentialTotal - schoolBudgetLimit);
  const potentialHeadroom = Math.max(0, schoolBudgetLimit - potentialTotal);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!catName || isExceeded || isUpdating) return;
    setApiError("");

    try {
      await updateCategoryBudget({
        category_name: catName,
        budget_limit: newLimitNum,
        type: category?.type || "school",
        notes: notes.trim() || undefined,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const respData = err?.response?.data;
      const exceededMsg = respData?.exceeded_by_formatted;
      const msg = respData?.message || (exceededMsg ? `Exceeded school budget limit by ${exceededMsg}` : "Failed to update category budget.");
      setApiError(msg);
    }
  };

  const handleReset = async () => {
    if (!catName || isDeleting) return;
    setApiError("");

    try {
      if (category?.id) {
        await deleteCategoryBudget(category.id);
      } else {
        await deleteCategoryBudget({ category_name: catName });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to reset category budget limit.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F]">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Set Category Budget Limit</h2>
                  <p className="text-xs text-gray-500 truncate max-w-xs sm:max-w-md">{catName}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Summary Headroom Context Banner */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>School Budget Ceiling:</span>
                  <span className="font-bold text-gray-900">{fmtMoney(schoolBudgetLimit)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Current Spent YTD:</span>
                  <span className="font-semibold text-gray-800">{fmtMoneyDetailed(spentAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 border-t border-slate-200/60 pt-1.5">
                  <span>Remaining Unallocated Headroom:</span>
                  <span className={`font-bold ${isExceeded ? "text-[#8A362C]" : "text-[#2F6042]"}`}>
                    {isExceeded ? `-$${Math.round(exceededBy).toLocaleString()} (Exceeded)` : fmtMoney(potentialHeadroom)}
                  </span>
                </div>
              </div>

              {/* Budget Limit Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Category Budget Limit ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    placeholder="e.g. 25000.00"
                    className={`w-full h-11 pl-7 pr-3 rounded-xl border text-sm font-semibold transition-all ${
                      isExceeded
                        ? "border-red-400 focus:ring-2 focus:ring-red-200 bg-red-50/20 text-red-900"
                        : "border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] text-gray-900"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Custom dollar ceiling allocated specifically for {catName}
                </p>
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Allocation Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Allocated for 2026 building maintenance and utilities"
                  rows={2}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] resize-none"
                />
              </div>

              {/* Exceeded Ceiling Warning */}
              {isExceeded && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                  <AlertTriangle size={16} className="shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Total category budget exceeds school limit!</span>
                    <p className="mt-0.5 text-red-600">
                      Proposed total ({fmtMoney(potentialTotal)}) exceeds school limit ({fmtMoney(schoolBudgetLimit)}) by <span className="font-bold">{fmtMoney(exceededBy)}</span>. Lower the limit to save.
                    </p>
                  </div>
                </div>
              )}

              {/* API Error Message */}
              {apiError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                {hasCustomBudget ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isDeleting || isUpdating}
                    className="border-red-200 text-red-600 hover:bg-red-50 text-xs rounded-xl flex items-center gap-1.5"
                    title="Reset to default unallocated fallback"
                  >
                    {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                    <span>Reset to Default</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isUpdating}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  {hasCustomBudget && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isUpdating}
                      className="text-xs rounded-xl"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isExceeded || isUpdating || !budgetLimit || newLimitNum <= 0}
                    className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 px-4 h-10 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Save Limit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditCategoryBudgetModal;
