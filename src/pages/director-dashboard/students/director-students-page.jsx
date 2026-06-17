import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
  { name: "Age 1 — Bumblebees", program: "Age 1", capacity: 8, enrolled: 6 },
  { name: "Age 2 — Ladybugs", program: "Age 2", capacity: 12, enrolled: 10 },
  { name: "PreK3 — Caterpillars", program: "PreK3", capacity: 16, enrolled: 14 },
  { name: "PreK4 — Butterflies", program: "PreK4", capacity: 18, enrolled: 16 },
  { name: "VPK — Fireflies", program: "VPK", capacity: 12, enrolled: 11 },
  { name: "K — Sequoia", program: "K", capacity: 18, enrolled: 16 },
  { name: "1st — Redwood", program: "1st", capacity: 16, enrolled: 15 },
  { name: "2nd — Willow", program: "2nd", capacity: 16, enrolled: 14 },
  { name: "3rd — Oak", program: "3rd", capacity: 16, enrolled: 15 },
  { name: "4th — Maple", program: "4th", capacity: 16, enrolled: 14 },
  { name: "5th — Pine", program: "5th", capacity: 16, enrolled: 15 },
  { name: "6th — Cedar", program: "6th", capacity: 16, enrolled: 13 },
  { name: "7th — Birch", program: "7th", capacity: 16, enrolled: 11 },
  { name: "8th — Aspen", program: "8th", capacity: 14, enrolled: 10 },
];

const AT_RISK = [
  { student: "J. Martinez", grade: "5th", reason: "financial", detail: "Lost job · asking about payment plan", flagged: "2026-05-04", status: "intervening" },
  { student: "A. Choi", grade: "7th", reason: "transferring", detail: "Touring private school in Tampa", flagged: "2026-05-06", status: "intervening" },
  { student: "R. Hassan", grade: "3rd", reason: "financial", detail: "Asked about scholarship eligibility", flagged: "2026-05-08", status: "intervening" },
  { student: "M. Webb", grade: "8th", reason: "moving", detail: "Family relocating out of state", flagged: "2026-04-18", status: "lost" },
];

const INITIAL_INCIDENTS = [
  { id: 101, date: "2026-05-07", student: "Student A.", severity: "minor", classroom: "PreK3 — Caterpillars", area: "Playground", description: "Pushed another student on slide", loggedBy: "Director" },
  { id: 102, date: "2026-05-03", student: "Student C.", severity: "moderate", classroom: "1st — Redwood", area: "Classroom", description: "Refused to follow instructions, disruptive behavior", loggedBy: "Director" },
  { id: 103, date: "2026-04-22", student: "Student D.", severity: "major", classroom: "2nd — Willow", area: "Playground", description: "Physical altercation with peer", loggedBy: "Director" },
];

const INITIAL_REMOVALS = [
  { id: 201, date: "2026-05-04", student: "Student B.", reason: "behavioral", classroom: "3rd — Oak", detail: "Repeated behavioral issues after multiple interventions" },
  { id: 202, date: "2026-04-15", student: "Student E.", reason: "transferring", classroom: "5th — Pine", detail: "Family relocating out of state" },
];

const StudentManagementPage = () => {
  const [activeTab, setActiveTab] = useState("enrollment");
  const [searchQuery, setSearchQuery] = useState("");
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [removals, setRemovals] = useState(INITIAL_REMOVALS);
  const [showForm, setShowForm] = useState(null);

  const totalEnrolled = CLASSROOMS.reduce((a, c) => a + c.enrolled, 0);
  const totalCapacity = CLASSROOMS.reduce((a, c) => a + c.capacity, 0);
  const openSeats = totalCapacity - totalEnrolled;
  const enrollPct = Math.round((totalEnrolled / totalCapacity) * 100);
  const preEnrolled = CLASSROOMS.filter((c) => ["Age 1", "Age 2", "PreK3", "PreK4", "VPK"].includes(c.program)).reduce((a, c) => a + c.enrolled, 0);
  const k8Enrolled = CLASSROOMS.filter((c) => !["Age 1", "Age 2", "PreK3", "PreK4", "VPK"].includes(c.program)).reduce((a, c) => a + c.enrolled, 0);
  const activeRisk = AT_RISK.filter((r) => r.status === "intervening");
  const lostCount = AT_RISK.filter((r) => r.status === "lost").length;
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

  return (
    <motion.div className="space-y-6 pb-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalEnrolled} enrolled · {incidents.length} incidents · {removals.length} removals
          </p>
        </div>
        {activeTab !== "enrollment" && (
          <Button className="bg-[#1E3A5F] hover:bg-[#15294A] text-white shadow-sm" onClick={() => setShowForm(activeTab === "incidents" ? "incident" : "removal")}>
            <Plus size={16} className="mr-2" /> {activeTab === "incidents" ? "Log Incident" : "Record Removal"}
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
              <KpiCard icon={Users} label="Total Enrollment" value={totalEnrolled} sub={`${enrollPct}% of capacity`} iconBg="bg-blue-50 text-blue-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={TrendingUp} label="Open Seats" value={openSeats} sub={`${preEnrolled} preschool · ${k8Enrolled} K-8`} valueColor="text-emerald-600" iconBg="bg-emerald-50 text-emerald-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={GraduationCap} label="Classrooms" value={CLASSROOMS.length} sub={`${CLASSROOMS.filter((c) => c.enrolled >= c.capacity).length} at capacity`} iconBg="bg-purple-50 text-purple-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={BookOpen} label="High Incidents" value={incidentByClassroom.filter(([, c]) => c >= 2).length} sub={`${majorIncidents} major · ${incidents.length} total`} valueColor="text-red-600" iconBg="bg-red-50 text-red-600" />
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
              <KpiCard icon={FileText} label="Total Incidents" value={incidents.length} iconBg="bg-blue-50 text-blue-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={AlertTriangle} label="Major" value={majorIncidents} valueColor="text-red-600" iconBg="bg-red-50 text-red-500" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={AlertTriangle} label="Moderate" value={incidents.filter((i) => i.severity === "moderate").length} valueColor="text-orange-600" iconBg="bg-orange-50 text-orange-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={GraduationCap} label="Classrooms Affected" value={incidentByClassroom.length} iconBg="bg-purple-50 text-purple-600" />
            </motion.div>
          </div>

          {incidentByClassroom.length > 0 && <IncidentByClassroomCard incidentByClassroom={incidentByClassroom} />}

          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Incident Log</CardTitle>
                  <Button size="sm" className="bg-[#1E3A5F] hover:bg-[#15294A] text-white h-8" onClick={() => setShowForm("incident")}>
                    <Plus size={14} className="mr-1" /> Add Incident
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
              }).length} valueColor="text-blue-600" iconBg="bg-blue-50 text-blue-600" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <KpiCard icon={TrendingUp} label="Transferring" value={removals.filter((r) => r.reason === "transferring").length} valueColor="text-amber-600" iconBg="bg-amber-50 text-amber-600" />
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Removal History</CardTitle>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white h-8" onClick={() => setShowForm("removal")}>
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
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldAlert size={16} className="text-red-500" /> At-Risk Students
              </CardTitle>
              <CardDescription>{activeRisk.length} active cases · {lostCount} lost this year</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {AT_RISK.length > 0 ? AT_RISK.map((r, i) => (
                <AtRiskCard key={i} student={r} />
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
    </motion.div>
  );
};

export default StudentManagementPage;
