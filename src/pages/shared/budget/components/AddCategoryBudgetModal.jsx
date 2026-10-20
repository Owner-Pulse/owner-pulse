import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateCategoryBudgets } from "@/hooks/owner-hook/budget.hook";

const fmtMoney = (n) => "$" + Math.round(n ?? 0).toLocaleString();

const AddCategoryBudgetModal = ({
  isOpen,
  onClose,
  categories = [],
  summary,
  schoolBudgetLimit = 0,
  onSuccess,
}) => {
  const { updateCategoryBudget, isPending } = useUpdateCategoryBudgets();
  const [name, setName] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [notes, setNotes] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setBudgetLimit("");
      setNotes("");
      setApiError("");
    }
  }, [isOpen]);

  const schoolLimit = Number(summary?.school_budget_limit ?? schoolBudgetLimit ?? 0);
  const totalAllocated = Number(
    summary?.total_allocated_category_budget ??
      categories.reduce((sum, c) => sum + (Number(c.budget_limit_numeric ?? c.budgeted_numeric ?? c.budget) || 0), 0)
  );
  const newLimitNum = parseFloat(budgetLimit) || 0;
  const potentialTotal = totalAllocated + newLimitNum;
  const isExceeded = schoolLimit > 0 && potentialTotal > schoolLimit;
  const exceededBy = Math.max(0, potentialTotal - schoolLimit);

  const existingNames = useMemo(
    () =>
      categories
        .map((c) => (c.category_name || c.name || c.category || "").trim().toLowerCase())
        .filter(Boolean),
    [categories]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isPending) return;
    setApiError("");

    if (existingNames.includes(trimmed.toLowerCase())) {
      setApiError("That category is already in the budget.");
      return;
    }
    if (isExceeded) return;

    try {
      await updateCategoryBudget({
        create: true,
        category_name: trimmed,
        budget_limit: newLimitNum,
        type: "school",
        notes: notes.trim() || undefined,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to add budget category.");
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Add Budget Category</h2>
                <p className="text-xs text-gray-500 mt-0.5">Create a category and set its budget</p>
              </div>
              <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex justify-between text-slate-600">
                <span>Unallocated headroom</span>
                <span className={`font-bold ${isExceeded ? "text-[#8A362C]" : "text-[#2F6042]"}`}>
                  {schoolLimit > 0 ? fmtMoney(Math.max(0, schoolLimit - potentialTotal)) : "No school ceiling set"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Classroom Supplies"
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Budget amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    placeholder="0.00"
                    className={`w-full h-11 pl-7 pr-3 rounded-xl border text-sm font-semibold ${
                      isExceeded
                        ? "border-red-400 bg-red-50/20 text-red-900"
                        : "border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="What this category is for"
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] resize-none"
                />
              </div>

              {isExceeded && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>
                    This amount exceeds the school budget by <span className="font-bold">{fmtMoney(exceededBy)}</span>.
                  </span>
                </div>
              )}

              {apiError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="text-xs rounded-xl">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || isExceeded || !name.trim() || budgetLimit === ""}
                  className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 px-4 h-10 disabled:opacity-50"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {isPending ? "Adding..." : "Add Category"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddCategoryBudgetModal;
