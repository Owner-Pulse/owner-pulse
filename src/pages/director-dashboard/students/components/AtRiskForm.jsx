import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";
import { useGetStudentsByProcareClassroom } from "@/hooks/director-hook/student-manage.hook";
import SearchableStudentSelect, { getStudentId, getStudentName } from "./SearchableStudentSelect";

const AtRiskForm = ({ onAdd, onClose, isLoading = false }) => {
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
    reason: "financial",
    grade: "",
    detail: "",
    flagged: new Date().toISOString().split("T")[0],
    status: "intervening"
  });

  const [error, setError] = useState("");
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleClassroomChange = (e) => {
    const classId = e.target.value;
    setSelectedClassroomId(classId);

    const foundClass = classrooms.find((c) => String(c.procare_classroom_id || c.id) === String(classId));
    const className = foundClass ? (foundClass.classroom_name || foundClass.name) : "";
    setSelectedClassroomName(className);

    // Reset student selection
    setForm((prev) => ({ ...prev, student: "", childId: "", grade: className }));
  };

  const handleSelectStudent = (studentObj) => {
    if (studentObj) {
      setForm((prev) => ({
        ...prev,
        childId: getStudentId(studentObj),
        student: getStudentName(studentObj),
        grade: selectedClassroomName,
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
      ...form,
      grade: selectedClassroomName,
      classroomId: selectedClassroomId,
      procare_classroom_id: selectedClassroomId,
      procare_child_id: form.childId,
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
              <h2 className="text-xl font-bold text-gray-900">Add At-Risk Student</h2>
              <p className="text-sm text-gray-500 mt-0.5">Flag a student showing early signs of potential withdrawal</p>
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
                  const cId = c.procare_classroom_id || c.id;
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
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Student Name *</label>
              <SearchableStudentSelect
                students={studentsList}
                selectedStudentId={form.childId}
                onSelectStudent={handleSelectStudent}
                disabled={!selectedClassroomId || activeLoading}
                isLoading={isStudentsLoading}
                placeholder="Search student by name or ID..."
              />
            </div>

            {/* Risk Category & Flag Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Risk Category</label>
                <select value={form.reason} onChange={(e) => update("reason", e.target.value)} disabled={activeLoading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 appearance-none bg-white disabled:bg-gray-50">
                  <option value="financial">Financial Concerns</option>
                  <option value="transferring">Transferring Intent</option>
                  <option value="moving">Relocation/Moving</option>
                  <option value="behavioral">Behavioral Challenges</option>
                  <option value="other">Other Concerns</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Flag Date *</label>
                <input type="date" value={form.flagged} onChange={(e) => update("flagged", e.target.value)} required disabled={activeLoading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 disabled:bg-gray-50" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Risk Details & Intervention Notes</label>
              <textarea value={form.detail} onChange={(e) => update("detail", e.target.value)} placeholder="Detail the situation or early warning signs observed..." rows={3} disabled={activeLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 resize-none disabled:bg-gray-50" />
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={activeLoading} className="flex-1 rounded-xl">Cancel</Button>
              <Button type="submit" disabled={activeLoading} className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl">
                {activeLoading ? (
                  <>
                    <Loader2 size={15} className="mr-1.5 animate-spin inline" /> Flagging...
                  </>
                ) : (
                  <>
                    <Send size={15} className="mr-1.5 inline" /> Flag Student
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

export default AtRiskForm;
