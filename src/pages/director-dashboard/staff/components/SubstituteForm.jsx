import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddSubstitution, useGetPtoStaff } from "@/hooks";

const TODAY_STR = new Date().toISOString().split("T")[0];

const SubstituteForm = ({ onClose }) => {
  const [form, setForm] = useState({
    absentEmployeeId: "",
    absentEmployeeName: "",
    subEmployeeId: "",
    subEmployeeName: "",
    date: TODAY_STR,
  });
  const [absentDropdownOpen, setAbsentDropdownOpen] = useState(false);
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);
  const [error, setError] = useState("");

  const absentDropdownRef = useRef(null);
  const subDropdownRef = useRef(null);

  const { addSubstitution, isPending } = useAddSubstitution();
  const { staffList, isLoading: staffLoading } = useGetPtoStaff();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        absentDropdownRef.current &&
        !absentDropdownRef.current.closest(".absent-staff-picker")?.contains(e.target)
      ) {
        setAbsentDropdownOpen(false);
      }
      if (
        subDropdownRef.current &&
        !subDropdownRef.current.closest(".sub-staff-picker")?.contains(e.target)
      ) {
        setSubDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const selectAbsentStaff = (staff) => {
    update("absentEmployeeId", staff.id);
    update("absentEmployeeName", staff.name);
    setAbsentDropdownOpen(false);
  };

  const selectSubStaff = (staff) => {
    update("subEmployeeId", staff.id);
    update("subEmployeeName", staff.name);
    setSubDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.absentEmployeeId) {
      setError("Please select the absent staff member.");
      return;
    }
    if (!form.subEmployeeId) {
      setError("Please select the substitute staff member.");
      return;
    }
    if (form.absentEmployeeId === form.subEmployeeId) {
      setError("Absent and substitute staff cannot be the same person.");
      return;
    }
    if (!form.date) {
      setError("Please select a date.");
      return;
    }
    setError("");

    const formData = new FormData();
    formData.append("absent_employee_id", form.absentEmployeeId);
    formData.append("sub_employee_id", form.subEmployeeId);
    formData.append("date", form.date);

    try {
      await addSubstitution(formData);
      onClose();
    } catch {
      // toast already shown by the hook's onError
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Log Substitute</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Record a substitute covering for staff
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Custom Absent Staff Picker ── */}
            <div className="absent-staff-picker relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Absent Staff Member
              </label>

              {/* Trigger button */}
              <button
                type="button"
                onClick={() => {
                  setAbsentDropdownOpen((v) => !v);
                  setSubDropdownOpen(false);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
              >
                <span className={form.absentEmployeeName ? "text-gray-900" : "text-gray-400"}>
                  {form.absentEmployeeName || "Select absent staff..."}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${absentDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown list */}
              <AnimatePresence>
                {absentDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                  >
                    <div ref={absentDropdownRef} className="max-h-56 overflow-y-auto">
                      {staffLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" /> Loading staff...
                        </div>
                      ) : staffList?.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400">No staff found.</div>
                      ) : (
                        staffList?.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => selectAbsentStaff(s)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center justify-between group"
                          >
                            <span className="text-gray-800">{s?.name}</span>
                            {form.absentEmployeeId === s?.id && (
                              <Check size={14} className="text-blue-600" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Custom Substitute Staff Picker ── */}
            <div className="sub-staff-picker relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Substitute Staff Member
              </label>

              {/* Trigger button */}
              <button
                type="button"
                onClick={() => {
                  setSubDropdownOpen((v) => !v);
                  setAbsentDropdownOpen(false);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
              >
                <span className={form.subEmployeeName ? "text-gray-900" : "text-gray-400"}>
                  {form.subEmployeeName || "Select substitute..."}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${subDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown list */}
              <AnimatePresence>
                {subDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                  >
                    <div ref={subDropdownRef} className="max-h-48 overflow-y-auto">
                      {staffLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" /> Loading staff...
                        </div>
                      ) : staffList?.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400">No staff found.</div>
                      ) : (
                        staffList?.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => selectSubStaff(s)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center justify-between group"
                          >
                            <span className="text-gray-800">{s?.name}</span>
                            {form.subEmployeeId === s?.id && (
                              <Check size={14} className="text-blue-600" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Coverage Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white"
              >
                {isPending ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Send size={16} className="mr-2" />
                )}
                {isPending ? "Submitting..." : "Log Substitute"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SubstituteForm;
