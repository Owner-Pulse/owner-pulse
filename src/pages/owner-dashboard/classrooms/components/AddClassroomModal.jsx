import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

const AddClassroomModal = ({ isOpen, form, onFormChange, onSave, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Classroom</h2>
              <p className="text-sm text-gray-500 mt-0.5">Create a new classroom or program</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} className="text-gray-400" /></button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Classroom Name *</label>
                <input type="text" value={form.name} onChange={(e) => onFormChange("name", e.target.value)}
                  placeholder="e.g. VPK C — Oak" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Program</label>
                <input type="text" value={form.program} onChange={(e) => onFormChange("program", e.target.value)}
                  placeholder="e.g. VPK C" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tier</label>
                <select value={form.tier} onChange={(e) => onFormChange("tier", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="preschool">Preschool</option>
                  <option value="k8">K-8</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Capacity *</label>
                <input type="number" value={form.capacity} onChange={(e) => onFormChange("capacity", e.target.value)}
                  placeholder="e.g. 20" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Teacher</label>
                <input type="text" value={form.teacher} onChange={(e) => onFormChange("teacher", e.target.value)}
                  placeholder="e.g. Ms. Smith" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tuition/Seat ($)</label>
                <input type="number" value={form.tuitionPerSeat} onChange={(e) => onFormChange("tuitionPerSeat", e.target.value)}
                  placeholder="e.g. 950" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Monthly Cost ($)</label>
                <input type="number" value={form.monthlyCost} onChange={(e) => onFormChange("monthlyCost", e.target.value)}
                  placeholder="e.g. 8000" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button onClick={onSave}
              className="w-full py-3 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#15294A] transition-colors">
              <Plus size={16} className="inline mr-1.5" /> Add Classroom
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default AddClassroomModal;
