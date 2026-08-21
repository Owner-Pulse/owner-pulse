import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ConfirmEnrollmentModal = ({ isOpen, onClose, entry, onConfirmEnrollment }) => {
  const [actualStart, setActualStart] = useState("");
  const [finalRoom, setFinalRoom] = useState("");
  const [enrollNotes, setEnrollNotes] = useState("");

  useEffect(() => {
    setActualStart("2026-09-01");
    setFinalRoom(entry?.program || "Main Classroom");
    setEnrollNotes("");
  }, [entry, isOpen]);

  if (!isOpen || !entry) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmEnrollment(entry.id, {
      actualStart,
      finalRoom: finalRoom.trim(),
      enrollNotes: enrollNotes.trim(),
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
          <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-200" />
              <h2 className="text-base font-bold">Confirm Enrollment: {entry.childName}</h2>
            </div>
            <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <p className="font-bold">{entry.childName} ({entry.program})</p>
              <p className="text-emerald-700 text-[11px] mt-0.5">Parent: {entry.parentName} · Phone: {entry.phone}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Actual Start Date *</label>
              <Input
                type="date"
                required
                value={actualStart}
                onChange={(e) => setActualStart(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Classroom / Room</label>
              <Input
                type="text"
                placeholder="e.g. PreK3 Room B"
                value={finalRoom}
                onChange={(e) => setFinalRoom(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Final Enrollment Notes</label>
              <textarea
                rows={3}
                placeholder="First tuition payment received, medical forms on file, special instructions..."
                value={enrollNotes}
                onChange={(e) => setEnrollNotes(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
                Confirm Enrolled
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmEnrollmentModal;
