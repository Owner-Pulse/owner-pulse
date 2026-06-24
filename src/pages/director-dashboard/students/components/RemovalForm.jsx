import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const CLASSROOMS = [
  { name: "Age 1 — Bumblebees" }, { name: "Age 2 — Ladybugs" }, { name: "PreK3 — Caterpillars" },
  { name: "PreK4 — Butterflies" }, { name: "VPK — Fireflies" }, { name: "K — Sequoia" },
  { name: "1st — Redwood" }, { name: "2nd — Willow" }, { name: "3rd — Oak" },
  { name: "4th — Maple" }, { name: "5th — Pine" }, { name: "6th — Cedar" },
  { name: "7th — Birch" }, { name: "8th — Aspen" },
];

const RemovalForm = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({ student: "", reason: "transferring", classroom: "", detail: "" });
  const [error, setError] = useState("");
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.student || !form.classroom) { setError("Student and classroom are required."); return; }
    onAdd({
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      student: form.student,
      reason: form.reason,
      classroom: form.classroom,
      detail: form.detail,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Remove Student</h2>
              <p className="text-sm text-gray-500 mt-0.5">Record a student withdrawal from the school</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Student *</label>
                <input type="text" value={form.student} onChange={(e) => update("student", e.target.value)} placeholder="e.g. M. Webb"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Reason</label>
                <select value={form.reason} onChange={(e) => update("reason", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                  <option value="transferring">Transferring</option>
                  <option value="moving">Moving</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="financial">Financial</option>
                  <option value="graduated">Graduated</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Classroom *</label>
              <select value={form.classroom} onChange={(e) => update("classroom", e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                <option value="">Select classroom...</option>
                {CLASSROOMS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Details</label>
              <textarea value={form.detail} onChange={(e) => update("detail", e.target.value)} placeholder="Reason for removal..." rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <Send size={16} className="mr-2" /> Record Removal
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RemovalForm;
