import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddDirectorWaitlist, useUpdateDirectorWaitlist } from "@/hooks";

const PRESCHOOL_PROGRAMS = ["Age 1", "Age 2", "PreK3", "PreK4", "VPK", "Summer"];
const K8_PROGRAMS = ["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

// editItem: pass the full waitlist row object to switch to edit mode
const AddWaitlistModal = ({ isOpen = true, onClose, editItem = null }) => {
  const isEdit = !!editItem;

  const { isPending: isAdding, addWaitlist } = useAddDirectorWaitlist();
  const { isPending: isUpdating, updateWaitlist } = useUpdateDirectorWaitlist();
  const isPending = isAdding || isUpdating;

  const [form, setForm] = useState({
    child: "", program: "PreK3", parent: "", phone: "", email: "", source: "referral",
  });

  // Pre-fill when editing
  useEffect(() => {
    if (editItem) {
      setForm({
        child:   editItem.child_name  ?? "",
        program: editItem.program     ?? "PreK3",
        parent:  editItem.parent_name ?? "",
        phone:   editItem.phone       ?? "",
        email:   editItem.email       ?? "",
        source:  editItem.source      ?? "referral",
      });
    }
  }, [editItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.child.trim() || !form.parent.trim()) return;

    const formData = new FormData();
    formData.append("child_name",  form.child.trim());
    formData.append("program",     form.program);
    formData.append("parent_name", form.parent.trim());
    formData.append("phone",       form.phone);
    formData.append("email",       form.email);
    formData.append("source",      form.source);

    try {
      if (isEdit) {
        await updateWaitlist({ id: editItem.id, payload: formData });
      } else {
        await addWaitlist(formData);
      }
      onClose();
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "adding"} waitlist entry:`, error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEdit ? "Edit Waitlist Entry" : "Add to Waitlist"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {isEdit ? "Update the family's information" : "Register a new family for enrollment"}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Child's Name</label>
                    <input type="text" value={form.child} onChange={(e) => setForm({ ...form, child: e.target.value })}
                      placeholder="e.g. Emma R." required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Program</label>
                    <select value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                      {PRESCHOOL_PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                      <option disabled>──────────</option>
                      {K8_PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Parent/Guardian</label>
                  <input type="text" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })}
                    placeholder="e.g. Sara R." required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="813-555-0000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="parent@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Source</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                    <option value="referral">Referral</option>
                    <option value="website">Website</option>
                    <option value="walkin">Walk-in</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                    {isEdit ? (
                      <>
                        <Pencil size={15} className="mr-2" />
                        {isPending ? "Updating..." : "Update Entry"}
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="mr-2" />
                        {isPending ? "Adding..." : "Add to Waitlist"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddWaitlistModal;