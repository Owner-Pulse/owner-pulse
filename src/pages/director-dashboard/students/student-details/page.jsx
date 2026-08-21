import React, { useState } from "react";
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
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Seed student data mapped to classrooms
const INITIAL_STUDENTS_LIST = [
  { id: 101, childId: "2941", personId: "19280", name: "Zain Abdelhade", dob: "2021-06-27", gender: "Male", status: "Active", parent: "Zed Abdelhade", phone: "(813) 555-0199", email: "zed.a@example.com", allergies: "Peanuts", classroom: "VPK B", enrollmentDate: "2024-09-01" },
  { id: 102, childId: "2942", personId: "19281", name: "Ny Troutma", dob: "2022-03-10", gender: "Female", status: "Active", parent: "Brit Davis", phone: "(813) 555-0144", email: "bdavis@example.com", allergies: "None", classroom: "VPK B", enrollmentDate: "2025-01-05" },
  { id: 103, childId: "2943", personId: "19281", name: "Zy Troutma", dob: "2022-03-10", gender: "Female", status: "Active", parent: "Brit Davis", phone: "(813) 555-0144", email: "bdavis@example.com", allergies: "None", classroom: "VPK B", enrollmentDate: "2025-01-05" },
  { id: 104, childId: "2944", personId: "19282", name: "Sarah Connor", dob: "2021-09-12", gender: "Female", status: "Active", parent: "John Connor", phone: "(813) 555-0210", email: "j.connor@example.com", allergies: "Dairy", classroom: "VPK B", enrollmentDate: "2024-09-03" },
  { id: 105, childId: "2945", personId: "19283", name: "Caleb Antoine", dob: "2022-03-23", gender: "Male", status: "Active", parent: "Cal Antoine", phone: "(813) 555-0182", email: "cal.antoine@example.com", allergies: "None", classroom: "VPK B", enrollmentDate: "2025-02-14" },
  { id: 106, childId: "2946", personId: "19284", name: "Liam Miller", dob: "2021-11-05", gender: "Male", status: "Active", parent: "Mollie Miller", phone: "(813) 555-0105", email: "miller.m@example.com", allergies: "Tree Nuts", classroom: "VPK B", enrollmentDate: "2024-09-01" },
  { id: 107, childId: "2947", personId: "19285", name: "Chloe Lee", dob: "2022-01-14", gender: "Female", status: "Active", parent: "Seon Lee", phone: "(813) 555-0311", email: "slee@example.com", allergies: "None", classroom: "VPK B", enrollmentDate: "2025-03-01" }
];

