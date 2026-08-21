import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";

const AtRiskForm = ({ onAdd, onClose }) => {
  const { classrooms } = useGetAllClassrooms();
  const [form, setForm] = useState({
    student: "",
    reason: "financial",
    grade: "",
    detail: "",
    flagged: new Date().toISOString().split("T")[0],
    status: "intervening"
  });
  const [error, setError] = useState("");

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.student || !form.grade) { setError("Student and Classroom are required."); return; }
    onAdd(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add At-Risk Student</h2>
              <p className="text-sm text-gray-500 mt-0.5">Flag a student showing early signs of potential withdrawal</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Student Name *</label>
                <input type="text" value={form.student} onChange={(e) => update("student", e.target.value)} placeholder="e.g. Liam T."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Risk Category</label>
                <select value={form.reason} onChange={(e) => update("reason", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 appearance-none bg-white">
                  <option value="financial">Financial Concerns</option>
                  <option value="transferring">Transferring Intent</option>
                  <option value="moving">Relocation/Moving</option>
                  <option value="behavioral">Behavioral Challenges</option>
                  <option value="other">Other Concerns</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Flag Date *</label>
                <input type="date" value={form.flagged} onChange={(e) => update("flagged", e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Classroom *</label>
                <select value={form.grade} onChange={(e) => update("grade", e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 appearance-none bg-white">
                  <option value="">Select classroom...</option>
                  {classrooms.map((c) => (
                    <option key={c.id || c.classroom_name} value={c.classroom_name || c.name}>
                      {c.classroom_name || c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Risk Details & Intervention Notes</label>
              <textarea value={form.detail} onChange={(e) => update("detail", e.target.value)} placeholder="Detail the situation or early warning signs observed..." rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 resize-none" />
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl">
                <Send size={15} className="mr-1.5 inline" /> Flag Student
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AtRiskForm;
