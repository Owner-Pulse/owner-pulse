import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LogTourModal = ({ isOpen, onClose, entry, onLogTour, isPending = false }) => {
  const [tourDate, setTourDate] = useState("");
  const [tourTime, setTourTime] = useState("");
  const [showedUp, setShowedUp] = useState("yes");
  const [tourNotes, setTourNotes] = useState("");

  useEffect(() => {
    setTourDate(new Date().toISOString().slice(0, 10));
    setTourTime("10:00");
    setShowedUp("yes");
    setTourNotes("");
  }, [entry, isOpen]);

  if (!isOpen || !entry) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onLogTour(entry.id, {
        tourDate,
        tourTime,
        showedUp,
        tourNotes: tourNotes.trim(),
      });
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
          <div className="flex items-center justify-between px-6 py-4 bg-[#1E3A5F] text-white">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#9DB8D9]" />
              <h2 className="text-base font-bold">Log Tour: {entry.childName}</h2>
            </div>
            <button onClick={onClose} disabled={isPending} className="p-1 text-white/80 hover:text-white rounded-lg disabled:opacity-50">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Quick Family Info */}
            <div className="p-3 rounded-lg bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/10 text-xs">
              <p className="font-bold text-gray-900">{entry.childName} ({entry.age || entry.program})</p>
              <p className="text-gray-500 text-[11px] mt-0.5">Parent: {entry.parentName} · Phone: {entry.phone}</p>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Tour Date *
                </label>
                <Input
                  type="date"
                  required
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Clock size={12} /> Tour Time
                </label>
                <Input
                  type="time"
                  value={tourTime}
                  onChange={(e) => setTourTime(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Showed Up */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Did they show up for the tour? *</label>
              <select
                value={showedUp}
                onChange={(e) => setShowedUp(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              >
                <option value="yes">Yes - Showed up (Move to Toured)</option>
                <option value="no">No - Did not show up (Mark Lost)</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tour Notes & Feedback</label>
              <textarea
                rows={3}
                placeholder="How did the tour go? Liked classroom, concerns, projected start date..."
                value={tourNotes}
                onChange={(e) => setTourNotes(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs" disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs font-bold flex items-center gap-1.5">
                {isPending && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
                {isPending ? "Logging..." : "Save Tour Log"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LogTourModal;
