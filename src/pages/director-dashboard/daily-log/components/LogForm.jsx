import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOG_TYPES = [
  { id: "incident", label: "Incident", desc: "Student incident", icon: AlertTriangle, color: "bg-red-500", light: "bg-red-50 text-red-600" },
  { id: "removal", label: "Removal", desc: "Student removed", icon: null, color: "bg-orange-500", light: "bg-orange-50 text-orange-600" },
];

const LogForm = ({ onAdd, onClose }) => {
  const [logType, setLogType] = useState("incident");
  const [form, setForm] = useState({});
  const [step, setStep] = useState(0);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const base = { id: Date.now(), date: new Date().toISOString().split("T")[0] };
    if (logType === "incident") {
      if (!form.student) return;
      onAdd({ ...base, type: "incident", student: form.student, severity: form.severity || "minor", area: form.area || "Classroom" });
    } else {
      if (!form.student) return;
      onAdd({ ...base, type: "removal", student: form.student, reason: form.reason || "other" });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Log Entry</h2>
              <p className="text-sm text-gray-500 mt-0.5">Record a student incident or removal</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} className="text-gray-400" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {LOG_TYPES.map((lt) => {
                  const Icon = lt.icon;
                  return (
                    <button key={lt.id} type="button" onClick={() => { setLogType(lt.id); setStep(1); }}
                      className="flex flex-col items-center gap-2 p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lt.light}`}>{Icon && <Icon size={24} />}</div>
                      <p className="text-sm font-bold text-gray-900">{lt.label}</p>
                      <p className="text-xs text-gray-500">{lt.desc}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <button type="button" onClick={() => setStep(0)} className="text-xs text-blue-600 hover:underline font-medium">← Change type</button>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-500 font-medium capitalize">{logType} entry</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Student</label>
                  <input type="text" value={form.student || ""} onChange={(e) => update("student", e.target.value)} placeholder="Initials OK" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {logType === "incident" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Severity</label>
                      <div className="flex gap-2">
                        {["minor", "moderate", "major"].map((s) => (
                          <button key={s} type="button" onClick={() => update("severity", s)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              (form.severity || "minor") === s
                                ? s === "minor" ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300"
                                  : s === "moderate" ? "bg-orange-100 text-orange-700 ring-2 ring-orange-300"
                                  : "bg-red-100 text-red-700 ring-2 ring-red-300"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                            }`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Area</label>
                      <select value={form.area || "Classroom"} onChange={(e) => update("area", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                        {["Classroom", "Playground", "Cafeteria", "Hallway", "Bathroom", "Outside"].map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {logType === "removal" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Reason</label>
                    <select value={form.reason || "other"} onChange={(e) => update("reason", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                      <option value="parent_pickup">Parent Pickup</option>
                      <option value="medical">Medical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="transferring">Transferring</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white"><Send size={16} className="mr-2" /> Log Entry</Button>
                </div>
              </>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LogForm;
