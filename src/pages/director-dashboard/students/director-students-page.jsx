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
  X
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

const TODAY = new Date("2026-05-11");

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const CLASSROOMS = [
  { id: 1, name: "Age 1 — Bumblebees", program: "Age 1", capacity: 8, enrolled: 6 },
  { id: 2, name: "Age 2 — Ladybugs", program: "Age 2", capacity: 12, enrolled: 10 },
  { id: 3, name: "PreK3 — Caterpillars", program: "PreK3", capacity: 16, enrolled: 14 },
  { id: 4, name: "PreK4 — Butterflies", program: "PreK4", capacity: 18, enrolled: 16 },
  { id: 5, name: "VPK — Fireflies", program: "VPK", capacity: 12, enrolled: 11 },
  { id: 6, name: "K — Sequoia", program: "K", capacity: 18, enrolled: 16 },
  { id: 7, name: "1st — Redwood", program: "1st", capacity: 16, enrolled: 15 },
  { id: 8, name: "2nd — Willow", program: "2nd", capacity: 16, enrolled: 14 },
  { id: 9, name: "3rd — Oak", program: "3rd", capacity: 16, enrolled: 15 },
  { id: 10, name: "4th — Maple", program: "4th", capacity: 16, enrolled: 14 },
  { id: 11, name: "5th — Pine", program: "5th", capacity: 16, enrolled: 15 },
  { id: 12, name: "6th — Cedar", program: "6th", capacity: 16, enrolled: 13 },
  { id: 13, name: "7th — Birch", program: "7th", capacity: 16, enrolled: 11 },
  { id: 14, name: "8th — Aspen", program: "8th", capacity: 14, enrolled: 10 },
];

