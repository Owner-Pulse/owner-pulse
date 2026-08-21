import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PulseImpactModal = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const { complianceScore, pulseBpmPenalty, scoreReason, expired, expiring, total } = stats;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden my-8 border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#1E3A5F] text-white">
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-[#AE4A3E] fill-[#AE4A3E]" />
              <h2 className="text-base md:text-lg font-bold">How Compliance Affects Pulse Score</h2>
            </div>
            <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Current State Highlight Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              complianceScore <= 30
                ? "bg-[#AE4A3E]/[0.08] border-[#AE4A3E]/30 text-[#8A362C]"
                : complianceScore <= 70
                ? "bg-[#B78A2F]/[0.10] border-[#B78A2F]/30 text-[#8F6A1F]"
                : complianceScore <= 85
                ? "bg-[#1E3A5F]/[0.06] border-[#1E3A5F]/20 text-[#1E3A5F]"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}>
              <ShieldAlert size={24} className="shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm md:text-base">
                    Current Compliance Score: {complianceScore} / 100
                  </h3>
                </div>
                <p className="text-xs mt-1 font-medium">{scoreReason}</p>
                {pulseBpmPenalty > 0 && (
                  <p className="text-xs font-bold mt-1.5 flex items-center gap-1">
                    ❤️ Direct Pulse BPM Impact: <span className="underline">+{pulseBpmPenalty} BPM ↑</span>
                  </p>
                )}
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle size={14} className="text-[#1E3A5F]" /> Compliance Weight & Calculation Rules
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                In OwnerPulse, Compliance carries a <strong>15% weight</strong> in calculating the overall Owner Health Pulse. Compliance scoring uses strict rule-based thresholds rather than linear averages:
              </p>
            </div>

            {/* Threshold Rules Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-700 uppercase">
                  <tr>
                    <th className="p-2.5">Condition</th>
                    <th className="p-2.5">Score</th>
                    <th className="p-2.5">Pulse BPM Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  <tr className={expired > 0 ? "bg-[#AE4A3E]/[0.08] font-bold" : ""}>
                    <td className="p-2.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#AE4A3E]" /> Any item EXPIRED
                    </td>
                    <td className="p-2.5 text-[#8A362C]">30 / 100</td>
                    <td className="p-2.5 text-[#8A362C]">❤️ BPM +40-50 (CRITICAL)</td>
                  </tr>
                  <tr className={complianceScore === 70 ? "bg-[#B78A2F]/[0.10] font-bold" : ""}>
                    <td className="p-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#B78A2F] inline-block mr-1.5" /> Item expires &lt;14 days
                    </td>
                    <td className="p-2.5 text-[#8F6A1F]">70 / 100</td>
                    <td className="p-2.5 text-[#8F6A1F]">❤️ BPM +20-30 (STRESSED)</td>
                  </tr>
                  <tr className={complianceScore === 85 ? "bg-[#1E3A5F]/[0.06] font-bold" : ""}>
                    <td className="p-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#1E3A5F] inline-block mr-1.5" /> Item expires &lt;60 days
                    </td>
                    <td className="p-2.5 text-[#1E3A5F]">85 / 100</td>
                    <td className="p-2.5 text-[#1E3A5F]">❤️ BPM +5-10 (ELEVATED)</td>
                  </tr>
                  <tr className={complianceScore === 100 ? "bg-emerald-50 font-bold" : ""}>
                    <td className="p-2.5 flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-600" /> All items CURRENT
                    </td>
                    <td className="p-2.5 text-emerald-700">100 / 100</td>
                    <td className="p-2.5 text-emerald-700">✅ 0 BPM penalty (Healthy)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Example Calculation Box */}
            <div className="p-3.5 rounded-xl bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/15 space-y-2">
              <h5 className="text-xs font-bold text-[#1E3A5F]">Real-world Example: Owner BPM Spike</h5>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Base BPM without compliance issues:</span>
                <span className="font-semibold text-gray-900">78 BPM (Healthy)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">With 1 expired item (e.g. CPR certification):</span>
                <span className="font-extrabold text-[#8A362C]">111 BPM (+33 BPM ↑)</span>
              </div>
              <p className="text-[10px] text-[#1E3A5F]/80 pt-1 border-t border-[#1E3A5F]/10">
                Fixing or renewing expired compliance items immediately reduces pulse stress by returning score to 100.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={onClose} className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs md:text-sm">
                Got it
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PulseImpactModal;
