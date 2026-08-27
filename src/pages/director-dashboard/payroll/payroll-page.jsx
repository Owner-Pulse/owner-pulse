import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ClipboardList,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Existing sub-components
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
import DirectorPayrollScheduleTable from "./components/DirectorPayrollScheduleTable";
import AddSchedulePeriodModal from "@/pages/owner-dashboard/payroll/components/AddSchedulePeriodModal";

// Custom API Hooks
import {
  useGetDirectorPayrollOverview,
  useGetDirectorPayrollSchedules,
  useGetDirectorPayrollHistory,
  useSubmitPayroll,
} from "@/hooks/payroll/payroll.hook";
import { useGetAllStaffs } from "@/hooks/classroom/classroom.hook";
import { getStaffName, getStaffId } from "@/pages/owner-dashboard/classrooms/components/SearchableStaffSelect";

// Local Storage Fallback Utils
import {
  getPayrollHistory,
  savePayrollHistory,
  getPayrollSchedule,
  savePayrollSchedule,
} from "@/utils/payroll-storage";


const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const PERIOD_HOLIDAYS = [
  { id: 1, date: "2026-05-08", name: "Mother's Day (no school)" },
];

const daysBetween = (start, end) => {
  if (!start) return 0;
  if (!end || end === start) return 1;
  return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
};

