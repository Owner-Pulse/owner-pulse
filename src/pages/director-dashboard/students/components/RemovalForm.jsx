import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";

const RemovalForm = ({ onAdd, onClose }) => {
  const { classrooms } = useGetAllClassrooms();
  const [form, setForm] = useState({
    student: "",
    reason: "transferring",
    classroom: "",
    detail: "",
    date: new Date().toISOString().split("T")[0],
    parentNotified: "Yes"
  });
  const [error, setError] = useState("");
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.student || !form.classroom) { setError("Student and classroom are required."); return; }
    onAdd({
      id: Date.now(),
      date: form.date,
      student: form.student,
      reason: form.reason,
      classroom: form.classroom,
      detail: form.detail,
      parentNotified: form.parentNotified,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Remove Student</h2>
              <p className="text-sm text-gray-500 mt-0.5">Record a student withdrawal from the school registry</p>
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Reason</label>
                <select value={form.reason} onChange={(e) => update("reason", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 appearance-none bg-white">
                  <option value="transferring">Transferring</option>
                  <option value="moving">Moving</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="financial">Financial</option>
                  <option value="graduated">Graduated</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Effective Date *</label>
                <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Parent Notification Received</label>
                <select value={form.parentNotified} onChange={(e) => update("parentNotified", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 appearance-none bg-white">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Classroom *</label>
              <select value={form.classroom} onChange={(e) => update("classroom", e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 appearance-none bg-white">
                <option value="">Select classroom...</option>
                {classrooms.map((c) => (
                  <option key={c.id || c.classroom_name} value={c.classroom_name || c.name}>
                    {c.classroom_name || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Details</label>
              <textarea value={form.detail} onChange={(e) => update("detail", e.target.value)} placeholder="Reason for removal..." rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 resize-none" />
            </div>

            {/* Retention Notice Box */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-xl flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-normal font-medium">
                <strong>Retention Notice:</strong> Removed student records are kept in this registry for exactly 60 days for compliance auditing, after which they will be permanently purged.
              </p>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl">
                <Send size={15} className="mr-1.5 inline" /> Record Removal
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RemovalForm;
