import React from "react";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import { decisionLabel, reasonLabel, statusMeta } from "@/lib/escalation";

export const EscalationStatusTag = ({ status, className = "" }) => {
  const meta = statusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase shrink-0 ${meta.className} ${className}`}
    >
      {status === "pending" || !status ? <ArrowUpRight size={9} /> : null}
      {meta.label}
    </span>
  );
};

const Answer = ({ label, type, details, clamp }) => (
  <div className="min-w-0">
    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
    <p className="text-[11px] font-semibold text-gray-800 break-words">{type}</p>
    {details && (
      <p className={`text-[11px] text-gray-600 leading-snug whitespace-pre-wrap break-words ${clamp ? "line-clamp-2" : ""}`}>
        {details}
      </p>
    )}
  </div>
);

/**
 * Compact block with the two escalation answers, the status and (once resolved) the Owner's note.
 *
 * Props:
 * - escalation: { decision_type, decision_details, reason_type, reason_details, status, owner_note }
 * - showStatus: render the status tag inside the block (off when the card already shows it)
 * - clamp: cut long answers to two lines (dense cards)
 */
const EscalationSummary = ({ escalation, showStatus = true, clamp = false, className = "" }) => {
  if (!escalation) return null;

  return (
    <div className={`p-2 rounded-lg bg-gray-50 border border-gray-100 space-y-1.5 ${className}`}>
      {showStatus && <EscalationStatusTag status={escalation.status} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
        <Answer
          label="Decision asked"
          type={decisionLabel(escalation.decision_type)}
          details={escalation.decision_details}
          clamp={clamp}
        />
        <Answer
          label="Why the Owner"
          type={reasonLabel(escalation.reason_type)}
          details={escalation.reason_details}
          clamp={clamp}
        />
      </div>
      {escalation.owner_note && (
        <div className="flex items-start gap-1.5 pt-1.5 border-t border-gray-200/70 text-[11px] text-gray-700">
          <MessageSquare size={11} className="shrink-0 mt-0.5 text-[#8F6A1F]" />
          <p className="min-w-0 break-words whitespace-pre-wrap">
            <span className="font-bold text-gray-900">Owner's note:</span> {escalation.owner_note}
          </p>
        </div>
      )}
    </div>
  );
};

export default EscalationSummary;
