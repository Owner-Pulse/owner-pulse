import React from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const TODAY = new Date("2026-05-11");
const daysSince = (d) => Math.floor((TODAY - new Date(d)) / 86400000);
const fmtMoney = (v) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

const ApprovalPipelineCard = ({ approvals }) => {
  const pending = approvals.filter((s) => s.status === "pending");
  const approved = approvals.filter((s) => s.status === "approved");

  const pendingByAge = {
    fresh: pending.filter((s) => daysSince(s.sent) < 7).length,
    aging: pending.filter((s) => daysSince(s.sent) >= 7 && daysSince(s.sent) < 14).length,
    stale: pending.filter((s) => daysSince(s.sent) >= 14 && daysSince(s.sent) < 20).length,
    redflag: pending.filter((s) => daysSince(s.sent) >= 20).length,
  };

  const turnaroundTimes = approved.map((s) =>
    Math.round((new Date(s.approvedOn) - new Date(s.sent)) / 86400000)
  );
  const avgTurnaround = turnaroundTimes.length
    ? Math.round(turnaroundTimes.reduce((a, b) => a + b, 0) / turnaroundTimes.length)
    : 0;
  const turnaroundPct = turnaroundTimes.length
    ? Math.round((turnaroundTimes.filter((t) => t <= 14).length / turnaroundTimes.length) * 100)
    : 100;

  const sortedPending = [...pending].sort((a, b) => daysSince(b.sent) - daysSince(a.sent));

  const isRedFlag = pendingByAge.redflag > 0;
  const isStale = pendingByAge.stale > 0 && !isRedFlag;

  return (
    <Card className={`bg-white border-none shadow-sm ${isRedFlag ? "border-l-4 border-l-red-400" : isStale ? "border-l-4 border-l-amber-400" : ""}`}>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <FileText size={16} /> Step Up Payment Approvals
        </CardTitle>
        <CardDescription>
          {isRedFlag
            ? `${pendingByAge.redflag} approvals stuck over 20 days — needs immediate attention`
            : `${pending.length} pending · tracking aging pipeline`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pipeline buckets */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { key: "fresh", label: "Fresh (<7d)", count: pendingByAge.fresh, color: "bg-emerald-500" },
            { key: "aging", label: "Aging (7-13d)", count: pendingByAge.aging, color: "bg-amber-500" },
            { key: "stale", label: "Stale (14-19d)", count: pendingByAge.stale, color: "bg-orange-500" },
            { key: "redflag", label: "Red Flag (20d+)", count: pendingByAge.redflag, color: "bg-red-500" },
          ].map((bucket) => (
            <div key={bucket.key} className="text-center p-3 bg-gray-50 rounded-xl">
              <p className={`text-2xl font-bold ${bucket.count > 0 ? bucket.color.replace("bg-", "text-") : "text-gray-400"}`}>{bucket.count}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{bucket.label}</p>
            </div>
          ))}
        </div>

        {/* Pending approvals */}
        {sortedPending.length > 0 ? (
          <div className="space-y-2">
            {sortedPending.map((a) => {
              const age = daysSince(a.sent);
              const isRed = age >= 20;
              const isStale = age >= 14 && age < 20;
              const isAging = age >= 7 && age < 14;
              return (
                <div key={a.id} className={`flex items-center justify-between p-3 rounded-xl ${isRed ? "bg-red-50" : isStale ? "bg-orange-50" : isAging ? "bg-amber-50" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isRed ? "bg-red-500" : isStale ? "bg-orange-500" : isAging ? "bg-amber-500" : "bg-emerald-500"}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{a.parent} → {a.student}</p>
                      <p className="text-xs text-gray-500">{a.grade} · Last contact: {a.lastContact}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{fmtMoney(a.amount)}</p>
                    <p className={`text-xs font-medium ${isRed ? "text-red-600" : isStale ? "text-orange-600" : "text-gray-500"}`}>{age}d pending</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center">
            <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-sm text-gray-500">No pending approvals — all caught up!</p>
          </div>
        )}

        {/* Approved stats */}
        {approved.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{approved.length}</span> approved this year · Avg turnaround{" "}
              <span className="font-semibold text-gray-700">{avgTurnaround}d</span> ·{" "}
              <span className="font-semibold text-emerald-600">{turnaroundPct}%</span> within 14 days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalPipelineCard;
