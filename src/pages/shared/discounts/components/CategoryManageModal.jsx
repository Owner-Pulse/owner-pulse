import React, { useState, useEffect } from "react";
import { X, FolderPlus, Loader2, DollarSign, Percent, Info, Layers } from "lucide-react";
import { useCreateDiscountCategory, useUpdateDiscountCategory, useGetSingleCategory } from "@/hooks/discount.hook";

const CategoryManageModal = ({ isOpen, onClose, editingCategory = null }) => {
  const { createCategory, isPending: isCreating } = useCreateDiscountCategory();
  const { updateCategory, isPending: isUpdating } = useUpdateDiscountCategory();
  const isSaving = isCreating || isUpdating;

  // Fetch fresh single category data when editing
  const { category: singleCategory, isLoading: isCategoryLoading } = useGetSingleCategory(
    isOpen && editingCategory?.id ? editingCategory.id : null
  );

  const [formData, setFormData] = useState({
    name: "",
    type: "discount",
    weekly_amount: "",
    discount_percentage: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    const activeCategory = singleCategory || editingCategory;
    if (activeCategory) {
      setFormData({
        name: activeCategory.name || "",
        type: activeCategory.type || "discount",
        weekly_amount: activeCategory.weekly_amount !== undefined ? String(activeCategory.weekly_amount) : "",
        discount_percentage: activeCategory.discount_percentage !== undefined ? String(activeCategory.discount_percentage) : "",
        description: activeCategory.description || "",
        is_active: activeCategory.is_active !== undefined ? Boolean(activeCategory.is_active) : true,
      });
    } else {
      setFormData({
        name: "",
        type: "discount",
        weekly_amount: "",
        discount_percentage: "",
        description: "",
        is_active: true,
      });
    }
  }, [editingCategory, singleCategory, isOpen]);

  // Prevent background scrolling & allow ESC to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      weekly_amount: formData.weekly_amount ? String(formData.weekly_amount) : "0",
      type: formData.type,
      description: formData.description.trim(),
      discount_percentage: formData.discount_percentage ? String(formData.discount_percentage) : "0",
      is_active: formData.is_active ? 1 : 0,
    };

    try {
      if (editingCategory?.id) {
        await updateCategory({ id: editingCategory.id, data: payload });
      } else {
        await createCategory(payload);
      }
      onClose();
    } catch (err) {
      // Toast handles feedback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88dvh] overflow-y-auto p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#B78A2F]/10 flex items-center justify-center text-[#8F6A1F]">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? "Edit Discount Category" : "Create Tuition Discount Category"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Define standard policy parameters & limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Staff Children, Sibling Discount, Military Waiver"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
              >
                <option value="discount">Tuition Discount</option>
                <option value="waiver">Hardship / Full Waiver</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="category_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#1E3A5F] focus:ring-[#1E3A5F]/20 border-gray-300"
                />
                <label htmlFor="category_active" className="text-xs font-medium text-gray-700 cursor-pointer">
                  {formData.is_active ? "Active (Available for applications)" : "Disabled"}
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Standard Weekly Amount ($/wk)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weekly_amount}
                  onChange={(e) => setFormData((p) => ({ ...p, weekly_amount: e.target.value }))}
                  placeholder="e.g. 50.00"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Standard Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData((p) => ({ ...p, discount_percentage: e.target.value }))}
                  placeholder="e.g. 10 or 50"
                  className="w-full pr-8 pl-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                />
                <span className="absolute right-3.5 top-2.5 text-gray-400 text-sm">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Policy Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Eligibility guidelines, qualifying conditions, and documentation rules..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !formData.name.trim()}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#152A45] active:scale-95 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : editingCategory ? (
                "Save Category Changes"
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryManageModal;
