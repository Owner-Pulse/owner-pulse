import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Calendar, FileText, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CompleteComplianceModal = ({ isOpen, onClose, item, onComplete, isLoading }) => {
  const [newExpirationDate, setNewExpirationDate] = useState("");
  const [validityPeriodMonths, setValidityPeriodMonths] = useState(12);
  const [markChecklistsCompleted, setMarkChecklistsCompleted] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (item) {
      setNewExpirationDate("");
      setValidityPeriodMonths(12);
      setMarkChecklistsCompleted(true);
      setNotes("");
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      validity_period_months: Number(validityPeriodMonths) || 12,
      mark_checklists_completed: markChecklistsCompleted,
    };
    if (newExpirationDate.trim()) {
      payload.new_expiration_date = newExpirationDate.trim();
    }
    if (notes.trim()) {
      payload.notes = notes.trim();
    }
    onComplete(item.id, payload);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#1E3A5F] to-[#2A4C7E] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold">Mark Compliance Item Complete</h2>
                <p className="text-xs text-blue-100/80">
                  {item.item || item.name} · {item.authority}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-[#3E7A54] space-y-4">
            {/* Context Note */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Completing this item will:</p>
                <ul className="list-disc list-inside mt-0.5 text-[11px] text-emerald-800 space-y-0.5">
                  <li>Advance the expiration date forward to status <strong>Compliant</strong></li>
                  <li>Complete remaining document checklist tasks</li>
                  <li>Recalculate Pulse Compliance Score (+15% weight) in real time</li>
                </ul>
              </div>
            </div>

            {/* Custom New Expiration Date (Optional) */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 flex items-center justify-between mb-1">
                <span>New Expiration Date <span className="text-gray-400 font-normal">(Optional)</span></span>
                {item.expires && (
                  <span className="text-[11px] text-gray-400">Current: {item.expires}</span>
                )}
              </Label>
              <Input
                type="date"
                value={newExpirationDate}
                onChange={(e) => setNewExpirationDate(e.target.value)}
                className="h-9 text-xs"
                placeholder="YYYY-MM-DD"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Leave blank to automatically extend date by validity period from today.
              </p>
            </div>

            {/* Validity Period Months */}
            {!newExpirationDate && (
              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Validity Period (Months)
                </Label>
                <select
                  value={validityPeriodMonths}
                  onChange={(e) => setValidityPeriodMonths(e.target.value)}
                  className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={36}>36 Months (3 Years)</option>
                </select>
              </div>
            )}

            {/* Checklists Auto-complete Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="mark_checklists"
                checked={markChecklistsCompleted}
                onChange={(e) => setMarkChecklistsCompleted(e.target.checked)}
                className="w-4 h-4 text-[#1E3A5F] rounded border-gray-300 focus:ring-[#1E3A5F]"
              />
              <label htmlFor="mark_checklists" className="text-xs text-gray-700 font-medium cursor-pointer">
                Mark all remaining document checklists as completed
              </label>
            </div>

            {/* Completion Notes */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                Activity Notes / Log Entry <span className="text-gray-400 font-normal">(Optional)</span>
              </Label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Annual inspection completed by city inspector. Certificate uploaded."
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} /> Complete Item
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompleteComplianceModal;
