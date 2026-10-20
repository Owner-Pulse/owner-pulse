import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateCategoryBudgets, useDeleteCategoryBudget } from "@/hooks/owner-hook/budget.hook";
import toast from "react-hot-toast";

const fmtMoney = (n) => "$" + Math.round(n ?? 0).toLocaleString();

const DeclareBudgetModal = ({
  isOpen,
  onClose,
  categories = [],
  schoolBudgetLimit = 100000,
  onSuccessRefetch,
  title,
  subtitle,
}) => {
  const { updateCategoryBudget, isPending } = useUpdateCategoryBudgets();
  const { deleteCategoryBudget, isPending: isDeleting } = useDeleteCategoryBudget();
  const [localCategories, setLocalCategories] = useState([]);
  const [removedCategories, setRemovedCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (categories && isOpen) {
      setLocalCategories(
        categories.map((c) => ({
          name: c.category_name || c.name || c.category || "",
          budget: c.budget_limit_numeric ?? c.budgeted_numeric ?? (typeof c.budget === "number" ? c.budget : 0),
          spent: c.spent_amount ?? c.spent_numeric ?? (typeof c.spent === "number" ? c.spent : 0),
          id: c.id,
          type: c.type || "school",
        }))
      );
      setRemovedCategories([]);
      setNewName("");
      setNewBudget("");
      setApiError("");
    }
  }, [categories, isOpen]);

  const handleChange = (index, value) => {
    const numericVal = parseFloat(value) || 0;
    setLocalCategories((prev) => {
      const updated = [...prev];
      updated[index].budget = numericVal;
      return updated;
    });
  };

  const totalAllocated = useMemo(() => {
    return localCategories.reduce((acc, curr) => acc + (curr.budget || 0), 0);
  }, [localCategories]);

  const limitNum = Number(schoolBudgetLimit) || 100000;
  const isExceeded = totalAllocated > limitNum;
  const exceededBy = Math.max(0, totalAllocated - limitNum);
  const remainingHeadroom = Math.max(0, limitNum - totalAllocated);

  const handleAddRow = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setApiError("Enter a category name.");
      return;
    }
    if (localCategories.some((c) => c.name.trim().toLowerCase() === trimmed.toLowerCase())) {
      setApiError("That category is already in the list.");
      return;
    }
    setLocalCategories((prev) => [
      ...prev,
      {
        name: trimmed,
        budget: parseFloat(newBudget) || 0,
        spent: 0,
        id: null,
        type: "school",
        isNew: true,
      },
    ]);
    setNewName("");
    setNewBudget("");
    setApiError("");
  };

  const handleRemoveRow = (index) => {
    setLocalCategories((prev) => {
      const target = prev[index];
      if (target && !target.isNew) {
        setRemovedCategories((current) => [...current, target]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isExceeded || isPending || isDeleting) return;
    if (localCategories.length === 0 && removedCategories.length === 0) return;
    setApiError("");

    try {
      for (const cat of removedCategories) {
        await deleteCategoryBudget({
          id: cat.id || undefined,
          category_name: cat.name,
          type: cat.type || "school",
          remove: true,
          silent: true,
        });
      }

      if (localCategories.length > 0) {
        await updateCategoryBudget({
          silent: true,
          categories: localCategories.map((c) => ({
            category_name: c.name,
            budget_limit: Number(c.budget) || 0,
            type: c.type || "school",
          })),
        });
      }

      toast.success("Budget categories saved.");
      if (onSuccessRefetch) onSuccessRefetch();
      onClose();
    } catch (err) {
      const respData = err?.response?.data;
      const exceededMsg = respData?.exceeded_by_formatted;
      const msg = respData?.message || (exceededMsg ? `Exceeded school budget limit by ${exceededMsg}` : "Failed to update category budgets.");
      setApiError(msg);
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
              <div>
                <h2 className="text-xl font-bold text-gray-900">{title || "Bulk Category Budgets"}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {subtitle || "Allocate spending caps across all expense categories"}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Headroom Context */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>School Budget Ceiling:</span>
                  <span className="font-bold text-gray-900">{fmtMoney(limitNum)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Total Proposed Allocations:</span>
                  <span className={`font-bold ${isExceeded ? "text-[#8A362C]" : "text-gray-900"}`}>
                    {fmtMoney(totalAllocated)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 border-t border-slate-200/60 pt-1.5">
                  <span>Unallocated Headroom:</span>
                  <span className={`font-bold ${isExceeded ? "text-[#8A362C]" : "text-[#2F6042]"}`}>
                    {isExceeded ? `-$${Math.round(exceededBy).toLocaleString()} (Exceeded)` : fmtMoney(remainingHeadroom)}
                  </span>
                </div>
              </div>

              {/* Exceeded Warning */}
              {isExceeded && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                  <AlertTriangle size={16} className="shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Total category allocations exceed school limit!</span>
                    <p className="mt-0.5 text-red-600">
                      Total ({fmtMoney(totalAllocated)}) exceeds ceiling ({fmtMoney(limitNum)}) by <span className="font-bold">{fmtMoney(exceededBy)}</span>.
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

              {/* Form Category Inputs */}
              <form id="bulk-category-budget-form" onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New category name"
                    className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
                  />
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-10 pl-7 pr-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="h-10 px-3 rounded-xl bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                  {localCategories.map((cat, idx) => (
                    <div key={cat.name + idx} className="flex flex-col space-y-1.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-bold text-gray-800 truncate">{cat.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {cat.spent !== undefined && (
                            <span className="text-[10px] text-gray-500 font-medium">
                              Spent: ${Math.round(cat.spent).toLocaleString()}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600"
                            title="Delete category"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={cat.budget || ""}
                          onChange={(e) => handleChange(idx, e.target.value)}
                          placeholder="0.00"
                          className="w-full h-10 pl-7 pr-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Total Allocated</p>
                <p className={`text-base font-extrabold ${isExceeded ? "text-[#8A362C]" : "text-[#1E3A5F]"}`}>
                  {fmtMoney(totalAllocated)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="bulk-category-budget-form"
                  disabled={isExceeded || isPending || isDeleting}
                  className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 h-10 px-4 disabled:opacity-50"
                >
                  {isPending || isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save All
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeclareBudgetModal;
