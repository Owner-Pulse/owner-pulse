import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import PayrollCountdownCard from "./components/PayrollCountdownCard";
import ChildCareSection from "./components/ChildCareSection";
import OtherDeductionsSection from "./components/OtherDeductionsSection";
import PTOSection from "./components/PTOSection";
import BirthdaySection from "./components/BirthdaySection";
import HoursToAddSection from "./components/HoursToAddSection";
import HolidayExceptionsSection from "./components/HolidayExceptionsSection";
import PayrollNotesSection from "./components/PayrollNotesSection";
import SubmitSection from "./components/SubmitSection";
import PayrollHistoryCard from "./components/PayrollHistoryCard";

// ─── Data ─────────────────────────────────────────────────────────

const TODAY = new Date("2026-05-11");
const NEXT_PAYROLL = "2026-05-15";
const payrollDays = Math.ceil((new Date(NEXT_PAYROLL) - TODAY) / 86400000);
const PERIOD_END = NEXT_PAYROLL;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const STAFF = [
  { id: 1, name: "Ms. Alvarez", role: "Teacher", ptoAllowance: 10, ptoUsed: 3 },
  { id: 2, name: "Ms. Soto", role: "Teacher", ptoAllowance: 10, ptoUsed: 2 },
  { id: 3, name: "Ms. Patel", role: "Teacher", ptoAllowance: 10, ptoUsed: 5 },
  { id: 4, name: "Ms. Rivera", role: "Teacher", ptoAllowance: 10, ptoUsed: 1 },
  { id: 5, name: "Ms. Brooks", role: "Teacher", ptoAllowance: 10, ptoUsed: 4 },
  { id: 6, name: "Mr. Nguyen", role: "Teacher", ptoAllowance: 10, ptoUsed: 6 },
  { id: 7, name: "Ms. Cohen", role: "Teacher", ptoAllowance: 10, ptoUsed: 7 },
  { id: 8, name: "Ms. Diaz", role: "Teacher", ptoAllowance: 10, ptoUsed: 0 },
  { id: 9, name: "Mr. Park", role: "Teacher", ptoAllowance: 10, ptoUsed: 3 },
  { id: 10, name: "Mr. O'Brien", role: "Teacher", ptoAllowance: 10, ptoUsed: 2 },
  { id: 11, name: "Ms. Hassan", role: "Teacher", ptoAllowance: 10, ptoUsed: 8 },
];

const OTHER_DEDUCTIONS = [
  { id: 1, staffName: "Ms. Crane", type: "Loan", originalAmount: 4000, balance: 3530 },
  { id: 2, staffName: "Mr. Levine", type: "Advance", originalAmount: 800, balance: 480 },
];

const PERIOD_HOLIDAYS = [
  { id: 1, date: "2026-05-08", name: "Mother's Day (no school)" },
];

const PAYROLL_HISTORY = [
  {
    id: 1, periodEnding: "2026-04-30", submittedAt: "2026-04-30T16:42:00", submittedBy: "Director",
    childCare: [{ name: "Kat", amount: 130 }, { name: "Maye", amount: 30 }],
    otherDeductions: [{ name: "Ms. Crane", amount: 160, balanceAfter: 3530 }],
    pto: [{ name: "Eliz", startDate: "2026-04-10", endDate: "2026-04-10", days: 1, balanceAfter: 0 },
          { name: "S ll", startDate: "2026-04-08", endDate: "2026-04-10", days: 3, balanceAfter: 5 }],
    birthday: [{ name: "Nam", date: "2026-04-30" }],
    hoursToAdd: [{ name: "Estra", hours: 0.5, type: "After-care" }],
    holidayExceptions: [],
    notes: { preschool: "", elementary: "" },
  },
];

const daysBetween = (start, end) => {
  if (!start) return 0;
  if (!end || end === start) return 1;
  return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
};

const ptoBalance = (staffId) => {
  const s = STAFF.find((x) => x.id === Number(staffId));
  return s ? s.ptoAllowance - s.ptoUsed : null;
};

// ─── Main Component ───────────────────────────────────────────────

