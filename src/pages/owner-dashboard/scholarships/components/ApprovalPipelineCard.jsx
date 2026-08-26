import React, { useState } from "react";
import { FileText, CheckCircle2, Loader2, Check, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  useGetInfinitePendingScholarships,
  useGetInfiniteApprovedScholarships,
} from "@/hooks/owner-hook/scholarship.hook";

const ApprovalPipelineCard = ({
  stepUpData = {},
  onUpdateStatus,
  isUpdatingStatus = false,
}) => {
  const [activeTab, setActiveTab] = useState("pending");

  // Infinite query for pending list
  const {
    data: infinitePendingData,
    fetchNextPage: fetchNextPending,
    hasNextPage: hasNextPending,
    isFetchingNextPage: isFetchingNextPending,
    isLoading: isPendingLoading,
  } = useGetInfinitePendingScholarships({ pending_per_page: 10 });

  // Infinite query for approved list
  const {
    data: infiniteApprovedData,
    fetchNextPage: fetchNextApproved,
    hasNextPage: hasNextApproved,
    isFetchingNextPage: isFetchingNextApproved,
    isLoading: isApprovedLoading,
  } = useGetInfiniteApprovedScholarships({ approved_per_page: 10 });

  // Flatten pending list from infinite pages
  const pendingList = infinitePendingData
    ? infinitePendingData.pages.flatMap(
        (page) => page?.data?.step_up_payment_approvals?.pending_list?.data || []
      )
    : stepUpData?.pending_list?.data || [];

  const pendingTotal =
    infinitePendingData?.pages?.[0]?.data?.step_up_payment_approvals?.pending_list?.total ??
    stepUpData?.pending_list?.total ??
    0;

  // Flatten approved list from infinite pages
  const approvedList = infiniteApprovedData
    ? infiniteApprovedData.pages.flatMap(
        (page) => page?.data?.step_up_payment_approvals?.approved_list?.data || []
      )
    : stepUpData?.approved_list?.data || [];

  const approvedTotal =
    infiniteApprovedData?.pages?.[0]?.data?.step_up_payment_approvals?.approved_list?.total ??
    stepUpData?.approved_list?.total ??
    stepUpData?.approved_count ??
    0;

  const summary =
    infinitePendingData?.pages?.[0]?.data?.step_up_payment_approvals?.pipeline_summary ||
    stepUpData?.pipeline_summary || {
      fresh_under_7d: 0,
      aging_7_to_13d: 0,
      stale_14_to_19d: 0,
      red_flag_20d_plus: 0,
    };

  const isRedFlag = (summary.red_flag_20d_plus || 0) > 0;
  const isStale = (summary.stale_14_to_19d || 0) > 0 && !isRedFlag;

  const handleStatusChange = (id, newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(id, newStatus);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 40) {
      if (activeTab === "pending" && hasNextPending && !isFetchingNextPending) {
        fetchNextPending();
      } else if (activeTab === "approved" && hasNextApproved && !isFetchingNextApproved) {
        fetchNextApproved();
      }
    }
  };

  return (
    <Card
      className={`bg-white border-none shadow-sm ${
        isRedFlag ? "border-l-4 border-l-[#AE4A3E]" : isStale ? "border-l-4 border-l-[#B78A2F]" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={16} className="text-[#1E3A5F]" /> Step Up Payment Approvals
            </CardTitle>
            <CardDescription className="mt-1">
              {isRedFlag
                ? `${summary.red_flag_20d_plus} approvals stuck over 20 days — needs immediate attention`
                : `${pendingTotal} pending · tracking aging pipeline`}
            </CardDescription>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "pending"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending ({pendingTotal})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "approved"
                  ? "bg-white text-[#2F6042] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Approved & Paid ({approvedTotal})
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Pipeline Summary Buckets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-[#3E7A54]">{summary.fresh_under_7d || 0}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Fresh (&lt;7d)</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-[#B78A2F]">{summary.aging_7_to_13d || 0}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Aging (7-13d)</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-[#AE4A3E]">{summary.stale_14_to_19d || 0}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Stale (14-19d)</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-[#8A362C]">{summary.red_flag_20d_plus || 0}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Red Flag (20d+)</p>
          </div>
        </div>

        {/* Tab Content: PENDING (Infinite Scroll Container) */}
        {activeTab === "pending" && (
          <div
            onScroll={handleScroll}
            className="max-h-[480px] overflow-y-auto space-y-2 pr-1 custom-scrollbar"
          >
            {isPendingLoading && pendingList.length === 0 ? (
              <div className="py-8 text-center">
                <Loader2 size={24} className="mx-auto text-[#1E3A5F] animate-spin mb-2" />
                <p className="text-xs text-gray-400 font-medium">Loading pending list...</p>
              </div>
            ) : pendingList.length > 0 ? (
              <>
                {pendingList.map((item, index) => {
                  const days = item.days_pending ?? 0;
                  const isRed = days >= 20;
                  const isStaleItem = days >= 14 && days < 20;
                  const isAgingItem = days >= 7 && days < 14;

                  const displayName =
                    item.heading ||
                    (item.guardian_name && item.student_name
                      ? `${item.guardian_name} → ${item.student_name}`
                      : item.student_name || "Student");

                  return (
                    <div
                      key={item.id ? `${item.id}-${index}` : index}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
                        isRed
                          ? "bg-[#AE4A3E]/10 border-[#AE4A3E]/20"
                          : isStaleItem
                          ? "bg-[#AE4A3E]/[0.05] border-[#AE4A3E]/10"
                          : isAgingItem
                          ? "bg-[#B78A2F]/[0.07] border-[#B78A2F]/15"
                          : "bg-gray-50/80 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isRed
                              ? "bg-[#8A362C]"
                              : isStaleItem
                              ? "bg-[#AE4A3E]"
                              : isAgingItem
                              ? "bg-[#B78A2F]"
                              : "bg-[#3E7A54]"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                          <p className="text-xs text-gray-500">
                            Grade/Level: {item.grade_or_level || "N/A"}
                            {item.last_contact_date ? ` · Contact: ${item.last_contact_date}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {item.formatted_amount || (item.amount ? `$${item.amount}` : "$0")}
                          </p>
                          <p
                            className={`text-xs font-medium ${
                              isRed ? "text-[#8A362C]" : isStaleItem ? "text-[#8F6A1F]" : "text-gray-500"
                            }`}
                          >
                            {item.formatted_pending || `${days}d pending`}
                          </p>
                        </div>

                        {/* Status dropdown / action */}
                        <select
                          value={item.status || "Pending"}
                          disabled={isUpdatingStatus}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 cursor-pointer disabled:opacity-50"
                        >
                          <option value="Pending">Pending</option>
                          <option value="GuardianReview">Guardian Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>
                    </div>
                  );
                })}

                {/* Infinite Scroll Footer / Controls */}
                {isFetchingNextPending ? (
                  <div className="py-3 text-center flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 size={14} className="animate-spin text-[#1E3A5F]" />
                    <span>Loading more entries...</span>
                  </div>
                ) : hasNextPending ? (
                  <div className="py-2 text-center">
                    <button
                      onClick={() => fetchNextPending()}
                      className="text-xs font-semibold text-[#1E3A5F] hover:underline"
                    >
                      Load More Pending ({pendingList.length} of {pendingTotal})
                    </button>
                  </div>
                ) : (
                  <div className="py-2 text-center text-[11px] text-gray-400">
                    Showing all {pendingList.length} pending items
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center bg-gray-50 rounded-2xl">
                <CheckCircle2 size={24} className="mx-auto text-[#3E7A54] mb-2" />
                <p className="text-sm font-medium text-gray-600">No pending approvals — all caught up!</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: APPROVED (Infinite Scroll Container) */}
        {activeTab === "approved" && (
          <div
            onScroll={handleScroll}
            className="max-h-[480px] overflow-y-auto space-y-2 pr-1 custom-scrollbar"
          >
            {isApprovedLoading && approvedList.length === 0 ? (
              <div className="py-8 text-center">
                <Loader2 size={24} className="mx-auto text-[#1E3A5F] animate-spin mb-2" />
                <p className="text-xs text-gray-400 font-medium">Loading approved list...</p>
              </div>
            ) : approvedList.length > 0 ? (
              <>
                {approvedList.map((item, index) => {
                  const displayName =
                    item.heading ||
                    (item.guardian_name && item.student_name
                      ? `${item.guardian_name} → ${item.student_name}`
                      : item.student_name || "Student");

                  return (
                    <div
                      key={item.id ? `${item.id}-${index}` : index}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#3E7A54]/10 text-[#2F6042] flex items-center justify-center font-bold text-xs">
                          <Check size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                          <p className="text-xs text-gray-500">
                            {item.approval_date ? `Approved / Paid on ${item.approval_date}` : "Approved"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {item.formatted_amount || (item.amount ? `$${item.amount}` : "$0")}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#3E7A54]/10 text-[#2F6042]">
                            {item.status || "Approved"}
                          </span>
                        </div>

                        {/* Status selector */}
                        <select
                          value={item.status || "Approved"}
                          disabled={isUpdatingStatus}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 cursor-pointer disabled:opacity-50"
                        >
                          <option value="Approved">Approved</option>
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="GuardianReview">Guardian Review</option>
                        </select>
                      </div>
                    </div>
                  );
                })}

                {/* Infinite Scroll Footer / Controls */}
                {isFetchingNextApproved ? (
                  <div className="py-3 text-center flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 size={14} className="animate-spin text-[#1E3A5F]" />
                    <span>Loading more entries...</span>
                  </div>
                ) : hasNextApproved ? (
                  <div className="py-2 text-center">
                    <button
                      onClick={() => fetchNextApproved()}
                      className="text-xs font-semibold text-[#1E3A5F] hover:underline"
                    >
                      Load More Approved ({approvedList.length} of {approvedTotal})
                    </button>
                  </div>
                ) : (
                  <div className="py-2 text-center text-[11px] text-gray-400">
                    Showing all {approvedList.length} approved items
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center bg-gray-50 rounded-2xl">
                <Clock size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-500">No approved payments found.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalPipelineCard;
