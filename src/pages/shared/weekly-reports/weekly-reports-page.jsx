import React from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router";
import { ChevronRight, FileText, Plus, ReceiptText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetWeeklyReports } from "@/hooks/weekly-report.hook";
import { fmtMoney } from "@/lib/collections";
import { fmtRange } from "@/lib/weekly-report";
import { CardBadge, CashBadge, LateBadge, StatusBadge } from "./components/CheckBadges";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export const useReportRole = () => (useLocation().pathname.startsWith("/owner") ? "owner" : "director");

const Total = ({ label, value, tone }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
    <p className={`text-lg font-bold tabular-nums truncate ${tone}`}>{value == null ? "—" : fmtMoney(value)}</p>
  </div>
);

const ReportCard = ({ report, onOpen }) => {
  const totals = report.totals || {};
  const accent =
    report.cash_check_status === "mismatch" || report.card_check_status === "mismatch"
      ? "bg-[#AE4A3E]"
      : report.late_deposit || report.status !== "confirmed"
      ? "bg-[#B78A2F]"
      : report.status === "confirmed"
      ? "bg-[#3E7A54]"
      : "bg-[#B78A2F]";

  return (
    <motion.div variants={itemVariants}>
      <Card
        onClick={onOpen}
        className="relative bg-white border-none shadow-sm hover:shadow-md transition-all cursor-pointer h-full py-0 gap-0"
      >
        <span className={`absolute left-0 inset-y-0 w-1 ${accent}`} aria-hidden="true" />
        <div className="p-4 pl-5 flex flex-col gap-3 h-full">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Week</p>
              <p className="text-sm font-bold text-gray-900">{fmtRange(report.week_start, report.week_end)}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {report.has_file && (
                <span title="PDF attached" className="p-1 rounded-md bg-[#AE4A3E]/10 text-[#AE4A3E]">
                  <FileText size={13} />
                </span>
              )}
              <StatusBadge status={report.status} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Total label="Cash deposited" value={totals.total_deposited} tone="text-[#2F6042]" />
            <Total label="Card payments" value={totals.credit_cards} tone="text-[#1E3A5F]" />
            <Total label="Bank deposit" value={totals.bank_deposit} tone="text-gray-900" />
            <Total label="In collections" value={totals.collections_balance} tone="text-gray-900" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <CashBadge check={report.cash_check_status} amount={report.cash_max_difference} />
            <CardBadge check={report.card_check_status} amount={report.card_difference} />
            {report.late_deposit && <LateBadge />}
          </div>

          <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>
              {report.status === "confirmed" && report.confirmed_at
                ? `Confirmed ${new Date(report.confirmed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "Not confirmed yet"}
            </span>
            <ChevronRight size={14} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const WeeklyReportsPage = () => {
  const role = useReportRole();
  const navigate = useNavigate();
  const { reports, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetWeeklyReports(role);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <ReceiptText className="text-[#3E7A54] shrink-0" size={28} /> Weekly Report & Deposits
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {role === "director"
              ? "Type in the paper weekly report, check the deposits and confirm."
              : "Every week's deposits, checks and attendance from the Director."}
          </p>
        </div>
        {role === "director" && (
          <Button onClick={() => navigate("/director/weekly-reports/new")} className="h-10 bg-[#1E3A5F] hover:bg-[#15294A] text-white shrink-0">
            <Plus size={16} className="mr-1.5" /> New weekly report
          </Button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="bg-white border-none shadow-sm p-8 text-center">
          <p className="text-sm text-gray-500">Could not load the weekly reports.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-3 h-9 mx-auto">Try again</Button>
        </Card>
      ) : reports.length === 0 ? (
        <Card className="bg-white border-none shadow-sm p-10 flex flex-col items-center text-center">
          <div className="p-3 rounded-2xl bg-[#3E7A54]/10 text-[#3E7A54]">
            <ReceiptText size={26} />
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-3">No weekly reports yet</p>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">
            {role === "director" ? "Start with this week's paper report." : "The Director's weekly reports will show up here."}
          </p>
          {role === "director" && (
            <Button onClick={() => navigate("/director/weekly-reports/new")} className="mt-4 h-9 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
              <Plus size={15} className="mr-1.5" /> New weekly report
            </Button>
          )}
        </Card>
      ) : (
        <>
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} onOpen={() => navigate(`/${role}/weekly-reports/${report.id}`)} />
            ))}
          </motion.div>
          {hasNextPage && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="h-9">
                {isFetchingNextPage ? "Loading..." : "Load older weeks"}
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default WeeklyReportsPage;
