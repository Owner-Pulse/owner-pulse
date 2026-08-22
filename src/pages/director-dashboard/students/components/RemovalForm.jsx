import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Send, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";
import { useGetStudentsByProcareClassroom } from "@/hooks/director-hook/student-manage.hook";
import SearchableStudentSelect, { getStudentId, getStudentName } from "./SearchableStudentSelect";

const RemovalForm = ({ onAdd, onClose, isLoading = false }) => {
  const { classrooms } = useGetAllClassrooms();

  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [selectedClassroomName, setSelectedClassroomName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: studentsApiResponse, isLoading: isStudentsLoading } = useGetStudentsByProcareClassroom(selectedClassroomId);

  const studentsList = useMemo(() => {
    if (!studentsApiResponse) return [];
    if (Array.isArray(studentsApiResponse.data)) return studentsApiResponse.data;
    if (Array.isArray(studentsApiResponse)) return studentsApiResponse;
    return [];
  }, [studentsApiResponse]);

  const [form, setForm] = useState({
    student: "",
    childId: "",
    reason: "transferring",
    detail: "",
    date: new Date().toISOString().split("T")[0],
    parentNotified: "Yes"
  });

  const [error, setError] = useState("");
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleClassroomChange = (e) => {
    const classId = e.target.value;
    setSelectedClassroomId(classId);

    const foundClass = classrooms.find((c) => String(c.id || c.procare_classroom_id) === String(classId));
    const className = foundClass ? (foundClass.classroom_name || foundClass.name) : "";
    setSelectedClassroomName(className);

    // Reset student selection
    setForm((prev) => ({ ...prev, student: "", childId: "" }));
  };

  const handleSelectStudent = (studentObj) => {
    if (studentObj) {
      setForm((prev) => ({
        ...prev,
        childId: getStudentId(studentObj),
        student: getStudentName(studentObj),
      }));
    } else {
      setForm((prev) => ({ ...prev, childId: "", student: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClassroomId) {
      setError("Please select a classroom first.");
      return;
    }
    if (!form.student || !form.childId) {
      setError("Please select a student.");
      return;
    }
    setIsSubmitting(true);
    onAdd({
      id: Date.now(),
      date: form.date,
      student: form.student,
      childId: form.childId,
      procare_child_id: form.childId,
      classroomId: selectedClassroomId,
      procare_classroom_id: selectedClassroomId,
      reason: form.reason,
      classroom: selectedClassroomName,
      detail: form.detail,
      parentNotified: form.parentNotified,
    });
  };

  const activeLoading = isLoading || isSubmitting;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Remove Student</h2>
              <p className="text-sm text-gray-500 mt-0.5">Record a student withdrawal from the school registry</p>
            </div>
            <button onClick={onClose} disabled={activeLoading} className="p-2 hover:bg-gray-100 rounded-xl disabled:opacity-50">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Classroom First (Full Line) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Classroom *</label>
              <select value={selectedClassroomId} onChange={handleClassroomChange} required disabled={activeLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 appearance-none bg-white font-medium disabled:bg-gray-50">
                <option value="">Select classroom...</option>
                {classrooms.map((c) => {
                  const cId = c.id || c.procare_classroom_id;
                  const cName = c.classroom_name || c.name;
                  return (
                    <option key={cId || cName} value={cId}>
                      {cName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Student Second (Full Line) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Student *</label>
              <SearchableStudentSelect
                students={studentsList}
                selectedStudentId={form.childId}
                onSelectStudent={handleSelectStudent}
                disabled={!selectedClassroomId || activeLoading}
                isLoading={isStudentsLoading}
                placeholder="Search student by name or ID..."
              />
            </div>

            {/* Reason & Effective Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Reason</label>
                <select value={form.reason} onChange={(e) => update("reason", e.target.value)} disabled={activeLoading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 appearance-none bg-white disabled:bg-gray-50">
                  <option value="transferring">Transferring</option>
                  <option value="moving">Moving</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="financial">Financial</option>
                  <option value="graduated">Graduated</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Effective Date *</label>
                <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required disabled={activeLoading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 disabled:bg-gray-50" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Parent Notification Received</label>
              <select value={form.parentNotified} onChange={(e) => update("parentNotified", e.target.value)} disabled={activeLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 appearance-none bg-white disabled:bg-gray-50">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Details</label>
              <textarea value={form.detail} onChange={(e) => update("detail", e.target.value)} placeholder="Reason for removal..." rows={2} disabled={activeLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 resize-none disabled:bg-gray-50" />
            </div>

            {/* Retention Notice Box */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-xl flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-normal font-medium">
                <strong>Retention Notice:</strong> Removed student records are kept in this registry for exactly 60 days for compliance auditing, after which they will be permanently purged.
              </p>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={activeLoading} className="flex-1 rounded-xl">Cancel</Button>
              <Button type="submit" disabled={activeLoading} className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl">
                {activeLoading ? (
                  <>
                    <Loader2 size={15} className="mr-1.5 animate-spin inline" /> Recording...
                  </>
                ) : (
                  <>
                    <Send size={15} className="mr-1.5 inline" /> Record Removal
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RemovalForm;
