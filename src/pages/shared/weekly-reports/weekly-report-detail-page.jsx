import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  NotebookPen,
  Pencil,
  PiggyBank,
  RotateCcw,
  Save,
  UserRound,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import {
  useConfirmWeeklyReport,
  useGetWeeklyReport,
  useReopenWeeklyReport,
  useUpdateWeeklyReportNotes,
} from "@/hooks/weekly-report.hook";
import { fmtMoney, fmtUpdatedAt, fmtWeek, parseFieldErrors } from "@/lib/collections";
import { fmtRange, formFromReport, serverGridTotals, toNum, weekDays } from "@/lib/weekly-report";
import AttendanceGrid from "./components/AttendanceGrid";
import CheckPanel, { cardFromReport, cashFromReport } from "./components/CheckPanel";
import { CardBadge, CashBadge, LateBadge, StatusBadge } from "./components/CheckBadges";
import { FieldError, Section, TextArea } from "./components/FormBits";
import { OpenPdfButton, PdfFrame, useReportPdfUrl } from "./components/PdfPanel";
import { useReportRole } from "./weekly-reports-page";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const Value = ({ label, value, money = false, strong = false }) => {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className="min-w-0 p-2.5 rounded-xl bg-gray-50">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 truncate">{label}</p>
      <p className={`text-sm tabular-nums break-words ${empty ? "text-gray-300" : strong ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>
        {empty ? "—" : money ? fmtMoney(value, { cents: true }) : value}
      </p>
    </div>
  );
};

const personLine = (label, person, at) =>
  person?.name ? `${label} ${person.name}${at ? ` · ${fmtUpdatedAt(at)}` : ""}` : null;

const WeeklyReportDetailPage = () => {
  const { id } = useParams();
  const role = useReportRole();
  const navigate = useNavigate();
  const { report, isLoading, isError, refetch } = useGetWeeklyReport(role, id);
  const { confirmReport, isPending: isConfirming } = useConfirmWeeklyReport(role);
  const { reopenReport, isPending: isReopening } = useReopenWeeklyReport();
  const { updateNotes, isPending: isSavingNotes } = useUpdateWeeklyReportNotes();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [notesError, setNotesError] = useState(null);

  // the Owner's notes are kept apart from the Director's notes
  useEffect(() => {
    if (report) setOwnerNotes(report.owner_notes || "");
  }, [report]);

  const form = useMemo(() => (report ? formFromReport(report) : null), [report]);
  const days = useMemo(() => weekDays(report?.week_start), [report?.week_start]);
  const hasFile = !!report?.file;
  const { url: pdfUrl, isLoading: pdfLoading, isError: pdfError } = useReportPdfUrl({ fileUrl: report?.file?.url });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <Card className="bg-white border-none shadow-sm p-8 text-center">
        <p className="text-sm text-gray-500">Could not load this weekly report.</p>
        <div className="flex justify-center gap-2 mt-3">
          <Button variant="outline" onClick={() => refetch()} className="h-9">Try again</Button>
          <Button variant="outline" onClick={() => navigate(`/${role}/weekly-reports`)} className="h-9">Back to the list</Button>
        </div>
      </Card>
    );
  }

  const isConfirmed = report.status === "confirmed";
  const cash = cashFromReport(report);
  const card = cardFromReport(report);
  const dailyCash = toNum(report.cash_check?.values?.daily_cash_total);

  const saveOwnerNotes = async () => {
    setNotesError(null);
    try {
      // an empty box clears the Owner's notes
      await updateNotes({ id, notes: ownerNotes.trim() || null });
    } catch (err) {
      setNotesError(parseFieldErrors(err).notes || null);
    }
  };

  const confirm = async () => {
    try {
      await confirmReport(id);
    } catch {
      // the hook shows the reason
    }
    setConfirmOpen(false);
  };

  const sections = (
    <>
      <CheckPanel cash={cash} card={card} title="Checks" />

      <Section tone="cash" icon={Banknote} title="Cash">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Value label="Receipts book start #" value={report.receipts_book_start} />
          <Value label="Receipts book end #" value={report.receipts_book_end} />
          <Value label="Receipts book total" value={toNum(report.receipts_book_total)} money />
        </div>
        <div className="mt-3 p-3 rounded-xl bg-[#3E7A54]/[0.05] border border-[#3E7A54]/15">
          <p className="text-xs font-semibold text-[#2F6042] mb-2">Cash per day</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {days.map((d) => (
              <Value key={d.date} label={`${d.name} ${fmtWeek(d.date)}`} value={toNum(form.cash_days[d.date])} money />
            ))}
            <div className="min-w-0 p-2.5 rounded-xl bg-[#3E7A54] text-white">
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">Week total</p>
              <p className="text-sm font-bold tabular-nums">{dailyCash === null ? "—" : fmtMoney(dailyCash, { cents: true })}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          <Value label="Deposit slip cash" value={toNum(report.deposit_slip_cash)} money />
          <Value label="Procare cash total" value={toNum(report.procare_cash_total)} money />
          <Value label="Total deposited" value={toNum(report.total_deposited)} money strong />
          <Value label="Bank deposit" value={toNum(report.bank_deposit_amount)} money strong />
          <Value label="Bank deposit date" value={report.bank_deposit_date ? fmtWeek(report.bank_deposit_date, { year: true }) : null} />
        </div>
      </Section>

      <Section tone="cards" icon={CreditCard} title="Cards">
        <div className="grid grid-cols-2 gap-2">
          <Value label="Card payments (cover sheet)" value={toNum(report.credit_card_total)} money strong />
          <Value label="Procare card total" value={toNum(report.procare_card_total)} money />
        </div>
      </Section>

      <Section tone="students" icon={GraduationCap} title="Students">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Value label="Preschool" value={report.enrolled_preschool} strong />
          <Value label="K-8" value={report.enrolled_k8} strong />
          <Value label="Enrolled this week" value={report.enrolled_this_week} />
          <Value label="Lost this week" value={report.lost_this_week} />
        </div>
      </Section>

      <Section tone="attendance" icon={Users} title="Attendance">
        <AttendanceGrid days={days} cells={form.headcount} totals={serverGridTotals(report.headcount)} />
      </Section>

      <Section tone="collections" icon={PiggyBank} title="Collections" hint="From the Account Balance Summary">
        <div className="sm:max-w-xs">
          <Value label="Total in collections" value={toNum(report.collections_balance)} money strong />
        </div>
      </Section>

      <Section tone="notes" icon={NotebookPen} title="Staff & notes">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Value label="Absent staff" value={report.absent_staff} />
          <Value label="Director notes" value={report.notes} />
        </div>
        {role === "director" && report.owner_notes && (
          <div className="mt-2">
            <Value label="Owner notes" value={report.owner_notes} />
          </div>
        )}
        {role === "owner" && (
          <div className="mt-3">
            <label htmlFor="owner-notes" className="block text-xs font-semibold text-gray-500 mb-1.5">Owner notes</label>
            <TextArea id="owner-notes" value={ownerNotes} onChange={setOwnerNotes} error={notesError} disabled={isSavingNotes} placeholder="Add a note for this week" />
            <FieldError message={notesError} />
            <div className="flex justify-end mt-2">
              <Button
                onClick={saveOwnerNotes}
                disabled={isSavingNotes || ownerNotes === (report.owner_notes || "")}
                className="h-9 bg-[#1E3A5F] hover:bg-[#15294A] text-white"
              >
                <Save size={14} className="mr-1.5" /> {isSavingNotes ? "Saving..." : "Save notes"}
              </Button>
            </div>
          </div>
        )}
      </Section>
    </>
  );

  const people = [
    personLine("Entered by", report.created_by, report.created_at),
    personLine("Confirmed by", report.confirmed_by, report.confirmed_at),
  ].filter(Boolean);

  return (
    <motion.div className="space-y-5 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link to={`/${role}/weekly-reports`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A5F] hover:underline w-fit">
          <ArrowLeft size={14} /> Weekly reports
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{fmtRange(report.week_start, report.week_end)}</h1>
              <StatusBadge status={report.status} />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <CashBadge check={report.cash_check} />
              <CardBadge check={report.card_check} />
              {cash.late && <LateBadge days={cash.lateDays} />}
            </div>
            {people.length > 0 && (
              <p className="text-[11px] text-gray-500 mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
                {people.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1">
                    <UserRound size={11} /> {p}
                  </span>
                ))}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {hasFile && <OpenPdfButton url={pdfUrl} isLoading={pdfLoading} className="lg:hidden" />}
            {role === "director" && !isConfirmed && (
              <>
                <Button variant="outline" onClick={() => navigate(`/director/weekly-reports/${id}/edit`)} className="h-9">
                  <Pencil size={14} className="mr-1.5" /> Edit
                </Button>
                <Button onClick={() => setConfirmOpen(true)} className="h-9 bg-[#3E7A54] hover:bg-[#2F6042] text-white">
                  <CheckCircle2 size={14} className="mr-1.5" /> Confirm
                </Button>
              </>
            )}
            {role === "owner" && !isConfirmed && (
              <Button onClick={() => setConfirmOpen(true)} className="h-9 bg-[#3E7A54] hover:bg-[#2F6042] text-white">
                <CheckCircle2 size={14} className="mr-1.5" /> Confirm
              </Button>
            )}
            {role === "owner" && isConfirmed && (
              <Button variant="outline" onClick={() => setReopenOpen(true)} className="h-9 border-[#B78A2F]/40 text-[#8F6A1F] hover:bg-[#B78A2F]/10">
                <RotateCcw size={14} className="mr-1.5" /> Reopen
              </Button>
            )}
          </div>
        </div>
      </div>

      {hasFile ? (
        <div className="lg:grid lg:grid-cols-2 lg:gap-5 lg:items-start">
          <aside className="hidden lg:block lg:sticky lg:top-0 h-[calc(100vh-7.5rem)]">
            <PdfFrame url={pdfUrl} isLoading={pdfLoading} isError={pdfError} name={report.file?.original_name} className="h-full" />
          </aside>
          <motion.div variants={containerVariants} className="space-y-5 min-w-0">{sections}</motion.div>
        </div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-5 max-w-5xl">{sections}</motion.div>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => !isConfirming && setConfirmOpen(false)}
        onConfirm={confirm}
        title="Confirm this weekly report?"
        message={
          role === "owner"
            ? "The Director's draft is confirmed as it is: attendance and Collections are updated. You can reopen it later if it needs changes."
            : "It is sent to the Owner and can't be edited after this unless the Owner reopens it."
        }
        confirmText="Confirm report"
        type="success"
        isLoading={isConfirming}
      />
      <ConfirmationModal
        isOpen={reopenOpen}
        onClose={() => !isReopening && setReopenOpen(false)}
        onConfirm={() => reopenReport(id, { onSettled: () => setReopenOpen(false) })}
        title="Reopen this report?"
        message="It goes back to a draft so the Director can correct it and confirm again."
        confirmText="Reopen"
        type="warning"
        isLoading={isReopening}
      />
    </motion.div>
  );
};

export default WeeklyReportDetailPage;
