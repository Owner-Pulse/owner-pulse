import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRESCHOOL_PROGRAMS = ["2 Yr Old Room", "PreK3", "PreK4", "VPK", "Summer"];
const K8_PROGRAMS = ["Kindergarten", "1st-8th Grade"];

const AddWaitlistModal = ({ isOpen = true, onClose, onSave, editItem = null }) => {
  const isEdit = !!editItem;

  const [form, setForm] = useState({
    childName: "",
    age: "",
    program: "PreK3",
    parentName: "",
    phone: "",
    email: "",
    source: "Referral",
    notes: "",
  });

  useEffect(() => {
    if (editItem) {
      setForm({
        childName: editItem.childName || editItem.child_name || "",
        age: editItem.age || "",
        program: editItem.program || "PreK3",
        parentName: editItem.parentName || editItem.parent_name || "",
        phone: editItem.phone || "",
        email: editItem.email || "",
        source: editItem.source || "Referral",
        notes: editItem.notes || "",
      });
    } else {
      setForm({
        childName: "",
        age: "",
        program: "PreK3",
        parentName: "",
        phone: "",
        email: "",
        source: "Referral",
        notes: "",
      });
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.childName.trim() || !form.parentName.trim()) return;

    if (onSave) {
      onSave({
        childName: form.childName.trim(),
        age: form.age.trim() || "3 years",
        program: form.program,
        parentName: form.parentName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        source: form.source,
        notes: form.notes.trim(),
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-8 border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#1E3A5F] text-white">
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-[#9DB8D9]" />
              <h2 className="text-base font-bold">
                {isEdit ? "Edit Waitlist Entry" : "Add to Waitlist"}
              </h2>
            </div>
            <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Child Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.childName}
                onChange={(e) => setForm({ ...form, childName: e.target.value })}
                placeholder="e.g. Emmanuel Reyes Jr."
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Age / DOB</label>
                <input
                  type="text"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="e.g. 1.5 years or 2023-05-12"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Desired Program *</label>
                <select
                  value={form.program}
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white"
                >
                  {PRESCHOOL_PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  <option disabled>──────────</option>
                  {K8_PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Parent / Guardian Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.parentName}
                onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                placeholder="e.g. Jasmine Cruz"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="863-844-1579"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="parent@email.com"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Lead Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Facebook">Facebook / Social</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Special Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Special needs, preferred start date, notes..."
                className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs font-bold">
                {isEdit ? "Update Entry" : "Save as Inquiry"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddWaitlistModal;