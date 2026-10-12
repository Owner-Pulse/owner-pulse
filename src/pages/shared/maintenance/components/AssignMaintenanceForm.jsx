import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetAllDirector } from "@/hooks/owner-hook/create-director.hook";
import { useCreateOwnerMaintenance } from "@/hooks/owner-hook/maintenance.hook";

const ALL_DIRECTORS = "all";

/**
 * AssignMaintenanceForm — Owner assigns a maintenance request to one director or to all of them
 */
const AssignMaintenanceForm = ({ onClose }) => {
  const { allDirector, isLoading: isDirectorsLoading } = useGetAllDirector();
  const { createMaintenance, isPending } = useCreateOwnerMaintenance();
  const directors = Array.isArray(allDirector) ? allDirector : [];

  const [form, setForm] = useState({
    description: "",
    location: "",
    priority: "medium",
    cost: "",
    directorId: ALL_DIRECTORS,
  });
  const [error, setError] = useState("");
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.location.trim()) { setError("Location is required."); return; }

    const payload = {
      priority: form.priority,
      location: form.location.trim(),
      description: form.description.trim(),
    };
    // An empty cost is left out, not sent as 0
    if (String(form.cost).trim() !== "") payload.cost = String(form.cost).trim();
    // No director_id means All Directors
    if (form.directorId !== ALL_DIRECTORS) payload.director_id = Number(form.directorId);

    try {
      await createMaintenance(payload);
      onClose();
    } catch (err) {
      // toast handled in hook
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900">Assign Maintenance to Director</h2>
              <p className="text-sm text-gray-500 mt-0.5">The director will see it under "Assigned to me"</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer shrink-0">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description *</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                placeholder="Describe what needs to be done…" rows={3} maxLength={2000}
                className={`${inputClass} resize-none`} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Location *</label>
              <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. K — Sequoia, Cafeteria" maxLength={255}
                className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Priority</label>
                <select value={form.priority} onChange={(e) => update("priority", e.target.value)}
                  className={`${inputClass} bg-white`}>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Est. Cost ($) <span className="font-normal text-gray-400">optional</span></label>
                <input type="number" value={form.cost} onChange={(e) => update("cost", e.target.value)}
                  placeholder="0.00" min={0} step="0.01"
                  className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Director</label>
              <select value={form.directorId} onChange={(e) => update("directorId", e.target.value)}
                disabled={isDirectorsLoading}
                className={`${inputClass} bg-white`}>
                <option value={ALL_DIRECTORS}>All Directors</option>
                {directors.map((dir) => (
                  <option key={dir.id} value={dir.id}>{dir.name || `Director #${dir.id}`}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#AE4A3E]/10 rounded-xl text-xs text-[#8A362C] font-medium">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={isPending} className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                {isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Send size={16} className="mr-2" />
                )}
                {isPending ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AssignMaintenanceForm;
