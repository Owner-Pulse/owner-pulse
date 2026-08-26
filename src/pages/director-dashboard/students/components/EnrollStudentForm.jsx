import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const EnrollStudentForm = ({ onAdd, onClose, displayClassrooms = [], isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    childId: "",
    personId: "",
    dob: "",
    gender: "",
    classroom: "",
    parent: "",
    phone: "",
    email: "",
    status: "",
    enrollmentDate: "",
    allergies: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.classroom) return;
    onAdd(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end" onClick={onClose}>
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
            <div>
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Procare Student Registration</h3>
              <p className="text-[11px] text-slate-400">Enroll new child & attach guardian record</p>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs flex-1">
            {/* ID Fields */}
            <div className="grid grid-cols-2 gap-3 bg-blue-50/40 p-3 rounded-xl border border-blue-100/60">
              <div>
                <label className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-1">Procare Child ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1042"
                  value={formData.childId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, childId: e.target.value }))}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 font-mono text-xs text-blue-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-1">Procare Person ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5081"
                  value={formData.personId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, personId: e.target.value }))}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 font-mono text-xs text-blue-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Liam T. Miller"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
              />
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Gender *</label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Classroom Selector Dropdown & Enrollment Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Assign Classroom *</label>
                <select
                  required
                  value={formData.classroom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, classroom: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none bg-white"
                >
                  <option value="" disabled>Select Classroom</option>
                  {displayClassrooms.map((cls) => (
                    <option key={cls.id || cls.name} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Enrollment Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                >
                  <option value="" disabled>Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Pre-Registered">Pre-Registered</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>

            {/* Enrollment date & Allergies */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Enrollment Date *</label>
                <input
                  type="date"
                  required
                  value={formData.enrollmentDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, enrollmentDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Medical/Allergy Alerts</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData((prev) => ({ ...prev, allergies: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                  placeholder="e.g. Peanuts, None"
                />
              </div>
            </div>

            {/* Contact parent section */}
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-[10px] font-extrabold text-blue-650 uppercase tracking-wider mb-2">Primary Parent Contact</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Parent Name *"
                  required
                  value={formData.parent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, parent: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Phone Number *"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 text-xs rounded-xl border-slate-200 text-gray-655"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-9 text-xs bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl font-bold"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Register & Enroll
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnrollStudentForm;
