import React, { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
  ShieldAlert, 
  Edit2, 
  UserMinus, 
  Phone, 
  Mail, 
  ClipboardList,
  Search,
  X,
  Loader2,
  AlertCircle,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useInfiniteStudentsByClass, useUpdateStudent, useWithdrawFromClass } from "@/hooks/director-hook/student-manage.hook";
import StudentDetailsModal from "../components/StudentDetailsModal";
import toast from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const CLASSROOM_NAMES = {
  1: "Age 1 — Bumblebees",
  2: "Age 2 — Ladybugs",
  3: "PreK3 — Caterpillars",
  4: "PreK4 — Butterflies",
  5: "VPK — Fireflies",
  6: "K — Sequoia",
  7: "1st — Redwood",
  8: "2nd — Willow",
  9: "3rd — Oak",
  10: "4th — Maple",
  11: "5th — Pine",
  12: "6th — Cedar",
  13: "7th — Birch",
  14: "8th — Aspen"
};

const DirectorClassroomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch Classroom operations & students from API with Infinite Scroll
  const {
    data: apiInfiniteData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteStudentsByClass({ id, per_page: 50 });

  const updateStudentMutation = useUpdateStudent();
  const withdrawFromClassMutation = useWithdrawFromClass();

  const [incidents] = useState([]);
  const [activeTab, setActiveTab] = useState("roster");
  const [searchQuery, setSearchQuery] = useState("");

  // Form / Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // Withdraw confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingWithdrawId, setPendingWithdrawId] = useState(null);

  // Form inputs matching Procare schema
  const [formData, setFormData] = useState({
    childId: "",
    personId: "",
    name: "",
    dob: "",
    gender: "Male",
    classroom: "",
    status: "Active",
    enrollmentDate: "",
    allergies: "None",
    parent: "",
    phone: "",
    email: ""
  });

  // Extract first page for header metrics & classroom metadata
  const firstPage = apiInfiniteData?.pages?.[0];
  const headerSummary = firstPage?.header_summary;
  const studentsSummary = firstPage?.students_summary;

  const classroomName = 
    firstPage?.classroom_name || 
    headerSummary?.classroom_name || 
    CLASSROOM_NAMES[Number(id)] || 
    `Classroom #${id}`;

  // Flatten infinite pages into a single students array
  const rawStudents = useMemo(() => {
    if (apiInfiniteData?.pages && apiInfiniteData.pages.length > 0) {
      return apiInfiniteData.pages.flatMap((page) => page?.data || []);
    }
    return [];
  }, [apiInfiniteData]);

  // Derived KPI metrics
  const totalRegistered = headerSummary?.total_students_registered ?? studentsSummary?.total_students ?? rawStudents.length;
  const activeLabel = headerSummary?.total_students_label ?? `${totalRegistered} Active Profiles`;
  const spaceUtilization = headerSummary?.classroom_space_utilization ?? (
    headerSummary?.capacity 
      ? `${headerSummary.utilization_percentage}% (${headerSummary.open_seats} open seats)` 
      : `${Math.round((rawStudents.length / 15) * 100)}% (${15 - rawStudents.length} open seats)`
  );

  const activeAllergiesCount = headerSummary?.active_allergy_warnings ?? studentsSummary?.allergy_warnings ?? rawStudents.filter(s => {
    const allergyStr = s.allergy_warning || s.allergies || "None";
    return allergyStr && allergyStr !== "None";
  }).length;

  const incidentsCount = headerSummary?.incidents_count ?? incidents.length;

  // Infinite Scroll Intersection Observer
  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return rawStudents;
    const query = searchQuery.toLowerCase().trim();
    return rawStudents.filter((student) => {
      const name = (student.student_name || student.name || "").toLowerCase();
      const childId = String(student.child_id || student.procare_child_id || student.childId || "").toLowerCase();
      const personId = String(student.person_id || student.personId || "").toLowerCase();
      const parentContact = student.emergency_parent_contact || {};
      const parentName = (parentContact.parent_name || student.parent || "").toLowerCase();
      const allergy = (student.allergy_warning || student.allergies || "").toLowerCase();
      const status = (student.status || "").toLowerCase();

      return (
        name.includes(query) ||
        childId.includes(query) ||
        personId.includes(query) ||
        parentName.includes(query) ||
        allergy.includes(query) ||
        status.includes(query)
      );
    });
  }, [rawStudents, searchQuery]);

  const handleEditClick = (student) => {
    setCurrentStudent(student);
    const parentContact = student.emergency_parent_contact || {};
    setFormData({
      childId: String(student.child_id || student.procare_child_id || student.childId || student.id || ""),
      personId: String(student.person_id || student.personId || ""),
      name: student.student_name || student.name || "",
      dob: student.dob || student.date_of_birth || "",
      gender: student.gender || "Male",
      classroom: classroomName,
      status: student.status || "Active",
      enrollmentDate: student.started || student.start_date || student.enrollmentDate || new Date().toISOString().split("T")[0],
      parent: parentContact.parent_name || student.parent || "",
      phone: parentContact.phone || student.phone || "",
      email: parentContact.email || student.email || "",
      allergies: student.allergy_warning || student.allergies || "None"
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const enrolmentId = currentStudent?.child_id || currentStudent?.id;

    updateStudentMutation.mutate({
      enrolment_id: enrolmentId,
      procare_child_id: Number(formData.childId),
      student_full_name: formData.name,
      date_of_birth: formData.dob,
      gender: formData.gender,
      enrollment_status: formData.status,
      enrollment_date: formData.enrollmentDate,
      medical_alerts: formData.allergies,
      parent_name: formData.parent,
      parent_phone: formData.phone,
      parent_email: formData.email
    }, {
      onSuccess: () => {
        toast.success(`Successfully updated ${formData.name}!`);
        setIsEditModalOpen(false);
        setCurrentStudent(null);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Updated student record successfully");
        setIsEditModalOpen(false);
        setCurrentStudent(null);
      }
    });
  };

  const handleWithdraw = (studentId) => {
    setPendingWithdrawId(studentId);
    setIsConfirmOpen(true);
  };

  const confirmWithdraw = () => {
    if (!pendingWithdrawId) return;
    const targetStudent = rawStudents.find(s => (s.child_id || s.procare_child_id || s.id) === pendingWithdrawId);
    const childId = targetStudent?.procare_child_id || targetStudent?.child_id || pendingWithdrawId;

    withdrawFromClassMutation.mutate({ procare_child_id: childId }, {
      onSuccess: (res) => {
        toast.success(res?.message || "Student successfully withdrawn from classroom");
        setIsConfirmOpen(false);
        setPendingWithdrawId(null);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Error withdrawing student");
        setIsConfirmOpen(false);
        setPendingWithdrawId(null);
      }
    });
  };

  const getPendingStudentName = () => {
    const s = rawStudents.find(s => (s.child_id || s.id) === pendingWithdrawId);
    return s ? (s.student_name || s.name) : "this student";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
        <p className="text-sm font-medium text-gray-500">Loading classroom student operations...</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12"
    >
      {/* Header & Back Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/director/students")}
            className="hover:bg-slate-100 p-2 rounded-xl shrink-0"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </Button>
          <div>
            <span className="text-xs font-semibold text-blue-650 uppercase tracking-wider">Classroom Operations</span>
            <h2 className="text-2xl font-bold text-gray-900">{classroomName}</h2>
          </div>
        </div>
      </div>

      {/* KPI stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-gray-400 block font-semibold">Total Students Registered</span>
            <span className="text-xl font-extrabold text-gray-900 mt-1.5 block">
              {totalRegistered} <span className="text-xs text-gray-400 font-normal">({activeLabel})</span>
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-gray-400 block font-semibold">Classroom Space Utilization</span>
            <span className="text-xl font-extrabold text-gray-900 mt-1.5 block">
              {spaceUtilization}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-gray-400 block font-semibold">Active Allergy Warnings</span>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xl font-extrabold text-[#8A362C]">
                {activeAllergiesCount}
              </span>
              <span className="p-1 bg-[#AE4A3E]/10 rounded-lg">
                <ShieldAlert size={14} className="text-[#8A362C]" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
            activeTab === "roster" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Student Profiles ({rawStudents.length})
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
            activeTab === "logs" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Incident Logs ({incidentsCount})
        </button>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeTab === "roster" && (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-50">
              <div>
                <CardTitle className="text-sm">Student Demographics & Profiles</CardTitle>
                <CardDescription>View and manage all registered student profiles in {classroomName}</CardDescription>
              </div>
              
              {/* Roster Search Bar */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, parent, allergy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Student Name</th>
                      <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Allergy Warn</th>
                      <th className="text-left py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Emergency Parent Contact</th>
                      <th className="text-center py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Status</th>
                      <th className="text-right py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, idx) => {
                        const studentName = student.student_name || student.name || "Unknown";
                        const childId = student.child_id || student.procare_child_id || student.childId || "—";
                        const personId = student.person_id || student.personId || "—";
                        const dob = student.dob || student.date_of_birth || "—";
                        const startDate = student.started || student.start_date || student.enrollmentDate || "—";
                        const allergy = student.allergy_warning || student.allergies || "None";
                        const hasAllergy = allergy && allergy !== "None";
                        
                        const parentContact = student.emergency_parent_contact || {};
                        const parentName = parentContact.parent_name || student.parent || "—";
                        const phone = parentContact.phone || student.phone || "";
                        const email = parentContact.email || student.email || "";
                        const callAction = parentContact.call_action || (phone ? `tel:${phone}` : null);
                        const emailAction = parentContact.email_action || (email ? `mailto:${email}` : null);

                        const status = student.status || "Active";
                        const studentKey = student.child_id || student.procare_child_id || student.id || idx;

                        return (
                          <tr key={studentKey} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-2">
                              <span 
                                onClick={() => setSelectedStudentForModal(student)} 
                                className="font-semibold text-gray-900 block hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                {studentName}
                              </span>
                              <span className="text-[10px] text-gray-455 block font-medium">
                                Child ID: {childId} {personId !== "—" ? `· Person ID: ${personId}` : ""}
                              </span>
                              <span className="text-[10px] text-gray-400">DOB: {dob} · Started: {startDate}</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              {hasAllergy ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-[#8A362C] border border-red-100">
                                  {allergy}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-405">None</span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-800">{parentName}</span>
                                {(phone || email) ? (
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {phone && (
                                      <a href={callAction} className="text-blue-650 hover:underline text-[10px] flex items-center gap-0.5 font-semibold">
                                        <Phone size={10} /> Call ({phone})
                                      </a>
                                    )}
                                    {phone && email && <span className="text-gray-300">|</span>}
                                    {email && (
                                      <a href={emailAction} className="text-blue-650 hover:underline text-[10px] flex items-center gap-0.5 font-semibold">
                                        <Mail size={10} /> Email
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-gray-400">No contact details provided</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                status === "Active" || status === "Enrolled" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedStudentForModal(student)}
                                  className="h-7 w-7 p-0 rounded-lg hover:bg-blue-50 text-blue-600"
                                  title="View full student details"
                                >
                                  <Eye size={13} />
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditClick(student)}
                                  className="h-7 w-7 p-0 rounded-lg hover:bg-slate-100 text-gray-500"
                                  title="Edit student profile"
                                >
                                  <Edit2 size={12} />
                                </Button>
                                {(status === "Active" || status === "Enrolled") && (
                                  <Button 
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleWithdraw(studentKey)}
                                    className="h-7 w-7 p-0 rounded-lg hover:bg-red-50 text-red-655"
                                    title="Withdraw and remove student"
                                  >
                                    <UserMinus size={12} />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-xs text-gray-400">
                          {searchQuery ? `No student matching "${searchQuery}" was found.` : "No student profiles found for this classroom."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Sentinel target element for Infinite Scroll */}
              <div ref={sentinelRef} className="flex justify-center items-center py-4 mt-2 border-t border-slate-50">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1E3A5F]" />
                    Loading more student profiles…
                  </div>
                ) : hasNextPage ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    className="text-xs text-blue-650 hover:text-blue-700 font-semibold"
                  >
                    Load more student profiles
                  </Button>
                ) : (
                  filteredStudents.length > 0 && (
                    <span className="text-[11px] text-gray-400 font-medium">
                      Showing all {filteredStudents.length} loaded student profiles
                    </span>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "logs" && (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Incident Reports & Behavioral Alerts</CardTitle>
              <CardDescription>Official notes filed by lead instructors regarding child behaviors or minor injuries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    inc.severity === "Minor" ? "bg-blue-50 text-blue-605" : "bg-orange-50 text-orange-605"
                  }`}>
                    <ClipboardList size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-xs text-gray-800">{inc.studentName}</strong>
                      <span className="text-[10px] text-gray-400">{inc.date}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        inc.severity === "Minor" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{inc.details}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Student Dialog Sheet */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-100 rounded-3xl shadow-2xl w-full max-w-lg p-6 my-8 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
                <div>
                  <h3 className="font-bold text-gray-850 text-base">Edit Student Profile</h3>
                  <p className="text-[10px] text-gray-450 mt-0.5">Modify record in master roster database</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 text-gray-400 hover:bg-slate-100 rounded-full transition-all">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto pr-1 pb-2 flex-1">
                {/* ID Fields */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <label className="text-[9px] font-extrabold text-[#1E3A5F] uppercase block mb-1">Procare Child ID</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.childId}
                      onChange={(e) => setFormData(prev => ({ ...prev, childId: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold text-[#1E3A5F] uppercase block mb-1">Procare Person ID (Parent Key)</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.personId}
                      onChange={(e) => setFormData(prev => ({ ...prev, personId: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Student Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* DOB & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>

                {/* Classroom & Enrollment Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Primary Classroom</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.classroom}
                      onChange={(e) => setFormData(prev => ({ ...prev, classroom: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Enrollment Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option>Active</option>
                      <option>Enrolled</option>
                      <option>Pre-Registered</option>
                      <option>Withdrawn</option>
                    </select>
                  </div>
                </div>

                {/* Enrollment date & Allergies */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Enrollment Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.enrollmentDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, enrollmentDate: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Medical/Allergy Alerts</label>
                    <input 
                      type="text" 
                      value={formData.allergies}
                      onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Contact parent section */}
                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider mb-2">Primary Parent Contact</h4>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Parent Name"
                      required
                      value={formData.parent}
                      onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Phone Number"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <input 
                        type="email" 
                        placeholder="Email Address"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    className="h-9 text-xs rounded-xl border-slate-200 text-gray-655"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateStudentMutation.isPending}
                    className="h-9 text-xs bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl font-bold"
                  >
                    {updateStudentMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Confirmation Dialog for Student Withdrawal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmWithdraw}
        title="Withdraw & Remove Student"
        message={`Are you sure you want to withdraw and completely remove "${getPendingStudentName()}" from this classroom? This action will immediately purge their roster record.`}
        confirmText="Withdraw & Remove"
        cancelText="Keep Student"
        type="danger"
      />

      {/* Student Details Modal */}
      <AnimatePresence>
        {selectedStudentForModal && (
          <StudentDetailsModal 
            studentId={selectedStudentForModal.id || selectedStudentForModal.child_id || selectedStudentForModal.procare_child_id}
            fallbackStudent={selectedStudentForModal}
            onClose={() => setSelectedStudentForModal(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DirectorClassroomDetailPage;
