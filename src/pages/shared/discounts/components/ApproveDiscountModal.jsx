import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, DollarSign, Calendar, User, ShieldCheck, Paperclip, ExternalLink } from "lucide-react";
import { useApproveDiscountRequest } from "@/hooks/discount.hook";
import { getFileUrl } from "@/utils/file.utils";

const ApproveDiscountModal = ({ isOpen, onClose, application }) => {
  const [approvalNotes, setApprovalNotes] = useState("Owner verified and approved.");
  const { approveDiscount, isPending } = useApproveDiscountRequest();

  // Prevent background scrolling & allow ESC to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !application) return null;

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      await approveDiscount({
        id: application.id,
        data: {
          approval_notes: approvalNotes.trim() || "Owner verified and approved.",
        },
      });
      onClose();
    } catch (err) {
      // Handled by hook toast
    }
  };

  const studentName = application.student_name || "Student";
  const categoryName = application.category?.name || "Tuition Discount";
  const weeklyFormatted = application.formatted_weekly_amount || `$${application.weekly_amount}/wk`;
  const monthlyFormatted = application.formatted_monthly_amount || `$${application.monthly_amount}/mo`;
  const annualFormatted = application.formatted_annual_amount || `$${application.annual_amount}`;
  const directorName = application.director?.name || "Director";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88dvh] overflow-y-auto p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 border border-emerald-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Approve Tuition Discount</h2>
              <p className="text-xs text-gray-500 mt-0.5">Authorizes requested tuition deduction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Application Summary Card */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">{studentName}</h3>
              <p className="text-xs text-emerald-800 font-medium">
                Classroom: {application.classroom_name || application.classroom?.name || "Unassigned"}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
              {categoryName}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 text-xs">
            <div>
              <span className="text-gray-500 block">Weekly</span>
              <span className="font-bold text-gray-900">{weeklyFormatted}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Monthly</span>
              <span className="font-bold text-gray-900">{monthlyFormatted}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Annual Impact</span>
              <span className="font-bold text-emerald-700">{annualFormatted}</span>
            </div>
          </div>

          {application.reason && (
            <div className="text-xs text-gray-600 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
              <span className="font-semibold text-gray-700">Director Reason: </span>
              {application.reason}
            </div>
          )}

          {(application.attachment_url || application.attachment) && (
            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
              <span className="text-emerald-900 font-medium flex items-center gap-1.5">
                <Paperclip size={13} className="text-emerald-700" />
                Supporting Document:
              </span>
              <a
                href={getFileUrl(application.attachment_url || application.attachment)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
              >
                <span>View Attachment</span>
                <ExternalLink size={11} />
              </a>
            </div>
          )}

          <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
            <span>Submitted by: <strong className="text-gray-700">{directorName}</strong></span>
            <span>Academic Year: {application.academic_year || "2025-2026"}</span>
          </div>
        </div>

        {/* Approval Notes Form */}
        <form onSubmit={handleApprove} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Approval Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="e.g. Owner verified and approved under tuition benefit policy."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-center"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Authorize & Approve
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveDiscountModal;
