import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetEnrollmentTargets, useUpdateEnrollmentTargets } from "@/hooks/classroom/classroom.hook";

const EnrollmentTargetsModal = ({ isOpen, onClose }) => {
  const { targetsData, isLoading: isFetching } = useGetEnrollmentTargets();
  const { updateTargets, isPending: isUpdating } = useUpdateEnrollmentTargets();

  const [preschoolTarget, setPreschoolTarget] = useState(65);
  const [k8Target, setK8Target] = useState(85);

  useEffect(() => {
    if (targetsData) {
      if (targetsData.enrollment_target_preschool !== undefined) {
        setPreschoolTarget(targetsData.enrollment_target_preschool);
      }
      if (targetsData.enrollment_target_k8 !== undefined) {
        setK8Target(targetsData.enrollment_target_k8);
      }
    }
  }, [targetsData]);

  if (!isOpen) return null;

  const totalTarget = (Number(preschoolTarget) || 0) + (Number(k8Target) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateTargets({
      enrollment_target_preschool: Number(preschoolTarget) || 0,
      enrollment_target_k8: Number(k8Target) || 0,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100"
        >
          <div className="p-5 bg-[#1E3A5F] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-white">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold">Enrollment Target Settings</h2>
                <p className="text-xs text-blue-100/80">
                  Configure goal targets for Overview & Classroom P&L
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {isFetching ? (
              <div className="py-8 text-center space-y-2">
                <Loader2 size={24} className="animate-spin mx-auto text-[#1E3A5F]" />
                <p className="text-xs text-gray-500">Loading current targets...</p>
              </div>
            ) : (
              <>
                <div>
                  <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Preschool Enrollment Target
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={preschoolTarget}
                    onChange={(e) => setPreschoolTarget(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="e.g. 65"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                    K–8 Enrollment Target
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={k8Target}
                    onChange={(e) => setK8Target(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="e.g. 85"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs text-[#1E3A5F]">
                  <span className="font-semibold">Total Facility Target:</span>
                  <span className="text-sm font-extrabold">{totalTarget} Students</span>
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUpdating}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || isFetching}
                className="bg-[#1E3A5F] hover:bg-[#15294A] text-white font-bold text-xs h-9 px-4 flex items-center gap-1.5"
              >
                {isUpdating ? (
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

export default EnrollmentTargetsModal;
