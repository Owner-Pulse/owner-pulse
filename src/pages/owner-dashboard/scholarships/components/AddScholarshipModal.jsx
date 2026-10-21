import React, { useRef, useState, useMemo } from "react";
import { X, Loader2, DollarSign, Calendar, GraduationCap, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { useAddScholarship, useGetScholarshipPrograms } from "@/hooks/owner-hook/scholarship.hook";
import NewImportModal from "@/pages/shared/data-import/components/NewImportModal";
import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";
import { useGetStudentsByProcareClassroom } from "@/hooks/director-hook/student-manage.hook";
import SearchableStudentSelect, { getStudentId, getStudentName } from "@/pages/director-dashboard/students/components/SearchableStudentSelect";
import { todayYmd } from "@/lib/datetime";

const AddScholarshipModal = ({ isOpen, onClose }) => {
  const { programsData } = useGetScholarshipPrograms();
  const { addScholarship, isPending } = useAddScholarship();
  const { classrooms, isLoading: isClassroomsLoading } = useGetAllClassrooms();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [selectedClassroomName, setSelectedClassroomName] = useState("");

  const { data: studentsApiResponse, isLoading: isStudentsLoading } =
    useGetStudentsByProcareClassroom(selectedClassroomId);

  const studentsList = useMemo(() => {
    if (!studentsApiResponse) return [];
    if (Array.isArray(studentsApiResponse.data)) return studentsApiResponse.data;
    if (Array.isArray(studentsApiResponse)) return studentsApiResponse;
    return [];
  }, [studentsApiResponse]);

  const [formData, setFormData] = useState({
    procare_child_id: "",
    program_name: "",
    purchase_amount: "",
    status: "Pending",
    purchase_date: todayYmd(),
  });

  if (!isOpen) return null;

  const chooseCsv = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv") && file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
      toast.error("Invalid file format. Please select a valid CSV (.csv) file.");
      return;
    }
    setImportFile(file);
  };

  const handleClassroomChange = (e) => {
    const classId = e.target.value;
    setSelectedClassroomId(classId);

    const foundClass = (classrooms || []).find(
      (c) => String(c.id || c.procare_classroom_id) === String(classId)
    );
    const className = foundClass ? foundClass.classroom_name || foundClass.name : "";
    setSelectedClassroomName(className);

    // Reset student selection when classroom changes
    setFormData((prev) => ({ ...prev, procare_child_id: "" }));
  };

  const handleSelectStudent = (studentObj) => {
    if (studentObj) {
      const childId = getStudentId(studentObj);
      setFormData((prev) => ({
        ...prev,
        procare_child_id: childId,
      }));
    } else {
      setFormData((prev) => ({ ...prev, procare_child_id: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.procare_child_id || !formData.program_name || !formData.purchase_amount) {
      return;
    }

    try {
      await addScholarship({
        procare_child_id: Number(formData.procare_child_id),
        program_name: formData.program_name,
        purchase_amount: Number(formData.purchase_amount),
        status: formData.status || "Pending",
        purchase_date: formData.purchase_date,
      });
      onClose();
      // Reset form
      setSelectedClassroomId("");
      setSelectedClassroomName("");
      setFormData({
        procare_child_id: "",
        program_name: "",
        purchase_amount: "",
        status: "Pending",
        purchase_date: todayYmd(),
      });
    } catch (err) {
      // Toast handles error feedback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F]">
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add Scholarship Payment</h2>
              <p className="text-xs text-gray-500">Record a new scholarship award/payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            chooseCsv(e.dataTransfer.files?.[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer p-5 border-2 border-dashed rounded-2xl flex flex-col items-center text-center transition-all ${isDragging ? "border-[#1E3A5F] bg-[#1E3A5F]/5" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}
        >
          <div className="p-2.5 bg-white rounded-full border border-gray-100 mb-2 text-[#1E3A5F]">
            <UploadCloud size={22} />
          </div>
          <p className="text-sm font-semibold text-gray-700">Drag scholarship.csv here, or click to upload</p>
          <p className="text-xs text-gray-400 mt-1">Same column match and import as Data Import. Only .csv files.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => {
              chooseCsv(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Or enter one payment</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Classroom Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Classroom *</label>
            <select
              value={selectedClassroomId}
              onChange={handleClassroomChange}
              disabled={isClassroomsLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 bg-white font-medium text-gray-800 disabled:bg-gray-50 disabled:cursor-not-allowed"
              required
            >
              <option value="">
                {isClassroomsLoading ? "Loading classrooms..." : "Select Classroom..."}
              </option>
              {(classrooms || []).map((c) => {
                const cId = c.id || c.procare_classroom_id;
                const cName = c.classroom_name || c.name || `Classroom #${cId}`;
                return (
                  <option key={cId} value={cId}>
                    {cName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 2. Searchable Student Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Student *</label>
            <SearchableStudentSelect
              students={studentsList}
              selectedStudentId={formData.procare_child_id}
              onSelectStudent={handleSelectStudent}
              disabled={!selectedClassroomId}
              isLoading={isStudentsLoading}
              placeholder={
                !selectedClassroomId ? "Select classroom first..." : "Search & select student..."
              }
            />
          </div>

          {/* 3. Program Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Scholarship Program *</label>
            <select
              value={formData.program_name}
              onChange={(e) => setFormData((p) => ({ ...p, program_name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 bg-white font-medium text-gray-800"
              required
            >
              <option value="">Select Program...</option>
              {programsData.map((prog) => {
                const progName = prog.name || prog.program || prog.code || prog.id;
                return (
                  <option key={prog.id || progName} value={progName}>
                    {progName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 4. Amount and Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount ($) *</label>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchase_amount}
                  onChange={(e) => setFormData((p) => ({ ...p, purchase_amount: e.target.value }))}
                  placeholder="2900"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 bg-white font-medium text-gray-800"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
                <option value="GuardianReview">Guardian Review</option>
              </select>
            </div>
          </div>

          {/* 5. Purchase Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Purchase / Effective Date *</label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData((p) => ({ ...p, purchase_date: e.target.value }))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium text-gray-800"
                required
              />
            </div>
          </div>

          {/* Submit Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !formData.procare_child_id}
              className="px-5 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#152A45] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Save Scholarship
            </button>
          </div>
        </form>
      </div>
      {importFile && (
        <NewImportModal
          lockedType="scholarship"
          initialFile={importFile}
          onClose={(error, imported) => {
            setImportFile(null);
            if (imported) onClose();
            else if (typeof error === "string") toast.error(error);
          }}
        />
      )}
    </div>
  );
};

export default AddScholarshipModal;
