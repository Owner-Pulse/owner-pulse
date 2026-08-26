import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileSpreadsheet,
  Clock,
  DollarSign,
  Plus,
  AlertTriangle,
  User,
  MessageSquare,
  Loader2,
  Users,
  Percent,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetOwnerPayrollSubmissionAudit } from "@/hooks/payroll/payroll.hook";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const ITEM_TYPE_CONFIG = {
  pto: { label: "PTO Leave", bg: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
  child_care_deduction: { label: "Child Care", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: DollarSign },
  other_deduction: { label: "Other Deduction", bg: "bg-amber-50 text-amber-700 border-amber-200", icon: DollarSign },
  adp_hours: { label: "ADP Extra Hours", bg: "bg-purple-50 text-purple-700 border-purple-200", icon: Plus },
  hours_to_add: { label: "ADP Extra Hours", bg: "bg-purple-50 text-purple-700 border-purple-200", icon: Plus },
  holiday_exception: { label: "Holiday Exception", bg: "bg-rose-50 text-rose-700 border-rose-200", icon: AlertTriangle },
  birthday_extra_off: { label: "Birthday Off", bg: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: User },
  birthday: { label: "Birthday Off", bg: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: User },
};

const OwnerAuditDetailModal = ({ payroll, onClose }) => {
  const [activeTab, setActiveTab] = useState("all");

  if (!payroll) return null;

  // Fetch audit details from API
  const { auditData, isLoading } = useGetOwnerPayrollSubmissionAudit(payroll?.id);
  const payload = auditData || payroll;

  const cycleStart = payload.payroll_cycle?.start_date || payload.cycle_start_date || payload.periodStart;
  const cycleEnd = payload.payroll_cycle?.end_date || payload.cycle_end_date || payload.periodEnding;
  const submittedAt = payload.submitted_at || payload.submittedAt;
  const submittedBy =
    typeof payload.submitted_by === "object"
      ? payload.submitted_by?.name || payload.submitted_by?.email
      : payload.submitted_by || "Director";

  const staffCount = payload.staff_count ?? payload.staffCount ?? 0;
  const ptoPct = payload.pto_used_ytd_percentage ?? payload.ptoPct ?? 0;

  // Items normalized array
  const rawItems = payload.items || [];
  const hasItemsArray = Array.isArray(payload.items);

  const normalizedItems = useMemo(() => {
    if (hasItemsArray) {
      return rawItems.map((item) => ({
        id: item.id,
        staffName: item.staff_name || "All Staff",
        itemType: item.item_type,
        amount: item.amount,
        hours: item.hours,
        startDate: item.start_date,
        endDate: item.end_date,
        categoryTag: item.category_tag,
        notes: item.notes,
      }));
    }

    // Fallback for local storage objects
    const list = [];
    (payload.pto || []).forEach((p, idx) =>
      list.push({
        id: `pto-${idx}`,
        staffName: p.name || "Staff Member",
        itemType: "pto",
        hours: p.days ? p.days * 8 : p.hours,
        startDate: p.startDate,
        endDate: p.endDate,
        notes: p.notes,
      })
    );
    (payload.childCare || []).forEach((c, idx) =>
      list.push({
        id: `cc-${idx}`,
        staffName: c.name || "Staff Member",
        itemType: "child_care_deduction",
        amount: c.amount,
        categoryTag: c.type || "Child Care",
      })
    );
    (payload.otherDeductions || []).forEach((o, idx) =>
      list.push({
        id: `od-${idx}`,
        staffName: o.name || "Staff Member",
        itemType: "other_deduction",
        amount: o.amount,
      })
    );
    (payload.hoursToAdd || []).forEach((h, idx) =>
      list.push({
        id: `adp-${idx}`,
        staffName: h.name || "Staff Member",
        itemType: "adp_hours",
        hours: h.hours,
        categoryTag: h.type,
      })
    );
    (payload.holidayExceptions || []).forEach((h, idx) =>
      list.push({
        id: `hol-${idx}`,
        staffName: h.name || "Multiple Staff",
        itemType: "holiday_exception",
        categoryTag: h.category_tag || h.name,
        hours: 8,
      })
    );
    (payload.birthday || []).forEach((b, idx) =>
      list.push({
        id: `bday-${idx}`,
        staffName: b.name || "Staff Member",
        itemType: "birthday_extra_off",
        startDate: b.date,
      })
    );
    return list;
  }, [rawItems, hasItemsArray, payload]);

  // Tab filtering
  const filteredItems = useMemo(() => {
    if (activeTab === "all") return normalizedItems;
    if (activeTab === "pto") return normalizedItems.filter((i) => i.itemType === "pto");
    if (activeTab === "deductions")
      return normalizedItems.filter(
        (i) => i.itemType === "child_care_deduction" || i.itemType === "other_deduction"
      );
    if (activeTab === "adp")
      return normalizedItems.filter((i) => i.itemType === "adp_hours" || i.itemType === "hours_to_add");
    if (activeTab === "exceptions")
      return normalizedItems.filter(
        (i) =>
          i.itemType === "holiday_exception" ||
          i.itemType === "birthday_extra_off" ||
          i.itemType === "birthday"
      );
    return normalizedItems;
  }, [normalizedItems, activeTab]);

  const counts = useMemo(
    () => ({
      all: normalizedItems.length,
      pto: normalizedItems.filter((i) => i.itemType === "pto").length,
      deductions: normalizedItems.filter(
        (i) => i.itemType === "child_care_deduction" || i.itemType === "other_deduction"
      ).length,
      adp: normalizedItems.filter((i) => i.itemType === "adp_hours" || i.itemType === "hours_to_add").length,
      exceptions: normalizedItems.filter(
        (i) =>
          i.itemType === "holiday_exception" ||
          i.itemType === "birthday_extra_off" ||
          i.itemType === "birthday"
      ).length,
    }),
    [normalizedItems]
  );

  const preschoolNotes = payload.preschool_notes || payload.notes?.preschool || "No notes submitted for Preschool division.";
  const elementaryNotes = payload.elementary_notes || payload.notes?.elementary || "No notes submitted for Elementary division.";

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#15294A] text-white p-6 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">Payroll Audit Details</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Audited
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  Period: <span className="font-semibold text-white">{fmtDate(cycleStart)}</span> —{" "}
                  <span className="font-semibold text-white">{fmtDate(cycleEnd)}</span>
                </p>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <p className="text-[10px] uppercase font-semibold text-gray-300 flex items-center gap-1">
                  <Users size={12} className="text-gray-400" /> Staff Count
                </p>
                <p className="text-base font-bold mt-0.5">{staffCount}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <p className="text-[10px] uppercase font-semibold text-gray-300 flex items-center gap-1">
                  <Percent size={12} className="text-gray-400" /> PTO YTD Used
                </p>
                <p className="text-base font-bold mt-0.5">{ptoPct}%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <p className="text-[10px] uppercase font-semibold text-gray-300 flex items-center gap-1">
                  <FileSpreadsheet size={12} className="text-gray-400" /> Total Items
                </p>
                <p className="text-base font-bold mt-0.5">{counts.all}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <p className="text-[10px] uppercase font-semibold text-gray-300 flex items-center gap-1">
                  <User size={12} className="text-gray-400" /> Submitted By
                </p>
                <p className="text-xs font-semibold truncate mt-1">{submittedBy}</p>
                <p className="text-[9px] text-gray-400">{fmtDate(submittedAt)}</p>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="bg-gray-50/80 px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
            <div className="flex items-center gap-1.5 min-w-max">
              {[
                { id: "all", label: "All Items", count: counts.all },
                { id: "pto", label: "PTO Leave", count: counts.pto },
                { id: "deductions", label: "Deductions", count: counts.deductions },
                { id: "adp", label: "ADP Hours", count: counts.adp },
                { id: "exceptions", label: "Holiday & Birthdays", count: counts.exceptions },
                { id: "notes", label: "Director Notes", count: null },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#1E3A5F] text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#1E3A5F]" />
                <p className="text-xs font-medium">Loading audit submission items...</p>
              </div>
            ) : activeTab === "notes" ? (
              /* Director Notes Tab */
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <MessageSquare size={18} className="text-[#1E3A5F]" />
                  <span>Division Summary Notes</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A5F] bg-[#1E3A5F]/10 px-2 py-0.5 rounded-md">
                      Preschool Division
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed italic pt-1">
                      "{preschoolNotes}"
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A5F] bg-[#1E3A5F]/10 px-2 py-0.5 rounded-md">
                      Elementary Division
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed italic pt-1">
                      "{elementaryNotes}"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Unified Audit Items Table View */
              <div className="space-y-4">
                {filteredItems.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
                        <tr>
                          <th className="py-3 px-4">Staff Member</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Tag / Details</th>
                          <th className="py-3 px-4 text-right">Hours / Days</th>
                          <th className="py-3 px-4 text-right">Amount ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredItems.map((item, idx) => {
                          const config = ITEM_TYPE_CONFIG[item.itemType] || {
                            label: item.itemType || "Item",
                            bg: "bg-gray-100 text-gray-700 border-gray-200",
                            icon: FileSpreadsheet,
                          };
                          const IconComp = config.icon;

                          return (
                            <tr key={item.id || idx} className="hover:bg-gray-50/60 transition-colors">
                              {/* Staff Name */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] font-bold flex items-center justify-center text-[10px] shrink-0">
                                    {(item.staffName || "S")[0]}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{item.staffName}</p>
                                    {item.notes && (
                                      <p className="text-[10px] text-gray-400 italic line-clamp-1">{item.notes}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Category Badge */}
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${config.bg}`}
                                >
                                  <IconComp size={11} />
                                  {config.label}
                                </span>
                              </td>

                              {/* Details / Tag */}
                              <td className="py-3 px-4 text-gray-600">
                                {item.categoryTag ? (
                                  <span className="font-medium text-gray-800">{item.categoryTag}</span>
                                ) : item.startDate ? (
                                  <span className="text-[11px] text-gray-500">
                                    {fmtDate(item.startDate)}
                                    {item.endDate && item.endDate !== item.startDate ? ` - ${fmtDate(item.endDate)}` : ""}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">—</span>
                                )}
                              </td>

                              {/* Hours / Days */}
                              <td className="py-3 px-4 text-right font-medium text-gray-800">
                                {item.hours ? (
                                  `${item.hours} hrs`
                                ) : item.startDate ? (
                                  "1 Day"
                                ) : (
                                  <span className="text-gray-400 italic">—</span>
                                )}
                              </td>

                              {/* Amount */}
                              <td className="py-3 px-4 text-right font-bold text-gray-900">
                                {item.amount !== null && item.amount !== undefined ? (
                                  `$${item.amount}`
                                ) : (
                                  <span className="text-gray-400 italic font-normal">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <FileSpreadsheet size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-600">No items found for this category</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Select a different tab or view "All Items" to inspect all submission entries.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between shrink-0">
            <div className="text-xs text-gray-500">
              Showing <span className="font-bold text-gray-900">{filteredItems.length}</span> of{" "}
              <span className="font-bold text-gray-900">{counts.all}</span> items
            </div>
            <Button
              onClick={onClose}
              className="bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl px-6 py-2 text-xs font-semibold shadow-sm"
            >
              Close Audit View
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OwnerAuditDetailModal;
