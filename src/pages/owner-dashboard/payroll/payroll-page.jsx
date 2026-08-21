import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ChevronRight,
  User,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  Trash2,
  CalendarDays,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  getPayrollHistory,
  savePayrollHistory,
  getPayrollSchedule,
  savePayrollSchedule
} from "@/utils/payroll-storage";

const TODAY = new Date("2026-05-11");

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const OwnerPayrollPage = () => {
  const [activeTab, setActiveTab] = useState("history"); // "history" | "schedule"
  const [history, setHistory] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  
  // Schedule Modal State
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [modalError, setModalError] = useState("");
  const [scheduleMode, setScheduleMode] = useState("single"); // "single" | "series"
  const [seriesCount, setSeriesCount] = useState("4"); // "4" = 2 months, "12" = 6 months, "26" = 1 year

  // History Filter State
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Load and Sync Data
  const loadData = () => {
    setHistory(getPayrollHistory());
    setSchedule(getPayrollSchedule());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("pulse_payroll_update", loadData);
    return () => window.removeEventListener("pulse_payroll_update", loadData);
  }, []);

  // Filter history to last 2 months by default
  const filteredHistory = useMemo(() => {
    if (showAllHistory) return history;
    const twoMonthsAgo = new Date(TODAY);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    return history.filter(item => {
      const periodDate = new Date(item.periodEnding);
      return periodDate >= twoMonthsAgo;
    });
  }, [history, showAllHistory]);

  // Next Pending Payroll Period
  const nextPendingPeriod = useMemo(() => {
    const pending = schedule
      .filter(p => p.status === "Pending")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    return pending[0] || null;
  }, [schedule]);

  const daysRemaining = useMemo(() => {
    if (!nextPendingPeriod) return null;
    const diffTime = new Date(nextPendingPeriod.dueDate) - TODAY;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [nextPendingPeriod]);

  // Handle Add Schedule Period
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
    }

    setStartDate("");
    setEndDate("");
    setDueDate("");
    setScheduleMode("single");
    setIsAddPeriodOpen(false);
  };

  // Handle Delete Schedule Period
  const handleDeletePeriod = (id) => {
    const updated = schedule.filter(p => p.id !== id);
    setSchedule(updated);
    savePayrollSchedule(updated);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payroll Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review bi-weekly director submissions and schedule upcoming payroll cycles.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "history" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
              }`}
            >
              Payroll History
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "schedule" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
              }`}
            >
              Payroll Schedule
            </button>
          </div>

          {activeTab === "schedule" && (
            <Button
              onClick={() => setIsAddPeriodOpen(true)}
              className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-semibold rounded-xl text-xs md:text-sm flex items-center gap-1.5"
            >
              <Plus size={16} /> Schedule Period
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F]">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Next Due Date</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {nextPendingPeriod ? fmtDate(nextPendingPeriod.dueDate) : "None Scheduled"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              daysRemaining !== null && daysRemaining <= 3 ? "bg-[#AE4A3E]/10 text-[#AE4A3E]" : "bg-[#B78A2F]/10 text-[#8F6A1F]"
            }`}>
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Days Remaining</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {daysRemaining !== null ? `${daysRemaining} Days` : "N/A"}
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
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {history.length > 0 ? fmtDate(history[0].submittedAt) : "None"}
              </p>
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
                {schedule.filter(s => s.status === "Pending").length} Cycles
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "history" ? (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  {showAllHistory ? "All Submissions" : "Recent Submissions (Last 2 Months)"}
                </h3>
                <p className="text-xs text-gray-400">Click a record to audit child deductions, PTO used, ADP notes and approvals.</p>
              </div>
              <Button
                variant="outline"
                className="text-xs rounded-xl"
                onClick={() => setShowAllHistory(!showAllHistory)}
              >
                {showAllHistory ? "Show Last 2 Months" : "Show All History"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((item) => {
                const totalDeductions = (item.childCare?.length || 0) + (item.otherDeductions?.length || 0);
                const totalPtoDays = item.pto?.reduce((acc, curr) => acc + curr.days, 0) || 0;
                
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
                    onClick={() => setSelectedPayroll(item)}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="px-2.5 py-1 bg-[#1E3A5F]/5 rounded-lg text-xs font-semibold text-[#1E3A5F]">
                          Period: {fmtDate(item.periodStart || "2026-04-16")} - {fmtDate(item.periodEnding)}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          Submitted {fmtDate(item.submittedAt)}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 text-base mb-1">
                        Bi-Weekly Report Summary
                      </h4>
                      <p className="text-xs text-gray-500 mb-4">
                        Submitted by <span className="font-semibold">{item.submittedBy}</span>
                      </p>

                      <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-50 mb-3 text-center">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Deductions</p>
                          <p className="text-sm font-bold text-gray-800">{totalDeductions} items</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">PTO Used</p>
                          <p className="text-sm font-bold text-gray-800">{totalPtoDays} Days</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">ADP Hours</p>
                          <p className="text-sm font-bold text-gray-800">{item.hoursToAdd?.length || 0} staff</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#1E3A5F] font-semibold pt-1">
                      <span>Audit Detailed Sections</span>
                      <ChevronRight size={16} />
                    </div>
                  </motion.div>
                );
              })}

              {filteredHistory.length === 0 && (
                <div className="col-span-2 py-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm">
                  No payroll reports found for this period.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="schedule-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Bi-Weekly Submission Schedule</h3>
                <p className="text-xs text-gray-400">View and adjust active payroll schedules for the entire academic/fiscal year.</p>
              </div>
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
      </AnimatePresence>

      {/* Audit Detail Modal */}
      <AnimatePresence>
        {selectedPayroll && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPayroll(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Audit Payroll Details</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Period Ending: {fmtDate(selectedPayroll.periodEnding)} · Submitted {fmtDate(selectedPayroll.submittedAt)}
                    </p>
                  </div>
                  <button onClick={() => setSelectedPayroll(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Deductions Card */}
                  <Card className="border border-gray-100 shadow-none bg-gray-50/50">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-800">
                        <DollarSign size={16} className="text-[#1E3A5F]" />
                        Child Care Deductions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 space-y-1.5">
                      {selectedPayroll.childCare?.length > 0 ? (
                        selectedPayroll.childCare.map((c, i) => (
                          <div key={i} className="flex justify-between text-xs py-1">
                            <span className="text-gray-600 font-medium">{c.name}</span>
                            <span className="font-bold text-gray-900">${c.amount}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No child care deductions logged.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Other Deductions Card */}
                  <Card className="border border-gray-100 shadow-none bg-gray-50/50">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-800">
                        <Receipt size={16} className="text-[#1E3A5F]" />
                        Other Deductions (Loans)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 space-y-1.5">
                      {selectedPayroll.otherDeductions?.length > 0 ? (
                        selectedPayroll.otherDeductions.map((o, i) => (
                          <div key={i} className="flex justify-between text-xs py-1">
                            <span className="text-gray-600 font-medium">{o.name}</span>
                            <span className="font-bold text-gray-900">${o.amount} <span className="text-[10px] text-gray-400 font-normal">(bal: ${o.balanceAfter})</span></span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No other deductions logged.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* PTO Card */}
                  <Card className="border border-gray-100 shadow-none bg-gray-50/50">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-800">
                        <Clock size={16} className="text-[#1E3A5F]" />
                        PTO Days Logged
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 space-y-1.5">
                      {selectedPayroll.pto?.length > 0 ? (
                        selectedPayroll.pto.map((p, i) => (
                          <div key={i} className="flex justify-between text-xs py-1">
                            <div>
                              <p className="font-medium text-gray-700">{p.name}</p>
                              <p className="text-[9px] text-gray-400">{fmtDate(p.startDate)} - {fmtDate(p.endDate)}</p>
                            </div>
                            <span className="font-bold text-gray-900">{p.days} Days <span className="text-[10px] text-gray-400 font-normal">(bal: {p.balanceAfter})</span></span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No PTO requested this period.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* ADP Hours Card */}
                  <Card className="border border-gray-100 shadow-none bg-gray-50/50">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-800">
                        <Plus size={16} className="text-[#1E3A5F]" />
                        ADP Hours to Add
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 space-y-1.5">
                      {selectedPayroll.hoursToAdd?.length > 0 ? (
                        selectedPayroll.hoursToAdd.map((h, i) => (
                          <div key={i} className="flex justify-between text-xs py-1">
                            <span className="text-gray-600 font-medium">{h.name} <span className="text-[10px] text-gray-400 font-normal">({h.type})</span></span>
                            <span className="font-bold text-gray-900">{h.hours} hrs</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No extra ADP hours logged.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Holiday Exclusions & Birthdays */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-gray-100 shadow-none bg-gray-50/50">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-800">
                        <AlertTriangle size={16} className="text-[#1E3A5F]" />
                        Holiday Exclusions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 space-y-1.5">
                      {selectedPayroll.holidayExceptions?.some(h => h.excluded?.length > 0) ? (
                        selectedPayroll.holidayExceptions.map((h, i) => (
                          <div key={i} className="text-xs py-1">
                            <p className="font-semibold text-gray-700">{h.name} ({fmtDate(h.date)})</p>
                            <p className="text-gray-500">Excluded: {h.excluded.join(", ")}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No holiday exclusions specified.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-100 shadow-none bg-gray-50/50">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-800">
                        <User size={16} className="text-[#1E3A5F]" />
                        Birthday Leave
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 space-y-1.5">
                      {selectedPayroll.birthday?.length > 0 ? (
                        selectedPayroll.birthday.map((b, i) => (
                          <div key={i} className="flex justify-between text-xs py-1">
                            <span className="text-gray-600 font-medium">{b.name}</span>
                            <span className="font-bold text-gray-900">{fmtDate(b.date)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No birthday leaves logged.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Audit Notes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Director Comments</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Preschool Division</p>
                      <p className="text-xs text-gray-700 mt-1">{selectedPayroll.notes?.preschool || "No comments."}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Elementary Division</p>
                      <p className="text-xs text-gray-700 mt-1">{selectedPayroll.notes?.elementary || "No comments."}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <Button onClick={() => setSelectedPayroll(null)} className="bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl px-5">
                    Close Audit
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Period Modal */}
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
    </div>
  );
};

export default OwnerPayrollPage;