const PayrollPage = () => {
  // ─── Section 1: Child Care ─────────────────────────────────────
  const [childCare, setChildCare] = useState([]);
  const addCC = () => setChildCare([...childCare, { id: Date.now(), staffId: "", amount: "" }]);
  const updCC = (i, f, v) => setChildCare(childCare.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));
  const rmCC = (i) => setChildCare(childCare.filter((_, idx) => idx !== i));

  // ─── Section 2: Other Deductions ───────────────────────────────
  const [otherDed, setOtherDed] = useState([]);
  const addOD = () => setOtherDed([...otherDed, { id: Date.now(), loanId: "", amount: "" }]);
  const updOD = (i, f, v) => setOtherDed(otherDed.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));
  const rmOD = (i) => setOtherDed(otherDed.filter((_, idx) => idx !== i));

  // ─── Section 3: PTO ────────────────────────────────────────────
  const [pto, setPto] = useState([]);
  const addPTO = () => setPto([...pto, { id: Date.now(), staffId: "", startDate: "", endDate: "" }]);
  const updPTO = (i, f, v) => setPto(pto.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));
  const rmPTO = (i) => setPto(pto.filter((_, idx) => idx !== i));

  // ─── Section 4: Birthday ────────────────────────────────────────
  const [birthday, setBirthday] = useState([]);
  const addBD = () => setBirthday([...birthday, { id: Date.now(), staffId: "", date: "" }]);
  const updBD = (i, f, v) => setBirthday(birthday.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));
  const rmBD = (i) => setBirthday(birthday.filter((_, idx) => idx !== i));

  // ─── Section 5: Hours to Add ───────────────────────────────────
  const [hoursToAdd, setHoursToAdd] = useState([]);
  const addHTA = () => setHoursToAdd([...hoursToAdd, { id: Date.now(), staffId: "", hours: "", type: "After-care" }]);
  const updHTA = (i, f, v) => setHoursToAdd(hoursToAdd.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));
  const rmHTA = (i) => setHoursToAdd(hoursToAdd.filter((_, idx) => idx !== i));

  // ─── Section 6: Holiday Exceptions ─────────────────────────────
  const [holidayExceptions, setHolidayExceptions] = useState({});
  const toggleExclusion = (holidayId, staffId) => {
    const current = holidayExceptions[holidayId] || [];
    const next = current.includes(staffId) ? current.filter((x) => x !== staffId) : [...current, staffId];
    setHolidayExceptions({ ...holidayExceptions, [holidayId]: next });
  };

  // ─── Section 7: Notes ─────────────────────────────────────────
  const [notes, setNotes] = useState({ preschool: "", elementary: "" });

  // ─── Submit ─────────────────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false);
  const [payrollHistory, setPayrollHistory] = useState(PAYROLL_HISTORY);

  const handleSubmit = () => {
    const payload = {
      periodEnding: PERIOD_END,
      submittedAt: new Date().toISOString(),
      submittedBy: "Director",
      childCare: childCare.map((r) => ({ name: STAFF.find((s) => s.id === Number(r.staffId))?.name || "Unknown", amount: Number(r.amount) || 0 })),
      otherDeductions: otherDed.map((r) => {
        const loan = OTHER_DEDUCTIONS.find((l) => l.id === Number(r.loanId));
        return { name: loan?.staffName || "Unknown", amount: Number(r.amount) || 0, balanceAfter: (loan?.balance || 0) - (Number(r.amount) || 0) };
      }),
      pto: pto.map((r) => ({
        name: STAFF.find((s) => s.id === Number(r.staffId))?.name || "Unknown",
        startDate: r.startDate, endDate: r.endDate || r.startDate,
        days: daysBetween(r.startDate, r.endDate),
        balanceAfter: ptoBalance(Number(r.staffId)) - daysBetween(r.startDate, r.endDate),
      })),
      birthday: birthday.map((r) => ({ name: STAFF.find((s) => s.id === Number(r.staffId))?.name || "Unknown", date: r.date })),
      hoursToAdd: hoursToAdd.map((r) => ({ name: STAFF.find((s) => s.id === Number(r.staffId))?.name || r.staffId, hours: Number(r.hours) || 0, type: r.type })),
      holidayExceptions: PERIOD_HOLIDAYS.map((h) => ({ date: h.date, name: h.name, excluded: (holidayExceptions[h.id] || []).map((sid) => STAFF.find((s) => s.id === sid)?.name || "Unknown") })),
      notes,
    };
    setPayrollHistory([{ ...payload, id: Date.now() }, ...payrollHistory]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
    setChildCare([]); setOtherDed([]); setPto([]); setBirthday([]); setHoursToAdd([]);
    setHolidayExceptions({}); setNotes({ preschool: "", elementary: "" });
  };

  const itemCount = childCare.length + otherDed.length + pto.length + birthday.length + hoursToAdd.length;

  const stats = useMemo(() => ({
    totalStaff: STAFF.length,
    pendingPTO: pto.reduce((a, r) => a + daysBetween(r.startDate, r.endDate), 0),
    deductions: itemCount,
    historyCount: payrollHistory.length,
    ptoPct: Math.round((STAFF.reduce((a, s) => a + s.ptoUsed, 0) / STAFF.reduce((a, s) => a + s.ptoAllowance, 0)) * 100),
  }), [itemCount, pto, payrollHistory]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* ─── Header ───────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payroll</h1>
          <p className="text-sm text-gray-500 mt-1">Pay period ending {fmtDate(PERIOD_END)} · Replaces bi-weekly email to Owner</p>
        </div>
        <div className="flex items-center gap-2">
          {payrollDays <= 3 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#AE4A3E]/10 text-[#AE4A3E]">
              <AlertTriangle size={12} /> {payrollDays}d until due
            </span>
          )}
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm" onClick={handleSubmit}
            disabled={itemCount === 0}>
            <Send size={16} className="mr-2" /> Submit Payroll
          </Button>
        </div>
      </motion.div>

      {/* ─── Success Banner ──────────────────────────────────────── */}
      {showSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-[#3E7A54]/10 border border-[#3E7A54]/25">
          <CheckCircle2 size={20} className="text-[#3E7A54]" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Payroll Submitted!</p>
            <p className="text-xs text-gray-600">The owner has been notified. Pay period ending {fmtDate(PERIOD_END)}.</p>
          </div>
        </motion.div>
      )}

      {/* ─── KPI Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={UserCheck} label="Staff Count" value={stats.totalStaff} sub={`${stats.ptoPct}% PTO used YTD`} color="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={DollarSign} label="Deductions" value={stats.deductions} sub="Child care + loans this period" color="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Clock} label="PTO This Period" value={stats.pendingPTO} sub={`${stats.pendingPTO > 0 ? "Days to deduct" : "No PTO logged"}`} color="bg-[#B78A2F]/10 text-[#B78A2F]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={ClipboardList} label="History" value={stats.historyCount} sub={`${stats.historyCount > 0 ? "Past submissions" : "No history yet"}`} color="bg-gray-50 text-gray-500" />
        </motion.div>
      </div>

      {/* ─── Countdown Banner ──────────────────────────────────── */}
      <PayrollCountdownCard periodEnd={PERIOD_END} payrollDays={payrollDays} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          <ChildCareSection rows={childCare} onAdd={addCC} onUpdate={updCC} onRemove={rmCC} />
          <OtherDeductionsSection rows={otherDed} onAdd={addOD} onUpdate={updOD} onRemove={rmOD} />
          <PTOSection rows={pto} onAdd={addPTO} onUpdate={updPTO} onRemove={rmPTO} />
          <BirthdaySection rows={birthday} onAdd={addBD} onUpdate={updBD} onRemove={rmBD} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          <HoursToAddSection rows={hoursToAdd} onAdd={addHTA} onUpdate={updHTA} onRemove={rmHTA} />
          <HolidayExceptionsSection
            holidays={PERIOD_HOLIDAYS}
            exceptions={holidayExceptions}
            onToggleExclusion={toggleExclusion}
          />
          <PayrollNotesSection notes={notes} onChange={setNotes} />
          <SubmitSection itemCount={itemCount} payrollDays={payrollDays} onSubmit={handleSubmit} />
        </div>
      </div>

      {/* ─── Payroll History ────────────────────────────────────── */}
      <PayrollHistoryCard history={payrollHistory} />
    </motion.div>
  );
};

export default PayrollPage;
