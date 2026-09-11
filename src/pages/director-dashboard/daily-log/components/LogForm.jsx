import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  UserX, 
  Calendar, 
  UserCheck, 
  UserPlus, 
  Wrench, 
  ShieldAlert, 
  X, 
  Send 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";

export const LOG_TYPES = [
  { 
    id: "incident", 
    label: "Incident", 
    desc: "Safety, behavior or medical event", 
    icon: AlertTriangle, 
    color: "bg-[#AE4A3E]", 
    light: "bg-[#AE4A3E]/10 text-[#8A362C] border-[#AE4A3E]/20" 
  },
  { 
    id: "removal", 
    label: "Removal", 
    desc: "Student withdrawal or drop", 
    icon: UserX, 
    color: "bg-[#8A362C]", 
    light: "bg-[#8A362C]/10 text-[#8A362C] border-[#8A362C]/20" 
  },
  { 
    id: "pto", 
    label: "PTO Entry", 
    desc: "Staff vacation or sick leave", 
    icon: Calendar, 
    color: "bg-blue-600", 
    light: "bg-blue-50 text-blue-700 border-blue-200" 
  },
  { 
    id: "substitute", 
    label: "Substitute Entry", 
    desc: "Covering classroom shift", 
    icon: UserCheck, 
    color: "bg-teal-600", 
    light: "bg-teal-50 text-teal-700 border-teal-200" 
  },
  { 
    id: "waitlist", 
    label: "Waitlist Entry", 
    desc: "Inquiry or prospective child", 
    icon: UserPlus, 
    color: "bg-purple-600", 
    light: "bg-purple-50 text-purple-700 border-purple-200" 
  },
  { 
    id: "maintenance", 
    label: "Maintenance Entry", 
    desc: "Facility repair or ticket", 
    icon: Wrench, 
    color: "bg-amber-600", 
    light: "bg-amber-50 text-amber-700 border-amber-200" 
  },
  { 
    id: "at_risk", 
    label: "At-Risk Entry", 
    desc: "Early retention intervention", 
    icon: ShieldAlert, 
    color: "bg-rose-600", 
    light: "bg-rose-50 text-rose-700 border-rose-200" 
  },
];

