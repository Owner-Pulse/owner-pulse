import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddPto } from "@/hooks";

const TODAY_STR = new Date().toISOString().split("T")[0];

const PTOForm = ({ onClose, staff }) => {
  const [form, setForm] = useState({
    staffId: "",
    dayType: "sick",
    days: 1,
    date: TODAY_STR,
  });
  const [error, setError] = useState("");

  const { addPto, isPending } = useAddPto();

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.staffId) {
      setError("Please select a staff member.");
      return;
    }
    if (!form.date) {
      setError("Please select a date.");
      return;
    }
    setError("");

    const formData = new FormData();
    formData.append("employee_id", form.staffId);
    formData.append("day_type", form.dayType);
    formData.append("days", form.days);
    formData.append("date", form.date);

    try {
      await addPto(formData);
      onClose();
    } catch {
      // toast already shown by the hook's onError
    }
  };

  const selected = staff?.find((s) => s.id === Number(form.staffId));
  const remaining = selected ? selected.ptoAllowance - selected.ptoUsed : null;

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
              <h2 className="text-xl font-bold text-gray-900">Log PTO</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Record time off for a staff member
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
            {/* Staff Member */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Staff Member
              </label>
              <select
                value={form.staffId}
                onChange={(e) => update("staffId", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">Select staff...</option>
                {staff?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.ptoAllowance - s.ptoUsed}d remaining
                  </option>
                ))}
              </select>
              {remaining !== null && (
                <p
                  className={`text-xs mt-1 ${
                    remaining <= 2 ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {remaining} PTO days remaining
                </p>
              )}
            </div>

            {/* Day Type + Days */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Day Type
                </label>
                <select
                  value={form.dayType}
                  onChange={(e) => update("dayType", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="sick">Sick</option>
                  <option value="personal">Personal</option>
                  <option value="vacation">Vacation</option>
                  <option value="jury">Jury Duty</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Days <span className="text-gray-400 font-normal">(1–10)</span>
                </label>
                <input
                  type="number"
                  value={form.days}
                  onChange={(e) => update("days", e.target.value)}
                  min={1}
                  max={10}
                  step={1}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                PTO Date
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
                {isPending ? "Submitting..." : "Log PTO"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PTOForm;
