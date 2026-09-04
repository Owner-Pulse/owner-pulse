import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Target, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateEnrollmentTargets } from "@/hooks/classroom/classroom.hook";

const EnrollmentTargetModal = ({ isOpen, onClose, initialTargets }) => {
  const [preschoolTarget, setPreschoolTarget] = useState(500);
  const [k8Target, setK8Target] = useState(500);

  const { updateTargets, isPending } = useUpdateEnrollmentTargets();

  useEffect(() => {
    if (initialTargets) {
      if (initialTargets.preschool !== undefined) setPreschoolTarget(initialTargets.preschool);
      if (initialTargets.k8 !== undefined) setK8Target(initialTargets.k8);
    }
  }, [initialTargets]);

  if (!isOpen) return null;

  const totalTarget = (Number(preschoolTarget) || 0) + (Number(k8Target) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTargets({
        enrollment_target_preschool: Number(preschoolTarget),
        enrollment_target_k8: Number(k8Target),
      });
      onClose();
    } catch (err) {
      // Handled by hook toast
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#1E3A5F] to-[#2A4C7E] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Settings size={18} className="text-[#9DB8D9]" />
              </div>
              <div>
                <h3 className="text-base font-bold">Enrollment Target Settings</h3>
                <p className="text-xs text-white/80">Configure category-wise student targets</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Target size={14} className="text-[#1E3A5F]" /> Preschool Target
              </label>
              <input
                type="number"
                min="0"
                value={preschoolTarget}
                onChange={(e) => setPreschoolTarget(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent font-medium"
                required
              />
              <p className="text-[11px] text-gray-400">Target enrolled capacity for Preschool programs</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Target size={14} className="text-[#1E3A5F]" /> K–8 Target
              </label>
              <input
                type="number"
                min="0"
                value={k8Target}
                onChange={(e) => setK8Target(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent font-medium"
                required
              />
              <p className="text-[11px] text-gray-400">Target enrolled capacity for K–8 grade classrooms</p>
            </div>

            {/* Calculated Total Target Preview */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Total Combined Target
              </span>
              <span className="text-base font-extrabold text-[#1E3A5F]">
                {totalTarget.toLocaleString()} <span className="text-xs font-semibold text-gray-500">students</span>
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="text-xs h-9">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs h-9 px-4 cursor-pointer gap-1.5"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Targets
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

export default EnrollmentTargetModal;
