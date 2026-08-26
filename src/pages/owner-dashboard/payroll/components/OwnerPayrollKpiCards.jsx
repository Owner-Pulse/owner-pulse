import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, CheckCircle2, FileSpreadsheet } from "lucide-react";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "None";

const OwnerPayrollKpiCards = ({ metrics, nextPendingPeriod, daysRemaining, historyCount }) => {
  const nextDueDateText = metrics?.next_due_date
    ? fmtDate(metrics.next_due_date)
    : nextPendingPeriod
    ? fmtDate(nextPendingPeriod.dueDate || nextPendingPeriod.submission_due_date)
    : "None Scheduled";

  const daysLeft = metrics?.days_remaining ?? daysRemaining ?? null;
  const lastSubDate = metrics?.last_submission_date
    ? fmtDate(metrics.last_submission_date)
    : historyCount > 0
    ? "Recent"
    : "None";

  const activeCycles = metrics?.active_cycles_count ?? null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F]">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Next Due Date</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{nextDueDateText}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5 flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              daysLeft !== null && daysLeft <= 3
                ? "bg-[#AE4A3E]/10 text-[#AE4A3E]"
                : "bg-[#B78A2F]/10 text-[#8F6A1F]"
            }`}
          >
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Days Remaining</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {daysLeft !== null ? `${daysLeft} Days` : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#3E7A54]/10 flex items-center justify-center text-[#2F6042]">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Last Submission</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{lastSubDate}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Active Schedules</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {activeCycles !== null ? `${activeCycles} Cycles` : "Scheduled"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerPayrollKpiCards;
