import React from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Calendar,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
  FileSpreadsheet,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/datetime";
import CardAccent from "@/components/ui/card-accent";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => {
  if (!d) return "—";
  return formatDate(d, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const LatestPayrollSubmissionCard = ({ submission, onNavigate }) => {
  if (!submission) return null;

  const cycle = submission?.payroll_cycle;
  const startDate = cycle?.start_date;
  const endDate = cycle?.end_date;
  const dueDate = cycle?.submission_due_date;
  const submittedBy =
    typeof submission?.submitted_by === "object"
      ? submission?.submitted_by?.name || submission?.submitted_by?.email
      : submission?.submitted_by || "Director";
  const submittedAt = submission?.submitted_at || submission?.created_at;
  const staffCount = submission?.staff_count ?? 0;
  const status = submission?.status;
  const normalizedStatus = String(status || "").toLowerCase();
  const statusTone = !status
    ? STATUS.none
    : /reject|failed|error/.test(normalizedStatus)
    ? STATUS.problem
    : /pending|draft|review/.test(normalizedStatus)
    ? STATUS.watch
    : /approv|submit|complete|paid/.test(normalizedStatus)
    ? STATUS.good
    : STATUS.none;
  const items = Array.isArray(submission?.items) ? submission.items : [];

  // Deductions sum
  const totalDeductions = items.reduce((sum, item) => {
    if (item.item_type === "child_care_deduction" || item.item_type === "other_deduction") {
      return sum + (Number(item.amount) || 0);
    }
    return sum;
  }, 0);

  // PTO total hours
  const totalPtoHours = items.reduce((sum, item) => {
    if (item.item_type === "pto") {
      return sum + (Number(item.hours) || 0);
    }
    return sum;
  }, 0);

  const notes = submission?.preschool_notes || submission?.elementary_notes;

  return (
    <motion.div variants={itemVariants}>
      <Card className="relative bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
        <CardAccent group="staff" />

        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ACCENTS.staff.icon}`}>
                <ClipboardCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Latest Payroll Submission
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusTone.badge}`}>
                    {status || "No status"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Submitted by <span className="font-semibold text-gray-800">{submittedBy}</span> · {fmtDate(submittedAt)}
                </p>
              </div>
            </div>

            <Button
              onClick={onNavigate}
              className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs sm:text-sm font-semibold rounded-xl h-9 px-4 flex items-center justify-center gap-1.5 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
            >
              <span>Review in Payroll</span>
              <ArrowRight size={15} />
            </Button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Pay Period Cycle */}
            <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100/80 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Calendar size={13} className={ACCENTS.staff.text} />
                <span>Cycle Period</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {fmtDate(startDate)} – {fmtDate(endDate)}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Due {fmtDate(dueDate)}</p>
              </div>
            </div>

            {/* Staff Count */}
            <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100/80 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Users size={13} className={ACCENTS.staff.text} />
                <span>Staff Count</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {staffCount} {staffCount === 1 ? "Employee" : "Employees"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {items.length} line item{items.length === 1 ? "" : "s"} logged
                </p>
              </div>
            </div>

            {/* Total Deductions */}
            <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100/80 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <DollarSign size={13} className={ACCENTS.staff.text} />
                <span>Deductions</span>
              </div>
              <div>
                <p className={`text-xs sm:text-sm font-bold leading-tight ${ACCENTS.staff.text}`}>
                  ${totalDeductions.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Child care & other</p>
              </div>
            </div>

            {/* PTO Requested */}
            <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100/80 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Clock size={13} className={ACCENTS.staff.text} />
                <span>PTO Logged</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {totalPtoHours} Hours
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {totalPtoHours > 0 ? `~${Math.round(totalPtoHours / 8)} days off` : "No PTO days"}
                </p>
              </div>
            </div>
          </div>

          {/* Optional Notes from Director */}
          {notes && (
            <div className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs ${ACCENTS.operations.soft} ${ACCENTS.operations.border} text-gray-700`}>
              <MessageSquare size={14} className={`shrink-0 mt-0.5 ${ACCENTS.operations.text}`} />
              <div className="min-w-0">
                <span className="font-semibold text-gray-900">Director Notes: </span>
                <span>{notes}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LatestPayrollSubmissionCard;
