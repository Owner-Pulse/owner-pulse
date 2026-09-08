import React, { useEffect } from "react";
import {
  X,
  Tag,
  DollarSign,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  FileText,
  Shield,
  HelpCircle,
  AlertTriangle,
  Loader2,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { useGetSingleDiscount } from "@/hooks/discount.hook";
import { getFileUrl } from "@/utils/file.utils";

const formatDate = (isoStr) => {
  if (!isoStr) return "N/A";
  try {
    return new Date(isoStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoStr;
  }
};

const DiscountDetailsModal = ({
  isOpen,
  onClose,
  discount: initialDiscount,
  discountId,
  isOwner = false,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}) => {
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

  // Fetch fresh single discount details by ID
  const targetId = discountId || initialDiscount?.id;
  const {
    discount: fetchedDiscount,
    isLoading: isSingleLoading,
    isFetching: isSingleFetching,
  } = useGetSingleDiscount(isOpen ? targetId : null);

  const discount = fetchedDiscount || initialDiscount;

  if (!isOpen) return null;

  if (isSingleLoading && !discount) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative bg-white rounded-3xl max-w-sm w-full p-8 flex flex-col items-center justify-center shadow-2xl border border-gray-100 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Loader2 size={32} className="animate-spin text-[#1E3A5F]" />
          <p className="text-xs font-semibold text-gray-700">Loading discount application details...</p>
        </div>
      </div>
    );
  }

  if (!discount) return null;

  const status = discount.status || "pending";
  const studentName = discount.student_name || "Student";
  const classroomName = discount.classroom_name || discount.classroom?.name || "Unassigned Classroom";
  const categoryName = discount.category?.name || "Tuition Discount";
  const isWaiver = discount.category?.type === "waiver" || discount.discount_mode === "full_waiver";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[88dvh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed Top */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F] shrink-0">
              <Tag size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-snug truncate">
                  {studentName}
                </h2>
                {isSingleFetching && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <Loader2 size={10} className="animate-spin" />
                    Syncing...
                  </span>
                )}
                {/* Status Badge */}
                {status === "approved" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 size={13} />
                    Approved
                  </span>
                )}
                {status === "pending" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    <Clock size={13} />
                    Pending Authorization
                  </span>
                )}
                {status === "rejected" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    <XCircle size={13} />
                    Declined
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                <span>Classroom: <strong>{classroomName}</strong></span>
                {discount.procare_child_id && (
                  <span>· Procare ID: #{discount.procare_child_id}</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors shrink-0 ml-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4">
          {/* Financial Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
            <span className="text-[11px] text-gray-500 uppercase font-semibold block">Weekly Amount</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5 block">
              {discount.formatted_weekly_amount || `$${discount.weekly_amount}/wk`}
            </span>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
            <span className="text-[11px] text-gray-500 uppercase font-semibold block">Monthly Equivalent</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5 block">
              {discount.formatted_monthly_amount || `$${discount.monthly_amount}/mo`}
            </span>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
            <span className="text-[11px] text-gray-500 uppercase font-semibold block">Annual Impact</span>
            <span className="text-lg font-bold text-[#1E3A5F] mt-0.5 block">
              {discount.formatted_annual_amount || `$${discount.annual_amount}`}
            </span>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
            <span className="text-[11px] text-gray-500 uppercase font-semibold block">Policy Type</span>
            <span className="text-xs font-bold text-gray-800 mt-1 block">
              {categoryName}
            </span>
            <span className="text-[10px] text-gray-500 block">
              {isWaiver ? "Tuition Waiver" : "Discount"}
              {discount.discount_percentage ? ` (${discount.discount_percentage}%)` : ""}
            </span>
          </div>
        </div>

        {/* Application Specifics */}
        <div className="bg-gray-50/70 p-4 rounded-2xl space-y-3 border border-gray-100 text-xs">
          <h3 className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
            Schedule & Allocation Parameters
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-gray-500 block">Academic Year</span>
              <span className="font-semibold text-gray-900">{discount.academic_year || "2025-2026"}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Start Date</span>
              <span className="font-semibold text-gray-900">{formatDate(discount.start_date)}</span>
            </div>
            <div>
              <span className="text-gray-500 block">End Date</span>
              <span className="font-semibold text-gray-900">{formatDate(discount.end_date)}</span>
            </div>
            <div>
              <span className="text-gray-500 block">School Schedule</span>
              <span className="font-semibold text-gray-900">
                {discount.school_weeks || 43} weeks · {discount.school_months || 10} months
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Calculation Mode</span>
              <span className="font-semibold text-gray-900 capitalize">
                {(discount.discount_mode || "fixed_weekly").replace("_", " ")}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Submitted On</span>
              <span className="font-semibold text-gray-900">{formatDate(discount.created_at)}</span>
            </div>
          </div>

          {discount.reason && (
            <div className="pt-2 border-t border-gray-200/60">
              <span className="text-gray-500 block font-medium">Justification / Reason:</span>
              <p className="text-gray-800 mt-0.5">{discount.reason}</p>
            </div>
          )}

          {discount.notes && (
            <div className="pt-1">
              <span className="text-gray-500 block font-medium">Staff Notes:</span>
              <p className="text-gray-700 mt-0.5 italic">{discount.notes}</p>
            </div>
          )}

          {(discount.attachment_url || discount.attachment) && (
            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-gray-500 block font-medium">Supporting Attachment:</span>
                <span className="text-gray-700 text-xs">Document uploaded with application</span>
              </div>
              <a
                href={getFileUrl(discount.attachment_url || discount.attachment)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#1E3A5F] hover:bg-gray-50 font-semibold text-xs shadow-2xs transition-colors"
              >
                <Paperclip size={13} />
                <span>View Attachment</span>
                <ExternalLink size={12} className="text-gray-400" />
              </a>
            </div>
          )}
        </div>

        {/* Audit & Decision Log */}
        <div className="bg-gray-50/70 p-4 rounded-2xl space-y-3 border border-gray-100 text-xs">
          <h3 className="font-semibold text-gray-700 uppercase tracking-wider text-[11px]">
            Governance & Decision Log
          </h3>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
              <User size={14} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Submitted by: {discount.director?.name || "Campus Director"}
              </p>
              <p className="text-[11px] text-gray-500">{discount.director?.email || ""}</p>
            </div>
          </div>

          {status === "approved" && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Authorized by Owner
                </span>
                <span className="text-[11px] text-emerald-700">{formatDate(discount.approved_at)}</span>
              </div>
              <p className="text-xs text-emerald-800">
                Notes: {discount.approval_notes || "Owner verified and approved under tuition assistance policy."}
              </p>
            </div>
          )}

          {status === "rejected" && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <XCircle size={14} /> Declined by Administration
                </span>
                <span className="text-[11px] text-rose-700">{formatDate(discount.rejected_at || discount.updated_at)}</span>
              </div>
              <p className="text-xs text-rose-800">
                Reason: {discount.rejection_reason || "Application does not meet current tuition waiver criteria."}
              </p>
            </div>
          )}
        </div>
        </div>

        {/* Footer Actions - Fixed Bottom */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-t border-gray-100 bg-gray-50/95 backdrop-blur-xs shrink-0 flex-wrap gap-2.5">
          <div>
            {/* Delete button if owner or pending director */}
            {(isOwner || status === "pending") && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(discount);
                  onClose();
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1.5 transition-colors"
              >
                Delete Record
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Owner Decision Quick Actions */}
            {isOwner && status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReject?.(discount);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onApprove?.(discount);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Authorize Discount
                </button>
              </>
            )}

            {/* Edit button if pending */}
            {status === "pending" && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(discount);
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
              >
                Edit
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountDetailsModal;
