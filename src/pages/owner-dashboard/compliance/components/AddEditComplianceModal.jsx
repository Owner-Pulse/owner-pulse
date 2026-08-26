import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Calendar, ShieldCheck, Building2, User, FileText, CheckSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AddEditComplianceModal = ({ isOpen, onClose, onSave, editItem = null, userRole = "owner", isLoading = false }) => {
  const [formData, setFormData] = useState({
    item: "",
    authority: "",
    expires: "",
    category: "regulatory",
    ownerRole: userRole === "director" ? "director" : "owner",
    notes: "",
    docChecklist: [],
    shopReminder: "",
  });

  const [newChecklistText, setNewChecklistText] = useState("");

  useEffect(() => {
    if (editItem) {
      setFormData({
        item: editItem.item || editItem.name || "",
        authority: editItem.authority || editItem.authority_agency || "",
        expires: editItem.expires || (editItem.expiration_date ? editItem.expiration_date.slice(0, 10) : "") || "",
        category: editItem.category || "regulatory",
        ownerRole: editItem.ownerRole || editItem.responsible_role || (userRole === "director" ? "director" : "owner"),
        notes: editItem.notes || editItem.renewal_notes || "",
        docChecklist: editItem.docChecklist
          ? editItem.docChecklist.map((c) => (typeof c === "string" ? { text: c, checked: false } : c))
          : editItem.checklists
          ? editItem.checklists.map((c) => ({ id: c.id, text: c.title || c.text || "", checked: c.is_completed ?? c.checked ?? false }))
          : [],
        shopReminder: editItem.shopReminder || (editItem.reminder_window_date ? editItem.reminder_window_date.slice(0, 10) : "") || "",
      });
    } else {
      setFormData({
        item: "",
        authority: "",
        expires: "",
        category: "regulatory",
        ownerRole: userRole === "director" ? "director" : "owner",
        notes: "",
        docChecklist: [],
        shopReminder: "",
      });
    }
  }, [editItem, isOpen, userRole]);

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      docChecklist: [...prev.docChecklist, { text: newChecklistText.trim(), checked: false }],
    }));
    setNewChecklistText("");
  };

  const handleRemoveChecklistItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      docChecklist: prev.docChecklist.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.item.trim() || !formData.expires) return;
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden my-8 border border-gray-100"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#1E3A5F] text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#9DB8D9]" />
              <h2 className="text-base md:text-lg font-bold">
                {editItem ? "Edit Compliance Item" : "Add New Compliance Item"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Item Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Item / Requirement Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. CPR & First Aid Certification"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                className="text-xs md:text-sm"
              />
            </div>

            {/* Grid 2-col: Authority & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Building2 size={12} /> Authority / Agency
                </label>
                <Input
                  type="text"
                  placeholder="e.g. FL DCF / Red Cross"
                  value={formData.authority}
                  onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                  className="text-xs md:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  <option value="regulatory">Regulatory</option>
                  <option value="operational">Operational</option>
                  <option value="safety">Safety / Facility</option>
                  <option value="academic">Academic / Testing</option>
                </select>
              </div>
            </div>

            {/* Grid 2-col: Expiry Date & Owner Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Expiration Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  required
                  value={formData.expires}
                  onChange={(e) => setFormData({ ...formData, expires: e.target.value })}
                  className="text-xs md:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <User size={12} /> Primary Responsible Role
                </label>
                <select
                  value={formData.ownerRole}
                  onChange={(e) => setFormData({ ...formData, ownerRole: e.target.value })}
                  className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  <option value="director">Director Owned</option>
                  <option value="owner">Owner Owned</option>
                </select>
              </div>
            </div>

            {/* Shop Reminder Date (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Advance Shopping / Reminder Window Date (Optional)
              </label>
              <Input
                type="date"
                value={formData.shopReminder}
                onChange={(e) => setFormData({ ...formData, shopReminder: e.target.value })}
                className="text-xs md:text-sm"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Set a 60-day or custom window to start shopping/preparing renewals.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <FileText size={12} /> Renewal Notes & Operational Instructions
              </label>
              <textarea
                rows={2}
                placeholder="Add special instructions or renewal steps..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-md border border-gray-200 bg-white p-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>

            {/* Document Checklist Items */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-[#1E3A5F] mb-1.5 flex items-center gap-1">
                <CheckSquare size={14} /> Pre-Renewal Required Document Checklist
              </label>

              <div className="flex items-center gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="e.g. Updated liability certificate"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  className="text-xs"
                />
                <Button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs shrink-0"
                >
                  <Plus size={14} /> Add
                </Button>
              </div>

              {formData.docChecklist.length > 0 && (
                <ul className="space-y-1.5 bg-[#1E3A5F]/[0.03] p-2.5 rounded-lg border border-[#1E3A5F]/10 max-h-36 overflow-y-auto">
                  {formData.docChecklist.map((c, idx) => (
                    <li key={idx} className="flex items-center justify-between text-xs text-gray-700 bg-white px-2.5 py-1.5 rounded border border-gray-100 shadow-2xs">
                      <span className="truncate pr-2">{c.text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(idx)}
                        className="text-red-500 hover:text-red-700 p-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="text-xs md:text-sm">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm font-semibold">
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : editItem ? (
                  "Save Changes"
                ) : (
                  "Create Item"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddEditComplianceModal;
