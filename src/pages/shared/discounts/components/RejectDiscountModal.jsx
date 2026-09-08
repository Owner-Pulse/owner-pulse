import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2, XCircle, Paperclip, ExternalLink } from "lucide-react";
import { useRejectDiscountRequest } from "@/hooks/discount.hook";
import { getFileUrl } from "@/utils/file.utils";

const RejectDiscountModal = ({ isOpen, onClose, application }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const { rejectDiscount, isPending } = useRejectDiscountRequest();

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

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    try {
      const text = rejectionReason.trim();
      await rejectDiscount({
        id: application.id,
        data: {
          rejection_reason: text,
          reason: text,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88dvh] overflow-y-auto p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 border border-rose-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Decline Tuition Discount</h2>
              <p className="text-xs text-gray-500 mt-0.5">Return application with explanation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Application Snippet */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 text-sm">{studentName}</span>
            <span className="font-semibold text-rose-800">{categoryName}</span>
          </div>
          <div className="flex items-center justify-between text-gray-600">
            <span>Requested Discount: <strong className="text-gray-900">{weeklyFormatted}</strong></span>
            <span>Classroom: {application.classroom_name || application.classroom?.name || "N/A"}</span>
          </div>
          {(application.attachment_url || application.attachment) && (
            <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
              <span className="text-rose-900 font-medium flex items-center gap-1.5">
                <Paperclip size={13} className="text-rose-700" />
                Supporting Document:
              </span>
              <a
                href={getFileUrl(application.attachment_url || application.attachment)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-rose-800 hover:text-rose-950 underline flex items-center gap-1"
              >
                <span>View Attachment</span>
                <ExternalLink size={11} />
              </a>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Reason for Rejection <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete proof of employment or exceeds hardship budget limit. Please resubmit..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium resize-none"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              This explanation will be recorded and displayed to the Director.
            </p>
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
              disabled={isPending || !rejectionReason.trim()}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Declining...
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  Decline Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectDiscountModal;
