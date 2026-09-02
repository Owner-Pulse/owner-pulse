import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2 } from "lucide-react";
import { useGetAllStaffs } from "@/hooks/classroom/classroom.hook";
import SearchableStaffSelect from "./SearchableStaffSelect";

const TIER_OPTIONS = [
  "Preschool",
  "VPK",
  "K-8",
  "After School",
  "Summer Camp",
];

const AddClassroomModal = ({ isOpen, form, onFormChange, onSave, onClose, isEdit, isLoading = false }) => {
  const { staffs, isLoading: isStaffsLoading } = useGetAllStaffs();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Classroom" : "Add Classroom"}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isEdit ? "Modify classroom mapping & financial parameters" : "Create a new classroom or program mapping with Procare IDs"}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Classroom Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Classroom Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => onFormChange("name", e.target.value)}
                    placeholder="e.g. Summit Classroom"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                </div>

                {/* Procare Classroom ID */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Procare Classroom ID *</label>
                  <input
                    type="text"
                    required
                    value={form.procareClassroomId}
                    onChange={(e) => onFormChange("procareClassroomId", e.target.value)}
                    placeholder="e.g. 99009"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] font-mono"
                  />
                </div>

                {/* Tier (Replaces Program per D-09) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tier *</label>
                  <select
                    value={form.tier || "Preschool"}
                    onChange={(e) => onFormChange("tier", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white font-medium text-gray-800"
                  >
                    {TIER_OPTIONS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Capacity *</label>
                  <input
                    type="number"
                    required
                    value={form.capacity}
                    onChange={(e) => onFormChange("capacity", e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                </div>

                {/* Searchable Assigned Teacher (Staff Combobox) */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Assigned Teacher / Staff *</label>
                  <SearchableStaffSelect
                    staffs={staffs}
                    selectedStaffId={form.teacherId}
                    onSelectStaff={(id) => onFormChange("teacherId", id)}
                    isLoading={isStaffsLoading}
                    placeholder="Search or select teacher by name, ID, or role..."
                  />
                </div>

                {/* Tuition ($ per seat / week) per D-09 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tuition ($ per seat / week)</label>
                  <input
                    type="number"
                    value={form.tuitionPerSeat}
                    onChange={(e) => onFormChange("tuitionPerSeat", e.target.value)}
                    placeholder="e.g. 250.00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                </div>

                {/* Monthly Operating Cost */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Monthly Operating Cost ($)</label>
                  <input
                    type="number"
                    value={form.monthlyCost}
                    onChange={(e) => onFormChange("monthlyCost", e.target.value)}
                    placeholder="e.g. 3500.00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={onSave}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#1E3A5F] text-[#FFFFFF] text-sm font-semibold hover:bg-[#15294A] transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  <>
                    <Plus size={16} /> Add Classroom
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddClassroomModal;
