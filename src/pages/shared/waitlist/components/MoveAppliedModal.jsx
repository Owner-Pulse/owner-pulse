import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MoveAppliedModal = ({ isOpen, onClose, entry, onMoveToApplied }) => {
  const [packetGiven, setPacketGiven] = useState("Yes");
  const [appliedDate, setAppliedDate] = useState("");
  const [appliedNotes, setAppliedNotes] = useState("");

  useEffect(() => {
    setPacketGiven("Yes");
    setAppliedDate(new Date().toISOString().slice(0, 10));
    setAppliedNotes("");
  }, [entry, isOpen]);

  if (!isOpen || !entry) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onMoveToApplied(entry.id, {
      packetGiven,
      appliedDate,
      appliedNotes: appliedNotes.trim(),
    });
    onClose();
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
          <div className="flex items-center justify-between px-6 py-4 bg-[#1E3A5F] text-white">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#9DB8D9]" />
              <h2 className="text-base font-bold">Move to Applied: {entry.childName}</h2>
            </div>
            <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 rounded-lg bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/10 text-xs">
              <p className="font-bold text-gray-900">{entry.childName} ({entry.program})</p>
              <p className="text-gray-500 text-[11px] mt-0.5">Parent: {entry.parentName} · Phone: {entry.phone}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Application / Packet Handed to Family? *
              </label>
              <select
                value={packetGiven}
                onChange={(e) => setPacketGiven(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              >
                <option value="Yes">Yes - Paperwork/Digital Packet Issued</option>
                <option value="No">No - Pending Packet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Application Date *</label>
              <Input
                type="date"
                required
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Application Notes</label>
              <textarea
                rows={3}
                placeholder="Registration fee status, requested schedule, special requests..."
                value={appliedNotes}
                onChange={(e) => setAppliedNotes(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs">
                Move to Applied
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MoveAppliedModal;