const INITIAL_AT_RISK = [
  { student: "J. Martinez", grade: "5th — Pine", reason: "financial", detail: "Lost job · asking about payment plan", flagged: "2026-05-04", status: "intervening" },
  { student: "A. Choi", grade: "7th — Birch", reason: "transferring", detail: "Touring private school in Tampa", flagged: "2026-05-06", status: "intervening" },
  { student: "R. Hassan", grade: "3rd — Oak", reason: "financial", detail: "Asked about scholarship eligibility", flagged: "2026-05-08", status: "intervening" },
  { student: "M. Webb", grade: "8th — Aspen", reason: "moving", detail: "Family relocating out of state", flagged: "2026-04-18", status: "lost" },
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
  const [activeTab, setActiveTab] = useState("enrollment");
  const [searchQuery, setSearchQuery] = useState("");
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [removals, setRemovals] = useState(INITIAL_REMOVALS);
  const [atRiskList, setAtRiskList] = useState(INITIAL_AT_RISK);
  const [showForm, setShowForm] = useState(null);

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

  const totalEnrolled = CLASSROOMS.reduce((a, c) => a + c.enrolled, 0);
  const totalCapacity = CLASSROOMS.reduce((a, c) => a + c.capacity, 0);
  const openSeats = totalCapacity - totalEnrolled;
  const enrollPct = Math.round((totalEnrolled / totalCapacity) * 100);
  const preEnrolled = CLASSROOMS.filter((c) => ["Age 1", "Age 2", "PreK3", "PreK4", "VPK"].includes(c.program)).reduce((a, c) => a + c.enrolled, 0);
  const k8Enrolled = CLASSROOMS.filter((c) => !["Age 1", "Age 2", "PreK3", "PreK4", "VPK"].includes(c.program)).reduce((a, c) => a + c.enrolled, 0);
  const activeRisk = atRiskList.filter((r) => r.status === "intervening");
  const lostCount = atRiskList.filter((r) => r.status === "lost").length;
  const majorIncidents = incidents.filter((i) => i.severity === "major").length;

  const incidentByClassroom = useMemo(() => {
    const map = {};
    incidents.forEach((i) => {
      const cls = i.classroom || "Unknown";
      map[cls] = (map[cls] || 0) + 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [incidents]);

  const filteredIncidents = incidents.filter((i) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(i).join(" ").toLowerCase().includes(q);
  });

  const filteredRemovals = removals.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(r).join(" ").toLowerCase().includes(q);
  });

  const handleEnrollClick = () => {
    setFormData({
      childId: Math.floor(1000 + Math.random() * 9000).toString(),
      personId: Math.floor(10000 + Math.random() * 90000).toString(),
      name: "",
      dob: "2022-01-01",
      gender: "Male",
      classroom: CLASSROOMS[0]?.name || "",
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
    
    const matchedClassroom = CLASSROOMS.find(c => c.name === formData.classroom);
    if (matchedClassroom) {
      matchedClassroom.enrolled += 1;
    }
    
    alert(`Successfully registered & enrolled ${formData.name} in ${formData.classroom}!`);
    setShowForm(null);
  };

  const handleAddAtRisk = (record) => {
    setAtRiskList((prev) => [record, ...prev]);
  };

  const handleWithdrawClick = (student) => {
    setPendingWithdrawStudent(student);
    setIsConfirmWithdrawOpen(true);
  };

  const confirmWithdrawStudent = () => {
    if (!pendingWithdrawStudent) return;
    
    // 1. Remove from At-Risk list
    setAtRiskList((prev) => prev.filter((s) => s.student !== pendingWithdrawStudent.student));

    // 2. Automatically log a Removal record
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

    // 3. Switch tab to Removals
    setActiveTab("removals");

    // 4. Reset modal state
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
            {totalEnrolled} enrolled · {incidents.length} incidents · {removals.length} removals
          </p>
        </div>
        
        {/* Enroll button when in enrollment tab, otherwise log buttons */}
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
      <StudentTabBar activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); setShowForm(null); }} incidentCount={incidents.length} />

      {/* ─── ENROLLMENT TAB ─── */}
      {activeTab === "enrollment" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <KpiCard icon={Users} label="Total Enrollment" value={totalEnrolled} sub={`${enrollPct}% of capacity`} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={TrendingUp} label="Open Seats" value={openSeats} sub={`${preEnrolled} preschool · ${k8Enrolled} K-8`} valueColor="text-[#2F6042]" iconBg="bg-[#3E7A54]/10 text-[#2F6042]" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={GraduationCap} label="Classrooms" value={CLASSROOMS.length} sub={`${CLASSROOMS.filter((c) => c.enrolled >= c.capacity).length} at capacity`} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={BookOpen} label="High Incidents" value={incidentByClassroom.filter(([, c]) => c >= 2).length} sub={`${majorIncidents} major · ${incidents.length} total`} valueColor="text-[#8A362C]" iconBg="bg-[#AE4A3E]/10 text-[#8A362C]" />
            </motion.div>
          </div>

          <EnrollmentTable classrooms={CLASSROOMS} incidents={incidents} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </>
      )}

      {/* ─── INCIDENTS TAB ─── */}
      {activeTab === "incidents" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <KpiCard icon={FileText} label="Total Incidents" value={incidents.length} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={AlertTriangle} label="Major" value={majorIncidents} valueColor="text-[#8A362C]" iconBg="bg-[#AE4A3E]/10 text-[#8A362C]" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={AlertTriangle} label="Moderate" value={incidents.filter((i) => i.severity === "moderate").length} valueColor="text-[#8F6A1F]" iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={GraduationCap} label="Classrooms Affected" value={incidentByClassroom.length} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
            </motion.div>
          </div>

          {incidentByClassroom.length > 0 && <IncidentByClassroomCard incidentByClassroom={incidentByClassroom} />}

          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm border-l-3 border-l-[#B78A2F]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-gray-900">Incident Log</CardTitle>
                  <Button size="sm" className="bg-[#1E3A5F] hover:bg-[#15294A] text-white h-8" onClick={() => setShowForm("incident")}>
                    <Plus size={14} className="mr-1" /> Log Incident
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredIncidents.length > 0 ? (
                  [...filteredIncidents].sort((a, b) => new Date(b.date) - new Date(a.date)).map((inc) => (
                    <IncidentCard key={inc.id} incident={inc} />
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No incidents recorded</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* ─── REMOVALS TAB ─── */}
      {activeTab === "removals" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <motion.div variants={itemVariants}>
              <KpiCard icon={UserMinus} label="Total Removals" value={removals.length} iconBg="bg-gray-50 text-gray-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={Calendar} label="This Month" value={removals.filter((r) => {
                const diff = Math.ceil((TODAY - new Date(r.date)) / 86400000);
                return diff >= 0 && diff <= 30;
              }).length} valueColor="text-[#1E3A5F]" iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={TrendingUp} label="Transferring" value={removals.filter((r) => r.reason === "transferring").length} valueColor="text-[#8F6A1F]" iconBg="bg-[#B78A2F]/10 text-[#8F6A1F]" />
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm border-l-3 border-l-[#AE4A3E]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-gray-900">Removal History</CardTitle>
                  <Button size="sm" className="bg-[#1E3A5F] hover:bg-[#15294A] text-white h-8" onClick={() => setShowForm("removal")}>
                    <Plus size={14} className="mr-1" /> Record Removal
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredRemovals.length > 0 ? (
                  [...filteredRemovals].sort((a, b) => new Date(b.date) - new Date(a.date)).map((r) => (
                    <RemovalCard key={r.id} removal={r} />
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No removals recorded</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* ─── AT-RISK TAB ─── */}
      {activeTab === "at-risk" && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-none shadow-sm border-l-3 border-l-[#AE4A3E]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-[#AE4A3E]" /> At-Risk Students
                  </CardTitle>
                  <CardDescription>{activeRisk.length} active cases · {lostCount} lost this year</CardDescription>
                </div>
                <Button size="sm" className="bg-[#1E3A5F] hover:bg-[#15294A] text-white h-8" onClick={() => setShowForm("at-risk")}>
                  <Plus size={14} className="mr-1" /> Flag Student
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {atRiskList.length > 0 ? atRiskList.map((r, i) => (
                <AtRiskCard key={i} student={r} onWithdraw={handleWithdrawClick} />
              )) : (
                <p className="text-sm text-gray-400 text-center py-4">No at-risk students</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modal Forms */}
      {showForm === "incident" && <IncidentForm onAdd={(inc) => setIncidents((prev) => [inc, ...prev])} onClose={() => setShowForm(null)} />}
      {showForm === "removal" && <RemovalForm onAdd={(rem) => setRemovals((prev) => [rem, ...prev])} onClose={() => setShowForm(null)} />}
      {showForm === "at-risk" && <AtRiskForm onAdd={handleAddAtRisk} onClose={() => setShowForm(null)} />}

      {/* Enroll Student Modal Sheet */}
      <AnimatePresence>
        {showForm === "enroll" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-100 rounded-3xl shadow-2xl w-full max-w-lg p-6 my-8 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
                <div>
                  <h3 className="font-bold text-gray-850 text-base">Enroll Student</h3>
                  <p className="text-[10px] text-gray-455 mt-0.5">Primary registration matching Procare core data elements</p>
                </div>
                <button onClick={() => setShowForm(null)} className="p-1.5 text-gray-400 hover:bg-slate-100 rounded-full transition-all">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEnrollSubmit} className="space-y-4 overflow-y-auto pr-1 pb-2 flex-1 animate-fadeIn">
                {/* ID Fields */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <label className="text-[9px] font-extrabold text-[#1E3A5F] uppercase block mb-1">Procare Child ID</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.childId}
                      onChange={(e) => setFormData(prev => ({ ...prev, childId: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none font-mono"
                      placeholder="e.g. 2948"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold text-[#1E3A5F] uppercase block mb-1">Procare Person ID (Parent Key)</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.personId}
                      onChange={(e) => setFormData(prev => ({ ...prev, personId: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none font-mono"
                      placeholder="e.g. 19283"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                    placeholder="e.g. Liam Troutman"
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
                      {CLASSROOMS.map((cls) => (
                        <option key={cls.id} value={cls.name}>{cls.name}</option>
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
                    className="h-9 text-xs bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl font-bold"
                  >
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
