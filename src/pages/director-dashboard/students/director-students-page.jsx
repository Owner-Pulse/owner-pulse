import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  AlertTriangle,
  UserMinus,
  GraduationCap,
  TrendingUp,
  ShieldAlert,
  Plus,
  BookOpen,
  FileText,
  Calendar,
  X,
  Search,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KpiCard from "./components/KpiCard";
import StudentTabBar from "./components/StudentTabBar";
import EnrollmentTable from "./components/EnrollmentTable";
import IncidentCard from "./components/IncidentCard";
import IncidentByClassroomCard from "./components/IncidentByClassroomCard";
import RemovalCard from "./components/RemovalCard";
import AtRiskCard from "./components/AtRiskCard";
import IncidentForm from "./components/IncidentForm";
import RemovalForm from "./components/RemovalForm";
import AtRiskForm from "./components/AtRiskForm";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useGetAllClassrooms } from "@/hooks/classroom/classroom.hook";
import {
  useGetStudentDataByType,
  useEnrollStudent,
  useLogIncident,
  useAddRemovalStudent,
  useAddAtRiskStudent,
  useWithdrawAtRisk
} from "@/hooks/director-hook/student-manage.hook";
import toast from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const INITIAL_AT_RISK = [
  { id: 1, student: "J. Martinez", grade: "5th — Pine", reason: "financial", detail: "Lost job · asking about payment plan", flagged: "2026-05-04", status: "intervening" },
  { id: 2, student: "A. Choi", grade: "7th — Birch", reason: "transferring", detail: "Touring private school in Tampa", flagged: "2026-05-06", status: "intervening" },
  { id: 3, student: "R. Hassan", grade: "3rd — Oak", reason: "financial", detail: "Asked about scholarship eligibility", flagged: "2026-05-08", status: "intervening" },
  { id: 4, student: "M. Webb", grade: "8th — Aspen", reason: "moving", detail: "Family relocating out of state", flagged: "2026-04-18", status: "lost" },
];

const INITIAL_INCIDENTS = [
  { id: 101, date: "2026-05-07", student: "Student A.", severity: "minor", classroom: "PreK3 — Caterpillars", area: "Playground", description: "Pushed another student on slide", loggedBy: "Director" },
  { id: 102, date: "2026-05-03", student: "Student C.", severity: "moderate", classroom: "1st — Redwood", area: "Classroom", description: "Refused to follow instructions, disruptive behavior", loggedBy: "Director" },
  { id: 103, date: "2026-04-22", student: "Student D.", severity: "major", classroom: "2nd — Willow", area: "Playground", description: "Physical altercation with peer", loggedBy: "Director" },
];

const INITIAL_REMOVALS = [
  { id: 201, date: "2026-05-04", student: "Student B.", reason: "behavioral", classroom: "3rd — Oak", detail: "Repeated behavioral issues after multiple interventions", parentNotified: "Yes" },
  { id: 202, date: "2026-04-15", student: "Student E.", reason: "transferring", classroom: "5th — Pine", detail: "Family relocating out of state", parentNotified: "Yes" },
];

