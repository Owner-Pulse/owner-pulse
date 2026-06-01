import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  Send,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
const fmtRelative = (d) => {
  const diff = Math.ceil((new Date(d) - TODAY) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff > 0) return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
};

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

const TEACHER_LIST = STAFF.filter((s) => s.role === "Teacher");

// ─── Section helpers ──────────────────────────────────────────────

const StaffSelect = ({ value, onChange, exclude = [] }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
    <option value="">Pick staff…</option>
    {TEACHER_LIST.filter((s) => !exclude.includes(s.id)).map((s) => (
      <option key={s.id} value={s.id}>{s.name}</option>
    ))}
  </select>
);

const ptoBalance = (staffId) => { const s = STAFF.find((x) => x.id === Number(staffId)); return s ? s.ptoAllowance - s.ptoUsed : null; };
const daysBetween = (start, end) => { if (!start) return 0; if (!end || end === start) return 1; return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1); };
const balanceColor = (n) => n <= 0 ? "text-red-600" : n <= 2 ? "text-amber-600" : "text-emerald-600";
const balanceBg = (n) => n <= 0 ? "bg-red-50" : n <= 2 ? "bg-amber-50" : "bg-emerald-50";

// ─── KPI Card ─────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, color }) => (
  <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color || "bg-blue-50 text-blue-600"}`}><Icon size={18} /></div>
      </div>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </CardContent>
  </Card>
);

// ─── Section Header ───────────────────────────────────────────────

const SectionHeader = ({ number, title, description, onAdd, addLabel }) => (
  <div className="flex items-baseline justify-between mb-3">
    <div>
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{number}</span>
        {title}
      </h3>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    {onAdd && (
      <button onClick={onAdd}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
        <Plus size={12} /> {addLabel || "Add"}
      </button>
    )}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────

const EmptyRow = ({ text = "None this period." }) => (
  <div className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl">{text}</div>
);

// ─── PayrollPage ──────────────────────────────────────────────────

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
    // Reset form
    setChildCare([]); setOtherDed([]); setPto([]); setBirthday([]); setHoursToAdd([]);
    setHolidayExceptions({}); setNotes({ preschool: "", elementary: "" });
  };

  // ─── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalStaff: STAFF.length,
    pendingPTO: pto.reduce((a, r) => a + daysBetween(r.startDate, r.endDate), 0),
    deductions: childCare.length + otherDed.length,
    historyCount: payrollHistory.length,
    ptoPct: Math.round((STAFF.reduce((a, s) => a + s.ptoUsed, 0) / STAFF.reduce((a, s) => a + s.ptoAllowance, 0)) * 100),
  }), [childCare, otherDed, pto, payrollHistory]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* ─── Header ───────────────────────────────────────────── */ }
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payroll</h1>
          <p className="text-sm text-gray-500 mt-1">Pay period ending {fmtDate(PERIOD_END)} · Replaces bi-weekly email to Owner</p>
        </div>
        <div className="flex items-center gap-2">
          {payrollDays <= 3 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-600">
              <AlertTriangle size={12} /> {payrollDays}d until due
            </span>
          )}
          <Button className="bg-[#0A0F1E] hover:bg-black text-white shadow-sm" onClick={handleSubmit}
            disabled={childCare.length === 0 && otherDed.length === 0 && pto.length === 0 && birthday.length === 0 && hoursToAdd.length === 0}>
            <Send size={16} className="mr-2" /> Submit Payroll
          </Button>
        </div>
      </motion.div>

      {/* ─── Success Banner ──────────────────────────────────────── */}
      {showSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Payroll Submitted!</p>
            <p className="text-xs text-gray-600">The owner has been notified. Pay period ending {fmtDate(PERIOD_END)}.</p>
          </div>
        </motion.div>
      )}

      {/* ─── KPI Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard icon={UserCheck} label="Staff Count" value={stats.totalStaff} sub={`${stats.ptoPct}% PTO used YTD`} color="bg-blue-50 text-blue-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={DollarSign} label="Deductions" value={stats.deductions} sub="Child care + loans this period" color="bg-purple-50 text-purple-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={Clock} label="PTO This Period" value={stats.pendingPTO} sub={`${stats.pendingPTO > 0 ? "Days to deduct" : "No PTO logged"}`} color="bg-amber-50 text-amber-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard icon={ClipboardList} label="History" value={stats.historyCount} sub={`${stats.historyCount > 0 ? "Past submissions" : "No history yet"}`} color="bg-gray-50 text-gray-500" />
        </motion.div>
      </div>

      {/* ─── Payroll Countdown Banner ──────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className={`bg-white border-none shadow-sm ${payrollDays <= 3 ? "ring-2 ring-red-200" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                payrollDays <= 3 ? "bg-red-50" : "bg-blue-50"
              }`}>
                <Calendar size={22} className={payrollDays <= 3 ? "text-red-500" : "text-blue-500"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Next Payroll</p>
                <p className="text-base font-bold text-gray-900">
                  {new Date(PERIOD_END).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {payrollDays <= 0 ? "Overdue!" : `${payrollDays} days away`} · {fmtRelative(NEXT_PAYROLL)}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                payrollDays <= 3 ? "bg-red-50 text-red-600" : payrollDays <= 7 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              }`}>
                {payrollDays}d
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */ }
        <div className="space-y-5">

          {/* ─── 1. Child Care Deductions ──────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-5">
                <SectionHeader number={1} title="Child Care Deductions"
                  description="Tuition-style deductions taken from staff paychecks."
                  onAdd={addCC} addLabel="Add Deduction" />
                <div className="space-y-2">
                  {childCare.length === 0 && <EmptyRow />}
                  {childCare.map((row, i) => (
                    <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 100px 28px" }}>
                      <StaffSelect value={row.staffId} onChange={(v) => updCC(i, "staffId", v)} />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                        <input type="number" value={row.amount} onChange={(e) => updCC(i, "amount", e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <button onClick={() => rmCC(i)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 2. Other Deductions ──────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-5">
                <SectionHeader number={2} title="Other Deductions"
                  description="Loans, advances. Remaining balance auto-tracks across pay periods."
                  onAdd={addOD} addLabel="Add Deduction" />
                <div className="space-y-2">
                  {otherDed.length === 0 && <EmptyRow />}
                  {otherDed.map((row, i) => {
                    const loan = OTHER_DEDUCTIONS.find((l) => l.id === Number(row.loanId));
                    const newBal = loan ? loan.balance - (Number(row.amount) || 0) : 0;
                    return (
                      <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 80px 120px 28px" }}>
                        <select value={row.loanId} onChange={(e) => updOD(i, "loanId", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                          <option value="">Pick loan…</option>
                          {OTHER_DEDUCTIONS.map((l) => (
                            <option key={l.id} value={l.id}>{l.staffName} · {l.type}</option>
                          ))}
                        </select>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                          <input type="number" value={row.amount} onChange={(e) => updOD(i, "amount", e.target.value)}
                            placeholder="0"
                            className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className={`px-2 py-2 rounded-xl text-[10px] text-center font-bold ${loan ? balanceBg(newBal) : "bg-gray-50"} ${loan ? balanceColor(newBal) : "text-gray-400"}`}>
                          {loan ? `$${newBal.toLocaleString()} left` : "—"}
                        </div>
                        <button onClick={() => rmOD(i)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 3. PTO This Period ───────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-5">
                <SectionHeader number={3} title="PTO This Period"
                  description="Single day or date range — system auto-counts and deducts from balance."
                  onAdd={addPTO} addLabel="Add PTO" />
                <div className="space-y-2">
                  {pto.length === 0 && <EmptyRow />}
                  {pto.map((row, i) => {
                    const balance = row.staffId ? ptoBalance(Number(row.staffId)) : null;
                    const days = daysBetween(row.startDate, row.endDate);
                    const afterBalance = balance !== null ? balance - days : null;
                    return (
                      <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 1.2fr 110px 28px" }}>
                        <StaffSelect value={row.staffId} onChange={(v) => updPTO(i, "staffId", v)} />
                        <div className="flex gap-1 items-center">
                          <input type="date" value={row.startDate} onChange={(e) => updPTO(i, "startDate", e.target.value)}
                            className="flex-1 min-w-0 px-2 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <span className="text-xs text-gray-400">→</span>
                          <input type="date" value={row.endDate} onChange={(e) => updPTO(i, "endDate", e.target.value)}
                            className="flex-1 min-w-0 px-2 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className={`px-2 py-2 rounded-xl text-[10px] text-center font-bold ${
                          afterBalance !== null ? balanceBg(afterBalance) : "bg-gray-50"
                        } ${afterBalance !== null ? balanceColor(afterBalance) : "text-gray-400"}`}>
                          {afterBalance !== null ? `${afterBalance} left` : "—"}
                        </div>
                        <button onClick={() => rmPTO(i)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 4. Birthday ───────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-5">
                <SectionHeader number={4} title="Birthday / Extra Day Off"
                  description="Staff celebrating their birthday during this pay period."
                  onAdd={addBD} addLabel="Add Birthday" />
                <div className="space-y-2">
                  {birthday.length === 0 && <EmptyRow />}
                  {birthday.map((row, i) => (
                    <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 1fr 28px" }}>
                      <StaffSelect value={row.staffId} onChange={(v) => updBD(i, "staffId", v)} />
                      <input type="date" value={row.date} onChange={(e) => updBD(i, "date", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button onClick={() => rmBD(i)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* RIGHT COLUMN */ }
        <div className="space-y-5">

          {/* ─── 5. Hours to Add ──────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-5">
                <SectionHeader number={5} title="Hours to Add (ADP)"
                  description="Extra time: after-care, tutoring, events, etc."
                  onAdd={addHTA} addLabel="Add Hours" />
                <div className="space-y-2">
                  {hoursToAdd.length === 0 && <EmptyRow />}
                  {hoursToAdd.map((row, i) => (
                    <div key={row.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 70px 100px 28px" }}>
                      <StaffSelect value={row.staffId} onChange={(v) => updHTA(i, "staffId", v)} />
                      <input type="number" value={row.hours} onChange={(e) => updHTA(i, "hours", e.target.value)}
                        placeholder="0" step={0.25}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <select value={row.type} onChange={(e) => updHTA(i, "type", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                        <option value="After-care">After-care</option>
                        <option value="Tutoring">Tutoring</option>
                        <option value="Event">Event</option>
                        <option value="Other">Other</option>
                      </select>
                      <button onClick={() => rmHTA(i)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 6. Holiday Exceptions ────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-5">
                <SectionHeader number={6} title="Holiday Exceptions"
                  description="Staff who worked during the holiday and should be paid." />
                <div className="space-y-3">
                  {PERIOD_HOLIDAYS.length === 0 && <EmptyRow text="No holidays this period." />}
                  {PERIOD_HOLIDAYS.map((h) => {
                    const excluded = holidayExceptions[h.id] || [];
                    return (
                      <div key={h.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm font-semibold text-gray-700">{h.name}</span>
                          <span className="text-xs text-gray-400">{h.date}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {TEACHER_LIST.map((s) => {
                            const isExcluded = excluded.includes(s.id);
                            return (
                              <button key={s.id} onClick={() => toggleExclusion(h.id, s.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                                  isExcluded ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                }`}>
                                {isExcluded ? "✓ " : ""}{s.name.split(" ").slice(-1)[0]}
                              </button>
                            );
                          })}
                        </div>
                        {excluded.length > 0 && (
                          <p className="text-[10px] text-emerald-600 mt-1 font-medium">
                            {excluded.length} staff marked for pay exception
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 7. Notes ──────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-5">
                <SectionHeader number={7} title="Payroll Notes"
                  description="Notes for the Owner to review before approval." />
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Preschool Notes</label>
                    <textarea value={notes.preschool} onChange={(e) => setNotes({ ...notes, preschool: e.target.value })}
                      placeholder="Anything the Owner should know about preschool staff…"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Elementary Notes</label>
                    <textarea value={notes.elementary} onChange={(e) => setNotes({ ...notes, elementary: e.target.value })}
                      placeholder="Anything the Owner should know about elementary staff…"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Submit Section ────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className={`bg-white border-none shadow-sm ${payrollDays <= 3 ? "ring-2 ring-red-200" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Ready to Submit</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {childCare.length + otherDed.length + pto.length + birthday.length + hoursToAdd.length} items to process
                    </p>
                  </div>
                  <Button onClick={handleSubmit}
                    className={`px-6 py-3 rounded-xl text-sm font-bold shadow-sm ${
                      childCare.length === 0 && otherDed.length === 0 && pto.length === 0 && birthday.length === 0 && hoursToAdd.length === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#0A0F1E] hover:bg-black text-white"
                    }`}
                    disabled={childCare.length === 0 && otherDed.length === 0 && pto.length === 0 && birthday.length === 0 && hoursToAdd.length === 0}>
                    <Send size={16} className="mr-2" /> Submit to Owner
                  </Button>
                </div>
                {payrollDays <= 3 && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 rounded-xl text-xs text-red-600 font-medium">
                    <AlertTriangle size={14} /> Payroll is due soon — please submit promptly.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>

      {/* ─── Payroll History ────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList size={16} /> Payroll History
            </CardTitle>
            <CardDescription>Previously submitted payroll periods</CardDescription>
          </CardHeader>
          <CardContent>
            {payrollHistory.length > 0 ? (
              <div className="space-y-3">
                {payrollHistory.map((ph) => (
                  <div key={ph.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <DollarSign size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Period ending {fmtDate(ph.periodEnding)}</p>
                          <p className="text-xs text-gray-500">
                            Submitted {fmtDate(ph.submittedAt)} by {ph.submittedBy}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {ph.childCare.length > 0 && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                            {ph.childCare.length} CC
                          </span>
                        )}
                        {ph.otherDeductions.length > 0 && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
                            {ph.otherDeductions.length} Ded
                          </span>
                        )}
                        {ph.pto.length > 0 && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                            {ph.pto.length} PTO
                          </span>
                        )}
                        {ph.hoursToAdd.length > 0 && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                            {ph.hoursToAdd.length} Hrs
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Expandable details */}
                    <details className="mt-2">
                      <summary className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 font-medium">View details</summary>
                      <div className="mt-2 space-y-2 text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
                        {ph.childCare.length > 0 && (
                          <div><span className="font-semibold text-gray-700">Child Care:</span> {ph.childCare.map((c) => `${c.name} ($${c.amount})`).join(", ")}</div>
                        )}
                        {ph.otherDeductions.length > 0 && (
                          <div><span className="font-semibold text-gray-700">Deductions:</span> {ph.otherDeductions.map((d) => `${d.name} $${d.amount}`).join(", ")}</div>
                        )}
                        {ph.pto.length > 0 && (
                          <div><span className="font-semibold text-gray-700">PTO:</span> {ph.pto.map((p) => `${p.name} ${p.days}d`).join(", ")}</div>
                        )}
                        {ph.hoursToAdd.length > 0 && (
                          <div><span className="font-semibold text-gray-700">Extra Hours:</span> {ph.hoursToAdd.map((h) => `${h.name} ${h.hours}h`).join(", ")}</div>
                        )}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <ClipboardList size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No payroll history yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PayrollPage;
