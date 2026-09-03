import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";

const ROLES = ["Teacher"];

const parseToYYYYMMDD = (dateStr) => {
  if (!dateStr) return "";
  if (typeof dateStr !== "string") return "";
  if (dateStr.includes("-") && dateStr.split("-")[0].length === 4) {
    return dateStr;
  }
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const mm = parts[0].padStart(2, "0");
      const dd = parts[1].padStart(2, "0");
      const yyyy = parts[2];
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  return dateStr;
};

const formatDateToMMDDYYYY = (dateStr) => {
  if (!dateStr) return "";
  if (typeof dateStr !== "string") return "";
  if (dateStr.includes("/")) return dateStr;
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const yyyy = parts[0];
      const mm = parts[1];
      const dd = parts[2];
      return `${mm}/${dd}/${yyyy}`;
    }
  }
  return dateStr;
};

const StaffFormModal = ({ isOpen, staff, onSave, onClose, isSubmitting = false }) => {
  const { classrooms = [] } = useGetAllClassrooms();

  const [form, setForm] = useState({
    name: "",
    employee_id: "",
    role: "Teacher",
    classroom: "",
    status: "",
    ptoAllowance: "",
    pto_used: "",
    hireDate: "",
    dob: "",
    phone: "",
    email: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (staff) {
      setForm({
        name: staff.full_name || staff.name || "",
        employee_id: staff.procare_employee_id || staff.employee_id || "",
        role: staff.role || "Teacher",
        classroom: staff.primary_assignment || staff.classroom || staff.work_area || "",
        status: staff.employment_status || staff.status || "Currently Employed",
        ptoAllowance: staff.pto_allowance ?? staff.ptoAllowance ?? staff.total_allowance_days ?? "",
        pto_used: staff.pto_used ?? staff.ptoUsed ?? "",
        hireDate: parseToYYYYMMDD(staff.hire_date || staff.hireDate || ""),
        dob: parseToYYYYMMDD(staff.date_of_birth || staff.dob || staff.birth_date || ""),
        phone: staff.phone_number || staff.phone || "",
        email: staff.email || ""
      });
    } else {
      setForm({
        name: "",
        employee_id: "",
        role: "Teacher",
        classroom: "",
        status: "",
        ptoAllowance: "",
        pto_used: "",
        hireDate: "",
        dob: "",
        phone: "",
        email: ""
      });
    }
    setError("");
  }, [staff, isOpen]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.employee_id) {
      setError("Staff Name and Employee ID are required.");
      return;
    }

    const payload = {
      full_name: form.name,
      employee_id: Number(form.employee_id) || form.employee_id,
      role: form.role,
      primary_assignment: form.classroom,
      employment_status: form.status,
      date_of_birth: formatDateToMMDDYYYY(form.dob),
      hire_date: formatDateToMMDDYYYY(form.hireDate),
      pto_allowance: Number(form.ptoAllowance) || 0,
      pto_used: Number(form.pto_used) || 0,
      phone_number: form.phone,
      email: form.email
    };

    onSave(payload);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{staff ? "Edit Staff Member" : "Add Staff Member"}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {staff ? "Update details in Procare records" : "Register a new hire matching Procare CSV formatting"}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Employee ID (Procare) *</label>
                    <input
                      type="text"
                      value={form.employee_id}
                      onChange={(e) => update("employee_id", e.target.value)}
                      placeholder="e.g. 102"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] font-mono"
                      required
                      disabled={!!staff}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role *</label>
                    <select
                      value={form.role}
                      onChange={(e) => update("role", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white"
                    >
                      <option value="">Select Role...</option>
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Primary Assignment</label>
                    <select
                      value={form.classroom}
                      onChange={(e) => update("classroom", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white"
                    >
                      <option value="">Select Classroom...</option>
                      {classrooms.map((cls) => {
                        const cName = cls.classroom_name || cls.name || cls.title;
                        return (
                          <option key={cls.id || cls.procare_classroom_id || cName} value={cName}>
                            {cName}
                          </option>
                        );
                      })}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Employment Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => update("status", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white"
                    >
                      <option value="">Select Status...</option>
                      <option value="Currently Employed">Currently Employed</option>
                      <option value="Terminated Positive">Terminated Positive</option>
                      <option value="Terminated Negative">Terminated Negative</option>
                      <option value="Laid Off">Laid Off</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => update("dob", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Hire Date</label>
                    <input
                      type="date"
                      value={form.hireDate}
                      onChange={(e) => update("hireDate", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">PTO Allowance (Days)</label>
                    <input
                      type="number"
                      value={form.ptoAllowance}
                      onChange={(e) => update("ptoAllowance", Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">PTO Used (Days)</label>
                    <input
                      type="number"
                      value={form.pto_used}
                      onChange={(e) => update("pto_used", Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="e.g. 555-0199"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="e.g. sarah@school.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1 rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl">
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Saving...
                      </span>
                    ) : staff ? (
                      "Save Changes"
                    ) : (
                      <><UserPlus size={15} className="mr-1.5 inline" /> Add Staff</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StaffFormModal;
