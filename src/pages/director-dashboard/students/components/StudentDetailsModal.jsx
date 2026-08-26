import React from "react";
import { motion } from "framer-motion";
import {
  X,
  User,
  School,
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
  BadgeCheck,
  Users,
  Loader2,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetSingleStudent } from "@/hooks/director-hook/student-manage.hook";

const StudentDetailsModal = ({ studentId, fallbackStudent, onClose }) => {
  const { data: apiResponse, isLoading, isError } = useGetSingleStudent(studentId);

  // Extract student details from API response or use fallback
  const studentData = apiResponse?.data || null;

  const person = studentData?.person || {};
  const classroom = studentData?.classroom || {};
  const guardians = studentData?.guardian_relationships || [];

  // Fallbacks
  const studentName =
    person.full_name ||
    (person.first_name ? `${person.first_name} ${person.last_name || ""}`.trim() : "") ||
    fallbackStudent?.student_name ||
    fallbackStudent?.name ||
    "Student Profile";

  const childId = studentData?.procare_child_id || studentData?.id || fallbackStudent?.child_id || fallbackStudent?.procare_child_id || studentId;
  const personId = studentData?.person_id || person.procare_person_id || fallbackStudent?.person_id;
  const status = studentData?.enrollment_status || fallbackStudent?.status || "Active";
  const dob = person.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString() : (fallbackStudent?.dob || "N/A");
  const gender = person.gender || fallbackStudent?.gender || "N/A";
  const comment = person.comment && person.comment !== "None" ? person.comment : null;

  const className = classroom.classroom_name || fallbackStudent?.classroom || "N/A";
  const teacher = classroom.teacher || "Not Assigned";
  const program = classroom.program || "Standard";
  const tier = classroom.tier || "N/A";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1E3A5F] text-white p-6 relative flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-inner">
              {person.photo_url ? (
                <img src={person.photo_url} alt={studentName} className="w-full h-full object-cover" />
              ) : (
                <User size={32} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{studentName}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${status === "Active" || status === "Enrolled"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  }`}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1 font-mono">
                Procare Child ID: #{childId} {personId ? `· Person ID: #${personId}` : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
              <p className="text-sm text-gray-500 font-medium">Fetching student enrollment details...</p>
            </div>
          ) : (
            <>
              {/* Personal Information & Classroom Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Child Information Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <User size={14} className="text-[#1E3A5F]" />
                    <span>Personal Info</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-gray-400">Date of Birth:</span>
                      <span className="font-semibold text-gray-800">{dob}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-gray-400">Gender:</span>
                      <span className="font-semibold text-gray-800 capitalize">{gender}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400">Status Start Date:</span>
                      <span className="font-semibold text-gray-800">
                        {studentData?.status_start_date ? new Date(studentData.status_start_date).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    {comment && (
                      <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-800">
                        <strong className="block font-semibold mb-0.5">Notes:</strong>
                        {comment}
                      </div>
                    )}
                  </div>
                </div>

                {/* Classroom Details Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <School size={14} className="text-[#1E3A5F]" />
                    <span>Classroom Details</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-gray-400">Assigned Class:</span>
                      <span className="font-bold text-[#1E3A5F]">{className}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-gray-400">Teacher:</span>
                      <span className="font-semibold text-gray-800">{teacher}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-gray-400">Program / Tier:</span>
                      <span className="font-semibold text-gray-800">{program} ({tier})</span>
                    </div>
                    {classroom.capacity && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-400">Capacity / Available:</span>
                        <span className="font-semibold text-gray-800">{classroom.enrolled_students || 1} / {classroom.capacity} ({classroom.available_seats || 0} open)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Guardians & Emergency Contacts */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Users size={14} className="text-[#1E3A5F]" />
                  <span>Guardian & Emergency Contacts ({guardians.length})</span>
                </div>

                {guardians.length > 0 ? (
                  <div className="space-y-3 divide-y divide-slate-100">
                    {guardians.map((g, idx) => {
                      const guardianInfo = g.guardian || {};
                      const guardianName = guardianInfo.full_name || `${g.first_name || ""} ${g.last_name || ""}`.trim() || "Guardian";
                      const relType = g.relationship_type || "Parent/Guardian";
                      const email = guardianInfo.email || "";
                      const phoneObj = guardianInfo.phones?.[0];
                      const phone = phoneObj?.phone_number || "";

                      return (
                        <div key={g.id || idx} className={idx > 0 ? "pt-3" : ""}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-gray-900">{guardianName}</span>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-md">
                                  {relType}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">Primary Contact Slot #{g.slot || idx + 1}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {phone && (
                                <a
                                  href={`tel:${phone}`}
                                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                  <Phone size={12} /> {phone}
                                </a>
                              )}
                              {email && (
                                <a
                                  href={`mailto:${email}`}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                  <Mail size={12} /> Email
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 p-3 bg-slate-50 rounded-xl text-center">
                    No detailed guardian contacts attached.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-end shrink-0">
          <Button onClick={onClose} variant="outline" className="px-6 rounded-xl text-xs">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDetailsModal;
