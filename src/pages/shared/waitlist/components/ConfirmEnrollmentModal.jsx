import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";

const ConfirmEnrollmentModal = ({ isOpen, onClose, entry, onConfirmEnrollment, onSubmit, isPending = false }) => {
  const { classrooms } = useGetAllClassrooms();

  const [form, setForm] = useState({
    childId: "",
    personId: "",
    childName: "",
    dob: "",
    gender: "Male",
    finalRoom: "",
    status: "Active",
    actualStart: "",
    allergies: "",
    parentName: "",
    phone: "",
    email: "",
    enrollNotes: "",
  });

  useEffect(() => {
    if (entry && isOpen) {
      setForm({
        childId: entry.childId || entry.procare_child_id || "",
        personId: entry.personId || entry.procare_person_id || "",
        childName: entry.childName || entry.name || "",
        dob: entry.dob || entry.dateOfBirth || "",
        gender: entry.gender || "Male",
        finalRoom: entry.program || entry.classroom || classrooms[0]?.classroom_name || "Main Classroom",
        status: "Active",
        actualStart: entry.startDateOffered || new Date().toISOString().split("T")[0],
        allergies: entry.allergies || "",
        parentName: entry.parentName || entry.parent || "",
        phone: entry.phone || "",
        email: entry.email || "",
        enrollNotes: entry.notes || "",
      });
    }
  }, [entry, isOpen, classrooms]);

  if (!isOpen || !entry) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const handler = onConfirmEnrollment || onSubmit;
    if (!handler) return;
    try {
      await handler(entry.id, {
        childId: form.childId,
        personId: form.personId,
        childName: form.childName.trim(),
        dob: form.dob,
        gender: form.gender,
        finalRoom: form.finalRoom.trim(),
        status: form.status,
        actualStart: form.actualStart,
        allergies: form.allergies.trim(),
        parentName: form.parentName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        enrollNotes: form.enrollNotes.trim(),
      });
      onClose();
    } catch (err) {
      // Error handled by mutation toast notification
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-200" />
              <h2 className="text-base font-bold">Confirm Enrollment: {entry.childName}</h2>
            </div>
            <button onClick={onClose} disabled={isPending} className="p-1 text-white/80 hover:text-white rounded-lg disabled:opacity-50">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
            {/* Procare ID fields */}
            <div className="grid grid-cols-2 gap-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/70">
              <div>
                <label className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                  Procare Child ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1042"
                  value={form.childId}
                  onChange={(e) => setForm({ ...form, childId: e.target.value })}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 font-mono text-xs text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                  Procare Person ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5081"
                  value={form.personId}
                  onChange={(e) => setForm({ ...form, personId: e.target.value })}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 font-mono text-xs text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Child Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Student Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.childName}
                onChange={(e) => setForm({ ...form, childName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
                <select
                  required
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Classroom & Enrollment Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Classroom *</label>
                <select
                  required
                  value={form.finalRoom}
                  onChange={(e) => setForm({ ...form, finalRoom: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="" disabled>Select Classroom</option>
                  {classrooms.map((c) => (
                    <option key={c.id || c.classroom_name} value={c.classroom_name || c.name}>
                      {c.classroom_name || c.name}
                    </option>
                  ))}
                  {!classrooms.some(c => (c.classroom_name || c.name) === form.finalRoom) && form.finalRoom && (
                    <option value={form.finalRoom}>{form.finalRoom}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Enrollment Status *</label>
                <select
                  required
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Pre-Registered">Pre-Registered</option>
                </select>
              </div>
            </div>

            {/* Actual Start Date & Medical/Allergies */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Actual Start Date *</label>
                <input
                  type="date"
                  required
                  value={form.actualStart}
                  onChange={(e) => setForm({ ...form, actualStart: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Medical / Allergy Alerts</label>
                <input
                  type="text"
                  placeholder="e.g. Peanuts, None"
                  value={form.allergies}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Primary Parent Contact */}
            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider mb-2">
                Primary Parent Contact
              </h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Parent Name *"
                  required
                  value={form.parentName}
                  onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Final Enrollment Notes</label>
              <textarea
                rows={2}
                placeholder="First tuition payment received, medical forms on file, special instructions..."
                value={form.enrollNotes}
                onChange={(e) => setForm({ ...form, enrollNotes: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs" disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 font-bold">
                {isPending && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
                {isPending ? "Confirming..." : "Confirm Enrolled"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmEnrollmentModal;
