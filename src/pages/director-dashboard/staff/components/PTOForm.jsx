import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const PTOForm = ({ onAdd, onClose, staff }) => {
  const [form, setForm] = useState({ staffId: "", dayType: "sick", days: 1 });
  const [error, setError] = useState("");
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.staffId) { setError("Please select a staff member."); return; }
    onAdd({ id: Date.now(), staffId: Number(form.staffId), dayType: form.dayType, days: Number(form.days), date: new Date().toISOString().split("T")[0] });
    onClose();
  };

  const selected = staff.find((s) => s.id === Number(form.staffId));
  const remaining = selected ? selected.ptoAllowance - selected.ptoUsed : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-xl font-bold text-gray-900">Log PTO</h2><p className="text-sm text-gray-500 mt-0.5">Record time off for a staff member</p></div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} className="text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Staff Member</label>
              <select value={form.staffId} onChange={(e) => update("staffId", e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                <option value="">Select staff...</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} · {s.ptoAllowance - s.ptoUsed}d remaining</option>
                ))}
              </select>
              {remaining !== null && (
                <p className={`text-xs mt-1 ${remaining <= 2 ? "text-red-500" : "text-gray-400"}`}>
                  {remaining} PTO days remaining
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Day Type</label>
                <select value={form.dayType} onChange={(e) => update("dayType", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                  <option value="sick">Sick</option>
                  <option value="personal">Personal</option>
                  <option value="vacation">Vacation</option>
                  <option value="jury">Jury Duty</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Days</label>
                <input type="number" value={form.days} onChange={(e) => update("days", e.target.value)} min={0.5} max={5} step={0.5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white"><Send size={16} className="mr-2" /> Log PTO</Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PTOForm;
