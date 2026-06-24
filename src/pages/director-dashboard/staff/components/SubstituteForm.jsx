import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SubstituteForm = ({ onAdd, onClose, staff }) => {
  const [form, setForm] = useState({ coveringFor: "", subName: "" });
  const [error, setError] = useState("");
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.coveringFor || !form.subName.trim()) { setError("All fields are required."); return; }
    onAdd({ id: Date.now(), date: new Date().toISOString().split("T")[0], coveringFor: form.coveringFor, subName: form.subName.trim(), calledBy: "Director" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-xl font-bold text-gray-900">Log Substitute</h2><p className="text-sm text-gray-500 mt-0.5">Record a substitute covering for staff</p></div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} className="text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Covering For</label>
              <select value={form.coveringFor} onChange={(e) => update("coveringFor", e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                <option value="">Select staff member...</option>
                {staff.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Substitute Name</label>
              <input type="text" value={form.subName} onChange={(e) => update("subName", e.target.value)} placeholder="e.g. Ms. Hart" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white"><Send size={16} className="mr-2" /> Log Substitute</Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SubstituteForm;
