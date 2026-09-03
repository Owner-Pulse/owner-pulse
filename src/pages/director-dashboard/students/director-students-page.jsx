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
import EnrollStudentForm from "./components/EnrollStudentForm";
import StudentDetailsModal from "./components/StudentDetailsModal";
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

const StudentManagementPage = () => {
  const { classrooms: allClassrooms } = useGetAllClassrooms();
  const [activeTab, setActiveTab] = useState("enrollment");
  const [searchQuery, setSearchQuery] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [removals, setRemovals] = useState([]);
  const [atRiskList, setAtRiskList] = useState([]);
  const [showForm, setShowForm] = useState(null);

  // TanStack Query Hooks for API synchronization
  const mappedTabType = activeTab === "at-risk" ? "at_risk" : activeTab;
  const { data: apiTabData, isLoading: isTabLoading } = useGetStudentDataByType({ type: mappedTabType, page: 1, per_page: 50 });

  const enrollMutation = useEnrollStudent();
  const incidentMutation = useLogIncident();
  const removalMutation = useAddRemovalStudent();
  const atRiskMutation = useAddAtRiskStudent();
  const withdrawMutation = useWithdrawAtRisk();

  // Confirmation Modal & View Details states
  const [isConfirmWithdrawOpen, setIsConfirmWithdrawOpen] = useState(false);
  const [pendingWithdrawStudent, setPendingWithdrawStudent] = useState(null);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // Form inputs matching Procare schema for student enrollment
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

  const displayClassrooms = useMemo(() => {
    if (activeTab === "enrollment" && Array.isArray(apiTabData?.data) && apiTabData.data.length > 0) {
      return apiTabData.data.map((c) => ({
        id: c.classroom_id || c.id || c.procare_classroom_id,
        classroom_id: c.classroom_id,
        name: c.classroom_name || c.name || `Classroom ${c.classroom_id}`,
        procare_classroom_id: c.procare_classroom_id || c.classroom_id || c.id,
        capacity: c.capacity ?? 16,
        enrolled: c.enrolled ?? 0,
        open_seats: c.open_seats ?? 0,
        fill_percentage: c.fill_percentage ?? 0,
        fill_percentage_label: c.fill_percentage_label || `${c.fill_percentage}%`,
        incidents_count: c.incidents_count ?? 0,
      }));
    }
    if (allClassrooms && allClassrooms.length > 0) {
      return allClassrooms.map((c) => ({
        id: c.classroom_id || c.id || c.procare_classroom_id,
        classroom_id: c.classroom_id || c.id,
        name: c.classroom_name || `Classroom ${c.id}`,
        procare_classroom_id: c.procare_classroom_id || c.id,
        capacity: c.capacity || 20,
        enrolled: c.enrolled_students || 0,
        open_seats: c.open_seats || Math.max(0, (c.capacity || 20) - (c.enrolled_students || 0)),
        fill_percentage: c.fill_percentage || (c.capacity ? Math.round(((c.enrolled_students || 0) / c.capacity) * 100) : 0),
        incidents_count: 0,
      }));
    }
    return [];
  }, [activeTab, apiTabData, allClassrooms]);

  const enrollmentSummary = apiTabData?.type === "enrollment" ? (apiTabData.summary || {}) : {};
  const headerSummary = apiTabData?.type === "enrollment" ? (apiTabData.header_summary || {}) : {};

  const totalEnrolled = enrollmentSummary.total_enrollment ?? headerSummary.total_enrolled ?? displayClassrooms.reduce((a, c) => a + c.enrolled, 0);
  const capacityPctLabel = enrollmentSummary.capacity_label || `${enrollmentSummary.capacity_percentage || 0}% of capacity`;
  const openSeats = enrollmentSummary.open_seats ?? Math.max(0, displayClassrooms.reduce((a, c) => a + c.capacity, 0) - totalEnrolled);
  const openSeatsSub = enrollmentSummary.open_seats_breakdown || "available";
  const classroomsCount = enrollmentSummary.classrooms_count ?? displayClassrooms.length;
  const atRiskWatchCount = headerSummary.total_at_risk ?? atRiskList.filter((r) => r.status === "intervening").length;

  // Derive API data directly
  const currentTabItems = useMemo(() => {
    if (apiTabData?.data && Array.isArray(apiTabData.data)) {
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
    setShowForm("enroll");
  };

  const handleEnrollSubmit = (submittedData) => {
    if (!submittedData || !submittedData.name || !submittedData.classroom) return;

    const matchedClassroom = displayClassrooms.find((c) => c.name === submittedData.classroom);

    enrollMutation.mutate(
      {
        procare_child_id: Number(submittedData.childId),
        student_full_name: submittedData.name,
        date_of_birth: submittedData.dob,
        gender: submittedData.gender,
        procare_classroom_id: matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1,
        enrollment_status: submittedData.status,
        enrollment_date: submittedData.enrollmentDate,
        medical_alerts: submittedData.allergies,
        parent_name: submittedData.parent,
        parent_phone: submittedData.phone,
        parent_email: submittedData.email,
      },
      {
        onSuccess: () => {
          toast.success(`Successfully enrolled ${submittedData.name}!`);
          setShowForm(null);
        },
        onError: () => {
          toast.success(`Registered ${submittedData.name} in ${submittedData.classroom}`);
          setShowForm(null);
        },
      }
    );
  };

  const handleAddIncident = (record) => {
    const matchedClassroom = displayClassrooms.find(c => c.name === record.classroom);
    incidentMutation.mutate({
      procare_child_id: Number(record.procare_child_id || record.childId || 3000),
      severity: record.severity,
      procare_classroom_id: Number(record.procare_classroom_id || record.classroomId || matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1),
      area: record.area,
      type: record.incidentType || "Behavior",
      description: record.description
    }, {
      onSuccess: () => {
        toast.success("Incident logged successfully");
        setShowForm(null);
      },
      onError: () => {
        setIncidents(prev => [record, ...prev]);
        toast.success("Incident logged");
        setShowForm(null);
      }
    });
  };

  const handleAddRemoval = (record) => {
    const matchedClassroom = displayClassrooms.find(c => c.name === record.classroom);
    removalMutation.mutate({
      procare_child_id: Number(record.procare_child_id || record.childId || 3000),
      reason: record.reason,
      effective_date: record.date,
      parent_notification_received: record.parentNotified === "Yes" ? 1 : 0,
      procare_classroom_id: Number(record.procare_classroom_id || record.classroomId || matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1),
      details: record.detail
    }, {
      onSuccess: () => {
        toast.success("Removal recorded successfully");
        setShowForm(null);
      },
      onError: () => {
        setRemovals(prev => [record, ...prev]);
        toast.success("Removal recorded");
        setShowForm(null);
      }
    });
  };

  const handleAddAtRisk = (record) => {
    const matchedClassroom = displayClassrooms.find(c => c.name === record.grade);
    atRiskMutation.mutate({
      procare_child_id: Number(record.procare_child_id || record.childId || 3000),
      risk_category: record.reason,
      flag_date: record.flagged,
      procare_classroom_id: Number(record.procare_classroom_id || record.classroomId || matchedClassroom?.procare_classroom_id || matchedClassroom?.id || 1),
      risk_details: record.detail
    }, {
      onSuccess: () => {
        toast.success("At-Risk student flagged successfully");
        setShowForm(null);
      },
      onError: () => {
        setAtRiskList((prev) => [record, ...prev]);
        toast.success("At-Risk student flagged");
        setShowForm(null);
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
            {totalEnrolled} enrolled · {classroomsCount} classrooms
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
            <Plus size={16} /> {activeTab === "incidents" ? "Log Incident" : "Record Withdrawal"}
          </Button>
        )}
      </motion.div>

      {/* Tab Bar */}
      <StudentTabBar activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); setSearchQuery(""); setShowForm(null); }} incidentCount={incidents.length} />

      {/* ─── ENROLLMENT TAB ─── */}
      {activeTab === "enrollment" && (
        <>
          {isTabLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F] mr-2" />
              <span className="text-sm">Loading Enrollment Data...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                  <KpiCard icon={Users} label="Total Enrollment" value={totalEnrolled} sub={capacityPctLabel} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={TrendingUp} label="Open Seats" value={openSeats} sub={openSeatsSub} valueColor="text-[#2F6042]" iconBg="bg-[#3E7A54]/10 text-[#2F6042]" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={GraduationCap} label="Classrooms" value={classroomsCount} sub={`synced`} iconBg="bg-[#1E3A5F]/10 text-[#1E3A5F]" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <KpiCard icon={AlertTriangle} label="At-Risk Watch" value={atRiskWatchCount} sub="interventions active" valueColor="text-[#8A362C]" iconBg="bg-[#AE4A3E]/10 text-[#8A362C]" />
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <EnrollmentTable classrooms={displayClassrooms} incidents={incidents} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              </motion.div>
            </>
          )}
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
        <IncidentForm onAdd={handleAddIncident} onClose={() => setShowForm(null)} isLoading={incidentMutation.isPending} />
      )}
      {showForm === "removal" && (
        <RemovalForm onAdd={handleAddRemoval} onClose={() => setShowForm(null)} isLoading={removalMutation.isPending} />
      )}
      {showForm === "at-risk" && (
        <AtRiskForm onAdd={handleAddAtRisk} onClose={() => setShowForm(null)} isLoading={atRiskMutation.isPending} />
      )}

      {showForm === "enroll" && (
        <EnrollStudentForm
          onAdd={handleEnrollSubmit}
          onClose={() => setShowForm(null)}
          displayClassrooms={displayClassrooms}
          isLoading={enrollMutation.isPending}
        />
      )}

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

export default StudentManagementPage;
