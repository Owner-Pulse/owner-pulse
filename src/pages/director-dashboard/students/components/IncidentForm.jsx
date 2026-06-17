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

const AREAS = ["Classroom", "Playground", "Cafeteria", "Hallway", "Bathroom", "Outside", "Pickup/Dropoff"];

const IncidentForm = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({
    student: "", severity: "minor", classroom: "", area: "Classroom", description: "",
  });
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.student || !form.classroom) { setError("Student and classroom are required."); return; }
    onAdd({
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      student: form.student,
      severity: form.severity,
      classroom: form.classroom,
      area: form.area,
      description: form.description,
      loggedBy: "Director",
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
              <h2 className="text-xl font-bold text-gray-900">Log Incident</h2>
              <p className="text-sm text-gray-500 mt-0.5">Record a safety, behavior, or medical event</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Student *</label>
                <input type="text" value={form.student} onChange={(e) => update("student", e.target.value)} placeholder="e.g. J. Martinez"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Severity</label>
                <div className="flex gap-2">
                  {["minor", "moderate", "major"].map((s) => (
                    <button key={s} type="button" onClick={() => update("severity", s)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        form.severity === s
                          ? s === "minor" ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300"
                            : s === "moderate" ? "bg-orange-100 text-orange-700 ring-2 ring-orange-300"
                            : "bg-red-100 text-red-700 ring-2 ring-red-300"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                  ))}
                </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Area</label>
                <select value={form.area} onChange={(e) => update("area", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type</label>
                <select value={form.incidentType || "behavior"} onChange={(e) => update("incidentType", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                  <option value="behavior">Behavior</option>
                  <option value="safety">Safety</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Brief description of what happened..." rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                <Send size={16} className="mr-2" /> Log Incident
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default IncidentForm;
