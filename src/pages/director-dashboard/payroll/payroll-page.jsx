import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  ClipboardList,
  Plus,
  Trash2,
  X
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
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import {
  getPayrollHistory,
  savePayrollHistory,
  getPayrollSchedule,
  savePayrollSchedule
} from "@/utils/payroll-storage";

// ─── Data ─────────────────────────────────────────────────────────

const TODAY = new Date("2026-05-11");

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
  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "schedule"
  const [history, setHistory] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  // Add Period Modal state (for scheduling on director side)
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [modalError, setModalError] = useState("");
  const [scheduleMode, setScheduleMode] = useState("single"); // "single" | "series"
  const [seriesCount, setSeriesCount] = useState("4"); // "4" = 2 months, "12" = 6 months, "26" = 1 year

  // Load and Sync Data
  const loadData = () => {
    const loadedHistory = getPayrollHistory();
    const loadedSchedule = getPayrollSchedule();
    setHistory(loadedHistory);
    setSchedule(loadedSchedule);

    // Default to the first pending period
    const pending = loadedSchedule.filter(s => s.status === "Pending");
    if (pending.length > 0) {
      setSelectedPeriodId(pending[0].id.toString());
    } else if (loadedSchedule.length > 0) {
      setSelectedPeriodId(loadedSchedule[0].id.toString());
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("pulse_payroll_update", loadData);
    return () => window.removeEventListener("pulse_payroll_update", loadData);
  }, []);

  // Compute selected payroll period details
  const activePeriod = useMemo(() => {
    return schedule.find(p => p.id.toString() === selectedPeriodId) || null;
  }, [schedule, selectedPeriodId]);

  const periodEnding = activePeriod ? activePeriod.endDate : "2026-05-15";
  const periodStart = activePeriod ? activePeriod.startDate : "2026-05-01";
  const payrollDays = useMemo(() => {
    if (!activePeriod) return 4;
    const diff = new Date(activePeriod.dueDate) - TODAY;
    return Math.ceil(diff / 86400000);
  }, [activePeriod]);

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

  const handleSubmit = () => {
    const payload = {
      periodEnding,
      periodStart,
      dueDate: activePeriod?.dueDate || periodEnding,
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

    // Add submission to history
    const updatedHistory = [{ ...payload, id: Date.now() }, ...history];
    setHistory(updatedHistory);
    savePayrollHistory(updatedHistory);

    // Mark current schedule period as submitted
    const updatedSchedule = schedule.map(p =>
      p.id.toString() === selectedPeriodId ? { ...p, status: "Submitted" } : p
    );
    setSchedule(updatedSchedule);
    savePayrollSchedule(updatedSchedule);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
    setChildCare([]); setOtherDed([]); setPto([]); setBirthday([]); setHoursToAdd([]);
    setHolidayExceptions({}); setNotes({ preschool: "", elementary: "" });

    // Choose next pending period automatically if available
    const nextPending = updatedSchedule.filter(s => s.status === "Pending");
    if (nextPending.length > 0) {
      setSelectedPeriodId(nextPending[0].id.toString());
    }
  };

  // Add a new period directly from Director side
  const handleAddPeriod = (e) => {
    e.preventDefault();
    setModalError("");

    if (scheduleMode === "single") {
      if (!startDate || !endDate || !dueDate) {
        setModalError("All dates are required.");
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        setModalError("Start date cannot be after end date.");
        return;
      }

      const newPeriod = {
        id: Date.now(),
        startDate,
        endDate,
        dueDate,
        status: "Pending"
      };

      const updatedSchedule = [...schedule, newPeriod].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setSchedule(updatedSchedule);
      savePayrollSchedule(updatedSchedule);

      // If no period was selected or we just added one, make it the selection
      setSelectedPeriodId(newPeriod.id.toString());
    } else {
      if (!startDate) {
        setModalError("Starting date is required.");
        return;
      }

      const count = parseInt(seriesCount, 10);
      const newPeriods = [];
      let currentStart = new Date(startDate);

      for (let i = 0; i < count; i++) {
        // End date is start date + 13 days (2 weeks inclusive)
        const currentEnd = new Date(currentStart);
        currentEnd.setDate(currentStart.getDate() + 13);
        const due = new Date(currentEnd); // Due on ending date

        const startStr = currentStart.toISOString().split("T")[0];
        const endStr = currentEnd.toISOString().split("T")[0];
        const dueStr = due.toISOString().split("T")[0];

        newPeriods.push({
          id: Date.now() + i,
          startDate: startStr,
          endDate: endStr,
          dueDate: dueStr,
          status: "Pending"
        });

        // Next period starts the day after this period ends
        currentStart = new Date(currentEnd);
        currentStart.setDate(currentStart.getDate() + 1);
      }

      const updatedSchedule = [...schedule, ...newPeriods].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setSchedule(updatedSchedule);
      savePayrollSchedule(updatedSchedule);

      if (newPeriods.length > 0) {
        setSelectedPeriodId(newPeriods[0].id.toString());
      }
    }

    setStartDate("");
    setEndDate("");
    setDueDate("");
    setScheduleMode("single");
    setIsAddPeriodOpen(false);
  };

  const handleDeletePeriod = (id) => {
    const updated = schedule.filter(p => p.id !== id);
    setSchedule(updated);
    savePayrollSchedule(updated);
  };

  const itemCount = childCare.length + otherDed.length + pto.length + birthday.length + hoursToAdd.length;

  const stats = useMemo(() => ({
    totalStaff: STAFF.length,
    pendingPTO: pto.reduce((a, r) => a + daysBetween(r.startDate, r.endDate), 0),
    deductions: itemCount,
    historyCount: history.length,
    ptoPct: Math.round((STAFF.reduce((a, s) => a + s.ptoUsed, 0) / STAFF.reduce((a, s) => a + s.ptoAllowance, 0)) * 100),
  }), [itemCount, pto, history]);

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* ─── Header ───────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payroll</h1>
          {activeTab === "submit" ? (
            <p className="text-sm text-gray-500 mt-1">
              Pay period Ending {fmtDate(periodEnding)} · Replaces bi-weekly email to Owner
            </p>
          ) : activeTab === "history" ? (
            <p className="text-sm text-gray-500 mt-1">
              Review bi-weekly payroll submission records and history.
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              Schedule bi-weekly payroll submission periods.
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab("submit")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "submit" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Submit Payroll
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "history" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Payroll History
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "schedule" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Payroll Schedule
            </button>
          </div>

          {activeTab === "submit" ? (
            payrollDays <= 3 && payrollDays >= 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#AE4A3E]/10 text-[#AE4A3E]">
                <AlertTriangle size={12} /> {payrollDays}d until due
              </span>
            )
          ) : activeTab === "schedule" ? (
            <Button
              onClick={() => setIsAddPeriodOpen(true)}
              className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-semibold rounded-xl text-xs md:text-sm flex items-center gap-1.5"
            >
              <Plus size={16} /> Schedule Period
            </Button>
          ) : null}
        </div>
      </motion.div>

      {/* ─── Success Banner ──────────────────────────────────────── */}
      {showSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-[#3E7A54]/10 border border-[#3E7A54]/25">
          <CheckCircle2 size={20} className="text-[#3E7A54]" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Payroll Submitted!</p>
            <p className="text-xs text-gray-600">The owner has been notified. Pay period ending {fmtDate(periodEnding)}.</p>
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

      {activeTab === "submit" && (
        <>
          {/* Period Selector Dropdown */}
          <motion.div variants={itemVariants} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Select Payroll Cycle</h3>
              <p className="text-xs text-gray-400">Choose the upcoming cycle period from the schedule roster.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="h-10 px-3 rounded-xl border border-gray-250 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 bg-white min-w-[200px]"
              >
                {schedule.map(p => (
                  <option key={p.id} value={p.id}>
                    {fmtDate(p.startDate)} - {fmtDate(p.endDate)} ({p.status})
                  </option>
                ))}
                {schedule.length === 0 && <option value="">No periods scheduled</option>}
              </select>
            </div>
          </motion.div>

          {/* ─── Countdown Banner ──────────────────────────────────── */}
          <PayrollCountdownCard periodEnd={periodEnding} payrollDays={payrollDays} />

          <div className="flex flex-col gap-6">
            <ChildCareSection rows={childCare} onAdd={addCC} onUpdate={updCC} onRemove={rmCC} />
            <OtherDeductionsSection rows={otherDed} onAdd={addOD} onUpdate={updOD} onRemove={rmOD} />
            <PTOSection rows={pto} onAdd={addPTO} onUpdate={updPTO} onRemove={rmPTO} />
            <BirthdaySection rows={birthday} onAdd={addBD} onUpdate={updBD} onRemove={rmBD} />
            <HoursToAddSection rows={hoursToAdd} onAdd={addHTA} onUpdate={updHTA} onRemove={rmHTA} />
            <HolidayExceptionsSection
              holidays={PERIOD_HOLIDAYS}
              exceptions={holidayExceptions}
              onToggleExclusion={toggleExclusion}
            />
            <PayrollNotesSection notes={notes} onChange={setNotes} />
            <SubmitSection 
              itemCount={itemCount} 
              payrollDays={payrollDays} 
              onSubmit={() => setIsSubmitConfirmOpen(true)} 
              disabled={itemCount === 0 || !activePeriod || activePeriod.status === "Submitted"}
            />
          </div>
        </>
      )}

      {activeTab === "history" && (
        <PayrollHistoryCard history={history} />
      )}

      {activeTab === "schedule" && (
        /* Schedule Tab */
        <motion.div
          key="schedule-tab"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Bi-Weekly Submission Schedule</h3>
            <p className="text-xs text-gray-400">View and adjust active payroll schedules for the entire academic/fiscal year.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                  <th className="py-3 px-6">Start Date</th>
                  <th className="py-3 px-6">End Date</th>
                  <th className="py-3 px-6">Submission Due Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {schedule.map((period) => (
                  <tr key={period.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium">{fmtDate(period.startDate)}</td>
                    <td className="py-3.5 px-6 font-medium">{fmtDate(period.endDate)}</td>
                    <td className="py-3.5 px-6 font-semibold text-gray-900">{fmtDate(period.dueDate)}</td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        period.status === "Submitted"
                          ? "bg-[#3E7A54]/10 text-[#2F6042]"
                          : "bg-[#B78A2F]/10 text-[#8F6A1F]"
                      }`}>
                        {period.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => handleDeletePeriod(period.id)}
                        className="p-1.5 text-gray-400 hover:text-[#AE4A3E] hover:bg-[#AE4A3E]/5 rounded-lg transition-colors"
                        title="Delete Schedule Period"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {schedule.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">
                      No payroll periods scheduled. Click "Schedule Period" above to add.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Schedule Period Modal (Shared on director side) */}
      <AnimatePresence>
        {isAddPeriodOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setIsAddPeriodOpen(false); setScheduleMode("single"); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Schedule Payroll</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Define a single period or generate a recurring series.</p>
                  </div>
                  <button onClick={() => { setIsAddPeriodOpen(false); setScheduleMode("single"); }} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex bg-gray-50 border border-gray-100 rounded-xl p-1 mb-5">
                  <button
                    type="button"
                    onClick={() => setScheduleMode("single")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      scheduleMode === "single"
                        ? "bg-[#1E3A5F] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                    }`}
                  >
                    Single Cycle
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleMode("series")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      scheduleMode === "series"
                        ? "bg-[#1E3A5F] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                    }`}
                  >
                    Auto-Generate Series
                  </button>
                </div>

                <form onSubmit={handleAddPeriod} className="space-y-5">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                    {scheduleMode === "single" ? (
                      <>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cycle Start Date *</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cycle End Date *</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Submission Due Date *</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={dueDate}
                              onChange={(e) => setDueDate(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl border border-gray-250 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white transition-all"
                              required
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">First Cycle Start Date *</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Generate Duration *</label>
                          <select
                            value={seriesCount}
                            onChange={(e) => setSeriesCount(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] bg-white transition-all cursor-pointer"
                          >
                            <option value="4">4 Cycles (Next 2 Months)</option>
                            <option value="12">12 Cycles (Next 6 Months)</option>
                            <option value="26">26 Cycles (Next 1 Year)</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {modalError && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#AE4A3E]/5 border border-[#AE4A3E]/10 rounded-xl text-xs font-semibold text-[#8A362C]">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>{modalError}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" onClick={() => { setIsAddPeriodOpen(false); setScheduleMode("single"); }} className="flex-1 rounded-xl h-11 text-xs font-bold border-gray-200 hover:bg-gray-50">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl h-11 text-xs font-bold shadow-md shadow-[#1E3A5F]/15 transition-all">
                      {scheduleMode === "single" ? "Schedule Period" : "Generate Series"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        onConfirm={() => {
          setIsSubmitConfirmOpen(false);
          handleSubmit();
        }}
        title="Submit Payroll to Owner"
        message={`Are you sure you want to submit the payroll data for the period ending ${fmtDate(periodEnding)}? This will notify the school owner and log your deductions/additions.`}
        confirmText="Yes, Submit"
        cancelText="Cancel"
        type="info"
      />
    </motion.div>
  );
};

export default PayrollPage;
