import React, { useState } from "react";
import { ArrowUpRight, ClipboardList, Wrench } from "lucide-react";
import EscalationPrompt from "@/components/EscalationPrompt";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EscalationSummary, { EscalationStatusTag } from "@/components/EscalationSummary";
import { useGetEscalations } from "@/hooks/escalation.hook";

const ITEM_TYPES = {
  task: { label: "Task", icon: ClipboardList },
  maintenance: { label: "Maintenance", icon: Wrench },
  standalone: { label: "Standalone", icon: ArrowUpRight },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
];

const fmtDate = (d) => {
  const date = d ? new Date(d) : null;
  if (!date || isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Director: everything sent to the Owner, with its status and the Owner's note once resolved
const MyEscalations = () => {
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const { escalations, counts, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetEscalations("director", status);

  const resolved = counts.approved + counts.rejected + counts.acknowledged;
  const filterCount = { all: counts.pending + resolved, pending: counts.pending, resolved };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatus(f.key)}
            className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold transition-all cursor-pointer ${
              status === f.key
                ? "bg-[#1E3A5F] text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label} {!isLoading && !isError && <span className="opacity-70">{filterCount[f.key]}</span>}
          </button>
        ))}
        <Button
          onClick={() => setShowForm(true)}
          className="ml-auto bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs px-3 h-8"
        >
          <ArrowUpRight size={14} className="mr-1" /> Escalate to Owner
        </Button>
      </div>

      {isLoading ? (
        [1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-12 bg-gray-100 rounded" />
          </div>
        ))
      ) : isError ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">Could not load your escalations.</p>
          <button onClick={() => refetch()} className="mt-2 text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer">
            Try again
          </button>
        </div>
      ) : escalations.length === 0 ? (
        <div className="py-12 text-center">
          <ArrowUpRight size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">
            {status === "pending"
              ? "Nothing is waiting on the Owner."
              : status === "resolved"
                ? "The Owner has not resolved anything yet."
                : "You have not sent anything to the Owner yet."}
          </p>
        </div>
      ) : (
        escalations.map((escalation) => {
          const type = ITEM_TYPES[escalation.item?.type] || ITEM_TYPES.standalone;
          const TypeIcon = type.icon;
          return (
            <Card key={escalation.id} className="bg-white border-none shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] text-[9px] font-extrabold uppercase">
                        <TypeIcon size={9} /> {type.label}
                      </span>
                      <EscalationStatusTag status={escalation.status} />
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-gray-900 break-words">
                      {escalation.item?.title || "Untitled"}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0 text-right">
                    Sent {fmtDate(escalation.created_at)}
                    {escalation.resolved_at && (
                      <>
                        <br />
                        Resolved {fmtDate(escalation.resolved_at)}
                      </>
                    )}
                  </span>
                </div>
                {escalation.context && (
                  <p className="text-[11px] text-gray-500 break-words whitespace-pre-wrap">{escalation.context}</p>
                )}
                <EscalationSummary escalation={escalation} showStatus={false} />
                {escalation.status !== "pending" && !escalation.owner_note && (
                  <p className="text-[10px] text-gray-400">The Owner did not leave a note.</p>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Standalone escalation: title, optional context, the two questions */}
      <EscalationPrompt isOpen={showForm} onClose={() => setShowForm(false)} editableContext />

      {hasNextPage && (
        <div className="flex justify-center pt-1">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="bg-white text-xs">
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyEscalations;
