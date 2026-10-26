import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useGetOwnerPulseImpact } from "@/hooks/owner-hook/compliance.hook";
import PulseImpactModal from "@/pages/owner-dashboard/compliance/components/PulseImpactModal";

const PulseScoreImpactCard = () => {
  const { pulseImpactData, isLoading } = useGetOwnerPulseImpact();
  const [open, setOpen] = useState(false);

  if (isLoading || !pulseImpactData) return null;

  const score = pulseImpactData.current_score ?? 100;
  const penalty = pulseImpactData.bpm_penalty ?? 0;
  const stats = {
    complianceScore: score,
    pulseBpmPenalty: penalty,
    scoreReason: pulseImpactData.status_label ? `Status: ${pulseImpactData.status_label}` : "Compliance status",
    expired: pulseImpactData.counts?.expired ?? 0,
    expiring: pulseImpactData.counts?.expiring_14_days ?? 0,
    total: pulseImpactData.counts?.total ?? 0,
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 w-full text-left rounded-2xl bg-[#15294A] text-white px-4 py-4 flex items-center justify-between gap-3 shadow-sm hover:bg-[#1E3A5F] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Heart size={18} className="text-[#F0B4AC] fill-[#F0B4AC] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold">Owner Pulse Score Impact</p>
            <p className="text-xs text-white/75 mt-0.5">
              Compliance is 15% of the Owner Health Pulse · score {score}/100
              {penalty > 0 ? ` · +${penalty} BPM` : " · no BPM penalty"}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold shrink-0 underline">View breakdown</span>
      </button>
      <PulseImpactModal isOpen={open} onClose={() => setOpen(false)} stats={stats} />
    </>
  );
};

export default PulseScoreImpactCard;