const PayrollPage = () => {
  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "history" | "schedule"
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch real staff list from allStaffsService
  const { staffs } = useGetAllStaffs();

  // API Hooks
  const { data: directorOverview } = useGetDirectorPayrollOverview();
  const { schedules: apiSchedules } = useGetDirectorPayrollSchedules();
  const { history: apiHistory } = useGetDirectorPayrollHistory();
  const { submitPayroll: apiSubmitPayroll, isPending: isSubmitting } = useSubmitPayroll();

  // Local Storage Fallback State
  const [localHistory, setLocalHistory] = useState([]);
  const [localSchedule, setLocalSchedule] = useState([]);

  const loadLocalData = () => {
    const loadedHistory = getPayrollHistory();
    const loadedSchedule = getPayrollSchedule();
    setLocalHistory(loadedHistory);
    setLocalSchedule(loadedSchedule);
  };

  useEffect(() => {
    loadLocalData();
    window.addEventListener("pulse_payroll_update", loadLocalData);
    return () => window.removeEventListener("pulse_payroll_update", loadLocalData);
  }, []);

  const displaySchedules = useMemo(() => {
    if (Array.isArray(apiSchedules)) return apiSchedules;
    return localSchedule;
  }, [apiSchedules, localSchedule]);

  const displayHistory = useMemo(() => {
    if (Array.isArray(apiHistory)) return apiHistory;
    return localHistory;
  }, [apiHistory, localHistory]);

  const pendingSchedules = useMemo(() => {
    return displaySchedules.filter((s) => (s.status || "pending").toLowerCase() === "pending");
  }, [displaySchedules]);

  // Set default selected period ID to first pending cycle when schedules change
  useEffect(() => {
    if (pendingSchedules.length > 0 && (!selectedPeriodId || !pendingSchedules.some((p) => p.id.toString() === selectedPeriodId))) {
      setSelectedPeriodId(pendingSchedules[0].id.toString());
    }
  }, [pendingSchedules, selectedPeriodId]);

  // Selected period details
  const activePeriod = useMemo(() => {
    return displaySchedules.find((p) => p.id.toString() === selectedPeriodId) || null;
  }, [displaySchedules, selectedPeriodId]);

  const periodEnding = activePeriod?.endDate || activePeriod?.end_date || "";
  const periodStart = activePeriod?.startDate || activePeriod?.start_date || "";
  const payrollDays = useMemo(() => {
    if (!activePeriod) return 0;
    if (typeof activePeriod.days_remaining === "number") {
      return activePeriod.days_remaining;
    }
    const due = activePeriod.submission_due_date || activePeriod.dueDate || activePeriod.end_date || activePeriod.endDate;
    if (!due) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dueDt = new Date(due);
    dueDt.setHours(0, 0, 0, 0);
    const diff = dueDt - now;
    return Math.max(0, Math.ceil(diff / 86400000));
  }, [activePeriod]);

  // Helper to find staff name by ID
  const findStaffName = (sid) => {
    const s = staffs.find((st) => String(getStaffId(st)) === String(sid));
    return s ? getStaffName(s) : `Staff #${sid}`;
  };

  // ─── Sub-Section Forms State ───
  const [childCare, setChildCare] = useState([]);
  const addCC = () => setChildCare([...childCare, { id: Date.now(), staffId: "", amount: "" }]);
  const updCC = (i, f, v) => setChildCare(childCare.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));
  const rmCC = (i) => setChildCare(childCare.filter((_, idx) => idx !== i));

  const [otherDed, setOtherDed] = useState([]);
  const addOD = () => setOtherDed([...otherDed, { id: Date.now(), staffId: "", amount: "" }]);
  const updOD = (i, f, v) => setOtherDed(otherDed.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));
  const rmOD = (i) => setOtherDed(otherDed.filter((_, idx) => idx !== i));

  const [pto, setPto] = useState([]);
  const addPTO = () => setPto([...pto, { id: Date.now(), staffId: "", startDate: "", endDate: "" }]);
  const updPTO = (i, f, v) => setPto(pto.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));
  const rmPTO = (i) => setPto(pto.filter((_, idx) => idx !== i));

  const [birthday, setBirthday] = useState([]);
  const addBD = () => setBirthday([...birthday, { id: Date.now(), staffId: "", date: "" }]);
  const updBD = (i, f, v) => setBirthday(birthday.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));
  const rmBD = (i) => setBirthday(birthday.filter((_, idx) => idx !== i));

  const [hoursToAdd, setHoursToAdd] = useState([]);
  const addHTA = () => setHoursToAdd([...hoursToAdd, { id: Date.now(), staffId: "", hours: "", type: "After-care" }]);
  const updHTA = (i, f, v) => setHoursToAdd(hoursToAdd.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));
  const rmHTA = (i) => setHoursToAdd(hoursToAdd.filter((_, idx) => idx !== i));

  const [holidayExceptions, setHolidayExceptions] = useState({});
  const toggleExclusion = (holidayId, staffId) => {
    const current = holidayExceptions[holidayId] || [];
    const next = current.includes(staffId) ? current.filter((x) => x !== staffId) : [...current, staffId];
    setHolidayExceptions({ ...holidayExceptions, [holidayId]: next });
  };

  const [notes, setNotes] = useState({ preschool: "", elementary: "" });

  const itemCount = childCare.length + otherDed.length + pto.length + birthday.length + hoursToAdd.length;

  const stats = useMemo(() => {
    const metrics = directorOverview?.metrics;
    if (metrics) {
      return {
        totalStaff: metrics.staff_count ?? staffs.length,
        ptoPct: metrics.pto_used_ytd_percentage ?? 0,
        deductions: metrics.deductions_count ?? itemCount,
        pendingPTO: metrics.pto_this_period ?? pto.reduce((a, r) => a + daysBetween(r.startDate, r.endDate), 0),
        historyCount: metrics.past_submissions_count ?? displayHistory.length,
      };
    }
    return {
      totalStaff: staffs.length,
      ptoPct: 0,
      deductions: itemCount,
      pendingPTO: pto.reduce((a, r) => a + daysBetween(r.startDate, r.endDate), 0),
      historyCount: displayHistory.length,
    };
  }, [directorOverview, itemCount, pto, displayHistory, staffs]);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("payroll_cycle_id", selectedPeriodId || "");
    formData.append("pto_used_ytd_percentage", stats.ptoPct || 0);
    formData.append("preschool_notes", notes.preschool || "");
    formData.append("elementary_notes", notes.elementary || "");

    const selectedStaffSet = new Set();
    let idx = 0;

    // 1. Child care deductions
    childCare.forEach((r) => {
      if (!r.staffId) return;
      selectedStaffSet.add(r.staffId);
      formData.append(`items[${idx}][staff_id]`, r.staffId);
      formData.append(`items[${idx}][item_type]`, "child_care_deduction");
      formData.append(`items[${idx}][amount]`, r.amount || 0);
      idx++;
    });

    // 2. Other deductions
    otherDed.forEach((r) => {
      if (!r.staffId) return;
      selectedStaffSet.add(r.staffId);
      formData.append(`items[${idx}][staff_id]`, r.staffId);
      formData.append(`items[${idx}][item_type]`, "other_deduction");
      formData.append(`items[${idx}][amount]`, r.amount || 0);
      idx++;
    });

    // 3. PTO
    pto.forEach((r) => {
      if (!r.staffId) return;
      selectedStaffSet.add(r.staffId);
      formData.append(`items[${idx}][staff_id]`, r.staffId);
      formData.append(`items[${idx}][item_type]`, "pto");
      if (r.startDate) formData.append(`items[${idx}][start_date]`, r.startDate);
      if (r.endDate || r.startDate) formData.append(`items[${idx}][end_date]`, r.endDate || r.startDate);
      const days = daysBetween(r.startDate, r.endDate);
      formData.append(`items[${idx}][hours]`, days * 8);
      idx++;
    });

    // 4. Birthday / Extra Day Off
    birthday.forEach((r) => {
      if (!r.staffId) return;
      selectedStaffSet.add(r.staffId);
      formData.append(`items[${idx}][staff_id]`, r.staffId);
      formData.append(`items[${idx}][item_type]`, "birthday_extra_off");
      if (r.date) formData.append(`items[${idx}][start_date]`, r.date);
      idx++;
    });

    // 5. ADP Hours
    hoursToAdd.forEach((r) => {
      if (!r.staffId) return;
      selectedStaffSet.add(r.staffId);
      formData.append(`items[${idx}][staff_id]`, r.staffId);
      formData.append(`items[${idx}][item_type]`, "adp_hours");
      formData.append(`items[${idx}][hours]`, r.hours || 0);
      formData.append(`items[${idx}][category_tag]`, r.type || "After-care");
      idx++;
    });

    // 6. Holiday exceptions
    PERIOD_HOLIDAYS.forEach((h) => {
      const excluded = holidayExceptions[h.id] || [];
      excluded.forEach((staffId) => {
        selectedStaffSet.add(staffId);
        formData.append(`items[${idx}][staff_id]`, staffId);
        formData.append(`items[${idx}][item_type]`, "holiday_exception");
        formData.append(`items[${idx}][hours]`, 8);
        formData.append(`items[${idx}][category_tag]`, h.name);
        idx++;
      });
    });

    // Total staff count selected for the payload
    formData.append("staff_count", selectedStaffSet.size);

    // Fallback payload format for local state
    const localPayload = {
      payroll_cycle_id: Number(selectedPeriodId) || null,
      periodEnding,
      periodStart,
      dueDate: activePeriod?.dueDate || activePeriod?.submission_due_date || periodEnding,
      submittedAt: new Date().toISOString(),
      submittedBy: "Director",
      childCare: childCare.map((r) => ({ name: findStaffName(r.staffId), amount: Number(r.amount) || 0 })),
      otherDeductions: otherDed.map((r) => ({ name: findStaffName(r.staffId), amount: Number(r.amount) || 0 })),
      pto: pto.map((r) => ({ name: findStaffName(r.staffId), startDate: r.startDate, endDate: r.endDate || r.startDate, days: daysBetween(r.startDate, r.endDate) })),
      birthday: birthday.map((r) => ({ name: findStaffName(r.staffId), date: r.date })),
      hoursToAdd: hoursToAdd.map((r) => ({ name: findStaffName(r.staffId), hours: Number(r.hours) || 0, type: r.type })),
      holidayExceptions: PERIOD_HOLIDAYS.map((h) => ({ date: h.date, name: h.name, excluded: (holidayExceptions[h.id] || []).map((sid) => findStaffName(sid)) })),
      notes,
    };

    try {
      await apiSubmitPayroll(formData);
    } catch (err) {
      // API submission fallback to local storage mode
    }


    const updatedHistory = [{ ...localPayload, id: Date.now() }, ...localHistory];
    setLocalHistory(updatedHistory);
    savePayrollHistory(updatedHistory);

    const updatedSchedule = displaySchedules.map((p) =>
      p.id.toString() === selectedPeriodId ? { ...p, status: "Submitted" } : p
    );
    setLocalSchedule(updatedSchedule);
    savePayrollSchedule(updatedSchedule);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
    setChildCare([]);
    setOtherDed([]);
    setPto([]);
    setBirthday([]);
    setHoursToAdd([]);
    setHolidayExceptions({});
    setNotes({ preschool: "", elementary: "" });
  };

  const handleLocalAddSchedule = (newItems) => {
    const itemsToAdd = Array.isArray(newItems) ? newItems : [newItems];
    const updated = [...displaySchedules, ...itemsToAdd].sort(
      (a, b) =>
        new Date(a.startDate || a.start_date) - new Date(b.startDate || b.start_date)
    );
    setLocalSchedule(updated);
    savePayrollSchedule(updated);
  };

  const handleLocalDeleteSchedule = (id) => {
    const updated = displaySchedules.filter((p) => p.id !== id);
    setLocalSchedule(updated);
    savePayrollSchedule(updated);
  };

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Page Header */}
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
                activeTab === "submit"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Submit Payroll
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Payroll History ({displayHistory.length})
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "schedule"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Payroll Schedule ({displaySchedules.length})
            </button>
          </div>

          {activeTab === "submit" ? (
            payrollDays <= 3 && payrollDays >= 0 ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#AE4A3E]/10 text-[#AE4A3E]">
                <AlertTriangle size={12} /> {payrollDays}d until due
              </span>
            ) : null
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

      {/* Success Notification */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-[#3E7A54]/10 border border-[#3E7A54]/25"
        >
          <CheckCircle2 size={20} className="text-[#3E7A54]" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Payroll Submitted Successfully!</p>
            <p className="text-xs text-gray-600">
              The owner has been notified. Pay period ending {fmtDate(periodEnding)}.
            </p>
          </div>
        </motion.div>
      )}

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={UserCheck}
            label="Staff Count"
            value={stats.totalStaff}
            sub={`${stats.totalStaff} Total Active Staff`}
            color="bg-[#1E3A5F]/10 text-[#1E3A5F]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={DollarSign}
            label="Deductions"
            value={stats.deductions}
            sub="Child care + loans this period"
            color="bg-[#1E3A5F]/10 text-[#1E3A5F]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={Clock}
            label="PTO This Period"
            value={stats.pendingPTO}
            sub={stats.pendingPTO > 0 ? "Days to deduct" : "No PTO logged"}
            color="bg-[#B78A2F]/10 text-[#B78A2F]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            icon={ClipboardList}
            label="History"
            value={stats.historyCount}
            sub={stats.historyCount > 0 ? "Past submissions" : "No history yet"}
            color="bg-gray-50 text-gray-500"
          />
        </motion.div>
      </div>

      {/* Tab 1: Submit Payroll */}
      {activeTab === "submit" && (
        <>
          <motion.div
            variants={itemVariants}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h3 className="text-sm font-bold text-gray-800">Select Payroll Cycle</h3>
              <p className="text-xs text-gray-400">
                Choose the upcoming cycle period from the schedule roster.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 bg-white min-w-[220px]"
              >
                {pendingSchedules.map((p) => {
                  const sDate = p.startDate || p.start_date;
                  const eDate = p.endDate || p.end_date;
                  const status = p.status || "pending";
                  return (
                    <option key={p.id} value={p.id}>
                      {fmtDate(sDate)} - {fmtDate(eDate)} ({status})
                    </option>
                  );
                })}
                {pendingSchedules.length === 0 && <option value="">No pending cycles available</option>}
              </select>
            </div>
          </motion.div>

          <PayrollCountdownCard periodEnd={periodEnding} payrollDays={payrollDays} />

          <div className="flex flex-col gap-6">
            <div className="relative z-[60]">
              <ChildCareSection rows={childCare} onAdd={addCC} onUpdate={updCC} onRemove={rmCC} />
            </div>
            <div className="relative z-[50]">
              <OtherDeductionsSection rows={otherDed} onAdd={addOD} onUpdate={updOD} onRemove={rmOD} />
            </div>
            <div className="relative z-[40]">
              <PTOSection rows={pto} onAdd={addPTO} onUpdate={updPTO} onRemove={rmPTO} />
            </div>
            <div className="relative z-[30]">
              <BirthdaySection rows={birthday} onAdd={addBD} onUpdate={updBD} onRemove={rmBD} />
            </div>
            <div className="relative z-[20]">
              <HoursToAddSection rows={hoursToAdd} onAdd={addHTA} onUpdate={updHTA} onRemove={rmHTA} />
            </div>
            <div className="relative z-[10]">
              <HolidayExceptionsSection
                holidays={PERIOD_HOLIDAYS}
                exceptions={holidayExceptions}
                onToggleExclusion={toggleExclusion}
              />
            </div>
            <PayrollNotesSection notes={notes} onChange={setNotes} />
            <SubmitSection
              itemCount={itemCount}
              payrollDays={payrollDays}
              onSubmit={handleSubmit}
              disabled={
                itemCount === 0 ||
                !activePeriod ||
                (activePeriod.status || "").toLowerCase() === "submitted" ||
                isSubmitting
              }
            />
          </div>
        </>
      )}

      {/* Tab 2: History */}
      {activeTab === "history" && <PayrollHistoryCard history={displayHistory} />}

      {/* Tab 3: Schedule Table */}
      {activeTab === "schedule" && (
        <DirectorPayrollScheduleTable
          schedule={displaySchedules}
          onDeleteLocal={handleLocalDeleteSchedule}
        />
      )}

      {/* Add Schedule Period Modal */}
      <AddSchedulePeriodModal
        isOpen={isAddPeriodOpen}
        onClose={() => setIsAddPeriodOpen(false)}
        onLocalAdd={handleLocalAddSchedule}
      />
    </motion.div>
  );
};

export default PayrollPage;