const INITIAL_INCIDENTS = [
  { id: 101, date: "2026-05-07", severity: "Minor", studentName: "Caleb Antoine", details: "Scraped knee on playground slide, ice pack applied." },
  { id: 102, date: "2026-05-01", severity: "Moderate", studentName: "Liam Miller", details: "Disobedient during lunch period, warning issued." }
];

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
  
  const classroomId = Number(id) || 5;
  const classroomName = CLASSROOM_NAMES[classroomId] || "VPK B (Mrs.Johnson)";

  const [students, setStudents] = useState(INITIAL_STUDENTS_LIST);
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [activeTab, setActiveTab] = useState("roster");
  const [searchQuery, setSearchQuery] = useState("");

  // Form / Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

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

  const activeCount = students.filter(s => s.status === "Active" || s.status === "Enrolled").length;
  const capacity = 15;

  const handleEditClick = (student) => {
    setCurrentStudent(student);
    setFormData({
      childId: student.childId || student.id.toString(),
      personId: student.personId || "",
      name: student.name,
      dob: student.dob,
      gender: student.gender,
      classroom: student.classroom || classroomName,
      status: student.status,
      enrollmentDate: student.enrollmentDate || new Date().toISOString().split("T")[0],
      parent: student.parent,
      phone: student.phone,
      email: student.email,
      allergies: student.allergies
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setStudents(prev => prev.map(s => s.id === currentStudent.id ? { ...s, ...formData } : s));
    setIsEditModalOpen(false);
    setCurrentStudent(null);
  };

  const handleWithdraw = (studentId) => {
    setPendingWithdrawId(studentId);
    setIsConfirmOpen(true);
  };

  const confirmWithdraw = () => {
    setStudents(prev => prev.filter(s => s.id !== pendingWithdrawId));
    setIsConfirmOpen(false);
    setPendingWithdrawId(null);
  };

  const getPendingStudentName = () => {
    const s = students.find(s => s.id === pendingWithdrawId);
    return s ? s.name : "this student";
  };

  // Filter students based on search query (name or childId)
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      student.name.toLowerCase().includes(query) ||
      (student.childId && student.childId.toLowerCase().includes(query)) ||
      (student.id && student.id.toString().includes(query))
    );
  });

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

      {/* KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-gray-400 block font-semibold">Total Students Registered</span>
            <span className="text-xl font-extrabold text-gray-900 mt-1.5 block">
              {activeCount} <span className="text-xs text-gray-400 font-normal">Active Profiles</span>
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-gray-400 block font-semibold">Classroom Space Utilization</span>
            <span className="text-xl font-extrabold text-gray-900 mt-1.5 block">
              {Math.round((activeCount / capacity) * 100)}% <span className="text-xs text-gray-400 font-normal">({capacity - activeCount} open seats)</span>
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <span className="text-xs text-gray-400 block font-semibold">Active Allergy Warnings</span>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xl font-extrabold text-[#8A362C]">
                {students.filter(s => s.allergies !== "None" && s.status === "Active").length}
              </span>
              <span className="p-1 bg-[#AE4A3E]/10 rounded-lg">
                <ShieldAlert size={14} className="text-[#8A362C]" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
            activeTab === "roster" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Student Profiles
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
            activeTab === "logs" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Incident Logs ({incidents.length})
        </button>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeTab === "roster" && (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-50">
              <div>
                <CardTitle className="text-sm">Student Demographics & Profiles</CardTitle>
                <CardDescription>View and manage all registered student profiles</CardDescription>
              </div>
              
              {/* Roster Search Bar */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or Child ID..."
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
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-2">
                            <span className="font-semibold text-gray-900 block">{student.name}</span>
                            <span className="text-[10px] text-gray-455 block font-medium">Child ID: {student.childId || student.id} · Person ID: {student.personId}</span>
                            <span className="text-[10px] text-gray-400">DOB: {student.dob} · Started: {student.enrollmentDate || "—"}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            {student.allergies !== "None" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-[#8A362C] border border-red-100">
                                {student.allergies}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-405">None</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">{student.parent}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <a href={`tel:${student.phone}`} className="text-blue-650 hover:underline text-[10px] flex items-center gap-0.5 font-semibold">
                                  <Phone size={10} /> Call
                                </a>
                                <span className="text-gray-300">|</span>
                                <a href={`mailto:${student.email}`} className="text-blue-650 hover:underline text-[10px] flex items-center gap-0.5 font-semibold">
                                  <Mail size={10} /> Email
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              student.status === "Active" || student.status === "Enrolled" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditClick(student)}
                                className="h-7 w-7 p-0 rounded-lg hover:bg-slate-100 text-gray-500"
                              >
                                <Edit2 size={12} />
                              </Button>
                              {(student.status === "Active" || student.status === "Enrolled") && (
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleWithdraw(student.id)}
                                  className="h-7 w-7 p-0 rounded-lg hover:bg-red-50 text-red-655"
                                  title="Withdraw and remove student"
                                >
                                  <UserMinus size={12} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-xs text-gray-400">
                          No student matching "{searchQuery}" was found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                    className="h-9 text-xs bg-[#1E3A5F] hover:bg-[#15294A] text-white rounded-xl font-bold"
                  >
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
    </motion.div>
  );
};

export default DirectorClassroomDetailPage;
