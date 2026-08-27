import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetUser } from "@/hooks/auth/user-details.hook";
import { useCreateDirectorMaintenance, useUpdateDirectorMaintenance } from "@/hooks/director-hook/maintenance.hook";

import toast from "react-hot-toast";

const ASSIGNED_TO_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "handyman", label: "Handyman" },
  { value: "cleaning", label: "Cleaning Company" },
  { value: "camera", label: "Camera Person" },
  { value: "ac", label: "AC Person" },
  { value: "pest", label: "Pest Control" },
  { value: "staff", label: "Staff Member" },
  { value: "other", label: "Other" },
];

const STAFF_ROSTER = [
  "Ms. Alvarez", "Ms. Soto", "Ms. Patel", "Ms. Rivera", "Ms. Brooks",
  "Mr. Nguyen", "Ms. Cohen", "Ms. Diaz", "Mr. Park", "Mr. O'Brien",
  "Ms. Hassan", "Mr. Levine", "Ms. Foster", "Mr. Tate", "Ms. Crane",
];

const AddMaintenanceForm = ({ onAdd, onClose, editItem }) => {
  const { user } = useGetUser();
  const { createMaintenance, isPending: isCreating } = useCreateDirectorMaintenance();
  const { updateMaintenance, isPending: isUpdating } = useUpdateDirectorMaintenance();
  const isPending = isCreating || isUpdating;

  const [form, setForm] = useState(() => {
    if (editItem) {
      let initialAssignedTo = "";
      let initialAssignedStaff = "";
      let initialAssignedOther = "";

      const label = editItem.assignedTo || "";
      if (label.startsWith("Staff Member:")) {
        initialAssignedTo = "staff";
        initialAssignedStaff = label.replace("Staff Member:", "").trim();
      } else if (label.startsWith("Other:")) {
        initialAssignedTo = "other";
        initialAssignedOther = label.replace("Other:", "").trim();
      } else {
        const found = ASSIGNED_TO_OPTIONS.find((o) => o.label === label || o.value === label);
        initialAssignedTo = found ? found.value : "";
      }

      return {
        location: editItem.location || "",
        issue: editItem.issue || "",
        priority: editItem.priority || "medium",
        estCost: editItem.estCost || "",
        assignedTo: initialAssignedTo,
        assignedStaff: initialAssignedStaff,
        assignedOther: initialAssignedOther,
      };
    }
    return {
      location: "",
      issue: "",
      priority: "medium",
      estCost: "",
      assignedTo: "",
      assignedStaff: "",
      assignedOther: "",
    };
  });

  const [error, setError] = useState("");
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.location.trim()) { setError("Location is required."); return; }
    if (!form.issue.trim()) { setError("Issue description is required."); return; }
    if (!form.assignedTo) { setError("Please select who this is assigned to."); return; }
    if (form.assignedTo === "staff" && !form.assignedStaff) { setError("Please select a staff member."); return; }
    if (form.assignedTo === "other" && !form.assignedOther.trim()) { setError("Please describe who this is assigned to."); return; }

    let assignedLabel = ASSIGNED_TO_OPTIONS.find((o) => o.value === form.assignedTo)?.label || form.assignedTo;
    if (form.assignedTo === "staff") assignedLabel += `: ${form.assignedStaff}`;
    if (form.assignedTo === "other") assignedLabel += `: ${form.assignedOther}`;

    const payload = {
        priority: form.priority,
        location: form.location.trim(),
        description: form.issue.trim(),
        cost: Number(form.estCost) || 0,
        assign_to: assignedLabel,
    };

    try {
        if (editItem) {
            await updateMaintenance({ id: editItem.id, payload });
        } else {
            await createMaintenance(payload);
        }
        
        if (onAdd) {
          onAdd({
            id: editItem ? editItem.id : Date.now(),
            location: form.location.trim(),
            issue: form.issue.trim(),
            priority: form.priority,
            status: editItem ? editItem.status : "open",
            logged: editItem ? editItem.logged : new Date().toISOString().split("T")[0],
            estCost: Number(form.estCost) || 0,
            submittedBy: editItem ? editItem.submittedBy : (user?.name || "Director"),
            assignedTo: form.assignedTo,
            assignedLabel,
          });
        }
        
        onClose();
    } catch (err) {
        toast.error(err?.response?.data?.message || "Maintenance request processing failed");
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editItem ? "Edit Maintenance Request" : "New Maintenance Request"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {editItem ? "Update the facility issue details" : "Report a facility issue"}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Location *</label>
              <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. K — Sequoia, Cafeteria"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Issue Description *</label>
              <textarea value={form.issue} onChange={(e) => update("issue", e.target.value)}
                placeholder="Describe the problem clearly…" rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Priority</label>
                <select value={form.priority} onChange={(e) => update("priority", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white">
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Est. Cost ($)</label>
                <input type="number" value={form.estCost} onChange={(e) => update("estCost", e.target.value)}
                  placeholder="0.00" min={0}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Assigned To *</label>
              <select value={form.assignedTo} onChange={(e) => update("assignedTo", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white">
                <option value="">Select who handles this</option>
                {ASSIGNED_TO_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>

            {form.assignedTo === "staff" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Which staff member? *</label>
                <select value={form.assignedStaff} onChange={(e) => update("assignedStaff", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white">
                  <option value="">Select staff member</option>
                  {STAFF_ROSTER.map((name) => (<option key={name} value={name}>{name}</option>))}
                </select>
              </div>
            )}

            {form.assignedTo === "other" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Describe who *</label>
                <input type="text" value={form.assignedOther} onChange={(e) => update("assignedOther", e.target.value)}
                  placeholder="e.g. Electrician, Plumber..." maxLength={100}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]" />
              </div>
            )}

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
                {isPending ? "Submitting..." : editItem ? "Update Request" : "Submit Request"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddMaintenanceForm;