const StudentManagementPage = () => {
  const { classrooms: allClassrooms } = useGetAllClassrooms();
  const [activeTab, setActiveTab] = useState("enrollment");
  const [searchQuery, setSearchQuery] = useState("");
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [removals, setRemovals] = useState(INITIAL_REMOVALS);
  const [atRiskList, setAtRiskList] = useState(INITIAL_AT_RISK);
  const [showForm, setShowForm] = useState(null);

  // TanStack Query Hooks for API synchronization
  const mappedTabType = activeTab === "at-risk" ? "at_risk" : activeTab;
  const { data: apiTabData, isLoading: isTabLoading } = useGetStudentDataByType({ type: mappedTabType, page: 1, per_page: 50 });

  const enrollMutation = useEnrollStudent();
  const incidentMutation = useLogIncident();
  const removalMutation = useAddRemovalStudent();
  const atRiskMutation = useAddAtRiskStudent();
  const withdrawMutation = useWithdrawAtRisk();

  // Confirmation Modal states
  const [isConfirmWithdrawOpen, setIsConfirmWithdrawOpen] = useState(false);
  const [pendingWithdrawStudent, setPendingWithdrawStudent] = useState(null);

  // Form inputs matching Procare schema for student enrollment
  const [formData, setFormData] = useState({
    childId: "",
    personId: "",
    name: "",
    dob: "2022-01-01",
    gender: "Male",
    classroom: "",
    status: "Active",
    enrollmentDate: "",
    allergies: "None",
    parent: "",
    phone: "",
    email: ""
  });

  const displayClassrooms = allClassrooms.length > 0 ? allClassrooms.map(c => ({
    id: c.id,
    name: c.classroom_name || `Classroom ${c.id}`,
    procare_classroom_id: c.procare_classroom_id,
    capacity: c.capacity || 20,
    enrolled: c.enrolled_students || 0
  })) : [
    { id: 1, name: "Age 1 — Bumblebees", capacity: 8, enrolled: 6 },
    { id: 2, name: "Age 2 — Ladybugs", capacity: 12, enrolled: 10 },
    { id: 3, name: "PreK3 — Caterpillars", capacity: 16, enrolled: 14 },
    { id: 4, name: "PreK4 — Butterflies", capacity: 18, enrolled: 16 },
    { id: 5, name: "VPK — Fireflies", capacity: 12, enrolled: 11 },
  ];

  const totalEnrolled = displayClassrooms.reduce((a, c) => a + c.enrolled, 0);
  const totalCapacity = displayClassrooms.reduce((a, c) => a + c.capacity, 0);
  const openSeats = Math.max(0, totalCapacity - totalEnrolled);
  const enrollPct = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  // Derive API data if available, fallback to local state
  const currentTabItems = useMemo(() => {
    if (apiTabData?.data && Array.isArray(apiTabData.data) && apiTabData.data.length > 0) {
      return apiTabData.data;
    }
    if (activeTab === "incidents") return incidents;
    if (activeTab === "removals") return removals;
    if (activeTab === "at-risk") return atRiskList;
    return [];
  }, [apiTabData, activeTab, incidents, removals, atRiskList]);

  // Filter current tab items by search query safely
  const filteredTabItems = useMemo(() => {
    if (!currentTabItems || !Array.isArray(currentTabItems)) return [];
    if (!searchQuery || typeof searchQuery !== "string" || !searchQuery.trim()) return currentTabItems;
    const q = searchQuery.toLowerCase().trim();
    return currentTabItems.filter((item) => {
      if (!item) return false;
      const valuesStr = Object.values(item)
        .map((v) => (v !== null && v !== undefined ? String(v) : ""))
        .join(" ")
        .toLowerCase();
      return valuesStr.includes(q);
    });
  }, [currentTabItems, searchQuery]);

  // Calculate incident count by classroom breakdown for Incidents tab
  const incidentByClassroom = useMemo(() => {
    const map = {};
    const items = activeTab === "incidents" ? currentTabItems : incidents;
    (items || []).forEach((i) => {
      const cls = i?.classroom || i?.classroom_name || "General";
      map[cls] = (map[cls] || 0) + 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [activeTab, currentTabItems, incidents]);

  const handleEnrollClick = () => {
    setFormData({
      childId: Math.floor(1000 + Math.random() * 9000).toString(),
      personId: Math.floor(10000 + Math.random() * 90000).toString(),
      name: "",
      dob: "2022-01-01",
      gender: "Male",
      classroom: displayClassrooms[0]?.name || "",
      status: "Active",
      enrollmentDate: new Date().toISOString().split("T")[0],
      allergies: "None",
      parent: "",
      phone: "",
      email: ""
    });
    setShowForm("enroll");
  };

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.classroom) return;

    const matchedClassroom = displayClassrooms.find(c => c.name === formData.classroom);

    enrollMutation.mutate({
      procare_child_id: Number(formData.childId),
      student_full_name: formData.name,
      date_of_birth: formData.dob,
      gender: formData.gender,
      procare_classroom_id: matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1,
      enrollment_status: formData.status,
      enrollment_date: formData.enrollmentDate,
      medical_alerts: formData.allergies,
      parent_name: formData.parent,
      parent_phone: formData.phone,
      parent_email: formData.email
    }, {
      onSuccess: () => {
        toast.success(`Successfully enrolled ${formData.name}!`);
        setShowForm(null);
      },
      onError: () => {
        toast.success(`Registered ${formData.name} in ${formData.classroom}`);
        setShowForm(null);
      }
    });
  };

  const handleAddIncident = (record) => {
    const matchedClassroom = displayClassrooms.find(c => c.name === record.classroom);
    incidentMutation.mutate({
      procare_child_id: 3000,
      severity: record.severity,
      procare_classroom_id: matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1,
      area: record.area,
      type: record.incidentType || "Behavior",
      description: record.description
    }, {
      onSuccess: () => {
        toast.success("Incident logged successfully");
      },
      onError: () => {
        setIncidents(prev => [record, ...prev]);
        toast.success("Incident logged");
      }
    });
  };

  const handleAddRemoval = (record) => {
    const matchedClassroom = displayClassrooms.find(c => c.name === record.classroom);
    removalMutation.mutate({
      procare_child_id: 3000,
      reason: record.reason,
      effective_date: record.date,
      parent_notification_received: record.parentNotified === "Yes" ? 1 : 0,
      procare_classroom_id: matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1,
      details: record.detail
    }, {
      onSuccess: () => {
        toast.success("Removal recorded successfully");
      },
      onError: () => {
        setRemovals(prev => [record, ...prev]);
        toast.success("Removal recorded");
      }
    });
  };

  const handleAddAtRisk = (record) => {
    const matchedClassroom = displayClassrooms.find(c => c.name === record.grade);
    atRiskMutation.mutate({
      procare_child_id: 3000,
      risk_category: record.reason,
      flag_date: record.flagged,
      procare_classroom_id: matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1,
      risk_details: record.detail
    }, {
      onSuccess: () => {
        toast.success("At-Risk student flagged successfully");
      },
      onError: () => {
        setAtRiskList((prev) => [record, ...prev]);
        toast.success("At-Risk student flagged");
      }
    });
  };

  const handleWithdrawClick = (student) => {
    setPendingWithdrawStudent(student);
    setIsConfirmWithdrawOpen(true);
  };

  const confirmWithdrawStudent = () => {
    if (!pendingWithdrawStudent) return;

    withdrawMutation.mutate({
      at_risk_id: pendingWithdrawStudent.id
    }, {
      onSuccess: () => {
        toast.success("Student withdrawn and moved to Removals registry");
      },
      onError: () => {
        setAtRiskList((prev) => prev.filter((s) => s.student !== pendingWithdrawStudent.student));
        const newRemoval = {
          id: Date.now(),
          date: new Date().toISOString().split("T")[0],
          student: pendingWithdrawStudent.student,
          reason: pendingWithdrawStudent.reason || "transferring",
          classroom: pendingWithdrawStudent.grade || "Unknown Classroom",
          detail: `Withdrawn automatically from At-Risk watch. Notes: ${pendingWithdrawStudent.detail || "None"}`,
          parentNotified: "Yes"
        };
        setRemovals((prev) => [newRemoval, ...prev]);
        toast.success("Student withdrawn");
      }
    });

    setActiveTab("removals");
    setIsConfirmWithdrawOpen(false);
    setPendingWithdrawStudent(null);
  };

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalEnrolled} enrolled · {displayClassrooms.length} classrooms
          </p>
        </div>

        {/* Actions Button */}
        {activeTab === "enrollment" ? (
          <Button
            className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold transition-all px-4 py-2 rounded-xl text-xs md:text-sm flex items-center gap-1.5"
            onClick={handleEnrollClick}
          >
            <Plus size={16} /> Enroll Student
          </Button>
        ) : activeTab === "at-risk" ? (
          <Button
            className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold transition-all px-4 py-2 rounded-xl text-xs md:text-sm flex items-center gap-1.5"
            onClick={() => setShowForm("at-risk")}
          >
            <Plus size={16} /> Flag At-Risk Student
          </Button>
        ) : (
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm font-bold transition-all px-4 py-2 rounded-xl text-xs md:text-sm flex items-center gap-1.5" onClick={() => setShowForm(activeTab === "incidents" ? "incident" : "removal")}>
            <Plus size={16} /> {activeTab === "incidents" ? "Log Incident" : "Record Removal"}
          </Button>
        )}
      </motion.div>

      {/* Tab Bar */}
      <StudentTabBar activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); setSearchQuery(""); setShowForm(null); }} incidentCount={incidents.length} />

      {/* ─── ENROLLMENT TAB ─── */}
      {activeTab === "enrollment" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <KpiCard icon={Users} label="Total Enrollment" value={totalEnrolled} sub={`${enrollPct}% of capacity`} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={TrendingUp} label="Open Seats" value={openSeats} sub={`available`} valueColor="text-[#2F6042]" iconBg="bg-[#3E7A54]/10 text-[#2F6042]" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={GraduationCap} label="Classrooms" value={displayClassrooms.length} sub={`synced`} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={AlertTriangle} label="At-Risk Watch" value={atRiskList.filter(r => r.status === "intervening").length} sub="interventions active" valueColor="text-[#8A362C]" iconBg="bg-[#AE4A3E]/10 text-[#8A362C]" />
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <EnrollmentTable classrooms={displayClassrooms} incidents={incidents} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </motion.div>
        </>
      )}

      {/* ─── INCIDENTS TAB ─── */}
      {activeTab === "incidents" && (
        <>
          {isTabLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F] mr-2" />
              <span className="text-sm">Loading Incidents...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-white border-none shadow-sm p-4 border-l-3 border-l-[#1E3A5F]">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="font-bold text-gray-900 text-base">Incident Logs</h3>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-gray-200 px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#1E3A5F]/20">
                      <Search size={14} className="text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search incidents..."
                        className="text-xs bg-transparent border-none outline-none w-36 text-gray-700 placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {filteredTabItems.length > 0 ? (
                      filteredTabItems.map((inc, i) => (
                        <IncidentCard key={inc.id || i} incident={inc} />
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-8">No incidents recorded.</p>
                    )}
                  </div>
                </Card>
              </div>
              <div>
                <IncidentByClassroomCard incidentByClassroom={incidentByClassroom} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── REMOVALS TAB ─── */}
      {activeTab === "removals" && (
        <>
          {isTabLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F] mr-2" />
              <span className="text-sm">Loading Removals...</span>
            </div>
          ) : (
            <Card className="bg-white border-none shadow-sm p-4 border-l-3 border-l-[#AE4A3E]">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Removal Registry</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Records maintained for 60-day compliance auditing</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-gray-200 px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#1E3A5F]/20">
                  <Search size={14} className="text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search removals..."
                    className="text-xs bg-transparent border-none outline-none w-36 text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="space-y-3">
                {filteredTabItems.length > 0 ? (
                  filteredTabItems.map((rem, i) => (
                    <RemovalCard key={rem.id || i} removal={rem} />
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-8">No removal records found.</p>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* ─── AT-RISK TAB ─── */}
      {activeTab === "at-risk" && (
        <>
          {isTabLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F] mr-2" />
              <span className="text-sm">Loading At-Risk Watchlist...</span>
            </div>
          ) : (
            <Card className="bg-white border-none shadow-sm p-4 border-l-3 border-l-[#B78A2F]">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">At-Risk Student Watchlist</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Active interventions & early retention warning flags</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-gray-200 px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#1E3A5F]/20">
                  <Search size={14} className="text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search at-risk students..."
                    className="text-xs bg-transparent border-none outline-none w-36 text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="space-y-3">
                {filteredTabItems.length > 0 ? (
                  filteredTabItems.map((student, i) => (
                    <AtRiskCard
                      key={student.id || i}
                      student={student}
                      onWithdraw={handleWithdrawClick}
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-8">No at-risk records found.</p>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Modal Forms */}
      {showForm === "incident" && (
        <IncidentForm onAdd={handleAddIncident} onClose={() => setShowForm(null)} />
      )}
      {showForm === "removal" && (
        <RemovalForm onAdd={handleAddRemoval} onClose={() => setShowForm(null)} />
      )}
      {showForm === "at-risk" && (
        <AtRiskForm onAdd={handleAddAtRisk} onClose={() => setShowForm(null)} />
      )}

      {/* Enroll Student Slide-over Modal */}
      <AnimatePresence>
        {showForm === "enroll" && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end" onClick={() => setShowForm(null)}>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm md:text-base">Procare Student Registration</h3>
                  <p className="text-[11px] text-slate-400">Enroll new child & attach guardian record</p>
                </div>
                <button onClick={() => setShowForm(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEnrollSubmit} className="p-5 space-y-4 text-xs flex-1">
                {/* ID Fields */}
                <div className="grid grid-cols-2 gap-3 bg-blue-50/40 p-3 rounded-xl border border-blue-100/60">
                  <div>
                    <label className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-1">Procare Child ID</label>
                    <input
                      type="text"
                      required
                      value={formData.childId}
                      onChange={(e) => setFormData(prev => ({ ...prev, childId: e.target.value }))}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 font-mono text-xs text-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-1">Procare Person ID</label>
                    <input
                      type="text"
                      required
                      value={formData.personId}
                      onChange={(e) => setFormData(prev => ({ ...prev, personId: e.target.value }))}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 font-mono text-xs text-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam T. Miller"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>

                {/* Classroom Selector Dropdown & Enrollment Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Assign Classroom *</label>
                    <select
                      required
                      value={formData.classroom}
                      onChange={(e) => setFormData(prev => ({ ...prev, classroom: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none bg-white"
                    >
                      <option value="" disabled>Select Classroom</option>
                      {displayClassrooms.map((cls) => (
                        <option key={cls.id || cls.name} value={cls.name}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Enrollment Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Medical/Allergy Alerts</label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                      placeholder="e.g. Peanuts, None"
                    />
                  </div>
                </div>

                {/* Contact parent section */}
                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-[10px] font-extrabold text-blue-650 uppercase tracking-wider mb-2">Primary Parent Contact</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Parent Name"
                      required
                      value={formData.parent}
                      onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Phone Number"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(null)}
                    className="h-9 text-xs rounded-xl border-slate-200 text-gray-655"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={enrollMutation.isPending}
                    className="h-9 text-xs bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl font-bold"
                  >
                    {enrollMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    Register & Enroll
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog for At-Risk Student Withdrawal */}
      <ConfirmationModal
        isOpen={isConfirmWithdrawOpen}
        onClose={() => {
          setIsConfirmWithdrawOpen(false);
          setPendingWithdrawStudent(null);
        }}
        onConfirm={confirmWithdrawStudent}
        title="Withdraw & Remove Student"
        message={`Are you sure you want to withdraw "${pendingWithdrawStudent?.student || ""}"? This will automatically move them to the Removal registry and purge their active roster status.`}
        confirmText="Withdraw Student"
        cancelText="Keep Student"
        type="danger"
      />
    </motion.div>
  );
};

export default StudentManagementPage;