const LogForm = ({ onAdd, onClose, defaultType = null }) => {
  const { classrooms } = useGetAllClassrooms();
  const [logType, setLogType] = useState(defaultType || "incident");
  const [step, setStep] = useState(defaultType ? 1 : 0);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    severity: "minor",
    area: "Classroom",
    reason: "transferring",
    ptoType: "Sick Leave",
    priority: "Medium",
    category: "General Maintenance",
    riskCategory: "financial",
    source: "Referral"
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const base = { id: Date.now(), date: form.date || new Date().toISOString().split("T")[0] };
    
    if (logType === "incident") {
      if (!form.student || !form.classroom) return;
      onAdd({ 
        ...base, 
        type: "incident", 
        student: form.student, 
        classroom: form.classroom, 
        severity: form.severity || "minor", 
        area: form.area || "Classroom",
        description: form.description || ""
      });
    } else if (logType === "removal") {
      if (!form.student || !form.classroom) return;
      onAdd({ 
        ...base, 
        type: "removal", 
        student: form.student, 
        classroom: form.classroom, 
        reason: form.reason || "transferring",
        detail: form.detail || ""
      });
    } else if (logType === "pto") {
      if (!form.staffName) return;
      onAdd({
        ...base,
        type: "pto",
        staffName: form.staffName,
        role: form.role || "Teacher",
        ptoType: form.ptoType || "Sick Leave",
        startDate: form.startDate || form.date,
        endDate: form.endDate || form.date,
        notes: form.notes || ""
      });
    } else if (logType === "substitute") {
      if (!form.coveredStaff || !form.substituteName || !form.classroom) return;
      onAdd({
        ...base,
        type: "substitute",
        coveredStaff: form.coveredStaff,
        substituteName: form.substituteName,
        classroom: form.classroom,
        shiftDate: form.date,
        notes: form.notes || ""
      });
    } else if (logType === "waitlist") {
      if (!form.childName || !form.parentName || !form.classroom) return;
      onAdd({
        ...base,
        type: "waitlist",
        childName: form.childName,
        parentName: form.parentName,
        classroom: form.classroom,
        phone: form.phone || "",
        email: form.email || "",
        source: form.source || "Referral",
        notes: form.notes || ""
      });
    } else if (logType === "maintenance") {
      if (!form.title || !form.location) return;
      onAdd({
        ...base,
        type: "maintenance",
        title: form.title,
        location: form.location,
        category: form.category || "General Maintenance",
        priority: form.priority || "Medium",
        details: form.details || ""
      });
    } else if (logType === "at_risk") {
      if (!form.student || !form.classroom) return;
      onAdd({
        ...base,
        type: "at_risk",
        student: form.student,
        classroom: form.classroom,
        riskCategory: form.riskCategory || "financial",
        detail: form.detail || ""
      });
    }

    onClose();
  };

  const selectedTypeObj = LOG_TYPES.find((t) => t.id === logType);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {step === 0 ? "Select Log Category" : `New ${selectedTypeObj?.label || "Entry"}`}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {step === 0 ? "Choose the operational event type to record" : selectedTypeObj?.desc}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LOG_TYPES.map((lt) => {
                const Icon = lt.icon;
                return (
                  <button
                    key={lt.id}
                    type="button"
                    onClick={() => {
                      setLogType(lt.id);
                      setStep(1);
                    }}
                    className="flex items-start gap-3.5 p-4 rounded-2xl border border-gray-100 hover:border-[#1E3A5F]/30 hover:bg-slate-50/80 transition-all text-left group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${lt.light} shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-[#1E3A5F]">{lt.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{lt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Change type link */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedTypeObj?.color || "bg-gray-400"}`} />
                  <span className="text-xs font-bold text-gray-800">{selectedTypeObj?.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-xs text-[#1E3A5F] font-semibold hover:underline"
                >
                  ← Change Type
                </button>
              </div>

              {/* Entry Date */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                />
              </div>

              {/* 1. INCIDENT FORM */}
              {logType === "incident" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Student Name *</label>
                      <input
                        type="text"
                        required
                        value={form.student || ""}
                        onChange={(e) => update("student", e.target.value)}
                        placeholder="e.g. J. Martinez"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Classroom *</label>
                      <select
                        required
                        value={form.classroom || ""}
                        onChange={(e) => update("classroom", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                      >
                        <option value="">Select Classroom</option>
                        {classrooms.map((c) => (
                          <option key={c.id || c.classroom_name} value={c.classroom_name || c.name}>
                            {c.classroom_name || c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Severity</label>
                      <select
                        value={form.severity || "minor"}
                        onChange={(e) => update("severity", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                      >
                        <option value="minor">Minor</option>
                        <option value="moderate">Moderate</option>
                        <option value="major">Major</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Area / Location</label>
                      <select
                        value={form.area || "Classroom"}
                        onChange={(e) => update("area", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                      >
                        {["Classroom", "Playground", "Cafeteria", "Hallway", "Bathroom", "Outside"].map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Incident Description</label>
                    <textarea
                      rows={2}
                      value={form.description || ""}
                      onChange={(e) => update("description", e.target.value)}
                      placeholder="Details of what occurred..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* 2. REMOVAL FORM */}
              {logType === "removal" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Student Name *</label>
                      <input
                        type="text"
                        required
                        value={form.student || ""}
                        onChange={(e) => update("student", e.target.value)}
                        placeholder="e.g. M. Webb"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Classroom *</label>
                      <select
                        required
                        value={form.classroom || ""}
                        onChange={(e) => update("classroom", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                      >
                        <option value="">Select Classroom</option>
                        {classrooms.map((c) => (
                          <option key={c.id || c.classroom_name} value={c.classroom_name || c.name}>
                            {c.classroom_name || c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Removal Reason</label>
                    <select
                      value={form.reason || "transferring"}
                      onChange={(e) => update("reason", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                    >
                      <option value="transferring">Transferring</option>
                      <option value="moving">Moving / Relocating</option>
                      <option value="behavioral">Behavioral Issues</option>
                      <option value="financial">Financial Reasons</option>
                      <option value="graduated">Graduated</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Removal Details</label>
                    <textarea
                      rows={2}
                      value={form.detail || ""}
                      onChange={(e) => update("detail", e.target.value)}
                      placeholder="Context or documentation notes..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* 3. PTO FORM */}
              {logType === "pto" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Staff Member Name *</label>
                      <input
                        type="text"
                        required
                        value={form.staffName || ""}
                        onChange={(e) => update("staffName", e.target.value)}
                        placeholder="e.g. Ms. Sarah Jenkins"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Role / Title</label>
                      <input
                        type="text"
                        value={form.role || ""}
                        onChange={(e) => update("role", e.target.value)}
                        placeholder="e.g. Lead Teacher"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">PTO Category</label>
                      <select
                        value={form.ptoType || "Sick Leave"}
                        onChange={(e) => update("ptoType", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                      >
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Vacation">Vacation / Holiday</option>
                        <option value="Jury Duty">Jury Duty</option>
                        <option value="Hurricane">Hurricane</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">End Date (If Multi-Day)</label>
                      <input
                        type="date"
                        value={form.endDate || form.date}
                        onChange={(e) => update("endDate", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Notes / Coverage Plan</label>
                    <textarea
                      rows={2}
                      value={form.notes || ""}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="Approved by Director, coverage assigned..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* 4. SUBSTITUTE FORM */}
              {logType === "substitute" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Covered Staff Member *</label>
                      <input
                        type="text"
                        required
                        value={form.coveredStaff || ""}
                        onChange={(e) => update("coveredStaff", e.target.value)}
                        placeholder="e.g. Mrs. Johnson"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Substitute Teacher Name *</label>
                      <input
                        type="text"
                        required
                        value={form.substituteName || ""}
                        onChange={(e) => update("substituteName", e.target.value)}
                        placeholder="e.g. Amanda Clark"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Classroom Assigned *</label>
                    <select
                      required
                      value={form.classroom || ""}
                      onChange={(e) => update("classroom", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                    >
                      <option value="">Select Classroom</option>
                      {classrooms.map((c) => (
                        <option key={c.id || c.classroom_name} value={c.classroom_name || c.name}>
                          {c.classroom_name || c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Shift Notes</label>
                    <textarea
                      rows={2}
                      value={form.notes || ""}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="e.g. Full day coverage, credentials verified..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* 5. WAITLIST FORM */}
              {logType === "waitlist" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Child Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.childName || ""}
                        onChange={(e) => update("childName", e.target.value)}
                        placeholder="e.g. Leo Vance"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Classroom *</label>
                      <select
                        required
                        value={form.classroom || ""}
                        onChange={(e) => update("classroom", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                      >
                        <option value="">Select Classroom</option>
                        {classrooms.map((c) => (
                          <option key={c.id || c.classroom_name} value={c.classroom_name || c.name}>
                            {c.classroom_name || c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Parent / Guardian Name *</label>
                      <input
                        type="text"
                        required
                        value={form.parentName || ""}
                        onChange={(e) => update("parentName", e.target.value)}
                        placeholder="e.g. David Vance"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={form.phone || ""}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="e.g. (863) 555-0192"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Lead Source</label>
                    <select
                      value={form.source || "Referral"}
                      onChange={(e) => update("source", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                    >
                      <option value="Website">Website Inquiry</option>
                      <option value="Referral">Parent Referral</option>
                      <option value="Walk-in">Walk-in Tour</option>
                      <option value="Social Media">Social Media</option>
                    </select>
                  </div>
                </>
              )}

              {/* 6. MAINTENANCE FORM */}
              {logType === "maintenance" && (
                <>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Issue Title *</label>
                    <input
                      type="text"
                      required
                      value={form.title || ""}
                      onChange={(e) => update("title", e.target.value)}
                      placeholder="e.g. AC unit leaking water"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Location / Classroom *</label>
                      <input
                        type="text"
                        required
                        value={form.location || ""}
                        onChange={(e) => update("location", e.target.value)}
                        placeholder="e.g. Room 104 / Playground"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Priority</label>
                      <select
                        value={form.priority || "Medium"}
                        onChange={(e) => update("priority", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Repair Details</label>
                    <textarea
                      rows={2}
                      value={form.details || ""}
                      onChange={(e) => update("details", e.target.value)}
                      placeholder="Vendor contacted, safety precautions taken..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* 7. AT-RISK FORM */}
              {logType === "at_risk" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Student Name *</label>
                      <input
                        type="text"
                        required
                        value={form.student || ""}
                        onChange={(e) => update("student", e.target.value)}
                        placeholder="e.g. Liam T."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Classroom *</label>
                      <select
                        required
                        value={form.classroom || ""}
                        onChange={(e) => update("classroom", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                      >
                        <option value="">Select Classroom</option>
                        {classrooms.map((c) => (
                          <option key={c.id || c.classroom_name} value={c.classroom_name || c.name}>
                            {c.classroom_name || c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Risk Category</label>
                    <select
                      value={form.riskCategory || "financial"}
                      onChange={(e) => update("riskCategory", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none bg-white"
                    >
                      <option value="financial">Financial Concerns</option>
                      <option value="transferring">Transferring Intent</option>
                      <option value="moving">Relocation / Moving</option>
                      <option value="behavioral">Behavioral Challenges</option>
                      <option value="other">Other Concerns</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Intervention Notes</label>
                    <textarea
                      rows={2}
                      value={form.detail || ""}
                      onChange={(e) => update("detail", e.target.value)}
                      placeholder="Notes on communication or payment plan offer..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-gray-100 shrink-0">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl text-xs h-9">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl text-xs h-9 font-bold">
                  <Send size={14} className="mr-1.5 inline" /> Save {selectedTypeObj?.label}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LogForm;
