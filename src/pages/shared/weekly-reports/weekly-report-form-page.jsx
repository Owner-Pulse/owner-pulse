import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileUp,
  GraduationCap,
  Info,
  Loader2,
  NotebookPen,
  PiggyBank,
  Save,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import {
  useConfirmWeeklyReport,
  useGetWeeklyReport,
  useGetWeeklyReports,
  useSaveWeeklyReport,
} from "@/hooks/weekly-report.hook";
import { fmtMoney, normalizeWeek, thisMonday, toYmd } from "@/lib/collections";
import {
  MAX_PDF_MB,
  buildPayload,
  emptyForm,
  fmtRange,
  formFromReport,
  liveCardCheck,
  liveCashCheck,
  mapReportErrors,
  sumCashDays,
  weekDays,
} from "@/lib/weekly-report";
import AttendanceGrid from "./components/AttendanceGrid";
import CheckPanel, { cardFromForm, cashFromForm } from "./components/CheckPanel";
import { CardBadge, CashBadge } from "./components/CheckBadges";
import { CountInput, Field, FieldError, MoneyInput, Section, TextArea, TextInput, inputClass } from "./components/FormBits";
import { OpenPdfButton, PdfFrame, useReportPdfUrl } from "./components/PdfPanel";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const AUTOSAVE_MS = 20000;

const fmtTime = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

/**
 * Director: type in the paper weekly report — /director/weekly-reports/new and /director/weekly-reports/:id/edit
 */
const WeeklyReportFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { report, isLoading } = useGetWeeklyReport("director", id);
  const { reports } = useGetWeeklyReports("director");
  const { saveDraft, isPending: isSaving } = useSaveWeeklyReport();
  const { confirmReport, isPending: isConfirming } = useConfirmWeeklyReport("director");

  const [form, setForm] = useState(() => location.state?.form || emptyForm(thisMonday()));
  const [pdf, setPdf] = useState({ file: null, uploaded: false });
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState(null); // { at: Date } | { failed: true }
  const [confirmOpen, setConfirmOpen] = useState(false);

  const initRef = useRef(location.state?.form ? id : null);
  const listIndexRef = useRef({});
  const editsRef = useRef(0);
  const fileInputRef = useRef(null);

  // load the saved draft once per report
  useEffect(() => {
    if (!report || initRef.current === id) return;
    initRef.current = id;
    setForm(formFromReport(report));
    setDirty(false);
  }, [report, id]);

  // a confirmed report is read-only
  useEffect(() => {
    if (report?.status === "confirmed") navigate(`/director/weekly-reports/${id}`, { replace: true });
  }, [report?.status, id, navigate]);

  const days = useMemo(() => weekDays(form.week_start), [form.week_start]);
  const cashTotal = sumCashDays(form.cash_days);
  const liveCash = liveCashCheck(form);
  const liveCard = liveCardCheck(form);

  const hasServerFile = !!(report?.has_file || report?.file);
  const { url: pdfUrl, isLoading: pdfLoading, isError: pdfError } = useReportPdfUrl({
    role: "director",
    reportId: id,
    hasFile: hasServerFile,
    localFile: pdf.file,
  });
  const hasPdf = !!pdf.file || hasServerFile;
  const pdfName = pdf.file?.name || report?.file?.original_name;

  // another report already covers the picked week (new form only)
  const weekClash = !id ? reports.find((r) => normalizeWeek(r.week_start) === form.week_start) : null;

  const busy = isSaving || isConfirming;

  // ─── Editing ───────────────────────────────────────────────────
  const touch = (errorKey) => {
    editsRef.current += 1;
    setDirty(true);
    if (errorKey)
      setErrors((prev) => {
        if (!prev[errorKey]) return prev;
        const rest = { ...prev };
        delete rest[errorKey];
        return rest;
      });
  };

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    touch(key);
  };

  const setCashDay = (date) => (value) => {
    setForm((prev) => ({ ...prev, cash_days: { ...prev.cash_days, [date]: value } }));
    touch(`cash_days|${date}`);
  };

  const setCell = (key, value) => {
    setForm((prev) => ({ ...prev, headcount: { ...prev.headcount, [key]: value } }));
    touch(`headcount|${key}`);
  };

  const pickWeek = (e) => {
    const week = normalizeWeek(e.target.value);
    if (!week) return;
    // move what was typed to the same weekday of the new week
    setForm((prev) => {
      const from = weekDays(prev.week_start).map((d) => d.date);
      const to = weekDays(week).map((d) => d.date);
      const moveDate = (date) => to[from.indexOf(date)];
      const cash_days = {};
      Object.entries(prev.cash_days).forEach(([date, v]) => moveDate(date) && (cash_days[moveDate(date)] = v));
      const headcount = {};
      Object.entries(prev.headcount).forEach(([key, v]) => {
        const [room, date] = key.split("|");
        if (moveDate(date)) headcount[`${room}|${moveDate(date)}`] = v;
      });
      return { ...prev, week_start: week, cash_days, headcount };
    });
    touch("week_start");
  };

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrors((prev) => ({ ...prev, file: "Attach the report as a PDF." }));
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: `The PDF must be ${MAX_PDF_MB} MB or smaller.` }));
      return;
    }
    setPdf({ file, uploaded: false });
    touch("file");
  };

  // ─── Saving ────────────────────────────────────────────────────
  const save = useCallback(
    async ({ silent = false } = {}) => {
      if (!form.week_start) {
        setErrors((prev) => ({ ...prev, week_start: "Pick the week of this report." }));
        return null;
      }
      const editsAtStart = editsRef.current;
      const fileToSend = pdf.file && !pdf.uploaded ? pdf.file : null;
      const { payload, listIndex } = buildPayload(form, fileToSend);
      listIndexRef.current = listIndex;

      try {
        const res = await saveDraft({ payload, silent });
        const saved = res?.data || {};
        if (editsRef.current === editsAtStart) setDirty(false);
        if (fileToSend) setPdf((prev) => (prev.file === fileToSend ? { ...prev, uploaded: true } : prev));
        setErrors({});
        setSaveState({ at: new Date() });
        if (!id && saved.id) navigate(`/director/weekly-reports/${saved.id}/edit`, { replace: true, state: { form } });
        return saved;
      } catch (err) {
        setErrors(mapReportErrors(err, listIndex));
        setSaveState({ failed: true });
        return null;
      }
    },
    [form, pdf, saveDraft, id, navigate]
  );

  // save often: a quiet save a little while after the last change
  useEffect(() => {
    if (!dirty || busy || !form.week_start) return;
    const t = setTimeout(() => save({ silent: true }), AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [dirty, busy, form, save]);

  const handleConfirm = async () => {
    let reportId = id;
    if (dirty || !reportId || (pdf.file && !pdf.uploaded)) {
      const saved = await save({ silent: true });
      if (!saved?.id && !reportId) {
        setConfirmOpen(false);
        toast.error("Fix the highlighted fields, then confirm.");
        return;
      }
      reportId = saved?.id || reportId;
    }
    try {
      await confirmReport(reportId);
      setConfirmOpen(false);
      navigate(`/director/weekly-reports/${reportId}`);
    } catch (err) {
      setErrors(mapReportErrors(err, listIndexRef.current));
      setConfirmOpen(false);
    }
  };

  if (id && isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  // ─── Sections ──────────────────────────────────────────────────
  const checkPanel = <CheckPanel cash={cashFromForm(form)} card={cardFromForm(form)} />;

  const sections = (
    <>
      <Section tone="cash" icon={Banknote} title="Cash" hint="Receipts book, daily cash, deposit slip, Procare and bank">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field id="receipts_book_start" label="Receipts book start #" error={errors.receipts_book_start}>
            <TextInput id="receipts_book_start" value={form.receipts_book_start} onChange={set("receipts_book_start")} error={errors.receipts_book_start} disabled={busy} placeholder="e.g. 4501" />
          </Field>
          <Field id="receipts_book_end" label="Receipts book end #" error={errors.receipts_book_end}>
            <TextInput id="receipts_book_end" value={form.receipts_book_end} onChange={set("receipts_book_end")} error={errors.receipts_book_end} disabled={busy} placeholder="e.g. 4537" />
          </Field>
          <Field id="receipts_book_total" label="Receipts book total" error={errors.receipts_book_total}>
            <MoneyInput id="receipts_book_total" value={form.receipts_book_total} onChange={set("receipts_book_total")} error={errors.receipts_book_total} disabled={busy} />
          </Field>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-[#3E7A54]/[0.05] border border-[#3E7A54]/15">
          <p className="text-xs font-semibold text-[#2F6042] mb-2">Cash per day</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {days.map((d) => (
              <Field key={d.date} id={`cash-${d.date}`} label={d.name} error={errors[`cash_days|${d.date}`]}>
                <MoneyInput id={`cash-${d.date}`} value={form.cash_days[d.date] ?? ""} onChange={setCashDay(d.date)} error={errors[`cash_days|${d.date}`]} disabled={busy} />
              </Field>
            ))}
            <div className="min-w-0">
              <p className="block text-xs font-semibold text-[#2F6042] mb-1.5">Week total</p>
              <p className="h-10 px-3 rounded-xl bg-[#3E7A54] text-white font-bold text-sm tabular-nums flex items-center">
                {fmtMoney(cashTotal, { cents: true })}
              </p>
            </div>
          </div>
          <FieldError message={errors.cash_days} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <Field id="deposit_slip_cash" label="Deposit slip cash" error={errors.deposit_slip_cash}>
            <MoneyInput id="deposit_slip_cash" value={form.deposit_slip_cash} onChange={set("deposit_slip_cash")} error={errors.deposit_slip_cash} disabled={busy} />
          </Field>
          <Field id="procare_cash_total" label="Procare cash total" error={errors.procare_cash_total}>
            <MoneyInput id="procare_cash_total" value={form.procare_cash_total} onChange={set("procare_cash_total")} error={errors.procare_cash_total} disabled={busy} />
          </Field>
          <Field id="total_deposited" label="Total deposited (cover sheet)" error={errors.total_deposited}>
            <MoneyInput id="total_deposited" value={form.total_deposited} onChange={set("total_deposited")} error={errors.total_deposited} disabled={busy} />
          </Field>
          <Field id="bank_deposit_amount" label="Bank deposit amount" error={errors.bank_deposit_amount}>
            <MoneyInput id="bank_deposit_amount" value={form.bank_deposit_amount} onChange={set("bank_deposit_amount")} error={errors.bank_deposit_amount} disabled={busy} />
          </Field>
          <Field id="bank_deposit_date" label="Bank deposit date" error={errors.bank_deposit_date}>
            <TextInput id="bank_deposit_date" type="date" value={form.bank_deposit_date} onChange={set("bank_deposit_date")} error={errors.bank_deposit_date} disabled={busy} />
          </Field>
        </div>
      </Section>

      <Section tone="cards" icon={CreditCard} title="Cards" hint="Card payments on the cover sheet against Procare">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field id="credit_card_total" label="Card payments (cover sheet)" error={errors.credit_card_total}>
            <MoneyInput id="credit_card_total" value={form.credit_card_total} onChange={set("credit_card_total")} error={errors.credit_card_total} disabled={busy} />
          </Field>
          <Field id="procare_card_total" label="Procare card total" error={errors.procare_card_total}>
            <MoneyInput id="procare_card_total" value={form.procare_card_total} onChange={set("procare_card_total")} error={errors.procare_card_total} disabled={busy} />
          </Field>
        </div>
      </Section>

      <div className={hasPdf ? "" : "lg:hidden"}>{checkPanel}</div>

      <Section tone="students" icon={GraduationCap} title="Students" hint="Enrollment as of the end of the week">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field id="enrolled_preschool" label="Enrolled Preschool" error={errors.enrolled_preschool}>
            <CountInput id="enrolled_preschool" value={form.enrolled_preschool} onChange={set("enrolled_preschool")} error={errors.enrolled_preschool} disabled={busy} />
          </Field>
          <Field id="enrolled_k8" label="Enrolled K-8" error={errors.enrolled_k8}>
            <CountInput id="enrolled_k8" value={form.enrolled_k8} onChange={set("enrolled_k8")} error={errors.enrolled_k8} disabled={busy} />
          </Field>
          <Field id="enrolled_this_week" label="Enrolled this week" error={errors.enrolled_this_week}>
            <CountInput id="enrolled_this_week" value={form.enrolled_this_week} onChange={set("enrolled_this_week")} error={errors.enrolled_this_week} disabled={busy} />
          </Field>
          <Field id="lost_this_week" label="Lost this week" error={errors.lost_this_week}>
            <CountInput id="lost_this_week" value={form.lost_this_week} onChange={set("lost_this_week")} error={errors.lost_this_week} disabled={busy} />
          </Field>
        </div>
      </Section>

      <Section tone="attendance" icon={Users} title="Attendance" hint="Children present per room, Monday to Friday">
        <AttendanceGrid days={days} cells={form.headcount} onChange={setCell} errors={errors} disabled={busy} />
        {Object.keys(errors).some((k) => k.startsWith("headcount")) && (
          <ul className="mt-2 space-y-0.5">
            {Object.entries(errors)
              .filter(([k]) => k.startsWith("headcount"))
              .map(([k, m]) => (
                <li key={k}>
                  <FieldError message={k === "headcount" ? m : `${k.split("|")[1]}, ${k.split("|")[2] || ""}: ${m}`} />
                </li>
              ))}
          </ul>
        )}
      </Section>

      <Section tone="collections" icon={PiggyBank} title="Collections" hint="From the Account Balance Summary">
        <div className="sm:max-w-xs">
          <Field id="collections_balance" label="Total in collections" hint="This updates the Collections card." error={errors.collections_balance}>
            <MoneyInput id="collections_balance" value={form.collections_balance} onChange={set("collections_balance")} error={errors.collections_balance} disabled={busy} />
          </Field>
        </div>
      </Section>

      <Section tone="notes" icon={NotebookPen} title="Staff & notes">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field id="absent_staff" label="Absent staff" error={errors.absent_staff}>
            <TextArea id="absent_staff" value={form.absent_staff} onChange={set("absent_staff")} error={errors.absent_staff} disabled={busy} placeholder="e.g. Ms. Hart (Tue, sick)" />
          </Field>
          <Field id="notes" label="Notes" error={errors.notes}>
            <TextArea id="notes" value={form.notes} onChange={set("notes")} error={errors.notes} disabled={busy} placeholder="Anything the Owner should know about this week" />
          </Field>
        </div>
      </Section>
    </>
  );

  const saveLabel = isSaving
    ? "Saving..."
    : saveState?.failed
    ? "Not saved — check the highlighted fields"
    : dirty
    ? "Unsaved changes"
    : saveState?.at
    ? `Saved ${fmtTime(saveState.at)}`
    : id
    ? "Draft"
    : "Not saved yet";

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link to="/director/weekly-reports" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A5F] hover:underline w-fit">
          <ArrowLeft size={14} /> Weekly reports
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{id ? "Weekly report" : "New weekly report"}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{form.week_start ? fmtRange(form.week_start) : "Pick the week"}</p>
          </div>
        </div>
      </div>

      {/* Week + PDF */}
      <Card className="bg-white border-none shadow-sm py-0 gap-0">
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-4">
          <div>
            <label htmlFor="week_start" className="block text-xs font-semibold text-gray-500 mb-1.5">
              <CalendarDays size={12} className="inline mr-1 -mt-0.5" /> Week *
            </label>
            <input
              id="week_start"
              type="date"
              value={form.week_start}
              max={toYmd(new Date())}
              onChange={pickWeek}
              disabled={busy || !!id}
              className={inputClass(errors.week_start)}
            />
            <p className="mt-1 text-[11px] text-gray-400">{id ? "The week is fixed once saved." : "Any day of the week; it starts on Monday."}</p>
            <FieldError message={errors.week_start || errors.week_end} />
            {weekClash && (
              <p className="mt-2 flex items-start gap-1.5 p-2.5 rounded-xl bg-[#1E3A5F]/[0.06] border border-[#1E3A5F]/15 text-[11px] text-[#1E3A5F]">
                <Info size={12} className="shrink-0 mt-0.5" />
                <span>
                  This week already has a report.{" "}
                  <Link
                    to={weekClash.status === "confirmed" ? `/director/weekly-reports/${weekClash.id}` : `/director/weekly-reports/${weekClash.id}/edit`}
                    className="font-semibold underline"
                  >
                    Open it
                  </Link>
                </span>
              </p>
            )}
          </div>

          <div className="min-w-0">
            <p className="block text-xs font-semibold text-gray-500 mb-1.5">Paper report (PDF)</p>
            <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={pickFile} className="hidden" />
            {hasPdf ? (
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-[#AE4A3E]/20 bg-[#AE4A3E]/[0.04]">
                <span className="p-1.5 rounded-lg bg-[#AE4A3E]/10 text-[#AE4A3E] shrink-0">
                  <FileUp size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{pdfName || "Weekly report.pdf"}</p>
                  <p className="text-[11px] text-gray-500">
                    {pdf.file && !pdf.uploaded ? "Uploads with the next save" : "Attached"}
                    <span className="hidden lg:inline"> · shown on the left</span>
                  </p>
                </div>
                <OpenPdfButton url={pdfUrl} isLoading={pdfLoading} className="lg:hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={busy} className="h-9">
                  <Upload size={14} className="mr-1.5" /> Replace
                </Button>
                {pdf.file && !pdf.uploaded && (
                  <button
                    type="button"
                    onClick={() => setPdf({ file: null, uploaded: false })}
                    aria-label="Remove the new PDF"
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className={`w-full flex items-center justify-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors cursor-pointer ${
                  errors.file ? "border-[#AE4A3E] text-[#8A362C]" : "border-gray-200 text-gray-500 hover:border-[#1E3A5F]/40 hover:text-[#1E3A5F] hover:bg-[#1E3A5F]/[0.03]"
                }`}
              >
                <Upload size={18} /> Upload the scanned report (PDF, up to {MAX_PDF_MB} MB)
              </button>
            )}
            <FieldError message={errors.file} />
          </div>
        </div>
      </Card>

      {/* Form — split view next to the PDF on desktop */}
      {hasPdf ? (
        <div className="lg:grid lg:grid-cols-2 lg:gap-5 lg:items-start">
          <aside className="hidden lg:block lg:sticky lg:top-0 h-[calc(100vh-7.5rem)]">
            <PdfFrame url={pdfUrl} isLoading={pdfLoading} isError={pdfError} name={pdfName} className="h-full" />
          </aside>
          <motion.div variants={containerVariants} className="space-y-5 min-w-0">
            {sections}
          </motion.div>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5 lg:items-start">
          <motion.div variants={containerVariants} className="space-y-5 min-w-0">
            {sections}
          </motion.div>
          <aside className="hidden lg:block lg:sticky lg:top-0">{checkPanel}</aside>
        </div>
      )}

      {/* Action bar */}
      <div className="sticky bottom-0 z-20 -mx-5 px-5 pb-1 pt-3 bg-gradient-to-t from-gray-50 via-gray-50/95 to-gray-50/0">
        <Card className="bg-white border-none shadow-lg py-0 gap-0">
          <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
              <CashBadge check={liveCash.status} amount={liveCash.maxDifference} />
              <CardBadge check={liveCard.status} amount={liveCard.difference} />
              <span className={`text-[11px] ml-1 ${saveState?.failed ? "text-[#8A362C] font-semibold" : "text-gray-400"}`}>
                {isSaving && <Loader2 size={11} className="inline mr-1 animate-spin" />}
                {saveLabel}
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => save()} disabled={busy} className="flex-1 sm:flex-none h-10">
                <Save size={15} className="mr-1.5" /> Save draft
              </Button>
              <Button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={busy || !form.week_start}
                className="flex-1 sm:flex-none h-10 bg-[#3E7A54] hover:bg-[#2F6042] text-white"
              >
                <CheckCircle2 size={15} className="mr-1.5" /> Confirm
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => !busy && setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm this weekly report?"
        message={`The report for ${fmtRange(form.week_start)} is saved and sent to the Owner. It can't be edited after this unless the Owner reopens it.`}
        confirmText="Confirm report"
        type="success"
        isLoading={busy}
      />
    </motion.div>
  );
};

export default WeeklyReportFormPage;
