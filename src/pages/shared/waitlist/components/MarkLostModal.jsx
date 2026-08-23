import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

const MarkLostModal = ({ isOpen, onClose, entry, onMarkLost, isPending = false }) => {
  const [reason, setReason] = useState("Financial / Pricing");

  if (!isOpen || !entry) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onMarkLost(entry.id, reason);
      onClose();
    } catch (err) {
      // Error handled by mutation toast notification
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#AE4A3E] text-white">
            <div className="flex items-center gap-2">
              <AlertOctagon size={18} className="text-white/90" />
              <h2 className="text-base font-bold">Mark as Lost: {entry.childName}</h2>
            </div>
            <button onClick={onClose} disabled={isPending} className="p-1 text-white/80 hover:text-white rounded-lg disabled:opacity-50">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 rounded-lg bg-[#AE4A3E]/[0.08] border border-[#AE4A3E]/30 text-xs text-[#8A362C]">
              <p className="font-bold">{entry.childName} ({entry.program})</p>
              <p className="text-[11px] mt-0.5">Parent: {entry.parentName} · Phone: {entry.phone}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Dropping / Loss *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#AE4A3E]"
              >
                <option value="Financial / Pricing">Financial / Pricing / Cannot Afford</option>
                <option value="ELC / Voucher Denied">ELC / Subsidy / Voucher Denied</option>
                <option value="Chose Competitor">Chose Competitor / Another School</option>
                <option value="Moved Away">Family Moved / Relocated</option>
                <option value="Schedule Conflict">Hours / Schedule Conflict</option>
                <option value="Unresponsive / Ghosted">Unresponsive / No Follow-Up</option>
                <option value="Other">Other Reason</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs" disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-[#AE4A3E] hover:bg-[#8A362C] text-white text-xs font-bold flex items-center gap-1.5">
                {isPending && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
                {isPending ? "Saving..." : "Mark Family Lost"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MarkLostModal;
