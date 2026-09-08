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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
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
  const status = submission?.status || "submitted";
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
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden relative">
        {/* Subtle decorative top accent border */}
        <div className="h-1 w-full bg-gradient-to-r from-[#1E3A5F] via-[#2A4C7E] to-[#3E7A54]" />

        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center shrink-0 text-[#1E3A5F]">
                <ClipboardCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Latest Payroll Submission
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3E7A54]/10 text-[#2F6042] border border-[#3E7A54]/20">
                    {status}
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
                <Calendar size={13} className="text-[#1E3A5F]" />
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
                <Users size={13} className="text-[#1E3A5F]" />
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
                <DollarSign size={13} className="text-[#3E7A54]" />
                <span>Deductions</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#2F6042] leading-tight">
                  ${totalDeductions.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Child care & other</p>
              </div>
            </div>

            {/* PTO Requested */}
            <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100/80 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Clock size={13} className="text-[#B78A2F]" />
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
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/80 text-xs text-amber-900">
              <MessageSquare size={14} className="shrink-0 mt-0.5 text-amber-600" />
              <div className="min-w-0">
                <span className="font-semibold text-amber-950">Director Notes: </span>
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
