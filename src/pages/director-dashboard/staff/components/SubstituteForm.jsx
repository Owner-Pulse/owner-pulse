import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddSubstitution } from "@/hooks";

const TODAY_STR = new Date().toISOString().split("T")[0];

const SubstituteForm = ({ onClose, staff }) => {
  const [form, setForm] = useState({
    absentEmployeeId: "",
    subEmployeeId: "",
    date: TODAY_STR,
  });
  const [error, setError] = useState("");

  const { addSubstitution, isPending } = useAddSubstitution();

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

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
            {/* Absent Staff */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Absent Staff Member
              </label>
              <select
                value={form.absentEmployeeId}
                onChange={(e) => update("absentEmployeeId", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">Select absent staff...</option>
                {staff?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Substitute Staff */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Substitute Staff Member
              </label>
              <select
                value={form.subEmployeeId}
                onChange={(e) => update("subEmployeeId", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">Select substitute...</option>
                {staff?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
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
