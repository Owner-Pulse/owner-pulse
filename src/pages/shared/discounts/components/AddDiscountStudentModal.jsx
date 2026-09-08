import React, { useState, useMemo, useEffect } from "react";
import { X, Loader2, Tag, DollarSign, Calendar, AlertCircle, Percent, Check, HelpCircle, Paperclip, ExternalLink } from "lucide-react";
import { useAddDiscountStudent, useUpdateDiscountStudent, useGetDiscountCategories, useGetSingleDiscount } from "@/hooks/discount.hook";
import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";
import { useGetStudentsByProcareClassroom } from "@/hooks/director-hook/student-manage.hook";
import { useGetUser } from "@/hooks/auth/user-details.hook";
import SearchableStudentSelect, { getStudentId, getStudentName } from "@/pages/director-dashboard/students/components/SearchableStudentSelect";
import { getFileUrl } from "@/utils/file.utils";

const AddDiscountStudentModal = ({
  isOpen,
  onClose,
  isOwner = false,
  editingDiscount = null, // If provided, modal acts as Edit Modal
}) => {
  const { user } = useGetUser();

  // Classrooms API (same as AtRiskForm & IncidentForm)
  const { classrooms = [], isLoading: isClassroomsLoading } = useGetAllClassrooms();

  // Category options (Director or Owner)
  const { categories = [] } = useGetDiscountCategories({ isOwner });

  const { addDiscountStudent, isPending: isAdding } = useAddDiscountStudent({ isOwner });
  const { updateDiscountStudent, isPending: isUpdating } = useUpdateDiscountStudent({ isOwner });
  const isSaving = isAdding || isUpdating;

  // Fetch fresh single discount details if in edit mode
  const { discount: singleDiscount, isLoading: isSingleLoading } = useGetSingleDiscount(
    isOpen && editingDiscount?.id ? editingDiscount.id : null
  );

  // Selected Classroom State
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [selectedClassroomName, setSelectedClassroomName] = useState("");

  // Attachment file state
  const [attachmentFile, setAttachmentFile] = useState(null);

  // Fetch student list dynamically AFTER classroom is selected (same as AtRiskForm & IncidentForm)
  const { data: studentsApiResponse, isLoading: isStudentsLoading } =
    useGetStudentsByProcareClassroom(selectedClassroomId);

  const studentsList = useMemo(() => {
    if (!studentsApiResponse) return [];
    if (Array.isArray(studentsApiResponse.data)) return studentsApiResponse.data;
    if (Array.isArray(studentsApiResponse)) return studentsApiResponse;
    return [];
  }, [studentsApiResponse]);

  const [formData, setFormData] = useState({
    category_id: "",
    child_id: "",
    student_name: "",
    classroom_id: "",
    classroom_name: "",
    discount_mode: "fixed_weekly",
    weekly_amount: "",
    monthly_amount: "",
    annual_amount: "",
    discount_percentage: "",
    school_weeks: 43,
    school_months: 10,
    academic_year: "2025-2026",
    start_date: "",
    end_date: "",
    reason: "",
    notes: "",
    status: "pending",
    approval_notes: "",
    director_id: user?.id ? String(user.id) : "5",
  });

  const existingAttachment = (singleDiscount || editingDiscount)?.attachment_url || (singleDiscount || editingDiscount)?.attachment;

  // Populate form if editing (using fresh single record if available)
  useEffect(() => {
    const activeDiscount = singleDiscount || editingDiscount;
    if (activeDiscount) {
      const cid = String(activeDiscount.classroom_id || activeDiscount.classroom?.id || "");
      setSelectedClassroomId(cid);
      setSelectedClassroomName(activeDiscount.classroom_name || activeDiscount.classroom?.name || "");
      setAttachmentFile(null);

      setFormData({
        category_id: activeDiscount.category_id || "",
        child_id: activeDiscount.child_id || "",
        student_name: activeDiscount.student_name || "",
        classroom_id: cid,
        classroom_name: activeDiscount.classroom_name || activeDiscount.classroom?.name || "",
        discount_mode: activeDiscount.discount_mode || "fixed_weekly",
        weekly_amount: activeDiscount.weekly_amount !== undefined ? String(activeDiscount.weekly_amount) : "",
        monthly_amount: activeDiscount.monthly_amount !== undefined ? String(activeDiscount.monthly_amount) : "",
        annual_amount: activeDiscount.annual_amount !== undefined ? String(activeDiscount.annual_amount) : "",
        discount_percentage: activeDiscount.discount_percentage !== undefined ? String(activeDiscount.discount_percentage) : "",
        school_weeks: activeDiscount.school_weeks || 43,
        school_months: activeDiscount.school_months || 10,
        academic_year: activeDiscount.academic_year || "2025-2026",
        start_date: activeDiscount.start_date ? activeDiscount.start_date.split("T")[0] : "",
        end_date: activeDiscount.end_date ? activeDiscount.end_date.split("T")[0] : "",
        reason: activeDiscount.reason || "",
        notes: activeDiscount.notes || "",
        status: activeDiscount.status || "pending",
        approval_notes: activeDiscount.approval_notes || "",
        director_id: activeDiscount.director_id ? String(activeDiscount.director_id) : user?.id ? String(user.id) : "5",
      });
    } else {
      // Default reset
      setSelectedClassroomId("");
      setSelectedClassroomName("");
      setAttachmentFile(null);
      setFormData({
        category_id: "",
        child_id: "",
        student_name: "",
        classroom_id: "",
        classroom_name: "",
        discount_mode: "fixed_weekly",
        weekly_amount: "",
        monthly_amount: "",
        annual_amount: "",
        discount_percentage: "",
        school_weeks: 43,
        school_months: 10,
        academic_year: "2025-2026",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        reason: "",
        notes: "",
        status: "pending",
        approval_notes: "",
        director_id: user?.id ? String(user.id) : "5",
      });
    }
  }, [editingDiscount, singleDiscount, isOpen, user]);

  // Prevent background scrolling & allow ESC to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle classroom change (triggers student fetch via useGetStudentsByProcareClassroom)
  const handleClassroomChange = (e) => {
    const classId = e.target.value;
    setSelectedClassroomId(classId);

    const foundClass = (classrooms || []).find(
      (c) => String(c.classroom_id || c.id || c.procare_classroom_id) === String(classId)
    );
    const className = foundClass ? foundClass.classroom_name || foundClass.name : "";
    setSelectedClassroomName(className);

    // Reset selected student when classroom changes
    setFormData((prev) => ({
      ...prev,
      classroom_id: classId,
      classroom_name: className,
      child_id: "",
      student_name: "",
    }));
  };

  // Handle student selection from dropdown
  const handleSelectStudent = (studentObj) => {
    if (studentObj) {
      const cid = getStudentId(studentObj);
      const name = getStudentName(studentObj);

      setFormData((prev) => ({
        ...prev,
        child_id: studentObj.id || cid,
        student_name: name,
        classroom_id: selectedClassroomId,
        classroom_name: selectedClassroomName,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        child_id: "",
        student_name: "",
      }));
    }
  };

  // Handle Category selection
  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const selectedCat = categories.find((c) => String(c.id) === String(catId));

    if (!selectedCat) {
      setFormData((prev) => ({ ...prev, category_id: "" }));
      return;
    }

    const defaultWeekly = Number(selectedCat.weekly_amount) || 0;
    const defaultPct = Number(selectedCat.discount_percentage) || 0;
    const isWaiver = selectedCat.type === "waiver" || defaultPct === 100;

    const weeks = formData.school_weeks || 43;
    const months = formData.school_months || 10;
    const annual = defaultWeekly * weeks;
    const monthly = annual / months;

    setFormData((prev) => ({
      ...prev,
      category_id: Number(catId),
      discount_mode: isWaiver ? "full_waiver" : prev.discount_mode,
      weekly_amount: defaultWeekly ? String(defaultWeekly) : prev.weekly_amount,
      discount_percentage: defaultPct ? String(defaultPct) : prev.discount_percentage,
      monthly_amount: monthly ? monthly.toFixed(2) : prev.monthly_amount,
      annual_amount: annual ? annual.toFixed(2) : prev.annual_amount,
      reason: prev.reason || selectedCat.description || "",
    }));
  };

  // Calculate amounts based on weekly or percentage changes
  const handleWeeklyAmountChange = (val) => {
    const num = parseFloat(val);
    const weeks = Number(formData.school_weeks) || 43;
    const months = Number(formData.school_months) || 10;

    if (!isNaN(num) && num >= 0) {
      const annual = num * weeks;
      const monthly = annual / months;
      setFormData((prev) => ({
        ...prev,
        weekly_amount: val,
        monthly_amount: monthly.toFixed(2),
        annual_amount: annual.toFixed(2),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        weekly_amount: val,
        monthly_amount: "",
        annual_amount: "",
      }));
    }
  };

  const handleModeChange = (mode) => {
    if (mode === "full_waiver") {
      setFormData((prev) => ({
        ...prev,
        discount_mode: "full_waiver",
        discount_percentage: "100",
      }));
    } else if (mode === "percentage") {
      setFormData((prev) => ({
        ...prev,
        discount_mode: "percentage",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        discount_mode: "fixed_weekly",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClassroomId || !formData.student_name || !formData.category_id || !formData.weekly_amount) {
      return;
    }

    // Exact payload matching Postman form-data
    const payload = {
      category_id: formData.category_id,
      child_id: formData.child_id || "",
      student_name: formData.student_name,
      classroom_id: selectedClassroomId,
      classroom_name: selectedClassroomName || "",
      weekly_amount: formData.weekly_amount,
      school_weeks: formData.school_weeks || 43,
      school_months: formData.school_months || 10,
      discount_mode: formData.discount_mode || "fixed_weekly",
      discount_percentage: formData.discount_percentage ? String(formData.discount_percentage) : "0",
      academic_year: formData.academic_year || "2025-2026",
      start_date: formData.start_date || "",
      end_date: formData.end_date || "",
      reason: formData.reason || "",
      notes: formData.notes || "",
    };

    // Owner specific additions (Image 5)
    if (isOwner) {
      payload.director_id = formData.director_id || user?.id || "5";
      payload.status = formData.status || "pending";
      if (formData.approval_notes) {
        payload.approval_notes = formData.approval_notes;
      }
    }

    if (attachmentFile instanceof File) {
      payload.attachment = attachmentFile;
    }

    try {
      if (editingDiscount?.id) {
        await updateDiscountStudent({ id: editingDiscount.id, data: payload });
      } else {
        await addDiscountStudent(payload);
      }
      onClose();
    } catch (err) {
      // Toast notification is handled by the hook
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[88dvh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed Top */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F] shrink-0">
              <Tag size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-snug line-clamp-1 sm:line-clamp-none">
                {editingDiscount
                  ? "Edit Discount Application"
                  : isOwner
                  ? "Add Tuition Discount Record"
                  : "Apply Student for Tuition Discount"}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
                {isOwner
                  ? "Record student tuition reduction directly with active metrics"
                  : "Submit discount application for Owner review and authorization"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors shrink-0 ml-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body with Internal Scroll & Pinned Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Content Container */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 sm:px-6 py-3.5 sm:py-4 space-y-3.5 sm:space-y-4">
            {/* Section 1: Student & Classroom */}
            <div className="bg-gray-50/70 p-3 sm:p-4 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-3.5 border border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                1. Student & Classroom Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Step 1: Select Classroom */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Select Classroom <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedClassroomId}
                    onChange={handleClassroomChange}
                    disabled={isClassroomsLoading}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isClassroomsLoading ? "Loading classrooms..." : "Select classroom first..."}
                    </option>
                    {(classrooms || []).map((c) => {
                      const cid = c.classroom_id || c.id || c.procare_classroom_id;
                      const cname = c.classroom_name || c.name;
                      return (
                        <option key={cid} value={cid}>
                          {cname}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Step 2: Select Student (Enabled only after classroom is selected) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Select Student <span className="text-red-500">*</span>
                  </label>
                  <SearchableStudentSelect
                    students={studentsList}
                    selectedStudentId={formData.child_id}
                    onSelectStudent={handleSelectStudent}
                    disabled={!selectedClassroomId}
                    isLoading={isStudentsLoading}
                    triggerClassName="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm flex items-center justify-between bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 disabled:bg-gray-50 disabled:cursor-not-allowed font-medium text-gray-800"
                    placeholder={
                      !selectedClassroomId
                        ? "Select classroom first..."
                        : isStudentsLoading
                        ? "Loading students..."
                        : studentsList.length === 0
                        ? "No students in this classroom"
                        : "Search enrolled student..."
                    }
                  />
                </div>
              </div>

              {/* Selected Student Confirmation Chip */}
              {formData.student_name && (
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50/80 border border-blue-100 text-xs">
                  <span className="text-blue-900 truncate mr-2">
                    Selected: <strong>{formData.student_name}</strong> in{" "}
                    <strong>{selectedClassroomName || "Classroom"}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        child_id: "",
                        student_name: "",
                      }))
                    }
                    className="text-blue-600 hover:text-blue-800 font-semibold shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Section 2: Category & Discount Mode */}
            <div className="bg-gray-50/70 p-3 sm:p-4 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-3.5 border border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                2. Discount Category & Type
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Discount Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={handleCategoryChange}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                  >
                    <option value="">Choose category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.type === "waiver" ? "Waiver" : "Discount"} -{" "}
                        {cat.formatted_weekly_amount || `$${cat.weekly_amount}/wk`})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Discount Mode</label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-gray-200/60 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleModeChange("fixed_weekly")}
                      className={`py-1.5 px-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all text-center truncate ${
                        formData.discount_mode === "fixed_weekly"
                          ? "bg-white text-[#1E3A5F] shadow-sm font-bold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Fixed ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange("percentage")}
                      className={`py-1.5 px-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all text-center truncate ${
                        formData.discount_mode === "percentage"
                          ? "bg-white text-[#1E3A5F] shadow-sm font-bold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Percent (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange("full_waiver")}
                      className={`py-1.5 px-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all text-center truncate ${
                        formData.discount_mode === "full_waiver"
                          ? "bg-white text-[#1E3A5F] shadow-sm font-bold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      100% Waiver
                    </button>
                  </div>
                </div>
              </div>

              {/* Rates & Calculations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Weekly Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2 sm:top-2.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.weekly_amount}
                      onChange={(e) => handleWeeklyAmountChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Monthly Rate ($) (Est.)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2 sm:top-2.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthly_amount}
                      onChange={(e) => setFormData((p) => ({ ...p, monthly_amount: e.target.value }))}
                      placeholder="Auto-computed"
                      className="w-full pl-8 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Discount Percentage (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData((p) => ({ ...p, discount_percentage: e.target.value }))}
                      placeholder="e.g. 50"
                      className="w-full pr-8 pl-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                    />
                    <span className="absolute right-3.5 top-2 sm:top-2.5 text-gray-400 text-sm">%</span>
                  </div>
                </div>
              </div>

              {/* Live Impact Card */}
              {formData.weekly_amount > 0 && (
                <div className="bg-emerald-50 border border-emerald-200/70 p-3 sm:p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <DollarSign size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-900">Projected Tuition Assistance</p>
                      <p className="text-[11px] text-emerald-700">
                        ${formData.weekly_amount}/wk · ${formData.monthly_amount || 0}/mo ·{" "}
                        ${formData.annual_amount || 0} annual (43 school weeks)
                      </p>
                    </div>
                  </div>
                  {formData.discount_percentage && (
                    <span className="self-start sm:self-auto px-2.5 py-0.5 sm:py-1 rounded-lg bg-emerald-200/60 text-emerald-800 text-[11px] sm:text-xs font-bold">
                      {formData.discount_percentage}% off
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Section 3: Schedule & Documentation */}
            <div className="bg-gray-50/70 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-3.5 sm:space-y-4 border border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                3. Academic Year & Documentation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Academic Year</label>
                  <select
                    value={formData.academic_year}
                    onChange={(e) => setFormData((p) => ({ ...p, academic_year: e.target.value }))}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                    <option value="2027-2028">2027-2028</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Reason / Justification
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="e.g. Staff benefit for child enrollment"
                  className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Internal Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Full-time staff member child discount..."
                  className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium resize-none"
                />
              </div>

              {/* Owner specific fields (Image 5) */}
              {isOwner && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-2 border-t border-gray-200/60">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                      className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                    >
                      <option value="pending">Pending (Awaiting Review)</option>
                      <option value="approved">Approved (Active immediately)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Director ID</label>
                    <input
                      type="number"
                      value={formData.director_id}
                      onChange={(e) => setFormData((p) => ({ ...p, director_id: e.target.value }))}
                      placeholder="e.g. 5"
                      className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Approval Notes</label>
                    <input
                      type="text"
                      value={formData.approval_notes}
                      onChange={(e) => setFormData((p) => ({ ...p, approval_notes: e.target.value }))}
                      placeholder="Owner approval remark..."
                      className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Optional Attachment File Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Supporting Attachment (Optional)
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="cursor-pointer px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-2 transition-colors">
                    <Paperclip size={15} className="text-gray-500" />
                    {attachmentFile ? "Replace File" : existingAttachment ? "Change File..." : "Choose File..."}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachmentFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {attachmentFile ? (
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl">
                      <span className="font-medium truncate max-w-xs">{attachmentFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachmentFile(null)}
                        className="text-gray-400 hover:text-rose-600 font-bold"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : existingAttachment ? (
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                      <span className="text-gray-400">Current:</span>
                      <a
                        href={getFileUrl(existingAttachment)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#1E3A5F] hover:underline truncate max-w-xs flex items-center gap-1"
                      >
                        <span>{String(existingAttachment).split("/").pop()}</span>
                        <ExternalLink size={11} className="shrink-0" />
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed Bottom Footer */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 border-t border-gray-100 bg-gray-50/95 backdrop-blur-xs shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSaving ||
                !selectedClassroomId ||
                !formData.student_name ||
                !formData.weekly_amount ||
                !formData.category_id
              }
              className="flex-1 sm:flex-none px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#152A45] active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : editingDiscount ? (
                "Save Changes"
              ) : isOwner ? (
                "Add Discount Record"
              ) : (
                "Submit Application to Owner"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiscountStudentModal;
